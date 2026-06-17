/* ============================================================
   QUANTUMSERVE — INDEX.JS
   Multi-Tenant Authentication Gateway
   ============================================================

   ARCHITECTURE:
   ─────────────────────────────────────────────────────────
   Every hotel (tenant) shares ONE Supabase project.
   Isolation enforced by RLS using JWT claims.

   JWT carries (set by custom_access_token_hook in DB):
     tenant_id    → which hotel group
     property_id  → which specific property
     staff_id     → staff.id (not auth.users.id)
     role         → cashier / waiter / manager / gm / etc.
     shift_active → boolean
     shift_id     → current shift_assignment.id or null

   AUTH FLOW:
   ─────────────────────────────────────────────────────────
   1. Resolve tenant from subdomain / localStorage slug
   2. Check license: active, not expired
   3. Email → RPC: get_staff_for_login (tenant-scoped)
   4. PIN   → Edge Function: verify-pin (bcrypt server-side)
   5. Edge Function returns Supabase session tokens
   6. supabase.auth.setSession() → JWT with claims baked in
   7. Read role from JWT → route to module
   8. Module calls QS.requireAuth() → has JWT, RLS active

   TENANT RESOLUTION:
   ─────────────────────────────────────────────────────────
   serena.quantumserve.io  → slug = 'serena'
   lakeview.quantumserve.io → slug = 'lakeview'
   localhost / no subdomain → use stored slug or demo default

   ============================================================ */

'use strict';

// ============================================================
// CONFIG
// ============================================================
const SUPABASE_URL = 'https://emckziegbgzmofwiydey.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtY2t6aWVnYmd6bW9md2l5ZGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDk5NDMsImV4cCI6MjA5NzE4NTk0M30.5w7JWlpDc-Jz2wBr7B7hLprOLF3dDIXd9c9RWb65b3M';

const FLAGS = {
  demoMode: false,   // live Supabase — demo accounts still shown for dev testing
};

// ============================================================
// ROLE → MODULE MAP
// Single source of truth. One role, one home, no exceptions.
// ============================================================
const ROLE_ROUTES = {
  super_admin:      { module: 'admin.html',        label: 'System Administration', color: '#9b59b6' },
  gm:               { module: 'gm.html',           label: 'Executive Dashboard',   color: '#c9a84c' },
  manager:          { module: 'manager.html',      label: 'Operations Center',     color: '#e67e22' },
  accountant:       { module: 'finance.html',      label: 'Finance Console',       color: '#27ae60' },
  auditor:          { module: 'finance.html',      label: 'Audit Console',         color: '#16a085' },
  hr_officer:       { module: 'hr.html',           label: 'HR & Payroll',          color: '#8e44ad' },
  front_desk:       { module: 'frontdesk.html',    label: 'Front Desk',            color: '#2980b9' },
  chef:             { module: 'kitchen.html',      label: 'Kitchen Console',       color: '#e74c3c' },
  kitchen_staff:    { module: 'kitchen.html',      label: 'Kitchen Display',       color: '#c0392b' },
  waiter:           { module: 'pos.html',          label: 'Order Entry',           color: '#1abc9c' },
  cashier:          { module: 'pos.html',          label: 'Payment Terminal',      color: '#f39c12' },
  bartender:        { module: 'bar.html',          label: 'Bar Station',           color: '#d35400' },
  housekeeper:      { module: 'housekeeping.html', label: 'Task Board',            color: '#3498db' },
  shift_supervisor: { module: 'manager.html',      label: 'Shift Dashboard',       color: '#e67e22' },
  stock_manager:    { module: 'inventory.html',    label: 'Inventory Console',     color: '#7f8c8d' },
  maintenance:      { module: 'maintenance.html',  label: 'Maintenance Board',     color: '#95a5a6' },
};

// ============================================================
// DEMO DATA
// Mirrors real DB structure exactly.
// Two tenants, two properties for Serena, PIN always 1234.
// Replace with live DB by setting FLAGS.demoMode = false.
// ============================================================
const DEMO = {
  tenants: [
    {
      id: 'tenant-001', slug: 'lakeview',
      name: 'Lakeview Heights Hotel',
      trading_name: 'Lakeview Heights',
      country_code: 'UG', currency_code: 'UGX',
      timezone: 'Africa/Kampala', locale: 'en-UG',
      logo_url: null,
      license: { type: 'trial', status: 'active', days_remaining: 22, expires_at: new Date(Date.now() + 22 * 86400000).toISOString() },
    },
    {
      id: 'tenant-002', slug: 'serena',
      name: 'Serena Hotels Uganda',
      trading_name: 'Serena Hotel Kampala',
      country_code: 'UG', currency_code: 'UGX',
      timezone: 'Africa/Kampala', locale: 'en-UG',
      logo_url: null,
      license: { type: 'annual', status: 'active', days_remaining: 280, expires_at: new Date(Date.now() + 280 * 86400000).toISOString() },
    },
  ],

  properties: {
    'tenant-001': [
      { id: 'prop-001', name: 'Lakeview Heights — Kampala', city: 'Kampala', total_rooms: 48 },
    ],
    'tenant-002': [
      { id: 'prop-002', name: 'Serena Hotel Kampala',  city: 'Kampala', total_rooms: 152 },
      { id: 'prop-003', name: 'Serena Hotel Entebbe',  city: 'Entebbe', total_rooms: 68  },
    ],
  },

  // PIN stored plain ONLY in demo. In production: bcrypt hash in DB.
  // staff.tenant_id scoping is what makes this multi-tenant.
  staff: [
    // ── LAKEVIEW TENANT ──────────────────────────────────────
    {
      id: 'staff-001', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-001', email: 'grace@lakeview.com',
      first_name: 'Grace', last_name: 'Nakato',
      role: 'super_admin', department: 'System', employment_type: 'full_time',
      discount_ceiling: 1.0, void_authority: true, refund_authority: true,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#9b59b6',
    },
    {
      id: 'staff-002', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-002', email: 'john@lakeview.com',
      first_name: 'John', last_name: 'Mukasa',
      role: 'manager', department: 'Management', employment_type: 'full_time',
      discount_ceiling: 0.30, void_authority: true, refund_authority: true,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#e67e22',
    },
    {
      id: 'staff-003', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-003', email: 'mary@lakeview.com',
      first_name: 'Mary', last_name: 'Nambi',
      role: 'cashier', department: 'Food & Beverage', employment_type: 'full_time',
      discount_ceiling: 0.05, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#f39c12',
    },
    {
      id: 'staff-004', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-004', email: 'peter@lakeview.com',
      first_name: 'Peter', last_name: 'Okello',
      role: 'housekeeper', department: 'Housekeeping', employment_type: 'full_time',
      discount_ceiling: 0, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#3498db',
    },
    {
      id: 'staff-005', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-005', email: 'sarah@lakeview.com',
      first_name: 'Sarah', last_name: 'Kemigisha',
      role: 'auditor', department: 'Finance', employment_type: 'full_time',
      discount_ceiling: 0, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#16a085',
    },
    {
      id: 'staff-006', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-006', email: 'james@lakeview.com',
      first_name: 'James', last_name: 'Ssali',
      role: 'waiter', department: 'Food & Beverage', employment_type: 'full_time',
      discount_ceiling: 0, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#1abc9c',
    },
    {
      id: 'staff-007', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-007', email: 'alice@lakeview.com',
      first_name: 'Alice', last_name: 'Nabirye',
      role: 'front_desk', department: 'Rooms Division', employment_type: 'full_time',
      discount_ceiling: 0.10, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#2980b9',
    },
    {
      id: 'staff-008', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-008', email: 'brian@lakeview.com',
      first_name: 'Brian', last_name: 'Mugisha',
      role: 'chef', department: 'Kitchen', employment_type: 'full_time',
      discount_ceiling: 0, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#e74c3c',
    },
    {
      id: 'staff-009', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-009', email: 'diana@lakeview.com',
      first_name: 'Diana', last_name: 'Atuhaire',
      role: 'bartender', department: 'Bar', employment_type: 'full_time',
      discount_ceiling: 0, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#d35400',
    },
    {
      id: 'staff-010', tenant_id: 'tenant-001', property_id: 'prop-001',
      auth_user_id: 'auth-010', email: 'robert@lakeview.com',
      first_name: 'Robert', last_name: 'Tumwine',
      role: 'accountant', department: 'Finance', employment_type: 'full_time',
      discount_ceiling: 0, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#27ae60',
    },
    // ── SERENA TENANT ─────────────────────────────────────────
    // Completely separate tenant. RLS would prevent cross-access.
    {
      id: 'staff-101', tenant_id: 'tenant-002', property_id: 'prop-002',
      auth_user_id: 'auth-101', email: 'gm@serena.com',
      first_name: 'Patricia', last_name: 'Onek',
      role: 'gm', department: 'Executive', employment_type: 'full_time',
      discount_ceiling: 1.0, void_authority: true, refund_authority: true,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#c9a84c',
    },
    {
      id: 'staff-102', tenant_id: 'tenant-002', property_id: 'prop-002',
      auth_user_id: 'auth-102', email: 'cashier@serena.com',
      first_name: 'Felix', last_name: 'Oryem',
      role: 'cashier', department: 'Food & Beverage', employment_type: 'full_time',
      discount_ceiling: 0.05, void_authority: false, refund_authority: false,
      is_active: true, locked_until: null, failed_pin_attempts: 0,
      _demo_pin: '1234', avatar_color: '#f39c12',
    },
  ],
};

// ============================================================
// AUTH STATE (in-memory only)
// ============================================================
const AUTH = {
  step:           'email',
  tenant:         null,
  property:       null,
  staffRecord:    null,
  pinEntered:     '',
  failedAttempts: 0,
  maxAttempts:    5,
};

// ============================================================
// SUPABASE CLIENT (lazy init)
// ============================================================
let _sb = null;
function getSB() {
  if (_sb) return _sb;
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
  // Supabase v2 CDN exposes window.supabase.createClient
  const factory = window.supabase?.createClient || window.Supabase?.createClient;
  if (!factory) return null;
  _sb = factory(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession:     true,
      storageKey:         'qs_auth',
      storage:            window.sessionStorage,
      autoRefreshToken:   true,
      detectSessionInUrl: false,
    },
  });
  return _sb;
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initGrain();
  startClock();
  await resolveTenant();
  await checkExistingSession();
});

// ============================================================
// 1. TENANT RESOLUTION
// Which hotel is this browser session serving?
// ============================================================
async function resolveTenant() {
  let slug = null;

  // A) Subdomain: serena.quantumserve.io
  const host  = window.location.hostname;
  const parts = host.split('.');
  if (parts.length >= 3 && !host.startsWith('localhost') && !/^\d/.test(host)) {
    slug = parts[0];
  }

  // B) Stored from a previous visit on this device
  if (!slug) slug = localStorage.getItem('qs_tenant_slug');

  // C) Demo default
  if (!slug && FLAGS.demoMode) slug = 'lakeview';

  if (!slug) {
    // No tenant resolved — show hotel-code input (not yet built; default for now)
    return;
  }

  const tenant = await db.getTenantBySlug(slug);
  if (!tenant) return;

  AUTH.tenant = tenant;
  localStorage.setItem('qs_tenant_slug', slug);

  // Validate license
  if (!isLicenseValid(tenant.license)) {
    renderLicenseError(tenant);
    return;
  }

  // Resolve property
  const props = await db.getProperties(tenant.id);
  AUTH.property = props.length === 1 ? props[0] : null;

  applyTenantBranding(tenant, AUTH.property || props[0]);
  renderTrialBanner(tenant.license);
  renderDemoAccounts(tenant.id);
}

// ============================================================
// 2. SESSION CHECK — skip login if valid JWT exists
// ============================================================
async function checkExistingSession() {
  // Real Supabase
  const sb = getSB();
  if (sb) {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.access_token) {
      const claims = parseJWT(session.access_token);
      if (claims?.staff_id && claims?.tenant_id) {
        if (AUTH.tenant && claims.tenant_id !== AUTH.tenant.id) {
          await sb.auth.signOut();
          return;
        }
        routeToModule(claims.role, false);
        return;
      }
    }
  }

  // Demo mode
  if (FLAGS.demoMode) {
    try {
      const raw = sessionStorage.getItem('qs_session');
      if (!raw) return;
      const sess = JSON.parse(raw);
      if (!sess?.expiresAt || Date.now() > sess.expiresAt) {
        sessionStorage.removeItem('qs_session');
        return;
      }
      if (AUTH.tenant && sess.claims?.tenant_id !== AUTH.tenant.id) {
        sessionStorage.removeItem('qs_session');
        return;
      }
      routeToModule(sess.claims.role, false);
    } catch(e) {
      sessionStorage.removeItem('qs_session');
    }
  }
}

// ============================================================
// 3. EMAIL STEP
// ============================================================
function validateEmail() {
  const val   = document.getElementById('emailInput').value.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const check = document.getElementById('emailCheck');
  const input = document.getElementById('emailInput');

  document.getElementById('emailError').textContent = '';
  input.classList.remove('valid', 'error');
  check.textContent = '';

  if (val.length > 3) {
    if (valid) {
      input.classList.add('valid');
      check.textContent = '✓';
      check.style.color = 'var(--teal)';
    } else {
      input.classList.add('error');
    }
  }
  document.getElementById('btnEmail').disabled = !valid;
}

async function nextStep() {
  const email = document.getElementById('emailInput').value.trim().toLowerCase();
  const err   = document.getElementById('emailError');
  if (!email) return;

  if (!AUTH.tenant) {
    err.textContent = 'Hotel not identified. Contact your administrator.';
    return;
  }

  setBtnLoading('btnEmail', true);
  const staff = await db.getStaffForLogin(email, AUTH.tenant.id);
  setBtnLoading('btnEmail', false);

  if (!staff) {
    document.getElementById('emailInput').classList.add('error');
    err.textContent = 'No active staff account found for this email.';
    shakeEl('emailInput');
    return;
  }

  if (!staff.is_active) {
    err.textContent = 'Account deactivated. Contact your manager.';
    return;
  }

  if (staff.locked_until && new Date(staff.locked_until) > new Date()) {
    const mins = Math.ceil((new Date(staff.locked_until) - Date.now()) / 60000);
    err.textContent = `Account locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`;
    return;
  }

  AUTH.staffRecord    = staff;
  AUTH.failedAttempts = staff.failed_pin_attempts || 0;
  renderPinStep();
}

// ============================================================
// 4. PIN STEP
// ============================================================
function renderPinStep() {
  const s     = AUTH.staffRecord;
  const route = ROLE_ROUTES[s.role];
  const inits = s.first_name[0] + s.last_name[0];

  document.getElementById('staffAvatar').textContent      = inits;
  document.getElementById('staffAvatar').style.background = s.avatar_color || '#c9a84c';
  document.getElementById('staffName').textContent        = `${s.first_name} ${s.last_name}`;
  document.getElementById('staffRole').textContent        = route?.label || s.role;
  document.getElementById('staffDept').textContent        = s.department || '';

  switchStep('stepEmail', 'stepPin');
  AUTH.pinEntered = '';
  syncPinDots();
}

function pinInput(digit) {
  if (AUTH.pinEntered.length >= 6) return;
  AUTH.pinEntered += digit;
  syncPinDots();
  document.getElementById('btnPin').disabled = AUTH.pinEntered.length < 4;

  // Auto-attempt on 4 digits (most common PIN length)
  if (AUTH.pinEntered.length === 4) {
    setTimeout(() => {
      if (AUTH.step === 'pin' && AUTH.pinEntered.length === 4) attemptLogin();
    }, 280);
  }
}

function pinBackspace() {
  AUTH.pinEntered = AUTH.pinEntered.slice(0, -1);
  syncPinDots();
  document.getElementById('btnPin').disabled = AUTH.pinEntered.length < 4;
}

function pinClear() {
  AUTH.pinEntered = '';
  syncPinDots();
  document.getElementById('btnPin').disabled = true;
}

function syncPinDots() {
  for (let i = 0; i < 6; i++) {
    const dot = document.getElementById(`pd${i}`);
    if (!dot) continue;
    dot.classList.toggle('filled', i < AUTH.pinEntered.length);
    dot.classList.remove('error');
  }
}

function flashPinError() {
  for (let i = 0; i < 6; i++) {
    const dot = document.getElementById(`pd${i}`);
    if (dot) dot.classList.add('error');
  }
  setTimeout(() => {
    for (let i = 0; i < 6; i++) {
      const dot = document.getElementById(`pd${i}`);
      if (dot) dot.classList.remove('error');
    }
  }, 600);
}

function goBack() {
  AUTH.pinEntered  = '';
  AUTH.staffRecord = null;
  hideWarn();
  switchStep('stepPin', 'stepEmail');
}

// ============================================================
// 5. LOGIN ATTEMPT
// ============================================================
async function attemptLogin() {
  const pin   = AUTH.pinEntered;
  const staff = AUTH.staffRecord;
  if (pin.length < 4 || !staff) return;

  setBtnLoading('btnPin', true);
  document.getElementById('numpad').style.pointerEvents = 'none';

  const result = await verifyPin(staff, pin);

  setBtnLoading('btnPin', false);
  document.getElementById('numpad').style.pointerEvents = 'auto';

  if (!result.valid) {
    AUTH.failedAttempts++;
    AUTH.pinEntered = '';
    syncPinDots();
    flashPinError();

    const remaining = AUTH.maxAttempts - AUTH.failedAttempts;

    if (AUTH.failedAttempts >= AUTH.maxAttempts) {
      // Lock: in production the Edge Function sets staff.locked_until in DB
      showWarn('Account locked for 15 minutes. Too many failed attempts.');
      document.getElementById('numpad').style.pointerEvents = 'none';
      document.getElementById('btnPin').disabled = true;
      return;
    }

    showWarn(
      remaining === 1
        ? '⚠️ Last attempt before lockout.'
        : `Incorrect PIN — ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
    );
    return;
  }

  // ── SUCCESS ─────────────────────────────────────────────────
  hideWarn();

  // Store session (demo: sessionStorage; production: Supabase JWT in memory)
  if (FLAGS.demoMode) {
    sessionStorage.setItem('qs_session', JSON.stringify({
      access_token: result.access_token,
      claims:       result.claims,
      expiresAt:    Date.now() + 12 * 60 * 60 * 1000,
    }));
  }

  showRoutingStep(staff, result.claims);
}

// ============================================================
// 6. PIN VERIFICATION
// Demo: plain compare
// Production: POST to Edge Function → bcrypt.compare server-side
//   Edge Fn creates Supabase session for staff.auth_user_id
//   JWT claims are set automatically by custom_access_token_hook
// ============================================================
async function verifyPin(staff, pin) {
  // ── DEMO ────────────────────────────────────────────────────
  if (FLAGS.demoMode) {
    if (pin !== staff._demo_pin) return { valid: false };

    // Build mock JWT claims — mirrors exactly what
    // custom_access_token_hook returns for a real auth
    const claims = {
      // Supabase standard
      sub:  staff.auth_user_id,
      iat:  Math.floor(Date.now() / 1000),
      exp:  Math.floor(Date.now() / 1000) + 43200,
      // Custom claims (from schema: custom_access_token_hook)
      tenant_id:     staff.tenant_id,
      property_id:   staff.property_id,
      staff_id:      staff.id,
      role:          staff.role,
      department_id: staff.department_id || null,
      shift_active:  false,
      shift_id:      null,
      // Staff profile (modules need this without extra DB round-trip)
      first_name:       staff.first_name,
      last_name:        staff.last_name,
      email:            staff.email,
      avatar_color:     staff.avatar_color,
      discount_ceiling: staff.discount_ceiling,
      void_authority:   staff.void_authority,
      refund_authority: staff.refund_authority,
      // Tenant context
      tenant_name:    AUTH.tenant?.name,
      tenant_slug:    AUTH.tenant?.slug,
      property_name:  AUTH.property?.name,
      currency_code:  AUTH.tenant?.currency_code || 'UGX',
      country_code:   AUTH.tenant?.country_code  || 'UG',
      timezone:       AUTH.tenant?.timezone      || 'Africa/Kampala',
    };

    return {
      valid:        true,
      access_token: btoa(JSON.stringify(claims)), // mock token for demo
      claims,
    };
  }

  // ── PRODUCTION ───────────────────────────────────────────────
  // Edge Function: /functions/v1/verify-pin
  // Receives: { staff_id, tenant_id, pin }
  // Does:     bcrypt.compare(pin, staff.pin_hash from DB)
  //           supabase.auth.admin.createSession(staff.auth_user_id)
  // Returns:  { valid, access_token, refresh_token }
  // JWT hook: custom_access_token_hook runs automatically,
  //           baking tenant_id, property_id, role etc. into JWT
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-pin`, {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        staff_id:  staff.id,
        tenant_id: AUTH.tenant.id,
        pin,
      }),
    });

    if (!res.ok) return { valid: false };
    const data = await res.json();
    if (!data.valid) return { valid: false };

    // Set session in Supabase client → all subsequent queries carry JWT
    // RLS now enforces tenant_id isolation automatically
    const sb = getSB();
    if (sb) {
      await sb.auth.setSession({
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
      });
    }

    const claims = parseJWT(data.access_token);
    return { valid: true, access_token: data.access_token, claims };
  } catch(e) {
    console.error('verify-pin error:', e);
    return { valid: false };
  }
}

// ============================================================
// 7. ROUTING STEP → MODULE
// ============================================================
function showRoutingStep(staff, claims) {
  const route = ROLE_ROUTES[claims.role];
  switchStep('stepPin', 'stepRouting');

  document.getElementById('routingRole').textContent = `${staff.first_name}, you're in.`;

  const msgs = [
    'Verifying credentials…',
    'Loading permissions…',
    'Checking shift status…',
    `Opening ${route?.label || 'your workspace'}…`,
  ];

  let i = 0;
  const msgEl  = document.getElementById('routingMsg');
  const destEl = document.getElementById('routingDest');

  const iv = setInterval(() => {
    i++;
    if (i < msgs.length)          msgEl.textContent = msgs[i];
    if (i === msgs.length - 1) {
      destEl.textContent = `→ ${route?.label}`;
      destEl.classList.add('show');
      clearInterval(iv);
    }
  }, 380);

  setTimeout(() => routeToModule(claims.role, true), 1700);
}

function routeToModule(role, animated) {
  const route = ROLE_ROUTES[role];
  if (!route) { console.error('No route for role:', role); return; }
  if (animated) {
    document.body.style.transition = 'opacity 0.35s ease';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = route.module; }, 350);
  } else {
    window.location.href = route.module;
  }
}

// ============================================================
// DB LAYER — demo vs real Supabase
// All calls tenant-scoped. This is the multi-tenancy boundary.
// ============================================================
const db = {

  async getTenantBySlug(slug) {
    if (FLAGS.demoMode) return DEMO.tenants.find(t => t.slug === slug) || null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_tenant_by_slug`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_slug: slug }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[QS] get_tenant_by_slug RPC missing or failed:', err);
        return null;
      }
      return await res.json();
    } catch(e) { console.error('[QS] getTenantBySlug:', e); return null; }
  },

  async getProperties(tenantId) {
    if (FLAGS.demoMode) return DEMO.properties[tenantId] || [];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_properties_for_tenant`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_tenant_id: tenantId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[QS] get_properties_for_tenant RPC missing or failed:', err);
        return [];
      }
      return await res.json();
    } catch(e) { console.error('[QS] getProperties:', e); return []; }
  },

  async getStaffForLogin(email, tenantId) {
    if (FLAGS.demoMode) {
      return DEMO.staff.find(s =>
        s.email === email &&
        s.tenant_id === tenantId &&
        s.is_active
      ) || null;
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_staff_for_login`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_email: email, p_tenant_id: tenantId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[QS] get_staff_for_login RPC missing or failed:', err);
        return null;
      }
      return await res.json() || null;
    } catch(e) { console.error('[QS] getStaffForLogin:', e); return null; }
  },
};

// ============================================================
// QS GLOBAL — exported to all modules
// ============================================================
window.QS = {

  ROLE_ROUTES,

  // Every module calls this first. Returns claims or redirects.
  async requireAuth(allowedRoles = null) {
    let claims = null;

    if (FLAGS.demoMode) {
      try {
        const raw = sessionStorage.getItem('qs_session');
        if (!raw) { window.location.href = 'index.html'; return null; }
        const sess = JSON.parse(raw);
        if (!sess?.expiresAt || Date.now() > sess.expiresAt) {
          sessionStorage.removeItem('qs_session');
          window.location.href = 'index.html';
          return null;
        }
        claims = sess.claims;
      } catch(e) { window.location.href = 'index.html'; return null; }
    } else {
      const sb = getSB();
      if (!sb) { window.location.href = 'index.html'; return null; }
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.access_token) { window.location.href = 'index.html'; return null; }
      claims = parseJWT(session.access_token);
    }

    if (!claims?.role) { window.location.href = 'index.html'; return null; }

    // Role enforcement — wrong module for this role
    if (allowedRoles && !allowedRoles.includes(claims.role)) {
      const correct = ROLE_ROUTES[claims.role]?.module;
      window.location.href = correct || 'index.html';
      return null;
    }

    return claims;
  },

  // Extend session (call on user activity)
  extendSession() {
    if (!FLAGS.demoMode) return;
    try {
      const raw = sessionStorage.getItem('qs_session');
      if (!raw) return;
      const sess = JSON.parse(raw);
      sess.expiresAt = Date.now() + 12 * 60 * 60 * 1000;
      sessionStorage.setItem('qs_session', JSON.stringify(sess));
    } catch(e) {}
  },

  async logout() {
    sessionStorage.clear();
    const sb = getSB();
    if (sb) await sb.auth.signOut();
    window.location.href = 'index.html';
  },

  getSupabase: getSB,

  // Permission check — mirrors DB check_permission()
  // UI uses this for show/hide. DB RLS is the actual enforcement.
  can(claims, action, context = {}) {
    if (!claims) return { allowed: false, reason: 'no_session' };
    const { role, shift_active, discount_ceiling, void_authority, refund_authority } = claims;

    // Shift-required actions
    const needsShift = [
      'open_table','enter_order','close_bill','print_bill',
      'apply_discount','initiate_void','process_payment',
      'open_bar_session','mark_room_clean','serve_order_item',
    ];
    if (needsShift.includes(action) && !shift_active) {
      return { allowed: false, reason: 'no_active_shift' };
    }

    // Discount ceiling
    if (action === 'apply_discount' && context.pct != null) {
      const ceiling = discount_ceiling || 0;
      if (context.pct > ceiling) {
        return { allowed: false, reason: 'exceeds_ceiling',
                 escalate_to: 'manager', ceiling };
      }
    }

    // Permission matrix (mirrors DB check_permission function)
    const MATRIX = {
      // F&B
      open_table:           ['waiter','bartender','manager','gm','super_admin'],
      enter_order:          ['waiter','bartender','cashier','manager','gm','super_admin'],
      send_to_kitchen:      ['waiter','bartender','manager','gm','super_admin'],
      close_bill:           ['cashier','front_desk','manager','gm','super_admin'],
      print_bill:           ['cashier','front_desk','manager','gm','super_admin'],
      process_payment:      ['cashier','front_desk','manager','gm','super_admin'],
      split_bill:           ['cashier','front_desk','manager','gm','super_admin'],
      apply_discount:       ['cashier','front_desk','manager','gm','super_admin'],
      room_charge:          ['cashier','front_desk','manager','gm','super_admin'],
      initiate_void:        ['cashier','front_desk','manager','gm','super_admin'],
      approve_void:         ['manager','gm','super_admin'],
      process_refund:       ['manager','gm','super_admin'],
      // Rooms
      check_in_guest:       ['front_desk','manager','gm','super_admin'],
      check_out_guest:      ['front_desk','cashier','manager','gm','super_admin'],
      assign_room:          ['front_desk','manager','gm','super_admin'],
      upgrade_room:         ['manager','gm','super_admin'],
      view_room_rates:      ['front_desk','manager','gm','accountant','auditor','super_admin'],
      edit_room_rates:      ['manager','gm','super_admin'],
      override_room_status: ['manager','gm','super_admin'],
      view_folio:           ['front_desk','cashier','manager','gm','accountant','auditor','super_admin'],
      post_folio_charge:    ['front_desk','cashier','manager','gm','super_admin'],
      // Housekeeping
      mark_room_clean:      ['housekeeper','shift_supervisor','manager','gm','super_admin'],
      mark_room_inspected:  ['shift_supervisor','manager','gm','super_admin'],
      report_maintenance:   ['housekeeper','front_desk','maintenance','manager','gm','super_admin'],
      assign_hk_task:       ['shift_supervisor','manager','gm','super_admin'],
      // Kitchen
      acknowledge_ticket:   ['kitchen_staff','chef','super_admin'],
      mark_item_ready:      ['kitchen_staff','chef','super_admin'],
      manage_recipes:       ['chef','manager','gm','super_admin'],
      approve_wastage:      ['chef','manager','gm','super_admin'],
      view_food_cost:       ['chef','manager','gm','accountant','auditor','super_admin'],
      // Bar
      open_bar_session:     ['bartender','manager','gm','super_admin'],
      close_bar_session:    ['bartender','shift_supervisor','manager','gm','super_admin'],
      view_bar_variance:    ['manager','gm','accountant','auditor','super_admin'],
      // Inventory
      view_stock_levels:    ['stock_manager','chef','manager','gm','accountant','auditor','super_admin'],
      view_stock_costs:     ['stock_manager','manager','gm','accountant','auditor','super_admin'],
      receive_stock_grn:    ['stock_manager','manager','gm','super_admin'],
      create_purchase_order:['stock_manager','manager','gm','super_admin'],
      approve_purchase_order:['manager','gm','super_admin'],
      record_wastage:       ['stock_manager','chef','bartender','manager','gm','super_admin'],
      // Finance
      view_ledger:          ['accountant','gm','auditor','manager','super_admin'],
      post_journal_entry:   ['accountant','gm','super_admin'],
      view_profit_loss:     ['accountant','gm','auditor','manager','super_admin'],
      run_payroll:          ['accountant','gm','super_admin'],
      approve_payroll:      ['accountant','super_admin'],
      authorize_payroll:    ['gm','super_admin'],
      view_payroll:         ['accountant','gm','auditor','manager','hr_officer','super_admin'],
      view_own_payslip:     ['cashier','waiter','bartender','front_desk','housekeeper','chef','kitchen_staff','stock_manager','maintenance','accountant','auditor','hr_officer','manager','gm','shift_supervisor','super_admin'],
      // HR
      manage_staff:         ['manager','gm','hr_officer','super_admin'],
      approve_leave:        ['manager','gm','hr_officer','super_admin'],
      manage_shifts:        ['manager','gm','shift_supervisor','super_admin'],
      // System
      configure_system:     ['gm','super_admin'],
      manage_users:         ['manager','gm','super_admin'],
      view_audit_trail:     ['manager','gm','auditor','super_admin'],
    };

    const allowed = MATRIX[action]
      ? MATRIX[action].includes(role)
      : role === 'super_admin';

    return { allowed, reason: allowed ? 'authorized' : 'insufficient_role' };
  },

  // Format currency using tenant config from JWT claims
  formatCurrency(amount, claims) {
    const code = claims?.currency_code || 'UGX';
    return `${code} ${Math.round(amount || 0).toLocaleString()}`;
  },
};

// ============================================================
// LICENSE
// ============================================================
function isLicenseValid(lic) {
  if (!lic) return false;
  if (lic.status !== 'active') return false;
  if (lic.expires_at && new Date(lic.expires_at) < new Date()) return false;
  return true;
}

function renderTrialBanner(lic) {
  if (lic.type !== 'trial') return;
  const days = lic.days_remaining || 0;
  const el   = document.getElementById('trialBanner');
  if (!el) return;
  el.textContent = `Trial: ${days} day${days !== 1 ? 's' : ''} remaining`;
  el.style.display = 'block';
}

function renderLicenseError(tenant) {
  document.getElementById('loginCard').innerHTML = `
    <div style="text-align:center;padding:48px 24px">
      <div style="font-size:48px;margin-bottom:16px">⚠️</div>
      <h2 style="font-family:var(--font-display);font-size:20px;color:var(--crimson);margin-bottom:10px">
        License ${tenant.license?.status === 'expired' ? 'Expired' : 'Suspended'}
      </h2>
      <p style="font-size:13px;color:var(--text-3);line-height:1.7;margin-bottom:24px">
        The license for <strong style="color:var(--text-2)">${tenant.name}</strong>
        is no longer active. Contact Quantum Solutions to renew.
      </p>
      <a href="mailto:support@quantumsolutions.io"
         style="display:inline-block;padding:12px 24px;
                background:var(--gold-pale);border:1px solid var(--gold-dim);
                border-radius:8px;color:var(--gold);font-size:13px;
                font-weight:600;text-decoration:none">
        Contact Support →
      </a>
    </div>`;
}

// ============================================================
// BRANDING
// ============================================================
function applyTenantBranding(tenant, property) {
  const nameEl = document.getElementById('propertyName');
  if (nameEl) nameEl.textContent = property?.name || tenant.trading_name || tenant.name;
  if (tenant.logo_url) {
    const icon = document.querySelector('.brand-icon');
    if (icon) icon.innerHTML = `<img src="${tenant.logo_url}"
      style="width:28px;height:28px;object-fit:contain;border-radius:6px">`;
  }
}

// ============================================================
// DEMO ACCOUNTS (scoped to resolved tenant)
// ============================================================
function renderDemoAccounts(tenantId) {
  if (!FLAGS.demoMode) return;
  const tenantStaff = DEMO.staff
    .filter(s => s.tenant_id === tenantId)
    .slice(0, 6);

  document.getElementById('demoGrid').innerHTML = tenantStaff.map(s => {
    const route  = ROLE_ROUTES[s.role];
    const inits  = s.first_name[0] + s.last_name[0];
    return `
      <div class="demo-account" onclick="quickLogin('${s.email}')">
        <div class="demo-avatar" style="background:${s.avatar_color}">${inits}</div>
        <div class="demo-info">
          <div class="demo-name">${s.first_name} ${s.last_name}</div>
          <div class="demo-role-badge" style="color:${s.avatar_color}">
            ${s.role.replace(/_/g,' ')}
          </div>
        </div>
      </div>`;
  }).join('');
}

function quickLogin(email) {
  document.getElementById('emailInput').value = email;
  validateEmail();
  setTimeout(() => nextStep(), 150);
}

// ============================================================
// UTILITIES
// ============================================================
function parseJWT(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(atob(b64));
  } catch(e) { return null; }
}

function switchStep(fromId, toId) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  if (!from || !to) return;
  AUTH.step = toId.replace('step','').toLowerCase();
  from.style.cssText = 'opacity:0;transform:translateY(-8px);transition:opacity 0.2s,transform 0.2s';
  setTimeout(() => {
    from.classList.add('hidden');
    from.style.cssText = '';
    to.classList.remove('hidden');
    to.style.animation = 'none';
    requestAnimationFrame(() => { to.style.animation = ''; });
  }, 200);
}

function shakeEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'none';
  requestAnimationFrame(() => {
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  });
}

function setBtnLoading(id, on) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = on;
  if (on) {
    btn._h = btn.innerHTML;
    btn.innerHTML = `<div style="width:16px;height:16px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:_spin .7s linear infinite"></div>`;
  } else if (btn._h) {
    btn.innerHTML = btn._h;
  }
}

function showWarn(msg) {
  const w = document.getElementById('attemptsWarn');
  const m = document.getElementById('attemptsMsg');
  if (w && m) { m.textContent = msg; w.style.display = 'block'; }
}

function hideWarn() {
  const w = document.getElementById('attemptsWarn');
  if (w) w.style.display = 'none';
}

function startClock() {
  const tick = () => {
    const el = document.getElementById('brandClock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-UG', {
      hour:'2-digit', minute:'2-digit', second:'2-digit', hour12: false,
    });
  };
  tick(); setInterval(tick, 1000);
}

function initGrain() {
  const c = document.getElementById('grainCanvas');
  if (!c) return;
  const x = c.getContext('2d');
  const r = () => { c.width = innerWidth; c.height = innerHeight; };
  const d = () => {
    const img = x.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 11;
    }
    x.putImageData(img, 0, 0);
    requestAnimationFrame(d);
  };
  r(); addEventListener('resize', r); d();
}

// Inject keyframes
const _ks = document.createElement('style');
_ks.textContent = `
  @keyframes _spin { to { transform:rotate(360deg); } }
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)}
    60%{transform:translateX(-4px)}
    80%{transform:translateX(4px)}
  }`;
document.head.appendChild(_ks);

// Keyboard support on PIN step
document.addEventListener('keydown', e => {
  if (AUTH.step !== 'pin') return;
  if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (e.key >= '0' && e.key <= '9')  { pinInput(e.key); }
  else if (e.key === 'Backspace')     { e.preventDefault(); pinBackspace(); }
  else if (e.key === 'Delete')        { pinClear(); }
  else if (e.key === 'Escape')        { goBack(); }
  else if (e.key === 'Enter')         { attemptLogin(); }
});
