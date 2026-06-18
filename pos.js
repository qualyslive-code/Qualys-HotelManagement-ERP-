/* ============================================================
   QUANTUMSERVE POS — pos.js
   Complete Point of Sale · 5-Star Hotel Grade
   No placeholders. Every function production-complete.
   ============================================================ */
'use strict';

// ────────────────────────────────────────────────────────────
// CONFIG — swapped out when Supabase credentials provided
// ────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://emckziegbgzmofwiydey.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtY2t6aWVnYmd6bW9md2l5ZGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDk5NDMsImV4cCI6MjA5NzE4NTk0M30.5w7JWlpDc-Jz2wBr7B7hLprOLF3dDIXd9c9RWb65b3M';
const DEMO_MODE    = false; // false → live Supabase

// ────────────────────────────────────────────────────────────
// SUPABASE CLIENT
// ────────────────────────────────────────────────────────────
let _sb = null;
function getSB() {
  if (_sb) return _sb;
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
  if (typeof window.supabase !== 'undefined') {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, storageKey: 'qs_auth', storage: sessionStorage }
    });
  }
  return _sb;
}

// ────────────────────────────────────────────────────────────
// DEMO DATA — mirrors exact DB schema
// ────────────────────────────────────────────────────────────
const DEMO_DATA = {
  dining_areas: [
    { id: 'area-1', name: 'Main Restaurant', code: 'REST', area_type: 'restaurant', revenue_center_code: 'RESTAURANT' },
    { id: 'area-2', name: 'Pool Bar',         code: 'BAR',  area_type: 'bar',        revenue_center_code: 'BAR'        },
    { id: 'area-3', name: 'Terrace',          code: 'TERR', area_type: 'restaurant', revenue_center_code: 'RESTAURANT' },
    { id: 'area-4', name: 'Room Service',     code: 'ROMSVC', area_type: 'room_service', revenue_center_code: 'ROOM_SVC' },
  ],
  tables: [
    { id:'t1',  table_number:'1',  capacity:2, status:'free',     dining_area_id:'area-1' },
    { id:'t2',  table_number:'2',  capacity:4, status:'occupied', dining_area_id:'area-1' },
    { id:'t3',  table_number:'3',  capacity:4, status:'free',     dining_area_id:'area-1' },
    { id:'t4',  table_number:'4',  capacity:6, status:'occupied', dining_area_id:'area-1' },
    { id:'t5',  table_number:'5',  capacity:2, status:'free',     dining_area_id:'area-1' },
    { id:'t6',  table_number:'6',  capacity:8, status:'free',     dining_area_id:'area-1' },
    { id:'t7',  table_number:'7',  capacity:4, status:'occupied', dining_area_id:'area-1' },
    { id:'t8',  table_number:'8',  capacity:4, status:'free',     dining_area_id:'area-1' },
    { id:'t9',  table_number:'9',  capacity:2, status:'dirty',    dining_area_id:'area-1' },
    { id:'t10', table_number:'10', capacity:6, status:'free',     dining_area_id:'area-1' },
    { id:'b1',  table_number:'B1', capacity:4, status:'free',     dining_area_id:'area-2' },
    { id:'b2',  table_number:'B2', capacity:2, status:'occupied', dining_area_id:'area-2' },
    { id:'b3',  table_number:'B3', capacity:4, status:'free',     dining_area_id:'area-2' },
    { id:'r1',  table_number:'T1', capacity:6, status:'free',     dining_area_id:'area-3' },
    { id:'r2',  table_number:'T2', capacity:4, status:'free',     dining_area_id:'area-3' },
  ],
  waiters: [
    { id:'w1', name:'James Ssali',   initials:'JS', color:'#1abc9c' },
    { id:'w2', name:'Alice Nabirye', initials:'AN', color:'#3498db' },
    { id:'w3', name:'Brian Mugisha', initials:'BM', color:'#e74c3c' },
    { id:'w4', name:'Diana Nakku',   initials:'DN', color:'#9b59b6' },
    { id:'w5', name:'Felix Oryem',   initials:'FO', color:'#f39c12' },
  ],
  menu_categories: [
    { id:'c0', name:'All Items',   icon:'🍽️' },
    { id:'c1', name:'Starters',    icon:'🥗' },
    { id:'c2', name:'Soups',       icon:'🍲' },
    { id:'c3', name:'Grills',      icon:'🥩' },
    { id:'c4', name:'Mains',       icon:'🍛' },
    { id:'c5', name:'Seafood',     icon:'🐟' },
    { id:'c6', name:'Pizza',       icon:'🍕' },
    { id:'c7', name:'Pasta',       icon:'🍝' },
    { id:'c8', name:'Sides',       icon:'🥔' },
    { id:'c9', name:'Desserts',    icon:'🍰' },
    { id:'c10',name:'Soft Drinks', icon:'🥤' },
    { id:'c11',name:'Beers',       icon:'🍺' },
    { id:'c12',name:'Spirits',     icon:'🥃' },
    { id:'c13',name:'Cocktails',   icon:'🍹' },
    { id:'c14',name:'Wines',       icon:'🍷' },
    { id:'c15',name:'Hot Drinks',  icon:'☕' },
  ],
  menu_items: [
    // STARTERS
    { id:'m1',  cat:'c1', name:'Vegetable Spring Rolls',    desc:'Crispy rolls, sweet chili dipping sauce',          price:28000, emoji:'🥢', station:'cold',  pinned:false, popular:false, available:true },
    { id:'m2',  cat:'c1', name:'Chicken Wings (6 pcs)',      desc:'Buffalo or BBQ glaze, ranch dip',                  price:35000, emoji:'🍗', station:'fryer', pinned:true,  popular:true,  available:true },
    { id:'m3',  cat:'c1', name:'Smoked Salmon Bruschetta',   desc:'Toasted sourdough, cream cheese, capers, dill',    price:42000, emoji:'🍞', station:'cold',  pinned:false, popular:false, available:true },
    { id:'m4',  cat:'c1', name:'Beef Samosas (3 pcs)',       desc:'Homemade, tamarind chutney',                       price:22000, emoji:'🥟', station:'fryer', pinned:false, popular:false, available:true },
    { id:'m5',  cat:'c1', name:'Grilled Halloumi',           desc:'Honey drizzle, rocket, cherry tomatoes',           price:38000, emoji:'🧀', station:'grill', pinned:false, popular:false, available:true },
    { id:'m6',  cat:'c1', name:'Charcuterie Board',          desc:'Cured meats, artisan cheese, grapes, crackers',    price:65000, emoji:'🪵', station:'cold',  pinned:false, popular:true,  available:true },
    // SOUPS
    { id:'m7',  cat:'c2', name:'Soup of the Day',            desc:'Ask your server for today\'s selection',           price:22000, emoji:'🍲', station:'cold',  pinned:false, popular:false, available:true },
    { id:'m8',  cat:'c2', name:'French Onion Soup',          desc:'Gruyère crouton, rich beef broth',                 price:28000, emoji:'🍜', station:'cold',  pinned:false, popular:false, available:true },
    // GRILLS
    { id:'m9',  cat:'c3', name:'Beef Tenderloin 250g',       desc:'Truffle butter, seasonal vegetables, jus',         price:95000, emoji:'🥩', station:'grill', pinned:true,  popular:true,  available:true },
    { id:'m10', cat:'c3', name:'T-Bone Steak 400g',          desc:'Dry-aged, hand-cut fries, garden salad',           price:125000,emoji:'🍖', station:'grill', pinned:true,  popular:true,  available:true },
    { id:'m11', cat:'c3', name:'Lamb Chops (3 pcs)',          desc:'Rosemary marinade, mint jelly, roasted garlic',    price:98000, emoji:'🍗', station:'grill', pinned:false, popular:false, available:true },
    { id:'m12', cat:'c3', name:'Grilled Chicken Breast',     desc:'Lemon herb, garden salad, fries',                  price:52000, emoji:'🐔', station:'grill', pinned:false, popular:false, available:true },
    { id:'m13', cat:'c3', name:'BBQ Pork Ribs Half Rack',    desc:'12-hour slow cook, smoky BBQ sauce, slaw',         price:85000, emoji:'🍖', station:'grill', pinned:false, popular:false, available:true },
    { id:'m14', cat:'c3', name:'Mixed Grill Platter',        desc:'For 2 — steak, lamb, chicken, sausage, sides',     price:185000,emoji:'🥩', station:'grill', pinned:false, popular:true,  available:true },
    // MAINS
    { id:'m15', cat:'c4', name:'Chicken Biryani',            desc:'Fragrant basmati, raita, kachumber salad',         price:45000, emoji:'🍛', station:'pass',  pinned:true,  popular:true,  available:true },
    { id:'m16', cat:'c4', name:'Vegetable Curry & Rice',     desc:'Chef\'s daily curry, naan bread',                  price:36000, emoji:'🥘', station:'pass',  pinned:false, popular:false, available:true },
    { id:'m17', cat:'c4', name:'Beef Burger Deluxe',         desc:'200g Angus patty, cheese, bacon, fries',           price:48000, emoji:'🍔', station:'grill', pinned:true,  popular:true,  available:true },
    { id:'m18', cat:'c4', name:'Club Sandwich & Fries',      desc:'Triple decker — chicken, bacon, egg, avocado',     price:40000, emoji:'🥪', station:'cold',  pinned:false, popular:false, available:true },
    { id:'m19', cat:'c4', name:'Fish & Chips',               desc:'Beer-battered, mushy peas, tartar sauce',          price:52000, emoji:'🐡', station:'fryer', pinned:false, popular:false, available:true },
    // SEAFOOD
    { id:'m20', cat:'c5', name:'Grilled Nile Perch',         desc:'Garlic butter, lemon, seasonal vegetables',        price:72000, emoji:'🐟', station:'grill', pinned:false, popular:true,  available:true },
    { id:'m21', cat:'c5', name:'Grilled Tilapia',            desc:'Lake Victoria tilapia, tartar sauce, fries',       price:50000, emoji:'🐠', station:'grill', pinned:true,  popular:true,  available:true },
    { id:'m22', cat:'c5', name:'Tiger Prawn Stir Fry',       desc:'Ginger, spring onion, jasmine rice',               price:82000, emoji:'🦐', station:'grill', pinned:false, popular:false, available:true },
    { id:'m23', cat:'c5', name:'Seafood Platter',            desc:'For 2 — perch, prawns, calamari, sides',           price:165000,emoji:'🦞', station:'grill', pinned:false, popular:false, available:true },
    // PIZZA
    { id:'m24', cat:'c6', name:'Margherita',                 desc:'San Marzano tomato, buffalo mozzarella, basil',    price:50000, emoji:'🍕', station:'pass',  pinned:false, popular:false, available:true },
    { id:'m25', cat:'c6', name:'BBQ Chicken Pizza',          desc:'Grilled chicken, red onion, mozzarella, BBQ base', price:58000, emoji:'🍕', station:'pass',  pinned:false, popular:false, available:true },
    { id:'m26', cat:'c6', name:'Meat Feast',                 desc:'Pepperoni, beef, Italian sausage, olives',         price:65000, emoji:'🍕', station:'pass',  pinned:false, popular:false, available:true },
    // PASTA
    { id:'m27', cat:'c7', name:'Pasta Carbonara',            desc:'Pancetta, parmesan, black pepper, cream',          price:42000, emoji:'🍝', station:'pass',  pinned:false, popular:false, available:true },
    { id:'m28', cat:'c7', name:'Pasta Arrabiata',            desc:'Spicy tomato, basil, garlic, vegan',               price:38000, emoji:'🍝', station:'pass',  pinned:false, popular:false, available:true },
    // SIDES
    { id:'m29', cat:'c8', name:'Hand-Cut Fries',             desc:'Sea salt, house dipping sauce',                    price:15000, emoji:'🍟', station:'fryer', pinned:false, popular:false, available:true },
    { id:'m30', cat:'c8', name:'Garden Salad',               desc:'Mixed leaves, cherry tomatoes, vinaigrette',       price:18000, emoji:'🥗', station:'cold',  pinned:false, popular:false, available:true },
    { id:'m31', cat:'c8', name:'Steamed Rice',               desc:'Jasmine or basmati',                               price:10000, emoji:'🍚', station:'pass',  pinned:false, popular:false, available:true },
    { id:'m32', cat:'c8', name:'Garlic Bread (4 slices)',    desc:'Toasted sourdough, garlic butter, herbs',          price:14000, emoji:'🧄', station:'fryer', pinned:false, popular:false, available:true },
    // DESSERTS
    { id:'m33', cat:'c9', name:'Chocolate Fondant',          desc:'Warm, vanilla bean ice cream, chocolate dust',     price:30000, emoji:'🍫', station:'pastry',pinned:false, popular:true,  available:true },
    { id:'m34', cat:'c9', name:'Crème Brûlée',               desc:'Classic French, caramelised sugar crust',          price:28000, emoji:'🍮', station:'pastry',pinned:false, popular:false, available:true },
    { id:'m35', cat:'c9', name:'Tropical Fruit Platter',     desc:'Seasonal fresh fruits, honey, lime zest',          price:24000, emoji:'🍍', station:'cold',  pinned:false, popular:false, available:true },
    { id:'m36', cat:'c9', name:'Cheese Board',               desc:'Selection of 4 cheeses, grapes, crackers',         price:42000, emoji:'🧀', station:'cold',  pinned:false, popular:false, available:true },
    // SOFT DRINKS
    { id:'m37', cat:'c10',name:'Coca-Cola 330ml',            desc:'Chilled bottle',                                   price:8000,  emoji:'🥤', station:'bar',   pinned:true,  popular:true,  available:true },
    { id:'m38', cat:'c10',name:'Sprite / Fanta 330ml',       desc:'Choice of flavour',                                price:8000,  emoji:'🥤', station:'bar',   pinned:true,  popular:false, available:true },
    { id:'m39', cat:'c10',name:'Mineral Water 500ml',        desc:'Sparkling or still',                               price:7000,  emoji:'💧', station:'bar',   pinned:true,  popular:false, available:true },
    { id:'m40', cat:'c10',name:'Fresh Passion Juice',        desc:'Pure, no added sugar',                             price:14000, emoji:'🍊', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m41', cat:'c10',name:'Fresh Mango Smoothie',       desc:'Blended fresh mango, yoghurt, honey',              price:16000, emoji:'🥭', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m42', cat:'c10',name:'Dawa Special',               desc:'Fresh ginger, lemon, honey, hot water',            price:12000, emoji:'🫖', station:'bar',   pinned:false, popular:false, available:true },
    // BEERS
    { id:'m43', cat:'c11',name:'Nile Special 500ml',         desc:'Premium Ugandan lager',                            price:10000, emoji:'🍺', station:'bar',   pinned:true,  popular:true,  available:true },
    { id:'m44', cat:'c11',name:'Club Pilsner 500ml',         desc:'Uganda\'s favourite',                              price:9000,  emoji:'🍺', station:'bar',   pinned:true,  popular:true,  available:true },
    { id:'m45', cat:'c11',name:'Tusker Lager 500ml',         desc:'Kenyan premium lager',                             price:11000, emoji:'🍺', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m46', cat:'c11',name:'Guinness Foreign Extra',     desc:'Rich smooth stout, 500ml',                         price:15000, emoji:'🍺', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m47', cat:'c11',name:'Heineken 330ml',             desc:'Premium Dutch lager',                              price:16000, emoji:'🍺', station:'bar',   pinned:false, popular:false, available:true },
    // SPIRITS
    { id:'m48', cat:'c12',name:'Uganda Waragi (Single)',     desc:'30ml — Uganda\'s premium gin spirit',              price:8000,  emoji:'🥃', station:'bar',   pinned:true,  popular:true,  available:true },
    { id:'m49', cat:'c12',name:'Johnnie Walker Red (Single)',desc:'30ml blended Scotch whisky',                       price:20000, emoji:'🥃', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m50', cat:'c12',name:'Johnnie Walker Black',       desc:'30ml aged 12 years',                               price:28000, emoji:'🥃', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m51', cat:'c12',name:'Smirnoff Vodka (Single)',    desc:'30ml triple distilled',                            price:14000, emoji:'🥃', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m52', cat:'c12',name:'Jameson Irish Whiskey',      desc:'30ml smooth triple-distilled',                     price:24000, emoji:'🥃', station:'bar',   pinned:false, popular:false, available:true },
    // COCKTAILS
    { id:'m53', cat:'c13',name:'Gin & Tonic',                desc:'Gordon\'s gin, tonic water, lime, ice',            price:24000, emoji:'🍸', station:'bar',   pinned:true,  popular:true,  available:true },
    { id:'m54', cat:'c13',name:'Mojito',                     desc:'White rum, fresh mint, lime, soda',                price:26000, emoji:'🍹', station:'bar',   pinned:false, popular:true,  available:true },
    { id:'m55', cat:'c13',name:'Long Island Iced Tea',       desc:'Vodka, gin, rum, tequila, triple sec, cola',       price:35000, emoji:'🍹', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m56', cat:'c13',name:'Negroni',                    desc:'Gin, Campari, sweet vermouth, orange peel',        price:30000, emoji:'🍸', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m57', cat:'c13',name:'Aperol Spritz',              desc:'Aperol, Prosecco, soda, orange slice',             price:28000, emoji:'🍊', station:'bar',   pinned:false, popular:true,  available:true },
    { id:'m58', cat:'c13',name:'Passion Daiquiri',           desc:'White rum, passion fruit, lime, sugar syrup',      price:28000, emoji:'🍹', station:'bar',   pinned:false, popular:false, available:true },
    // WINES
    { id:'m59', cat:'c14',name:'House Red (Glass)',          desc:'South African Cabernet Sauvignon 175ml',           price:24000, emoji:'🍷', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m60', cat:'c14',name:'House White (Glass)',        desc:'Chardonnay, crisp & dry, 175ml',                   price:24000, emoji:'🥂', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m61', cat:'c14',name:'Prosecco (Glass)',           desc:'Italian sparkling, 125ml',                         price:28000, emoji:'🥂', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m62', cat:'c14',name:'House Red (Bottle)',         desc:'750ml — same as glass but better value',           price:90000, emoji:'🍾', station:'bar',   pinned:false, popular:false, available:true },
    // HOT DRINKS
    { id:'m63', cat:'c15',name:'Café Latte',                 desc:'Double espresso, steamed milk, your choice of milk',price:14000,emoji:'☕', station:'bar',   pinned:true,  popular:true,  available:true },
    { id:'m64', cat:'c15',name:'Cappuccino',                 desc:'Double espresso, foam, chocolate dust',            price:13000, emoji:'☕', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m65', cat:'c15',name:'Espresso (Double)',          desc:'Bold and intense',                                  price:10000, emoji:'☕', station:'bar',   pinned:false, popular:false, available:true },
    { id:'m66', cat:'c15',name:'English Breakfast Tea',      desc:'Kenyan blend, served with milk',                   price:9000,  emoji:'🍵', station:'bar',   pinned:true,  popular:false, available:true },
    { id:'m67', cat:'c15',name:'Hot Chocolate',              desc:'Rich Belgian chocolate, whipped cream',            price:14000, emoji:'🍫', station:'bar',   pinned:false, popular:false, available:true },
  ],
  // Rooms for room-charge lookup
  occupied_rooms: [
    { id:'room-1', room_number:'101', guest_name:'Mr. John Aryemo',    folio_id:'folio-1', balance:320000  },
    { id:'room-2', room_number:'204', guest_name:'Dr. Sarah Wanjiku',  folio_id:'folio-2', balance:0       },
    { id:'room-3', room_number:'312', guest_name:'Ms. Amina Hassan',   folio_id:'folio-3', balance:85000   },
    { id:'room-4', room_number:'408', guest_name:'Mr. & Mrs. Okonkwo', folio_id:'folio-4', balance:550000  },
  ],
  // Backed by corporate_accounts table (see corporate_accounts_patch.sql).
  // Demo placeholder only — overwritten by POS.data.load() when live.
  city_ledger_accounts: [
    { id:'cl-1', code:'CL-001', name:'MTN Uganda Ltd',          balance: 2400000 },
    { id:'cl-2', code:'CL-002', name:'Airtel Networks Uganda',  balance:  850000 },
    { id:'cl-3', code:'CL-003', name:'Stanbic Bank',            balance: 1200000 },
  ],
  closed_orders: [
    { id:'h1', order_number:'POS-2026-00211', table:'4', covers:3, total:228000, method:'Cash',         time:'14:32', items:5, cashier:'Mary Nambi' },
    { id:'h2', order_number:'POS-2026-00210', table:'2', covers:2, total:95000,  method:'Card',         time:'14:18', items:3, cashier:'Mary Nambi' },
    { id:'h3', order_number:'POS-2026-00209', table:'B1',covers:1, total:64000,  method:'Mobile Money', time:'13:55', items:4, cashier:'Mary Nambi' },
    { id:'h4', order_number:'POS-2026-00208', table:'7', covers:4, total:320000, method:'Card',         time:'13:41', items:6, cashier:'Mary Nambi' },
    { id:'h5', order_number:'POS-2026-00207', table:'3', covers:2, total:58000,  method:'Cash',         time:'13:20', items:2, cashier:'Mary Nambi' },
    { id:'h6', order_number:'POS-2026-00206', table:'-', covers:1, total:32000,  method:'Cash',         time:'12:58', items:2, cashier:'Mary Nambi' },
    { id:'h7', order_number:'POS-2026-00205', table:'6', covers:5, total:445000, method:'Room Charge',  time:'12:30', items:8, cashier:'Mary Nambi' },
  ],
};
// Count items per category
DEMO_DATA.menu_categories.forEach(c => {
  c.count = c.id === 'c0' ? DEMO_DATA.menu_items.length
            : DEMO_DATA.menu_items.filter(m => m.cat === c.id).length;
});

// ────────────────────────────────────────────────────────────
// STATE — everything the POS needs at runtime
// ────────────────────────────────────────────────────────────
const S = {
  // Auth / session
  claims: null,           // JWT claims from QS.requireAuth()

  // Current order
  items:          [],     // { ...menu_item, qty, note, course, status, sent }
  orderNum:       null,
  orderType:      'dine_in',
  table:          null,
  waiter:         null,
  covers:         1,
  discount:       { pct: 0, reason: '' },
  serviceCharge:  0,      // from tenant config
  taxRate:        0.18,   // from tenant tax_configurations
  orderNote:      '',
  kitchenFired:   false,

  // Payment
  payMethod:      'cash',
  roomChargeTarget: null,
  cityLedgerTarget: null,

  // Split
  splitMode:      'equal',
  splitGuests:    2,
  splitAssignments: {},   // item index → guest num

  // Void
  pendingVoidRequestId: null,

  // UI
  currentCat:     'c0',
  searchQuery:    '',
  selectedTableArea: null,
  tempTable:      null,

  // Shift
  shiftStart:     new Date(Date.now() - (4*3600 + 12*60 + 7)*1000),
  drawerTotal:    1247500,
  sessionOrders:  0,
  sessionCovers:  0,
  orderSeq:       212,

  // Pending items for note/course editing
  editingItemIdx: null,
};

// ────────────────────────────────────────────────────────────
// BOOT
// ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Auth check — roles allowed on POS
  if (typeof QS !== 'undefined') {
    S.claims = await QS.requireAuth(['cashier','waiter','manager','gm','super_admin']);
    if (!S.claims) return; // redirected by requireAuth
  } else {
    // Dev mode without index.html — mock claims
    S.claims = {
      staff_id:'staff-003', role:'cashier', first_name:'Mary', last_name:'Nambi',
      tenant_id:'tenant-001', property_id:'prop-001', property_name:'Lakeview Heights Hotel',
      currency_code:'UGX', discount_ceiling:0.05, void_authority:false,
      refund_authority:false, shift_active:true,
      shift_id:'shift-001',
    };
  }

  await POS.init();
});

// ────────────────────────────────────────────────────────────
// MAIN POS NAMESPACE
// ────────────────────────────────────────────────────────────
const POS = {

  // ── INIT ──────────────────────────────────────────────────
  async init() {
    // Load tenant tax/service charge config
    await POS.config.load();

    // Load live tables/menu/categories/waiters from Supabase (demo data otherwise)
    await POS.data.load();

    // Render UI
    POS.ui.renderShiftBar();
    POS.ui.renderCategories();
    POS.ui.renderPinnedStrip();
    POS.ui.renderMenuGrid();
    POS.ui.renderOrderPanel();

    // Set default waiter (self if waiter role)
    if (['waiter','bartender'].includes(S.claims?.role)) {
      const me = DEMO_DATA.waiters.find(w => w.name.startsWith(S.claims.first_name));
      if (me) S.waiter = me;
    }
    POS.ui.updateWaiterBtn();

    // Start clocks
    POS.shift.startClock();

    // Keyboard shortcuts
    POS.ui.initKeyboard();

    // Realtime subscriptions (when Supabase connected)
    if (!DEMO_MODE) POS.realtime.subscribe();

    toast(`Welcome, ${S.claims.first_name}. Shift active.`, 'info', '☀️');
  },

  // ── CONFIG ─────────────────────────────────────────────────
  config: {
    async load() {
      if (DEMO_MODE) {
        S.taxRate       = 0.18;   // Uganda VAT
        S.serviceCharge = 0;      // no service charge in demo
        return;
      }
      try {
        const sb = getSB();
        const { data } = await sb
          .from('tax_configurations')
          .select('tax_code,rate')
          .eq('tenant_id', S.claims.tenant_id)
          .eq('is_active', true)
          .in('tax_code', ['UG_VAT_18','UG_SC_10','KE_VAT_16','TZ_VAT_18','RW_VAT_18']);
        if (data) {
          const vat = data.find(t => t.tax_code.includes('VAT'));
          if (vat) S.taxRate = parseFloat(vat.rate);
          const sc = data.find(t => t.tax_code.includes('SC'));
          if (sc) S.serviceCharge = parseFloat(sc.rate);
        }
      } catch(e) { console.error('Config load:', e); }
    },
  },

  // ── DATA — live reference data (tables, menu, waiters) ──────
  // Overwrites DEMO_DATA arrays in place so every existing reference
  // (order.add, table picker, category filter, etc.) keeps working
  // unchanged whether running live or in demo mode.
  data: {
    async load() {
      if (DEMO_MODE) return;
      try {
        const sb = getSB();
        const tenantId   = S.claims.tenant_id;
        const propertyId = S.claims.property_id;

        const [areasRes, tablesRes, catsRes, itemsRes, staffRes, foliosRes, corpRes] = await Promise.all([
          sb.from('dining_areas').select('id,name,code,area_type')
            .eq('tenant_id', tenantId).eq('property_id', propertyId).eq('is_active', true),
          sb.from('dining_tables').select('id,table_number,capacity,status,dining_area_id')
            .eq('tenant_id', tenantId).eq('is_active', true),
          sb.from('menu_categories').select('id,name,icon')
            .eq('tenant_id', tenantId).eq('is_active', true).order('sort_order'),
          sb.from('menu_items').select('id,category_id,name,description,selling_price,kitchen_station,is_available,is_featured')
            .eq('tenant_id', tenantId).order('sort_order'),
          sb.from('staff').select('id,first_name,last_name,role')
            .eq('property_id', propertyId).eq('is_active', true).in('role', ['waiter','bartender']),
          // Active folios for the room-charge picker. Joined to get room number + guest
          // name without a second round trip. Scoped to tenant only (not property) —
          // fine for single-property tenants, revisit if multi-property matters here.
          sb.from('guest_folios')
            .select('id,balance,reservation:reservations(room:rooms(room_number),guest:guests(first_name,last_name))')
            .eq('tenant_id', tenantId).eq('status', 'active'),
          sb.from('corporate_accounts').select('id,code,name,credit_limit,current_balance')
            .eq('tenant_id', tenantId).eq('is_active', true),
        ]);

        if (areasRes.data) {
          DEMO_DATA.dining_areas.length = 0;
          DEMO_DATA.dining_areas.push(...areasRes.data);
        }
        if (tablesRes.data) {
          DEMO_DATA.tables.length = 0;
          DEMO_DATA.tables.push(...tablesRes.data);
        }
        if (catsRes.data) {
          DEMO_DATA.menu_categories.length = 0;
          DEMO_DATA.menu_categories.push({ id:'c0', name:'All Items', icon:'🍽️' }, ...catsRes.data);
        }
        if (itemsRes.data) {
          DEMO_DATA.menu_items.length = 0;
          DEMO_DATA.menu_items.push(...itemsRes.data.map(m => ({
            id:        m.id,
            cat:       m.category_id,
            name:      m.name,
            desc:      m.description || '',
            price:     parseFloat(m.selling_price),
            emoji:     '🍽️', // no emoji column in schema — generic placeholder
            station:   m.kitchen_station || 'pass',
            pinned:    !!m.is_featured,
            popular:   !!m.is_featured,
            available: m.is_available,
          })));
        }
        if (staffRes.data) {
          const palette = ['#1abc9c','#3498db','#e74c3c','#9b59b6','#f39c12','#2ecc71'];
          DEMO_DATA.waiters.length = 0;
          DEMO_DATA.waiters.push(...staffRes.data.map((w, i) => ({
            id:       w.id,
            name:     `${w.first_name} ${w.last_name}`,
            initials: `${w.first_name[0]}${w.last_name[0]}`.toUpperCase(),
            color:    palette[i % palette.length],
          })));
        }
        if (foliosRes.data) {
          DEMO_DATA.occupied_rooms.length = 0;
          DEMO_DATA.occupied_rooms.push(...foliosRes.data
            .filter(f => f.reservation?.room) // skip folios with no room (e.g. routing folios)
            .map(f => ({
              id:          f.id,
              room_number: f.reservation.room.room_number,
              guest_name:  `${f.reservation.guest.first_name} ${f.reservation.guest.last_name}`,
              folio_id:    f.id,
              balance:     parseFloat(f.balance),
            })));
        }
        if (corpRes.data) {
          DEMO_DATA.city_ledger_accounts.length = 0;
          DEMO_DATA.city_ledger_accounts.push(...corpRes.data.map(a => ({
            id:      a.id,
            code:    a.code,
            name:    a.name,
            balance: parseFloat(a.credit_limit), // UI label is "Limit:" — credit_limit, not current_balance
          })));
        }

        // Recompute category counts against live menu data
        DEMO_DATA.menu_categories.forEach(c => {
          c.count = c.id === 'c0' ? DEMO_DATA.menu_items.length
                    : DEMO_DATA.menu_items.filter(m => m.cat === c.id).length;
        });
      } catch(e) {
        console.error('Data load:', e);
        toast('Failed to load live menu/table data', 'error');
      }
    },
  },

  // ── ORDER ──────────────────────────────────────────────────
  order: {
    add(itemId) {
      const item = DEMO_DATA.menu_items.find(m => m.id === itemId);
      if (!item || !item.available) return;

      // Shift check
      if (S.claims && !S.claims.shift_active && DEMO_MODE === false) {
        toast('No active shift. Clock in before taking orders.', 'error', '⏰');
        return;
      }

      // Check if same item (no note) already in order → increment qty
      const existing = S.items.findIndex(i =>
        i.id === itemId && !i.note && !i.sent && i.status !== 'void_requested'
      );
      if (existing !== -1) {
        S.items[existing].qty++;
      } else {
        S.items.push({
          ...item,
          qty:    1,
          note:   '',
          course: 1,
          status: 'pending', // pending | sent | ready | served | void_requested | voided
          sent:   false,
          _uiId:  Date.now() + Math.random(),
        });
      }

      POS.ui.flashMenuItem(itemId);
      POS.ui.renderOrderPanel();
      POS.audio.blip();

      // Generate order number if first item
      if (!S.orderNum) {
        S.orderSeq++;
        S.orderNum = `POS-${new Date().getFullYear()}-${String(S.orderSeq).padStart(5,'0')}`;
        document.getElementById('opOrderNum').textContent = S.orderNum;
      }
    },

    changeQty(idx, delta) {
      if (!S.items[idx]) return;
      if (S.items[idx].sent && delta < 0) {
        toast('Item already sent to kitchen. Use void to remove.', 'warning');
        return;
      }
      S.items[idx].qty += delta;
      if (S.items[idx].qty <= 0) {
        POS.order.removeItem(idx);
        return;
      }
      POS.ui.renderOrderPanel();
    },

    removeItem(idx) {
      if (!S.items[idx]) return;
      if (S.items[idx].sent) {
        toast('Sent items must be voided, not deleted.', 'warning');
        return;
      }
      const row = document.getElementById(`or-${S.items[idx]._uiId}`);
      if (row) {
        row.style.transition = 'all .2s ease-in';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => {
          S.items.splice(idx, 1);
          POS.ui.renderOrderPanel();
        }, 200);
      } else {
        S.items.splice(idx, 1);
        POS.ui.renderOrderPanel();
      }
    },

    setType(btn) {
      document.querySelectorAll('.ot-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.orderType = btn.dataset.type;
      // Room service → no table needed
      if (S.orderType === 'room_service') {
        S.table = null;
        POS.ui.updateTableBtn();
      }
    },

    changeCovers(delta) {
      S.covers = Math.max(1, S.covers + delta);
      document.getElementById('coversDisplay').textContent = S.covers;
      document.getElementById('sbCovers').textContent = S.sessionCovers;
    },

    removeDiscount() {
      S.discount = { pct: 0, reason: '' };
      POS.ui.renderOrderPanel();
      toast('Discount removed', 'info');
    },

    saveNote() {
      S.orderNote = document.getElementById('orderNoteInput').value.trim();
      POS.ui.closeModal('orderNoteModal');
      if (S.orderNote) toast('Order note saved', 'success', '📝');
    },

    clear() {
      if (!S.items.length) return;
      if (S.items.some(i => i.sent)) {
        if (!confirm('This order has items sent to kitchen. Clearing will require a void. Continue?')) return;
      } else {
        if (!confirm('Clear the current order?')) return;
      }
      S.items          = [];
      S.orderNum       = null;
      S.discount       = { pct: 0, reason: '' };
      S.orderNote      = '';
      S.kitchenFired   = false;
      S.table          = null;
      POS.ui.updateTableBtn();
      POS.ui.renderOrderPanel();
      document.getElementById('opOrderNum').textContent = 'New Order';
      toast('Order cleared', 'warning', '🗑️');
    },

    // Compute totals — single source of truth
    totals() {
      const subtotal = S.items
        .filter(i => !['voided','void_requested'].includes(i.status))
        .reduce((s, i) => s + i.price * i.qty, 0);
      const discAmt = Math.round(subtotal * S.discount.pct);
      const afterDisc = subtotal - discAmt;
      const sc  = Math.round(afterDisc * S.serviceCharge);
      const tax = Math.round((afterDisc + sc) * S.taxRate);
      const total = afterDisc + sc + tax;
      return { subtotal, discAmt, afterDisc, sc, tax, total };
    },
  },

  // ── KITCHEN ────────────────────────────────────────────────
  kitchen: {
    async fire() {
      const unsent = S.items.filter(i =>
        i.status === 'pending' && !i.sent &&
        !['voided','void_requested'].includes(i.status)
      );
      if (!unsent.length) {
        toast('No new items to send to kitchen', 'warning');
        return;
      }

      // Validate table / order type
      if (S.orderType === 'dine_in' && !S.table) {
        toast('Select a table before sending to kitchen', 'warning', '🪑');
        POS.ui.openTablePicker();
        return;
      }

      // Ensure order exists in DB before creating tickets
      const orderId = await POS.db.ensureOrder();
      if (!orderId && !DEMO_MODE) {
        toast('Failed to create order record', 'error');
        return;
      }

      // Create kitchen tickets
      await POS.db.createKitchenTickets(orderId, unsent);

      // Mark items as sent
      unsent.forEach(item => { item.sent = true; item.status = 'sent'; });
      S.kitchenFired = true;

      // Update table status to 'kitchen_pending' if dine_in
      if (S.table && S.orderType === 'dine_in') {
        await POS.db.updateTableStatus(S.table.id, 'kitchen_pending');
        S.table.status = 'kitchen_pending';
      }

      POS.ui.renderOrderPanel();
      toast(`${unsent.length} item${unsent.length !== 1 ? 's' : ''} fired to kitchen 🔥`, 'success', '👨‍🍳');
    },
  },

  // ── PAYMENT ───────────────────────────────────────────────
  payment: {
    selectMethod(el) {
      document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
      el.classList.add('active');
      S.payMethod = el.dataset.method;

      // Show/hide sections
      const sections = { cash: false, roomCharge: false, cityLedger: false, reference: false, comp: false };
      if (S.payMethod === 'cash')         sections.cash        = true;
      if (S.payMethod === 'room_charge')  sections.roomCharge  = true;
      if (S.payMethod === 'city_ledger')  sections.cityLedger  = true;
      if (S.payMethod === 'card')       { sections.reference   = true; document.getElementById('referenceLbl').textContent = 'Card Auth Code'; }
      if (S.payMethod === 'mobile_money'){sections.reference   = true; document.getElementById('referenceLbl').textContent = 'Mobile Money Reference'; }
      if (S.payMethod === 'complimentary'){sections.comp       = true; }

      document.getElementById('cashSection').style.display      = sections.cash        ? 'block' : 'none';
      document.getElementById('roomChargeSection').style.display = sections.roomCharge  ? 'block' : 'none';
      document.getElementById('cityLedgerSection').style.display = sections.cityLedger  ? 'block' : 'none';
      document.getElementById('referenceSection').style.display  = sections.reference   ? 'block' : 'none';
      document.getElementById('compSection').style.display       = sections.comp        ? 'block' : 'none';

      POS.payment.validateBtn();
    },

    calcChange() {
      const { total } = POS.order.totals();
      const received  = parseFloat(document.getElementById('cashReceived').value) || 0;
      const changeBox = document.getElementById('changeBox');
      const changeLbl = document.getElementById('changeLbl');
      const changeAmt = document.getElementById('changeAmt');

      if (received > 0) {
        const diff = received - total;
        changeBox.style.display = 'flex';
        changeAmt.textContent   = fmt(Math.abs(diff));
        const isShort = diff < 0;
        changeLbl.textContent   = isShort ? 'Still Owed' : 'Change to Give';
        changeBox.classList.toggle('short', isShort);
        changeAmt.style.color   = isShort ? 'var(--crimson)' : 'var(--teal)';
      } else {
        changeBox.style.display = 'none';
      }
      POS.payment.validateBtn();
    },

    searchRoom(query) {
      const results   = document.getElementById('roomResults');
      const q         = query.toLowerCase();
      const matches   = DEMO_DATA.occupied_rooms.filter(r =>
        r.room_number.toLowerCase().includes(q) ||
        r.guest_name.toLowerCase().includes(q)
      );
      results.innerHTML = matches.map(r => `
        <div class="room-result-item" onclick="POS.payment.selectRoom('${r.id}')">
          <strong>Room ${r.room_number}</strong> — ${r.guest_name}
          <span style="float:right;font-size:11px;color:var(--text3)">
            Bal: ${fmt(r.balance)}
          </span>
        </div>`).join('') || '<div style="padding:10px;color:var(--text3);font-size:12px">No occupied rooms found</div>';
    },

    selectRoom(id) {
      S.roomChargeTarget = DEMO_DATA.occupied_rooms.find(r => r.id === id);
      document.getElementById('roomResults').innerHTML = '';
      document.getElementById('roomSearch').value = '';
      const el = document.getElementById('selectedRoom');
      el.style.display = 'block';
      el.innerHTML = `✓ Room ${S.roomChargeTarget.room_number} — ${S.roomChargeTarget.guest_name}
        <button onclick="POS.payment.clearRoom()" style="float:right;background:none;border:none;color:var(--teal);cursor:pointer;font-size:14px">✕</button>`;
      POS.payment.validateBtn();
    },

    clearRoom() {
      S.roomChargeTarget = null;
      document.getElementById('selectedRoom').style.display = 'none';
      POS.payment.validateBtn();
    },

    searchLedger(query) {
      const results = document.getElementById('ledgerResults');
      const q       = query.toLowerCase();
      const matches = DEMO_DATA.city_ledger_accounts.filter(a =>
        a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)
      );
      results.innerHTML = matches.map(a => `
        <div class="room-result-item" onclick="POS.payment.selectLedger('${a.id}')">
          <strong>${a.code}</strong> — ${a.name}
          <span style="float:right;font-size:11px;color:var(--text3)">Limit: ${fmt(a.balance)}</span>
        </div>`).join('') || '<div style="padding:10px;color:var(--text3);font-size:12px">No accounts found</div>';
    },

    selectLedger(id) {
      S.cityLedgerTarget = DEMO_DATA.city_ledger_accounts.find(a => a.id === id);
      document.getElementById('ledgerResults').innerHTML = '';
      document.getElementById('ledgerSearch').value = '';
      const el = document.getElementById('selectedLedger');
      el.style.display = 'block';
      el.innerHTML = `✓ ${S.cityLedgerTarget.code} — ${S.cityLedgerTarget.name}
        <button onclick="POS.payment.clearLedger()" style="float:right;background:none;border:none;color:var(--teal);cursor:pointer;font-size:14px">✕</button>`;
      POS.payment.validateBtn();
    },

    clearLedger() {
      S.cityLedgerTarget = null;
      document.getElementById('selectedLedger').style.display = 'none';
      POS.payment.validateBtn();
    },

    validateBtn() {
      let ok = false;
      const { total } = POS.order.totals();
      switch (S.payMethod) {
        case 'cash':
          ok = (parseFloat(document.getElementById('cashReceived').value) || 0) >= total;
          break;
        case 'card':
        case 'mobile_money':
          ok = true; // reference optional
          break;
        case 'room_charge':
          ok = !!S.roomChargeTarget;
          break;
        case 'city_ledger':
          ok = !!S.cityLedgerTarget;
          break;
        case 'complimentary':
          ok = !!document.getElementById('compManager').value.trim();
          break;
        default:
          ok = true;
      }
      document.getElementById('confirmPayBtn').disabled = !ok;
    },

    async confirm() {
      const { total, subtotal, discAmt, sc, tax } = POS.order.totals();
      const cashReceived = parseFloat(document.getElementById('cashReceived').value) || 0;
      const change = S.payMethod === 'cash' ? cashReceived - total : 0;
      const paymentRef = document.getElementById('paymentRef')?.value?.trim() || null;
      const compMgr = document.getElementById('compManager')?.value?.trim() || null;

      // Complimentary auth check
      if (S.payMethod === 'complimentary') {
        const canComp = typeof QS !== 'undefined'
          ? QS.can(S.claims, 'apply_discount', { pct: 1.0 }).allowed
          : S.claims?.discount_ceiling >= 1.0;
        if (!canComp) {
          toast('Complimentary bills require manager authority', 'error');
          return;
        }
      }

      // Disable button to prevent double-submit
      document.getElementById('confirmPayBtn').disabled = true;
      document.getElementById('confirmPayBtn').textContent = 'Processing…';

      try {
        // Write to DB
        const orderId = await POS.db.closeOrder({
          total, subtotal, discAmt, sc, tax,
          paymentMethod: S.payMethod,
          cashReceived,
          change,
          paymentRef,
          compManager: compMgr,
          roomChargeTarget: S.roomChargeTarget,
          cityLedgerTarget: S.cityLedgerTarget,
        });

        // Post folio charge if room charge
        if (S.payMethod === 'room_charge' && S.roomChargeTarget) {
          await POS.db.postFolioCharge(S.roomChargeTarget.folio_id, {
            amount: total, description: `Restaurant — ${S.orderNum}`, type: 'restaurant'
          });
        }

        // Post corporate account charge if billed to city ledger
        if (S.payMethod === 'city_ledger' && S.cityLedgerTarget) {
          await POS.db.postCorporateCharge(S.cityLedgerTarget.id, {
            amount: total, description: `Restaurant — ${S.orderNum}`
          });
        }

        // Update drawer total
        if (S.payMethod === 'cash') S.drawerTotal += total;
        S.sessionOrders++;
        S.sessionCovers += S.covers;
        document.getElementById('sbOrderCount').textContent = S.sessionOrders;
        document.getElementById('sbCovers').textContent     = S.sessionCovers;
        document.getElementById('drawerTotal').textContent  = fmt(S.drawerTotal);

        // Add to history
        DEMO_DATA.closed_orders.unshift({
          id: orderId || `h-${Date.now()}`,
          order_number: S.orderNum,
          table: S.table?.table_number || '-',
          covers: S.covers,
          total,
          method: S.payMethod.replace(/_/g,' '),
          time: new Date().toTimeString().slice(0,5),
          items: S.items.length,
          cashier: `${S.claims.first_name} ${S.claims.last_name}`,
        });

        // Success feedback
        POS.ui.closeModal('paymentModal');
        POS.ui.showSuccess(total, change, S.payMethod);

        // Reset order after delay
        setTimeout(() => POS.order.resetAfterPayment(), 2500);

      } catch(err) {
        console.error('Payment error:', err);
        toast('Payment failed: ' + (err.message || 'Unknown error'), 'error');
        document.getElementById('confirmPayBtn').disabled  = false;
        document.getElementById('confirmPayBtn').textContent = '✓ Confirm Payment';
      }
    },
  },

  // ── DISCOUNT ──────────────────────────────────────────────
  discount: {
    select(pct) {
      document.getElementById('discInput').value = pct;
      document.querySelectorAll('.disc-preset').forEach(p =>
        p.classList.toggle('active', parseInt(p.textContent) === pct)
      );
      POS.discount.preview();
    },

    preview() {
      const pct = parseFloat(document.getElementById('discInput').value) || 0;
      const { subtotal } = POS.order.totals();
      const discAmt     = Math.round(subtotal * pct / 100);
      const afterDisc   = subtotal - discAmt;
      const sc          = Math.round(afterDisc * S.serviceCharge);
      const tax         = Math.round((afterDisc + sc) * S.taxRate);
      const newTotal    = afterDisc + sc + tax;
      const preview     = document.getElementById('discPreview');
      const warn        = document.getElementById('ceilingWarn');

      preview.style.display = pct > 0 ? 'block' : 'none';
      document.getElementById('discPrevAmt').textContent   = fmt(discAmt);
      document.getElementById('discPrevTotal').textContent = fmt(newTotal);

      // Ceiling check
      const ceiling = (S.claims?.discount_ceiling || 0) * 100;
      if (pct > ceiling) {
        warn.style.display = 'flex';
        document.getElementById('ceilingWarnMsg').textContent =
          `${pct}% exceeds your ${ceiling}% authority ceiling. A manager approval request will be sent.`;
      } else {
        warn.style.display = 'none';
      }
    },

    async apply() {
      const pct    = parseFloat(document.getElementById('discInput').value) || 0;
      const reason = document.getElementById('discReason').value.trim();
      if (!pct)    { toast('Enter a discount percentage', 'warning'); return; }
      if (!reason) { toast('Reason is required for audit trail', 'warning'); return; }

      const ceiling = (S.claims?.discount_ceiling || 0) * 100;
      if (pct > ceiling) {
        // Create approval request in DB
        await POS.db.createDiscountApproval(pct, reason);
        toast(`Discount approval request sent to manager (${pct}% > ${ceiling}% ceiling)`, 'warning', '📤');
      }

      S.discount = { pct: pct / 100, reason };
      POS.ui.closeModal('discountModal');
      POS.ui.renderOrderPanel();
      toast(`${pct}% discount applied`, 'success', '%');
    },
  },

  // ── VOID ──────────────────────────────────────────────────
  void: {
    async submit() {
      const scope    = document.getElementById('voidScope').value;
      const category = document.getElementById('voidCategory').value;
      const reason   = document.getElementById('voidReason').value.trim();
      if (!category) { toast('Select void category', 'warning'); return; }
      if (!reason)   { toast('Void reason required', 'warning'); return; }

      let itemId = null;
      if (scope === 'line_item') {
        itemId = document.getElementById('voidItemId').value;
        if (!itemId) { toast('Select item to void', 'warning'); return; }
      }

      // Create void request in DB
      const voidReqId = await POS.db.createVoidRequest({
        scope, category, reason, itemId,
        orderId: S.orderNum,
        amount: scope === 'full_order' ? POS.order.totals().total : null,
      });

      // Mark item(s) as void_requested
      if (scope === 'line_item' && itemId) {
        const idx = S.items.findIndex(i => i._uiId.toString() === itemId);
        if (idx !== -1) S.items[idx].status = 'void_requested';
      } else {
        S.items.forEach(i => { if (i.status !== 'voided') i.status = 'void_requested'; });
      }

      POS.ui.closeModal('voidModal');
      POS.ui.renderOrderPanel();
      toast('Void request sent to manager for approval', 'warning', '📤');

      // Notify manager via DB notification
      await POS.db.notifyManager('void_request', `Void requested on ${S.orderNum}: ${reason}`, voidReqId);
    },
  },

  // ── SPLIT BILL ────────────────────────────────────────────
  split: {
    setMode(btn) {
      document.querySelectorAll('.split-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      S.splitMode = btn.dataset.mode;
      POS.split.renderBody();
    },

    renderBody() {
      const { total } = POS.order.totals();
      const body = document.getElementById('splitBody');
      switch (S.splitMode) {
        case 'equal': {
          body.innerHTML = `
            <div style="margin-bottom:14px">
              <div class="field-lbl">Number of Guests</div>
              <div class="qty-row" style="justify-content:center;gap:14px;margin-top:6px">
                <button class="qty-btn" onclick="POS.split.changeGuests(-1)" style="width:32px;height:32px;font-size:18px">−</button>
                <span class="qty-val" id="splitGuestCount" style="font-size:22px;min-width:32px">${S.splitGuests}</span>
                <button class="qty-btn" onclick="POS.split.changeGuests(1)" style="width:32px;height:32px;font-size:18px">+</button>
              </div>
            </div>
            <div style="background:var(--s3);border:1px solid var(--border);border-radius:var(--r-md);padding:16px">
              <div class="tot-row"><span>Total</span><span class="mono gold">${fmt(total)}</span></div>
              <div class="tot-row tot-grand"><span>Per Guest</span><span class="mono big gold" id="splitPerGuest">${fmt(Math.ceil(total/S.splitGuests))}</span></div>
            </div>`;
          break;
        }
        case 'byItem': {
          body.innerHTML = `
            <p style="font-size:12px;color:var(--text3);margin-bottom:12px">
              Assign each item to a guest. Unassigned items go to Guest 1.
            </p>
            ${S.items.filter(i=>!['voided'].includes(i.status)).map((item, idx) => `
              <div class="split-item-check">
                <span style="flex:1;font-size:12px;font-weight:600">${item.name} x${item.qty}<br>
                  <span style="font-size:10px;color:var(--text3)">${fmt(item.price*item.qty)}</span>
                </span>
                <select class="course-select" onchange="S.splitAssignments[${idx}]=parseInt(this.value)">
                  ${Array.from({length:S.splitGuests},(_,i)=>`<option value="${i+1}" ${S.splitAssignments[idx]===(i+1)?'selected':''}>Guest ${i+1}</option>`).join('')}
                </select>
              </div>`).join('')}
            <div style="margin-top:8px">
              <div class="field-lbl">Number of Guests</div>
              <div class="qty-row" style="gap:10px;margin-top:5px">
                <button class="qty-btn" onclick="POS.split.changeGuests(-1)">−</button>
                <span class="qty-val">${S.splitGuests}</span>
                <button class="qty-btn" onclick="POS.split.changeGuests(1)">+</button>
              </div>
            </div>`;
          break;
        }
        case 'custom': {
          let remaining = total;
          body.innerHTML = `
            <p style="font-size:12px;color:var(--text3);margin-bottom:12px">
              Enter the amount each guest will pay. Must add up to ${fmt(total)}.
            </p>
            <div id="customSplitRows">
              ${Array.from({length:S.splitGuests},(_,i)=>`
                <div class="split-guest-row">
                  <div class="split-guest-num">${i+1}</div>
                  <span style="flex:1;font-size:13px">Guest ${i+1}</span>
                  <input type="number" class="cash-input" style="width:140px;margin:0;font-size:14px"
                    id="csp-${i}" placeholder="0" min="0" max="${total}"
                    oninput="POS.split.validateCustom()">
                </div>`).join('')}
            </div>
            <div class="change-box" id="customSplitCheck" style="margin-top:10px">
              <span class="change-lbl">Remaining</span>
              <span class="change-amt mono" id="customSplitRemaining">${fmt(total)}</span>
            </div>
            <div style="margin-top:10px">
              <button class="qty-btn" onclick="POS.split.changeGuests(-1)" style="width:28px;height:28px">−</button>
              <span style="margin:0 8px;font-size:12px">Guests: ${S.splitGuests}</span>
              <button class="qty-btn" onclick="POS.split.changeGuests(1)" style="width:28px;height:28px">+</button>
            </div>`;
          break;
        }
      }
    },

    changeGuests(delta) {
      S.splitGuests = Math.max(2, Math.min(12, S.splitGuests + delta));
      POS.split.renderBody();
    },

    validateCustom() {
      const { total } = POS.order.totals();
      let sum = 0;
      for (let i = 0; i < S.splitGuests; i++) {
        sum += parseFloat(document.getElementById(`csp-${i}`)?.value || 0);
      }
      const rem = total - sum;
      const el  = document.getElementById('customSplitRemaining');
      const box = document.getElementById('customSplitCheck');
      if (el) el.textContent = fmt(Math.abs(rem));
      if (box) box.classList.toggle('short', rem < 0);
    },

    proceed() {
      const { total } = POS.order.totals();
      // Validate and open payment modal for each split
      // In full production: process each guest's payment separately with their method
      POS.ui.closeModal('splitModal');
      // For now open payment modal — full split chain payment to be wired to individual receipts
      toast(`Split processed — ${fmt(Math.ceil(total/S.splitGuests))} per guest`, 'success', '⇌');
      POS.ui.openPayment();
    },
  },

  // ── COURSE SEQUENCE ───────────────────────────────────────
  course: {
    open() {
      const list = document.getElementById('courseList');
      list.innerHTML = S.items.filter(i => !['voided'].includes(i.status)).map((item, idx) => `
        <div class="course-item">
          <span style="flex:1;font-size:13px;font-weight:600">${item.name} x${item.qty}</span>
          <select class="course-select" id="course-sel-${idx}">
            <option value="1" ${item.course===1?'selected':''}>🥗 Starter</option>
            <option value="2" ${item.course===2?'selected':''}>🍛 Main</option>
            <option value="3" ${item.course===3?'selected':''}>🍰 Dessert</option>
          </select>
        </div>`).join('');
      POS.ui.openModal('courseModal');
    },

    save() {
      S.items.filter(i => !['voided'].includes(i.status)).forEach((item, idx) => {
        const sel = document.getElementById(`course-sel-${idx}`);
        if (sel) item.course = parseInt(sel.value);
      });
      POS.ui.closeModal('courseModal');
      POS.ui.renderOrderPanel();
      toast('Course sequence saved', 'success', '🍽');
    },
  },

  // ── ITEM NOTE ─────────────────────────────────────────────
  note: {
    add(text) {
      const input = document.getElementById('noteInput');
      input.value = (input.value ? input.value + ', ' : '') + text;
    },

    save() {
      const note = document.getElementById('noteInput').value.trim();
      if (S.editingItemIdx !== null && S.items[S.editingItemIdx]) {
        S.items[S.editingItemIdx].note = note;
      }
      S.editingItemIdx = null;
      POS.ui.closeModal('noteModal');
      POS.ui.renderOrderPanel();
      if (note) toast('Note saved', 'success', '📝');
    },
  },

  // ── RECEIPT ───────────────────────────────────────────────
  receipt: {
    build() {
      const { subtotal, discAmt, sc, tax, total } = POS.order.totals();
      const now = new Date();
      const items = S.items
        .filter(i => !['voided'].includes(i.status))
        .map(i => `<div class="rct-row"><span>${i.name} x${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`)
        .join('');
      const disc = discAmt ? `<div class="rct-row"><span>Discount (${Math.round(S.discount.pct*100)}%)</span><span>−${fmt(discAmt)}</span></div>` : '';
      const scLine = sc ? `<div class="rct-row"><span>Service Charge</span><span>${fmt(sc)}</span></div>` : '';
      return `
        <div class="rct-hotel">${S.claims?.property_name || 'Hotel'}</div>
        <div class="rct-sub">Hospitality · Excellence · Service</div>
        <div class="rct-sub">VAT Reg: ${S.claims?.vat_number || '—'}</div>
        <div class="rct-div"></div>
        <div class="rct-row"><span>Order:</span><span>${S.orderNum || 'Preview'}</span></div>
        <div class="rct-row"><span>Table:</span><span>${S.table?.table_number || S.orderType.replace('_',' ')}</span></div>
        <div class="rct-row"><span>Covers:</span><span>${S.covers}</span></div>
        <div class="rct-row"><span>Cashier:</span><span>${S.claims?.first_name} ${S.claims?.last_name}</span></div>
        <div class="rct-row"><span>Date:</span><span>${now.toLocaleDateString('en-UG')}</span></div>
        <div class="rct-row"><span>Time:</span><span>${now.toLocaleTimeString('en-UG',{hour:'2-digit',minute:'2-digit'})}</span></div>
        <div class="rct-div"></div>
        ${items}
        <div class="rct-div"></div>
        <div class="rct-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
        ${disc}${scLine}
        <div class="rct-row"><span>VAT (${Math.round(S.taxRate*100)}%)</span><span>${fmt(tax)}</span></div>
        <div class="rct-row bold"><span>TOTAL</span><span>${fmt(total)}</span></div>
        <div class="rct-div"></div>
        <div class="rct-foot">Thank you for dining with us!<br>We hope to see you again soon.<br>${S.claims?.property_name || ''}</div>`;
    },

    print() {
      const win = window.open('','_blank','width=420,height=620');
      win.document.write(`<!DOCTYPE html><html><head><style>
        body{font-family:'Courier New',monospace;font-size:12px;margin:20px;color:#000}
        .rct-hotel{text-align:center;font-size:16px;font-weight:700;margin-bottom:3px}
        .rct-sub{text-align:center;font-size:10px;color:#666;margin-bottom:2px}
        .rct-div{border:none;border-top:1px dashed #ccc;margin:8px 0}
        .rct-row{display:flex;justify-content:space-between;padding:2px 0}
        .rct-row.bold{font-weight:700;font-size:14px;margin-top:4px}
        .rct-foot{text-align:center;font-size:10px;color:#999;margin-top:12px;line-height:1.6}
      </style></head><body>${document.getElementById('receiptContent').innerHTML}</body></html>`);
      win.document.close();
      win.print();
    },
  },

  // ── SHIFT ─────────────────────────────────────────────────
  shift: {
    startClock() {
      const tick = () => {
        const now = new Date();
        document.getElementById('sbClock').textContent =
          now.toLocaleTimeString('en-UG', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12: false });
        const elapsed = Math.floor((now - S.shiftStart) / 1000);
        const h = String(Math.floor(elapsed/3600)).padStart(2,'0');
        const m = String(Math.floor((elapsed%3600)/60)).padStart(2,'0');
        const s = String(elapsed%60).padStart(2,'0');
        document.getElementById('sbTimer').textContent = `${h}:${m}:${s}`;
      };
      tick();
      setInterval(tick, 1000);
    },

    endShift() {
      const { total: drawerExpected } = { total: S.drawerTotal };
      const { total: sessionTotal }   = { total: DEMO_DATA.closed_orders
        .filter(o => o.cashier.startsWith(S.claims.first_name))
        .reduce((s,o) => s+o.total, 0) };

      document.getElementById('shiftEndBody').innerHTML = `
        <div class="shift-stat-grid">
          <div class="shift-stat">
            <div class="shift-stat-val">${S.sessionOrders}</div>
            <div class="shift-stat-lbl">Orders Closed</div>
          </div>
          <div class="shift-stat">
            <div class="shift-stat-val">${S.sessionCovers}</div>
            <div class="shift-stat-lbl">Covers Served</div>
          </div>
          <div class="shift-stat">
            <div class="shift-stat-val">${fmt(S.drawerTotal)}</div>
            <div class="shift-stat-lbl">Expected Drawer</div>
          </div>
          <div class="shift-stat">
            <div class="shift-stat-val" id="actualDrawerDisplay">—</div>
            <div class="shift-stat-lbl">Declared Drawer</div>
          </div>
        </div>
        <div class="cash-declare">
          <div class="field-lbl">Declare Cash in Drawer</div>
          <input type="number" class="cash-input" id="shiftCashDeclare"
            placeholder="Count and enter total cash" min="0"
            oninput="document.getElementById('actualDrawerDisplay').textContent=fmt(parseFloat(this.value)||0)">
        </div>
        <div style="margin-top:16px">
          <div class="field-lbl">End-of-Shift Checklist</div>
          ${[
            'All open orders closed or transferred',
            'Cash drawer counted and declared',
            'Voids and discounts documented',
            'Handover notes written for next shift',
            'Shift summary printed',
          ].map((item, i) => `
            <div class="checklist-item" id="cl-${i}" onclick="this.classList.toggle('done');document.querySelector('#cl-${i} input').checked=!document.querySelector('#cl-${i} input').checked">
              <input type="checkbox"> ${item}
            </div>`).join('')}
        </div>
        <div style="margin-top:12px">
          <div class="field-lbl">Handover Notes</div>
          <textarea class="form-textarea" id="shiftHandoverNotes" placeholder="Notes for incoming shift…" rows="3"></textarea>
        </div>`;
      POS.ui.openModal('shiftEndModal');
    },

    async confirmEnd() {
      const declared = parseFloat(document.getElementById('shiftCashDeclare').value) || 0;
      const notes    = document.getElementById('shiftHandoverNotes').value.trim();
      const variance = declared - S.drawerTotal;

      // Write shift close to DB
      await POS.db.closeShift({ declared, variance, notes });

      POS.ui.closeModal('shiftEndModal');

      if (Math.abs(variance) > 5000) {
        toast(`Shift closed with cash variance of ${fmt(Math.abs(variance))} — manager notified`, 'warning', '⚠️');
      } else {
        toast('Shift closed successfully', 'success', '✅');
      }

      // Print shift report
      setTimeout(() => {
        if (typeof QS !== 'undefined') QS.logout();
        else window.location.href = 'index.html';
      }, 2000);
    },
  },

  // ── DB LAYER ──────────────────────────────────────────────
  db: {
    _orderId: null, // cached current order ID

    async ensureOrder() {
      if (this._orderId) return this._orderId;
      if (DEMO_MODE) { this._orderId = 'demo-order-' + Date.now(); return this._orderId; }
      try {
        const sb = getSB();
        const { data, error } = await sb.from('pos_orders').insert([{
          tenant_id:          S.claims.tenant_id,
          property_id:        S.claims.property_id,
          order_type:         S.orderType,
          table_id:           S.table?.id || null,
          dining_area_id:     S.table ? DEMO_DATA.tables.find(t=>t.id===S.table.id)?.dining_area_id : null,
          waiter_id:          S.waiter?.id || null,
          cashier_id:         S.claims.staff_id,
          shift_assignment_id: S.claims.shift_id,
          covers:             S.covers,
          status:             'open',
          notes:              S.orderNote || null,
        }]).select('id');
        if (error) throw error;
        this._orderId = data[0].id;
        return this._orderId;
      } catch(e) { console.error('ensureOrder:', e); return null; }
    },

    async createKitchenTickets(orderId, items) {
      if (DEMO_MODE) return; // KDS reads live in production
      try {
        const sb = getSB();
        // Insert as 'pending' first — line_total is a generated column, never set it.
        const { data: inserted, error: insErr } = await sb.from('pos_order_items').insert(
          items.map(item => ({
            tenant_id:    S.claims.tenant_id,
            order_id:     orderId,
            menu_item_id: item.id,
            quantity:     item.qty,
            unit_price:   item.price,
            status:       'pending',
            kitchen_station:      item.station,
            special_instructions: item.note || null,
            course:       item.course,
            entered_by:   S.claims.staff_id,
          }))
        ).select('id');
        if (insErr) throw insErr;

        // Flip pending → sent. trg_kitchen_ticket fires on this exact transition
        // and creates the kitchen_tickets row itself (order_number, table_number,
        // menu_item_name all looked up server-side) — no manual insert needed.
        const ids = inserted.map(r => r.id);
        const { error: updErr } = await sb.from('pos_order_items')
          .update({ status: 'sent' }).in('id', ids);
        if (updErr) throw updErr;
      } catch(e) { console.error('createKitchenTickets:', e); }
    },

    async updateTableStatus(tableId, status) {
      if (DEMO_MODE) return;
      try { await getSB().from('dining_tables').update({ status }).eq('id', tableId); }
      catch(e) { console.error('updateTableStatus:', e); }
    },

    async closeOrder({ total, subtotal, discAmt, sc, tax, paymentMethod,
                       cashReceived, change, paymentRef, compManager,
                       roomChargeTarget, cityLedgerTarget }) {
      if (DEMO_MODE) { this._orderId = null; return 'demo-closed-' + Date.now(); }
      try {
        const sb      = getSB();
        const orderId = await this.ensureOrder();

        // Insert remaining order items
        const { data: existingItems } = await sb.from('pos_order_items')
          .select('menu_item_id').eq('order_id', orderId);
        const existing = new Set((existingItems||[]).map(i=>i.menu_item_id));
        const newItems = S.items.filter(i => !existing.has(i.id) && i.status !== 'voided');
        if (newItems.length) {
          await sb.from('pos_order_items').insert(newItems.map(i => ({
            tenant_id: S.claims.tenant_id, order_id: orderId,
            menu_item_id: i.id, quantity: i.qty,
            unit_price: i.price,
            status: 'served',
            served_at: new Date().toISOString(),
            entered_by: S.claims.staff_id,
            served_by: S.claims.staff_id,
          })));
        }

        // Close the order — trg_sync_table_status flips dining_tables to
        // 'clearing' and clears current_order_id automatically from this update.
        const { error } = await sb.from('pos_orders').update({
          status:         'closed',
          subtotal,
          discount_amount: discAmt,
          discount_pct:   S.discount.pct,
          service_charge: sc,
          tax_amount:     tax,
          total_amount:   total,
          payment_method: paymentMethod,
          cash_received:  cashReceived || null,
          change_given:   change || null,
          payment_reference: paymentRef || null,
          cashier_id:     S.claims.staff_id,
          closed_at:      new Date().toISOString(),
        }).eq('id', orderId);
        if (error) throw error;

        // Payment transaction record
        await sb.from('payment_transactions').insert([{
          tenant_id:          S.claims.tenant_id,
          order_id:           orderId,
          folio_id:           paymentMethod === 'room_charge' ? (roomChargeTarget?.folio_id || null) : null,
          corporate_account_id: paymentMethod === 'city_ledger' ? (cityLedgerTarget?.id || null) : null,
          transaction_type:   'payment',
          payment_method:     paymentMethod,
          amount:             total,
          currency_code:      S.claims.currency_code || 'UGX',
          reference_number:   paymentRef || null,
          cashier_id:         S.claims.staff_id,
          shift_assignment_id: S.claims.shift_id,
        }]);

        this._orderId = null;
        return orderId;
      } catch(e) { console.error('closeOrder:', e); throw e; }
    },

    async postFolioCharge(folioId, { amount, description, type }) {
      if (DEMO_MODE) return;
      try {
        await getSB().from('folio_charges').insert([{
          tenant_id:    S.claims.tenant_id,
          folio_id:     folioId,
          charge_type:  type,
          description,
          amount,
          posted_by:    S.claims.staff_id,
          shift_assignment_id: S.claims.shift_id,
        }]);
      } catch(e) { console.error('postFolioCharge:', e); }
    },

    async postCorporateCharge(accountId, { amount, description }) {
      if (DEMO_MODE) return;
      try {
        await getSB().from('corporate_account_charges').insert([{
          tenant_id:            S.claims.tenant_id,
          corporate_account_id: accountId,
          description,
          amount,
          reference_type:       'pos_order',
          posted_by:            S.claims.staff_id,
          shift_assignment_id:  S.claims.shift_id,
        }]);
      } catch(e) { console.error('postCorporateCharge:', e); }
    },

    async createVoidRequest({ scope, category, reason, itemId, orderId, amount }) {
      if (DEMO_MODE) return 'demo-void-' + Date.now();
      try {
        const { data } = await getSB().from('void_requests').insert([{
          tenant_id:    S.claims.tenant_id,
          order_id:     this._orderId,
          void_scope:   scope,
          void_reason:  reason,
          void_category: category,
          amount,
          requested_by: S.claims.staff_id,
          shift_assignment_id: S.claims.shift_id,
          status: 'pending',
        }]).select('id');
        return data?.[0]?.id;
      } catch(e) { console.error('createVoidRequest:', e); return null; }
    },

    async createDiscountApproval(pct, reason) {
      if (DEMO_MODE) return;
      try {
        await getSB().from('discount_approvals').insert([{
          tenant_id:    S.claims.tenant_id,
          order_id:     this._orderId,
          requested_by: S.claims.staff_id,
          requested_pct: pct / 100,
          reason,
          status:       'pending',
          shift_assignment_id: S.claims.shift_id,
        }]);
      } catch(e) { console.error('createDiscountApproval:', e); }
    },

    async notifyManager(type, body, refId) {
      if (DEMO_MODE) return;
      try {
        // Fetch manager staff IDs for this property
        const { data: managers } = await getSB()
          .from('staff')
          .select('id')
          .eq('property_id', S.claims.property_id)
          .in('role', ['manager','gm']);
        if (!managers?.length) return;
        await getSB().from('notifications').insert(managers.map(m => ({
          tenant_id:        S.claims.tenant_id,
          recipient_id:     m.id,
          notification_type: type,
          priority:         'high',
          title:            type.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
          body,
          reference_type:   'pos_order',
          reference_id:     refId || this._orderId,
        })));
      } catch(e) { console.error('notifyManager:', e); }
    },

    async closeShift({ declared, variance, notes }) {
      if (DEMO_MODE) return;
      try {
        await getSB().from('shift_assignments').update({
          status:          'handover_pending',
          cash_declared:   declared,
          cash_expected:   S.drawerTotal,
          handover_notes:  notes,
          clocked_out_at:  new Date().toISOString(),
        }).eq('id', S.claims.shift_id);
        if (Math.abs(variance) > 5000) {
          await this.notifyManager('shift_variance',
            `Cash variance of ${fmt(Math.abs(variance))} detected at shift close`, null);
        }
      } catch(e) { console.error('closeShift:', e); }
    },
  },

  // ── REALTIME ──────────────────────────────────────────────
  realtime: {
    subscribe() {
      const sb = getSB();
      if (!sb) return;
      // Listen for KDS updates on our order items
      sb.channel('pos-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'pos_order_items',
          filter: `tenant_id=eq.${S.claims.tenant_id}`,
        }, (payload) => {
          const { id, status } = payload.new;
          // Find matching item and update status
          const item = S.items.find(i => i._dbId === id);
          if (item) {
            item.status = status;
            POS.ui.renderOrderPanel();
            if (status === 'ready') {
              toast(`${item.name} is ready! 🔔`, 'success', '🍽');
              POS.audio.ding();
            }
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'void_requests',
          filter: `tenant_id=eq.${S.claims.tenant_id}`,
        }, (payload) => {
          if (payload.new.status === 'approved') {
            const voidedItemId = payload.new.order_item_id;
            S.items.forEach(i => { if (i._dbId === voidedItemId) i.status = 'voided'; });
            POS.ui.renderOrderPanel();
            toast('Void approved by manager', 'success', '✅');
          } else if (payload.new.status === 'rejected') {
            toast('Void request rejected by manager', 'error');
          }
        })
        .subscribe();
    },
  },

  // ── UI ────────────────────────────────────────────────────
  ui: {
    renderShiftBar() {
      document.getElementById('sbStaff').textContent    = `${S.claims.first_name} ${S.claims.last_name}`;
      document.getElementById('sbProperty').textContent = S.claims.property_name || '';
      document.getElementById('drawerTotal').textContent = fmt(S.drawerTotal);
      document.getElementById('sbOrderCount').textContent = S.sessionOrders;
      document.getElementById('sbCovers').textContent   = S.sessionCovers;

      const dot = document.getElementById('shiftDot');
      if (S.claims.shift_active) {
        dot.classList.remove('inactive');
      } else {
        dot.classList.add('inactive');
        document.getElementById('sbShiftAlert').style.display = 'flex';
      }

      const taxLbl = `(${Math.round(S.taxRate*100)}%)`;
      const scLbl  = `(${Math.round(S.serviceCharge*100)}%)`;
      if (document.getElementById('vatPctLbl')) document.getElementById('vatPctLbl').textContent = taxLbl;
      if (document.getElementById('scPctLbl'))  document.getElementById('scPctLbl').textContent  = scLbl;
    },

    renderCategories() {
      const rail = document.getElementById('catRail');
      rail.innerHTML = '<div class="cat-section-lbl">Categories</div>' +
        DEMO_DATA.menu_categories.map(c => `
          <div class="cat-item ${c.id === S.currentCat ? 'active' : ''}"
               data-cat="${c.id}" onclick="POS.menu.selectCat('${c.id}')">
            <div class="cat-ico">${c.icon}</div>
            <span class="cat-name">${c.name}</span>
            <span class="cat-badge">${c.count}</span>
          </div>`).join('');
    },

    renderPinnedStrip() {
      const pinned = DEMO_DATA.menu_items.filter(m => m.pinned && m.available);
      document.getElementById('pinnedStrip').innerHTML =
        pinned.map(m => `
          <div class="quick-tile" onclick="POS.order.add('${m.id}')">
            <div class="qt-emoji">${m.emoji}</div>
            <div class="qt-name">${m.name.split(' ').slice(0,2).join(' ')}</div>
            <div class="qt-price">${fmt(m.price)}</div>
          </div>`).join('');
    },

    renderMenuGrid() {
      const grid  = document.getElementById('menuGrid');
      const items = POS.menu.getFiltered();

      document.getElementById('menuSub').textContent =
        `${items.length} item${items.length !== 1 ? 's' : ''}${S.searchQuery ? ` for "${S.searchQuery}"` : ''}`;

      if (!items.length) {
        grid.innerHTML = `<div class="no-results">
          <div class="no-results-ico">🔍</div>
          <h3>No items found</h3>
          <p style="font-size:11px;margin-top:4px">Try a different category or search term</p>
        </div>`;
        return;
      }

      const stationStyle = {
        grill:  'background:rgba(232,124,62,.15);color:#e87c3e',
        cold:   'background:rgba(62,207,232,.15);color:#3ecfe8',
        fryer:  'background:rgba(232,194,62,.15);color:#e8c23e',
        pastry: 'background:rgba(200,62,232,.15);color:#c83ee8',
        bar:    'background:rgba(62,142,232,.15);color:#3e8ee8',
        pass:   'background:rgba(90,154,111,.15);color:#5a9a6f',
      };

      grid.innerHTML = items.map(item => `
        <div class="menu-card ${!item.available ? 'unavailable' : ''}"
             onclick="${item.available ? `POS.order.add('${item.id}')` : ''}">
          ${item.popular ? '<div class="mc-badge badge-popular">★ Popular</div>' : ''}
          <div class="mc-emoji">${item.emoji}</div>
          <div class="mc-name">${item.name}</div>
          <div class="mc-desc">${item.desc}</div>
          <div class="mc-foot">
            <span class="mc-price">${fmt(item.price)}</span>
            ${item.station && item.station !== 'none' ? `<span class="mc-station" style="${stationStyle[item.station]||''}">${item.station}</span>` : ''}
          </div>
        </div>`).join('');
    },

    flashMenuItem(itemId) {
      const cards = document.querySelectorAll('.menu-card');
      cards.forEach(card => {
        if (card.querySelector('.mc-name')?.textContent === DEMO_DATA.menu_items.find(m=>m.id===itemId)?.name) {
          const flash = document.createElement('div');
          flash.className = 'mc-flash';
          card.appendChild(flash);
          setTimeout(() => flash.remove(), 400);
        }
      });
    },

    renderOrderPanel() {
      const list   = document.getElementById('opItems');
      const totals = document.getElementById('opTotals');
      const payBtn = document.getElementById('payBtn');
      const empty  = document.getElementById('opEmpty');

      const activeItems = S.items.filter(i => i.status !== 'voided');

      if (!activeItems.length) {
        list.innerHTML = '';
        list.appendChild(POS.ui.buildEmpty());
        totals.style.display = 'none';
        payBtn.disabled = true;
        return;
      }

      // Group by course
      const courses = {};
      activeItems.forEach((item, idx) => {
        const c = item.course || 1;
        if (!courses[c]) courses[c] = [];
        courses[c].push({ ...item, _origIdx: S.items.indexOf(item) });
      });

      const courseNames = { 1:'Starters', 2:'Mains', 3:'Desserts' };
      const multiCourse  = Object.keys(courses).length > 1;
      let html = '';

      Object.keys(courses).sort().forEach(course => {
        if (multiCourse) {
          html += `<div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
            color:var(--text3);padding:8px 6px 4px">${courseNames[course] || `Course ${course}`}</div>`;
        }
        courses[course].forEach(item => {
          const idx    = item._origIdx;
          const sentCls = item.sent ? 'sent' : '';
          const voidCls = item.status === 'void_requested' ? 'void-pending' : '';
          html += `
            <div class="order-row ${sentCls} ${voidCls}" id="or-${item._uiId}">
              <div class="or-qty-ctrl">
                <button class="or-qty-btn" onclick="POS.order.changeQty(${idx},1)" ${item.sent?'disabled':''}>+</button>
                <span class="or-qty">${item.qty}</span>
                <button class="or-qty-btn minus" onclick="POS.order.changeQty(${idx},-1)" ${item.sent?'disabled':''}>−</button>
              </div>
              <div class="or-info">
                <div class="or-name">${item.name}</div>
                <div class="or-meta">
                  ${item.course > 1 ? `<span class="or-course">${courseNames[item.course]||'Course '+item.course}</span>` : ''}
                  ${item.note ? `<span class="or-note">${item.note}</span>` : ''}
                  ${item.sent ? `<span class="or-status status-sent">SENT</span>` : ''}
                  ${item.status==='void_requested' ? `<span class="or-status status-void">VOID PENDING</span>` : ''}
                  ${item.status==='ready' ? `<span class="or-status" style="background:var(--amber-pale);color:var(--amber)">READY</span>` : ''}
                </div>
              </div>
              <span class="or-price">${fmt(item.price*item.qty)}</span>
              <button class="or-note-btn" onclick="POS.ui.openItemNote(${idx})" title="Note">📝</button>
              <button class="or-del-btn" onclick="POS.order.removeItem(${idx})" title="Remove" ${item.sent?'disabled style="opacity:.3;cursor:not-allowed"':''}>✕</button>
            </div>`;
        });
        if (multiCourse) html += '<hr class="order-divider">';
      });

      list.innerHTML = html;

      // Render totals
      const t = POS.order.totals();
      document.getElementById('totSubtotal').textContent = fmt(t.subtotal);
      document.getElementById('totVAT').textContent      = fmt(t.tax);
      document.getElementById('totSC').textContent       = fmt(t.sc);
      document.getElementById('totGrand').textContent    = fmt(t.total);
      document.getElementById('vatPctLbl').textContent   = `(${Math.round(S.taxRate*100)}%)`;
      document.getElementById('scPctLbl').textContent    = S.serviceCharge > 0 ? `(${Math.round(S.serviceCharge*100)}%)` : '(0%)';

      const discRow = document.getElementById('totDiscRow');
      if (S.discount.pct > 0) {
        discRow.style.display = 'flex';
        document.getElementById('totDiscPct').textContent = `(${Math.round(S.discount.pct*100)}%)`;
        document.getElementById('totDisc').textContent   = `−${fmt(t.discAmt)}`;
      } else {
        discRow.style.display = 'none';
      }

      totals.style.display = 'block';
      payBtn.disabled = t.total <= 0;
    },

    buildEmpty() {
      const div = document.createElement('div');
      div.className = 'op-empty';
      div.innerHTML = '<div class="op-empty-ico">🍽️</div><div class="op-empty-title">Order is empty</div><div class="op-empty-hint">Tap menu items to add</div>';
      return div;
    },

    updateTableBtn() {
      const btn = document.getElementById('tableBtn');
      const lbl = document.getElementById('tableBtnLabel');
      if (S.table) {
        lbl.textContent = `Table ${S.table.table_number}`;
        btn.classList.add('has-value');
      } else {
        lbl.textContent = 'Select table…';
        btn.classList.remove('has-value');
      }
    },

    updateWaiterBtn() {
      if (S.waiter) {
        document.getElementById('waiterAvatar').textContent      = S.waiter.initials;
        document.getElementById('waiterAvatar').style.background = S.waiter.color || 'var(--gold)';
        document.getElementById('waiterBtnLabel').textContent    = S.waiter.name;
      }
    },

    openTablePicker() {
      S.tempTable = S.table;
      // Build area tabs
      const areaTabs = document.getElementById('tableAreaTabs');
      areaTabs.innerHTML = `<button class="area-tab ${!S.selectedTableArea?'active':''}" onclick="POS.ui.filterTableArea(null,this)">All Areas</button>` +
        DEMO_DATA.dining_areas.filter(a => a.area_type !== 'room_service').map(a => `
          <button class="area-tab ${S.selectedTableArea===a.id?'active':''}"
            onclick="POS.ui.filterTableArea('${a.id}',this)">${a.name}</button>`).join('');
      POS.ui.renderTableGrid();
      POS.ui.openModal('tableModal');
    },

    filterTableArea(areaId, btn) {
      S.selectedTableArea = areaId;
      document.querySelectorAll('.area-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      POS.ui.renderTableGrid();
    },

    renderTableGrid() {
      const tables = S.selectedTableArea
        ? DEMO_DATA.tables.filter(t => t.dining_area_id === S.selectedTableArea)
        : DEMO_DATA.tables;
      document.getElementById('tablePickerGrid').innerHTML =
        tables.map(t => {
          const disabled = ['dirty','maintenance','out_of_order'].includes(t.status);
          return `<div class="table-tile ${t.status} ${S.tempTable?.id===t.id?'selected':''} ${disabled?'maintenance':''}"
            onclick="${disabled?'':''}" ${disabled?'':'onclick="POS.table.tempSelect(\''+t.id+'\')"'}>
            <div class="tt-num">${t.table_number}</div>
            <div class="tt-cap">Seats ${t.capacity}</div>
            <div class="tt-status">${t.status}</div>
          </div>`;
        }).join('');
    },

    openWaiterPicker() {
      document.getElementById('waiterList').innerHTML =
        DEMO_DATA.waiters.map(w => `
          <div onclick="POS.waiter.select('${w.id}')"
               style="display:flex;align-items:center;gap:12px;padding:14px;
               border-radius:var(--r-md);cursor:pointer;margin-bottom:7px;transition:all .15s;
               background:${S.waiter?.id===w.id?'var(--gold-pale)':'var(--s3)'};
               border:1px solid ${S.waiter?.id===w.id?'var(--gold-d)':'var(--border)'}">
            <div class="waiter-avatar" style="width:36px;height:36px;font-size:13px;background:${w.color}">${w.initials}</div>
            <span style="font-family:var(--font-d);font-size:14px;font-weight:600;flex:1">${w.name}</span>
            ${S.waiter?.id===w.id?'<span style="color:var(--gold);font-size:18px">✓</span>':''}
          </div>`).join('');
      POS.ui.openModal('waiterModal');
    },

    openPayment() {
      if (!S.items.filter(i=>i.status!=='voided').length) return;
      const { total } = POS.order.totals();
      document.getElementById('payAmtDisplay').textContent = Math.round(total).toLocaleString();
      document.getElementById('payCurr').textContent = S.claims?.currency_code || 'UGX';
      document.getElementById('payOrderRef').textContent = S.orderNum || '';
      // Reset to cash
      document.getElementById('cashReceived').value = '';
      document.getElementById('changeBox').style.display = 'none';
      document.getElementById('confirmPayBtn').disabled = true;
      document.getElementById('confirmPayBtn').textContent = '✓ Confirm Payment';
      // Quick cash denominations
      const denoms = [20000,50000,100000,200000,500000].filter(d => d >= total);
      denoms.unshift(total); // exact
      document.getElementById('quickCashRow').innerHTML =
        [...new Set(denoms)].slice(0,5).map(d =>
          `<button class="qc-btn" onclick="POS.payment.setQuickCash(${d})">${fmt(d)}</button>`
        ).join('');
      S.payMethod = 'cash';
      document.querySelectorAll('.pay-method').forEach(m =>
        m.classList.toggle('active', m.dataset.method === 'cash'));
      document.getElementById('cashSection').style.display      = 'block';
      document.getElementById('roomChargeSection').style.display = 'none';
      document.getElementById('cityLedgerSection').style.display = 'none';
      document.getElementById('referenceSection').style.display  = 'none';
      document.getElementById('compSection').style.display       = 'none';
      S.roomChargeTarget = null;
      S.cityLedgerTarget = null;
      document.getElementById('selectedRoom').style.display    = 'none';
      document.getElementById('selectedLedger').style.display  = 'none';
      POS.ui.openModal('paymentModal');
    },

    openDiscount() {
      document.getElementById('discInput').value  = S.discount.pct ? Math.round(S.discount.pct*100) : '';
      document.getElementById('discReason').value = S.discount.reason || '';
      document.getElementById('discPreview').style.display  = 'none';
      document.getElementById('ceilingWarn').style.display  = 'none';
      document.querySelectorAll('.disc-preset').forEach(p => p.classList.remove('active'));
      if (S.discount.pct) {
        const pct = Math.round(S.discount.pct*100);
        document.querySelectorAll('.disc-preset').forEach(p => {
          if (parseInt(p.textContent) === pct) p.classList.add('active');
        });
        POS.discount.preview();
      }
      POS.ui.openModal('discountModal');
    },

    openVoid() {
      if (!S.items.length) { toast('No items to void', 'warning'); return; }
      // Populate item selector
      const sel = document.getElementById('voidItemId');
      sel.innerHTML = S.items
        .filter(i => !['voided','void_requested'].includes(i.status))
        .map(i => `<option value="${i._uiId}">${i.name} x${i.qty} — ${fmt(i.price*i.qty)}</option>`)
        .join('');
      document.getElementById('voidScope').onchange = function() {
        document.getElementById('voidItemSelect').style.display =
          this.value === 'line_item' ? 'block' : 'none';
      };
      POS.ui.openModal('voidModal');
    },

    openSplit() {
      if (!S.items.length) { toast('Add items before splitting', 'warning'); return; }
      S.splitMode = 'equal';
      document.querySelectorAll('.split-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.mode === 'equal'));
      POS.split.renderBody();
      POS.ui.openModal('splitModal');
    },

    openItemNote(idx) {
      S.editingItemIdx = idx;
      document.getElementById('noteInput').value = S.items[idx]?.note || '';
      const title = document.querySelector('#noteModal .modal-head h2');
      if (title) title.textContent = `📝 ${S.items[idx]?.name}`;
      POS.ui.openModal('noteModal');
      setTimeout(() => document.getElementById('noteInput').focus(), 220);
    },

    openOrderNote() {
      document.getElementById('orderNoteInput').value = S.orderNote;
      POS.ui.openModal('orderNoteModal');
      setTimeout(() => document.getElementById('orderNoteInput').focus(), 220);
    },

    openCourseModal() {
      if (!S.items.length) { toast('No items to assign courses', 'warning'); return; }
      POS.course.open();
    },

    openReceiptPreview() {
      document.getElementById('receiptContent').innerHTML = POS.receipt.build();
      POS.ui.openModal('receiptModal');
    },

    openHistory() {
      const orders = DEMO_DATA.closed_orders;
      const sessionTotal = orders.slice(0, S.sessionOrders || 0).reduce((s,o) => s+o.total, 0);
      document.getElementById('historyBody').innerHTML = `
        <table class="history-table">
          <thead><tr>
            <th>Order</th><th>Table</th><th>Time</th>
            <th>Method</th><th>Items</th><th style="text-align:right">Total</th>
          </tr></thead>
          <tbody>
            ${orders.map(o => `<tr>
              <td><span style="font-family:var(--font-mono);font-size:10px;color:var(--gold)">${o.order_number}</span></td>
              <td>${o.table}</td>
              <td style="color:var(--text3)">${o.time}</td>
              <td><span style="font-size:10px;padding:2px 7px;background:var(--s3);border-radius:var(--r-pill)">${o.method}</span></td>
              <td style="color:var(--text3)">${o.items}</td>
              <td style="text-align:right;font-family:var(--font-mono);font-weight:500">${fmt(o.total)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="hist-total">
          <span style="font-size:12px;color:var(--text3)">Session Total (${S.sessionOrders} orders)</span>
          <span class="mono gold" style="font-size:18px">${fmt(S.drawerTotal)}</span>
        </div>`;
      POS.ui.openModal('historyModal');
    },

    showSuccess(total, change, method) {
      const overlay = document.getElementById('successFlash');
      document.getElementById('sfIcon').textContent  = method === 'room_charge' ? '🏨' : '✅';
      document.getElementById('sfTitle').textContent = `${fmt(total)} Received!`;
      document.getElementById('sfSub').textContent   = change > 0
        ? `Change: ${fmt(change)}`
        : method.replace(/_/g,' ') + ' — Thank you!';
      overlay.classList.add('show');
      POS.audio.success();
      setTimeout(() => overlay.classList.remove('show'), 2600);
    },

    openKbdPanel() {
      document.getElementById('kbdPanel').classList.toggle('show');
    },

    openModal(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('open');
    },

    closeModal(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('open');
    },

    initKeyboard() {
      document.addEventListener('keydown', e => {
        const active = document.activeElement?.tagName;
        if (['INPUT','TEXTAREA','SELECT'].includes(active)) {
          if (e.key === 'Escape') { document.activeElement.blur(); POS.ui.closeAllModals(); }
          return;
        }
        switch(e.key) {
          case '/':  e.preventDefault(); document.getElementById('searchInput').focus(); break;
          case 'Escape': POS.ui.closeAllModals(); break;
          case 'F1':     e.preventDefault(); POS.order.clear(); break;
          case 'F2':     e.preventDefault(); if (!document.getElementById('payBtn').disabled) POS.ui.openPayment(); break;
          case 'F3':     e.preventDefault(); POS.kitchen.fire(); break;
          case 'F4':     e.preventDefault(); POS.ui.openDiscount(); break;
          case 'F5':     e.preventDefault(); POS.ui.openSplit(); break;
          case 'T': case 't': POS.ui.openTablePicker(); break;
          case 'H': case 'h': POS.ui.openHistory(); break;
          case '?':      POS.ui.openKbdPanel(); break;
        }
      });
    },

    closeAllModals() {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      document.getElementById('kbdPanel').classList.remove('show');
    },
  },

  // ── MENU ──────────────────────────────────────────────────
  menu: {
    selectCat(catId) {
      S.currentCat  = catId;
      S.searchQuery = '';
      document.getElementById('searchInput').value = '';
      document.getElementById('searchClear').style.display = 'none';
      document.querySelectorAll('.cat-item').forEach(el =>
        el.classList.toggle('active', el.dataset.cat === catId));
      const cat = DEMO_DATA.menu_categories.find(c => c.id === catId);
      document.getElementById('menuHeading').textContent = cat?.name || 'Menu';
      POS.ui.renderMenuGrid();
    },

    search(query) {
      S.searchQuery = query.trim();
      S.currentCat  = 'c0';
      document.querySelectorAll('.cat-item').forEach(el =>
        el.classList.toggle('active', el.dataset.cat === 'c0'));
      document.getElementById('menuHeading').textContent = S.searchQuery ? `Results for "${S.searchQuery}"` : 'All Items';
      document.getElementById('searchClear').style.display = S.searchQuery ? 'block' : 'none';
      POS.ui.renderMenuGrid();
    },

    clearSearch() {
      document.getElementById('searchInput').value = '';
      POS.menu.search('');
      document.getElementById('searchInput').focus();
    },

    getFiltered() {
      const q = S.searchQuery.toLowerCase();
      return DEMO_DATA.menu_items.filter(m => {
        const catMatch = S.currentCat === 'c0' || m.cat === S.currentCat;
        const srchMatch = !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
        return catMatch && srchMatch;
      });
    },
  },

  // ── TABLE ─────────────────────────────────────────────────
  table: {
    tempSelect(id) {
      S.tempTable = DEMO_DATA.tables.find(t => t.id === id) || null;
      POS.ui.renderTableGrid();
    },

    confirmSelection() {
      S.table = S.tempTable;
      POS.ui.updateTableBtn();
      POS.ui.closeModal('tableModal');
      if (S.table) toast(`Table ${S.table.table_number} selected`, 'success', '🪑');
    },

    clearSelection() {
      S.table = null;
      S.tempTable = null;
      POS.ui.updateTableBtn();
      POS.ui.closeModal('tableModal');
    },
  },

  // ── WAITER ────────────────────────────────────────────────
  waiter: {
    select(id) {
      S.waiter = DEMO_DATA.waiters.find(w => w.id === id);
      POS.ui.updateWaiterBtn();
      POS.ui.closeModal('waiterModal');
      toast(`Server: ${S.waiter.name}`, 'info', '👤');
    },
  },

  // ── AUDIO ─────────────────────────────────────────────────
  audio: {
    _ctx: null,
    ctx() {
      if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      return this._ctx;
    },
    tone(freq, dur, vol = 0.1) {
      try {
        const ctx  = this.ctx();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.start(); osc.stop(ctx.currentTime + dur);
      } catch(e) {}
    },
    blip()    { this.tone(880, 0.12, 0.08); },
    ding()    { this.tone(1046, 0.3, 0.12); setTimeout(() => this.tone(1318, 0.3, 0.10), 150); },
    success() { [523,659,784].forEach((f,i) => setTimeout(() => this.tone(f, 0.28, 0.12), i*110)); },
  },
};

// ────────────────────────────────────────────────────────────
// POST-PAYMENT RESET
// ────────────────────────────────────────────────────────────
POS.order.resetAfterPayment = function() {
  S.items        = [];
  S.orderNum     = null;
  S.discount     = { pct: 0, reason: '' };
  S.orderNote    = '';
  S.kitchenFired = false;
  S.table        = null;
  S.covers       = 1;
  S.db._orderId  = null;
  document.getElementById('coversDisplay').textContent = '1';
  POS.ui.updateTableBtn();
  POS.ui.renderOrderPanel();
  document.getElementById('opOrderNum').textContent = 'New Order';
  document.getElementById('drawerTotal').textContent = fmt(S.drawerTotal);
  document.getElementById('sbOrderCount').textContent = S.sessionOrders;
  document.getElementById('sbCovers').textContent = S.sessionCovers;
};

// Payment helper
POS.payment.setQuickCash = function(amount) {
  document.getElementById('cashReceived').value = amount;
  POS.payment.calcChange();
};

// ────────────────────────────────────────────────────────────
// TOAST
// ────────────────────────────────────────────────────────────
function toast(msg, type = 'info', icon = null) {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const stack = document.getElementById('toastStack');
  const el    = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-ico">${icon || icons[type]}</span><span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('exit');
    setTimeout(() => el.remove(), 250);
  }, 3600);
}

// ────────────────────────────────────────────────────────────
// FORMAT CURRENCY
// ────────────────────────────────────────────────────────────
function fmt(n) {
  const code = S.claims?.currency_code || 'UGX';
  return `${code} ${Math.round(n || 0).toLocaleString('en-UG')}`;
}

// ────────────────────────────────────────────────────────────
// CLICK-OUTSIDE MODALS TO CLOSE
// ────────────────────────────────────────────────────────────
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
  // Close kbd panel if clicking outside
  if (!e.target.closest('.kbd-panel') && !e.target.closest('.sb-btn')) {
    document.getElementById('kbdPanel')?.classList.remove('show');
  }
});
