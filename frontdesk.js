/* ============================================================
   QUANTUMSERVE FRONT DESK — frontdesk.js
   Complete Front Desk Operations System
   ============================================================ */
'use strict';

const SUPABASE_URL = 'https://emckziegbgzmofwiydey.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtY2t6aWVnYmd6bW9md2l5ZGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDk5NDMsImV4cCI6MjA5NzE4NTk0M30.5w7JWlpDc-Jz2wBr7B7hLprOLF3dDIXd9c9RWb65b3M';
const DEMO_MODE    = false;

let _sb = null;
function getSB() {
  if (_sb) return _sb;
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
  const factory = window.supabase?.createClient || window.Supabase?.createClient;
  if (!factory) return null;
  _sb = factory(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, storageKey: 'qs_auth', storage: sessionStorage }
  });
  return _sb;
}

const D = {
  property: { name:'Lakeview Heights Hotel', currency:'UGX' },
  tax_rate: 0.18,
  room_types: [
    { id:'rt1', name:'Standard',       code:'STD', max_occupancy:2, base_rate:180000, amenities:['WiFi','AC','TV','Safe'] },
    { id:'rt2', name:'Deluxe',         code:'DLX', max_occupancy:2, base_rate:250000, amenities:['WiFi','AC','TV','Minibar','Bathtub'] },
    { id:'rt3', name:'Junior Suite',   code:'JST', max_occupancy:3, base_rate:380000, amenities:['WiFi','AC','TV','Minibar','Lounge'] },
    { id:'rt4', name:'Executive Suite',code:'EST', max_occupancy:4, base_rate:550000, amenities:['WiFi','AC','TV','Minibar','Jacuzzi','Lounge'] },
    { id:'rt5', name:'Penthouse',      code:'PH',  max_occupancy:6, base_rate:900000, amenities:['WiFi','AC','TV','Minibar','Jacuzzi','Terrace'] },
  ],
  rate_plans: [
    { id:'rp1', room_type_id:'rt1', name:'Rack Rate',       code:'RACK', rate:180000, includes_breakfast:false },
    { id:'rp2', room_type_id:'rt1', name:'Bed & Breakfast', code:'BB',   rate:220000, includes_breakfast:true  },
    { id:'rp3', room_type_id:'rt2', name:'Rack Rate',       code:'RACK', rate:250000, includes_breakfast:false },
    { id:'rp4', room_type_id:'rt2', name:'Bed & Breakfast', code:'BB',   rate:295000, includes_breakfast:true  },
    { id:'rp5', room_type_id:'rt2', name:'Corporate',       code:'CORP', rate:230000, includes_breakfast:false },
    { id:'rp6', room_type_id:'rt3', name:'Rack Rate',       code:'RACK', rate:380000, includes_breakfast:false },
    { id:'rp7', room_type_id:'rt3', name:'Bed & Breakfast', code:'BB',   rate:430000, includes_breakfast:true  },
    { id:'rp8', room_type_id:'rt4', name:'Executive Rate',  code:'EXEC', rate:550000, includes_breakfast:true  },
    { id:'rp9', room_type_id:'rt5', name:'Penthouse Package',code:'PH',  rate:900000, includes_breakfast:true  },
  ],
  rooms: [
    { id:'r101',room_number:'101',floor:1,room_type_id:'rt1',status:'vacant_clean',   is_accessible:true,  is_smoking:false },
    { id:'r102',room_number:'102',floor:1,room_type_id:'rt1',status:'occupied',       is_accessible:false, is_smoking:false },
    { id:'r103',room_number:'103',floor:1,room_type_id:'rt1',status:'dirty',          is_accessible:false, is_smoking:false },
    { id:'r104',room_number:'104',floor:1,room_type_id:'rt2',status:'vacant_clean',   is_accessible:false, is_smoking:false },
    { id:'r105',room_number:'105',floor:1,room_type_id:'rt2',status:'reserved',       is_accessible:false, is_smoking:false },
    { id:'r106',room_number:'106',floor:1,room_type_id:'rt1',status:'maintenance',    is_accessible:false, is_smoking:false },
    { id:'r201',room_number:'201',floor:2,room_type_id:'rt2',status:'occupied',       is_accessible:false, is_smoking:false },
    { id:'r202',room_number:'202',floor:2,room_type_id:'rt2',status:'vacant_clean',   is_accessible:false, is_smoking:false },
    { id:'r203',room_number:'203',floor:2,room_type_id:'rt2',status:'checkout_pending',is_accessible:false,is_smoking:false },
    { id:'r204',room_number:'204',floor:2,room_type_id:'rt3',status:'occupied',       is_accessible:false, is_smoking:false },
    { id:'r205',room_number:'205',floor:2,room_type_id:'rt3',status:'vacant_clean',   is_accessible:false, is_smoking:false },
    { id:'r206',room_number:'206',floor:2,room_type_id:'rt2',status:'cleaning',       is_accessible:false, is_smoking:false },
    { id:'r301',room_number:'301',floor:3,room_type_id:'rt3',status:'occupied',       is_accessible:false, is_smoking:false },
    { id:'r302',room_number:'302',floor:3,room_type_id:'rt3',status:'vacant_clean',   is_accessible:false, is_smoking:false },
    { id:'r303',room_number:'303',floor:3,room_type_id:'rt4',status:'occupied',       is_accessible:false, is_smoking:false },
    { id:'r304',room_number:'304',floor:3,room_type_id:'rt4',status:'reserved',       is_accessible:false, is_smoking:false },
    { id:'r305',room_number:'305',floor:3,room_type_id:'rt3',status:'inspection',     is_accessible:false, is_smoking:false },
    { id:'r306',room_number:'306',floor:3,room_type_id:'rt3',status:'vacant_clean',   is_accessible:false, is_smoking:false },
    { id:'r401',room_number:'401',floor:4,room_type_id:'rt4',status:'occupied',       is_accessible:false, is_smoking:false },
    { id:'r402',room_number:'402',floor:4,room_type_id:'rt4',status:'vacant_clean',   is_accessible:false, is_smoking:false },
    { id:'r403',room_number:'403',floor:4,room_type_id:'rt5',status:'occupied',       is_accessible:false, is_smoking:false },
    { id:'r404',room_number:'404',floor:4,room_type_id:'rt5',status:'vacant_clean',   is_accessible:false, is_smoking:false },
  ],
  guests: [
    { id:'g1', first_name:'Amina',    last_name:'Hassan',   email:'amina@email.com',   phone:'+256701234567', nationality:'Ugandan',  vip_level:2, total_stays:8,  id_type:'national_id', id_number:'CM90200012345', preferences:['Non-smoking','High floor'], notes:'Prefers room 204' },
    { id:'g2', first_name:'Raj',      last_name:'Patel',    email:'raj@company.in',    phone:'+919876543210', nationality:'Indian',   vip_level:0, total_stays:2,  id_type:'passport',    id_number:'M1234567',      preferences:['Vegetarian breakfast'],    notes:'' },
    { id:'g3', first_name:'Sarah',    last_name:'Wanjiku',  email:'sarah@corp.co.ke',  phone:'+254722000111', nationality:'Kenyan',   vip_level:1, total_stays:5,  id_type:'passport',    id_number:'A1234568',      preferences:['Early check-in'],          notes:'Corporate — MTN rate' },
    { id:'g4', first_name:'David',    last_name:'Okonkwo',  email:'david@gmail.com',   phone:'+2348012345678',nationality:'Nigerian', vip_level:0, total_stays:1,  id_type:'passport',    id_number:'B9876543',      preferences:[],                          notes:'' },
    { id:'g5', first_name:'Patricia', last_name:'Mensah',   email:'pat@unicef.org',    phone:'+256782000555', nationality:'Ghanaian', vip_level:3, total_stays:14, id_type:'passport',    id_number:'GH2345678',     preferences:['VVIP suite','No press'],   notes:'UNICEF Director. Full press blackout.' },
    { id:'g6', first_name:'James',    last_name:'Morrison', email:'j.morrison@uk.gov', phone:'+441234567890', nationality:'British',  vip_level:1, total_stays:3,  id_type:'passport',    id_number:'GB123456C',     preferences:['Non-smoking'],             notes:'Diplomatic passport' },
    { id:'g7', first_name:'Yuki',     last_name:'Tanaka',   email:'y.tanaka@sony.jp',  phone:'+81312345678',  nationality:'Japanese', vip_level:0, total_stays:1,  id_type:'passport',    id_number:'TK1234567',     preferences:['Quiet room'],              notes:'' },
  ],
  reservations: [
    { id:'res1', reservation_number:'RES-2026-00089', guest_id:'g5', room_id:'r403', room_type_id:'rt5', rate_plan_id:'rp9', source:'corporate',   status:'checked_in',       check_in_date:'2026-05-30', check_out_date:'2026-06-07', num_adults:1, num_children:0, rate_per_night:900000, meal_plan:'full_board',    special_requests:'Fruit basket, flowers', deposit_paid:1800000, actual_check_in:'2026-05-30T14:22:00Z', num_nights:8 },
    { id:'res2', reservation_number:'RES-2026-00090', guest_id:'g1', room_id:'r204', room_type_id:'rt3', rate_plan_id:'rp7', source:'phone',        status:'checked_in',       check_in_date:'2026-05-31', check_out_date:'2026-06-02', num_adults:1, num_children:0, rate_per_night:430000, meal_plan:'bed_breakfast', special_requests:'High floor', deposit_paid:430000, actual_check_in:'2026-05-31T15:10:00Z', num_nights:2 },
    { id:'res3', reservation_number:'RES-2026-00091', guest_id:'g3', room_id:'r301', room_type_id:'rt3', rate_plan_id:'rp6', source:'corporate',   status:'checked_in',       check_in_date:'2026-06-01', check_out_date:'2026-06-03', num_adults:1, num_children:0, rate_per_night:380000, meal_plan:'room_only',    special_requests:'Quiet room', deposit_paid:380000, actual_check_in:'2026-06-01T11:30:00Z', num_nights:2 },
    { id:'res4', reservation_number:'RES-2026-00092', guest_id:'g2', room_id:null,   room_type_id:'rt2', rate_plan_id:'rp3', source:'booking_com', status:'confirmed',        check_in_date:'2026-06-01', check_out_date:'2026-06-04', num_adults:2, num_children:0, rate_per_night:250000, meal_plan:'room_only',    special_requests:'Vegetarian', deposit_paid:250000, channel_reference:'BDC-3847291', num_nights:3 },
    { id:'res5', reservation_number:'RES-2026-00093', guest_id:'g6', room_id:null,   room_type_id:'rt2', rate_plan_id:'rp4', source:'email',       status:'confirmed',        check_in_date:'2026-06-01', check_out_date:'2026-06-06', num_adults:1, num_children:0, rate_per_night:295000, meal_plan:'bed_breakfast', special_requests:'Diplomatic — discreet', deposit_paid:295000, num_nights:5 },
    { id:'res6', reservation_number:'RES-2026-00094', guest_id:'g7', room_id:null,   room_type_id:'rt1', rate_plan_id:'rp1', source:'website',     status:'confirmed',        check_in_date:'2026-06-01', check_out_date:'2026-06-03', num_adults:1, num_children:0, rate_per_night:180000, meal_plan:'room_only',    special_requests:'Quiet room', deposit_paid:180000, num_nights:2 },
    { id:'res7', reservation_number:'RES-2026-00095', guest_id:'g4', room_id:'r203', room_type_id:'rt2', rate_plan_id:'rp3', source:'walk_in',     status:'checkout_pending', check_in_date:'2026-05-29', check_out_date:'2026-06-01', num_adults:2, num_children:1, rate_per_night:250000, meal_plan:'room_only',    special_requests:'', deposit_paid:500000, actual_check_in:'2026-05-29T16:05:00Z', num_nights:3 },
    { id:'res8', reservation_number:'RES-2026-00088', guest_id:'g2', room_id:'r102', room_type_id:'rt1', rate_plan_id:'rp2', source:'phone',       status:'checked_in',       check_in_date:'2026-05-30', check_out_date:'2026-06-02', num_adults:1, num_children:0, rate_per_night:220000, meal_plan:'bed_breakfast', special_requests:'Vegetarian', deposit_paid:220000, actual_check_in:'2026-05-30T13:40:00Z', num_nights:3 },
  ],
  folios: [
    { id:'f1', reservation_id:'res1', guest_id:'g5', folio_number:'FOL-2026-00089', status:'active', total_charges:2850000, total_payments:1800000, balance:1050000,
      charges:[
        { id:'fc1', charge_date:'2026-05-30', charge_type:'room_night',  description:'Penthouse — Night 1',          amount:900000, is_reversal:false },
        { id:'fc2', charge_date:'2026-05-31', charge_type:'room_night',  description:'Penthouse — Night 2',          amount:900000, is_reversal:false },
        { id:'fc3', charge_date:'2026-05-31', charge_type:'restaurant',  description:'Dinner — Table 6',             amount:285000, is_reversal:false },
        { id:'fc4', charge_date:'2026-06-01', charge_type:'room_night',  description:'Penthouse — Night 3',          amount:900000, is_reversal:false },
        { id:'fc5', charge_date:'2026-06-01', charge_type:'minibar',     description:'Minibar — Water x4, Waragi',   amount:45000,  is_reversal:false },
        { id:'fc7', charge_date:'2026-05-30', charge_type:'payment',     description:'Deposit — Cash',               amount:-1800000,is_reversal:false },
      ]},
    { id:'f2', reservation_id:'res2', guest_id:'g1', folio_number:'FOL-2026-00090', status:'active', total_charges:880000, total_payments:430000, balance:450000,
      charges:[
        { id:'fc10', charge_date:'2026-05-31', charge_type:'room_night', description:'Junior Suite — Night 1',      amount:430000, is_reversal:false },
        { id:'fc11', charge_date:'2026-06-01', charge_type:'room_night', description:'Junior Suite — Night 2',      amount:430000, is_reversal:false },
        { id:'fc12', charge_date:'2026-06-01', charge_type:'minibar',    description:'Minibar — Nile Special x2',   amount:20000,  is_reversal:false },
        { id:'fc13', charge_date:'2026-05-31', charge_type:'payment',    description:'Deposit — Card',              amount:-430000,is_reversal:false },
      ]},
    { id:'f3', reservation_id:'res7', guest_id:'g4', folio_number:'FOL-2026-00095', status:'active', total_charges:780000, total_payments:500000, balance:280000,
      charges:[
        { id:'fc20', charge_date:'2026-05-29', charge_type:'room_night', description:'Deluxe — Night 1',            amount:250000, is_reversal:false },
        { id:'fc21', charge_date:'2026-05-30', charge_type:'room_night', description:'Deluxe — Night 2',            amount:250000, is_reversal:false },
        { id:'fc22', charge_date:'2026-05-31', charge_type:'room_night', description:'Deluxe — Night 3',            amount:250000, is_reversal:false },
        { id:'fc23', charge_date:'2026-05-30', charge_type:'restaurant', description:'Lunch',                       amount:30000,  is_reversal:false },
        { id:'fc24', charge_date:'2026-05-29', charge_type:'payment',    description:'Deposit — Cash',              amount:-500000,is_reversal:false },
      ]},
    { id:'f4', reservation_id:'res8', guest_id:'g2', folio_number:'FOL-2026-00088', status:'active', total_charges:440000, total_payments:220000, balance:220000,
      charges:[
        { id:'fc30', charge_date:'2026-05-30', charge_type:'room_night', description:'Standard B&B — Night 1',     amount:220000, is_reversal:false },
        { id:'fc31', charge_date:'2026-05-31', charge_type:'room_night', description:'Standard B&B — Night 2',     amount:220000, is_reversal:false },
        { id:'fc32', charge_date:'2026-05-30', charge_type:'payment',    description:'Deposit — Card',             amount:-220000,is_reversal:false },
      ]},
  ],
  conference_rooms: [
    { id:'cr1', name:'Nile Boardroom',   capacity:14,  rate_per_hour:150000, rate_per_day:800000,  amenities:['Projector','Video conf','Whiteboard','AC'] },
    { id:'cr2', name:'Kilimanjaro Hall', capacity:200, rate_per_hour:350000, rate_per_day:2000000, amenities:['Stage','Sound system','AC','Catering kitchen'] },
    { id:'cr3', name:'Serengeti Suite',  capacity:50,  rate_per_hour:220000, rate_per_day:1200000, amenities:['Projector','Video conf','Sound system','AC'] },
    { id:'cr4', name:'Rift Valley Room', capacity:30,  rate_per_hour:180000, rate_per_day:950000,  amenities:['Projector','Whiteboard','AC'] },
  ],
  conference_bookings: [
    { id:'cb1', conference_room_id:'cr1', guest_name:'MTN Uganda Ltd',     company_name:'MTN',    booking_date:'2026-06-01', start_time:'09:00', end_time:'17:00', attendees:12,  setup_type:'boardroom', total_amount:800000,  catering_required:true,  av_required:true,  status:'confirmed' },
    { id:'cb2', conference_room_id:'cr2', guest_name:'Ministry of Finance',company_name:'GoU',    booking_date:'2026-06-01', start_time:'08:00', end_time:'18:00', attendees:180, setup_type:'theatre',   total_amount:2000000, catering_required:true,  av_required:true,  status:'confirmed' },
    { id:'cb3', conference_room_id:'cr3', guest_name:'Stanbic Bank Uganda',company_name:'Stanbic',booking_date:'2026-06-02', start_time:'10:00', end_time:'16:00', attendees:40,  setup_type:'classroom', total_amount:1320000, catering_required:false, av_required:true,  status:'confirmed' },
    { id:'cb4', conference_room_id:'cr4', guest_name:'Dr. Grace Akello',   company_name:'UNHCR',  booking_date:'2026-06-01', start_time:'14:00', end_time:'17:00', attendees:25,  setup_type:'u_shape',   total_amount:540000,  catering_required:true,  av_required:false, status:'confirmed' },
  ],
  dining_areas: [
    { id:'da1', name:'Main Restaurant', area_type:'restaurant' },
    { id:'da2', name:'Pool Bar',        area_type:'bar' },
    { id:'da3', name:'Terrace',         area_type:'restaurant' },
  ],
  dining_tables: [
    { id:'dt1', table_number:'1',  capacity:2, status:'free',     dining_area_id:'da1' },
    { id:'dt2', table_number:'2',  capacity:4, status:'occupied', dining_area_id:'da1' },
    { id:'dt3', table_number:'3',  capacity:4, status:'free',     dining_area_id:'da1' },
    { id:'dt4', table_number:'4',  capacity:6, status:'occupied', dining_area_id:'da1' },
    { id:'dt5', table_number:'5',  capacity:2, status:'free',     dining_area_id:'da1' },
    { id:'dt6', table_number:'6',  capacity:8, status:'reserved', dining_area_id:'da1' },
    { id:'dt7', table_number:'7',  capacity:4, status:'occupied', dining_area_id:'da1' },
    { id:'dt8', table_number:'8',  capacity:4, status:'free',     dining_area_id:'da1' },
    { id:'dt9', table_number:'B1', capacity:4, status:'free',     dining_area_id:'da2' },
    { id:'dt10',table_number:'B2', capacity:2, status:'occupied', dining_area_id:'da2' },
    { id:'dt11',table_number:'T1', capacity:6, status:'free',     dining_area_id:'da3' },
    { id:'dt12',table_number:'T2', capacity:4, status:'free',     dining_area_id:'da3' },
  ],
  maintenance: [
    { id:'m1', room_id:'r106', issue_type:'plumbing',   description:'Hot water not working — guest complaint.',  priority:'critical', status:'in_progress', reported_by:'Alice Nabirye', created_at:'2026-06-01T06:30:00Z' },
    { id:'m2', room_id:'r203', issue_type:'hvac',       description:'AC making loud noise at night.',            priority:'high',     status:'open',        reported_by:'Peter Okello',  created_at:'2026-06-01T07:15:00Z' },
    { id:'m3', room_id:'r305', issue_type:'electrical', description:'Bedside lamp not working.',                 priority:'normal',   status:'open',        reported_by:'Peter Okello',  created_at:'2026-06-01T08:00:00Z' },
    { id:'m4', room_id:'r102', issue_type:'furniture',  description:'Wardrobe hinge broken.',                    priority:'low',      status:'resolved',    reported_by:'Alice Nabirye', created_at:'2026-05-31T14:00:00Z' },
  ],
  notifications: [
    { id:'n1', type:'vip_arrival',    title:'VIP Arrival Today',         body:'Patricia Mensah (VVIP) — 6-night stay. Ensure suite is ready.', time:'08:00', unread:true,  icon:'⭐' },
    { id:'n2', type:'checkout_overdue',title:'Overdue Checkout',         body:'Room 203 — David Okonkwo. Checkout was 11:00. Still in room.',   time:'11:32', unread:true,  icon:'⏰' },
    { id:'n3', type:'maintenance',    title:'Critical Maintenance',      body:'Room 106 — Plumbing. Room blocked from reservations.',           time:'06:35', unread:true,  icon:'🔧' },
    { id:'n4', type:'reservation',    title:'New Booking — Booking.com', body:'Raj Patel — 3 nights Deluxe. Ref: BDC-3847291.',                 time:'07:20', unread:false, icon:'📅' },
    { id:'n5', type:'payment',        title:'Folio Balance Alert',       body:'FOL-2026-00089 — Patricia Mensah UGX 1,050,000 outstanding.',    time:'09:00', unread:false, icon:'💰' },
  ],
};

const S = {
  claims: null, currentView:'dashboard', currentRoomFilter:'all', currentDiningArea:'da1',
  walkin:{ step:1, guest:null, room:null, ratePlan:null, checkin:null, checkout:null, adults:1, children:0, mealPlan:'room_only', source:'walk_in', requests:'', depositPaid:0 },
  activeFolioId:null, activeResId:null, activeGuestId:null, checkinStep:1, checkoutResId:null,
  resSeq:95, folioSeq:95,
};

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof QS !== 'undefined') {
    S.claims = await QS.requireAuth(['front_desk','manager','gm','super_admin']);
    if (!S.claims) return;
  } else {
    S.claims = { staff_id:'staff-007', role:'front_desk', first_name:'Alice', last_name:'Nabirye',
      tenant_id:'tenant-001', property_id:'prop-001', property_name:'Lakeview Heights Hotel',
      currency_code:'UGX', discount_ceiling:0.10, shift_active:true };
  }
  FD.init();
});

// ── UTILITIES ─────────────────────────────────────────────────
function today()          { return new Date().toISOString().slice(0,10); }
function addDays(d,n)     { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); }
function nightsBetween(a,b){ if(!a||!b) return 0; return Math.max(0,Math.round((new Date(b)-new Date(a))/(864e5))); }
function fmtDate(d)       { if(!d) return '—'; return new Date(d+'T12:00:00').toLocaleDateString('en-UG',{day:'numeric',month:'short',year:'numeric'}); }
function fmt(n)           { return `${S.claims?.currency_code||'UGX'} ${Math.round(n||0).toLocaleString()}`; }
function initials(g)      { return ((g?.first_name||'')[0]||'')+((g?.last_name||'')[0]||''); }
function timeToHours(t)   { if(!t) return 0; const [h,m]=t.split(':'); return +h+(+m)/60; }
function avatarColor(name){ const c=['#c9a84c','#00d4aa','#3b82f6','#8b5cf6','#e74c3c','#27ae60','#f59e0b','#d35400']; return c[(name?.charCodeAt(0)||0)%c.length]; }

function toast(msg,type='info',icon=null){
  const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.innerHTML=`<span style="font-size:16px">${icon||icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toastStack').appendChild(el);
  setTimeout(()=>{el.classList.add('exit');setTimeout(()=>el.remove(),250);},3600);
}

// ── DATA HELPERS ──────────────────────────────────────────────
const DH = {
  getGuest:    id => D.guests.find(g=>g.id===id),
  getRoom:     id => D.rooms.find(r=>r.id===id),
  getRoomType: id => D.room_types.find(t=>t.id===id),
  getRatePlan: id => D.rate_plans.find(p=>p.id===id),
  getFolio:    resId => D.folios.find(f=>f.reservation_id===resId),
  todayArrivals:   ()=> D.reservations.filter(r=>r.check_in_date===today()&&['confirmed','checkin_pending'].includes(r.status)),
  todayDepartures: ()=> D.reservations.filter(r=>r.check_out_date===today()&&['checked_in','checkout_pending'].includes(r.status)),
  inhouse:         ()=> D.reservations.filter(r=>['checked_in','checkout_pending'].includes(r.status)),
  availableRooms:  typeId=> D.rooms.filter(r=>r.status==='vacant_clean'&&(!typeId||r.room_type_id===typeId)),
};

// ── UI COMPONENTS ─────────────────────────────────────────────
const UI = {
  openModal:  id => document.getElementById(id)?.classList.add('open'),
  closeModal: id => document.getElementById(id)?.classList.remove('open'),
  closeAll:   ()=> document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open')),

  showSuccess(title,sub){
    document.getElementById('sfTitle').textContent=title;
    document.getElementById('sfSub').textContent=sub;
    document.getElementById('sfIcon').textContent='✅';
    document.getElementById('successFlash').classList.add('show');
    setTimeout(()=>document.getElementById('successFlash').classList.remove('show'),2600);
  },

  emptyState:(icon,text)=>`<div style="text-align:center;padding:48px;color:var(--text3)"><div style="font-size:44px;opacity:.25;margin-bottom:12px">${icon}</div><div style="font-size:13px;font-weight:500">${text}</div></div>`,

  badgeClass: status=>({pending:'badge-pending',confirmed:'badge-confirmed',checkin_pending:'badge-confirmed',checked_in:'badge-checkedin',checkout_pending:'badge-checkout',checked_out:'badge-cancelled',cancelled:'badge-cancelled',no_show:'badge-noshow'}[status]||'badge-cancelled'),

  guestAvatar: (g,size=38)=>`<div class="g-avatar" style="width:${size}px;height:${size}px;font-size:${size*0.38}px;background:${avatarColor(g?.first_name)}">${initials(g)}</div>`,

  vipBadge: level=>level>0?`<span class="g-badge badge-vip">${['','VIP','VIP','VVIP'][level]}</span>`:'',

  arrivalRow(r){
    const g=DH.getGuest(r.guest_id), rt=DH.getRoomType(r.room_type_id), rp=DH.getRatePlan(r.rate_plan_id), room=r.room_id?DH.getRoom(r.room_id):null;
    return `<div class="arrival-row">
      ${UI.guestAvatar(g)}
      <div class="g-info">
        <div class="g-name">${g?.first_name} ${g?.last_name} ${UI.vipBadge(g?.vip_level||0)}</div>
        <div class="g-meta">
          <span style="color:var(--gold);font-family:var(--font-m);font-size:10px">${r.reservation_number}</span>
          <span>${rt?.name}</span>${room?`<span>Room ${room.room_number}</span>`:''}
          <span>${r.num_adults} adult${r.num_adults>1?'s':''}</span>
          <span>${r.meal_plan?.replace(/_/g,' ')}</span>
          ${r.channel_reference?`<span style="color:var(--text3)">Ref: ${r.channel_reference}</span>`:''}
        </div>
        ${r.special_requests?`<div style="font-size:10px;color:var(--amber);margin-top:3px">📝 ${r.special_requests}</div>`:''}
        ${g?.notes?`<div style="font-size:10px;color:var(--crimson);margin-top:2px">⚠ ${g.notes}</div>`:''}
      </div>
      <div class="g-actions">
        <button class="action-btn-sm ab-checkin" onclick="FD.checkin.open('${r.id}')">Check-in</button>
        <button class="action-btn-sm ab-view" onclick="FD.modals.guestProfile('${r.guest_id}')">Guest</button>
      </div>
    </div>`;
  },

  departureRow(r){
    const g=DH.getGuest(r.guest_id), room=r.room_id?DH.getRoom(r.room_id):null, folio=DH.getFolio(r.id);
    return `<div class="dep-row">
      ${UI.guestAvatar(g)}
      <div class="g-info">
        <div class="g-name">${g?.first_name} ${g?.last_name}</div>
        <div class="g-meta">
          <span style="font-family:var(--font-m);font-size:10px;color:var(--gold)">${r.reservation_number}</span>
          ${room?`<span>Room ${room.room_number}</span>`:''}
          ${folio?`<span style="color:${folio.balance>0?'var(--crimson)':'var(--teal)'}">Bal: ${fmt(folio.balance)}</span>`:''}
        </div>
      </div>
      <div class="g-actions">
        <button class="action-btn-sm ab-checkout" onclick="FD.checkout.open('${r.id}')">Check-out</button>
        <button class="action-btn-sm ab-folio" onclick="FD.folio.open('${DH.getFolio(r.id)?.id||''}')">Folio</button>
      </div>
    </div>`;
  },

  inhouseRow(r){
    const g=DH.getGuest(r.guest_id), room=r.room_id?DH.getRoom(r.room_id):null, rt=DH.getRoomType(r.room_type_id), folio=DH.getFolio(r.id);
    const daysLeft=nightsBetween(today(),r.check_out_date);
    return `<div class="guest-row">
      ${UI.guestAvatar(g)}
      <div class="g-info">
        <div class="g-name">${g?.first_name} ${g?.last_name} ${UI.vipBadge(g?.vip_level||0)}</div>
        <div class="g-meta">
          ${room?`<span>Room ${room.room_number}</span>`:''}
          <span>${rt?.name}</span>
          <span>In: ${fmtDate(r.check_in_date)}</span>
          <span>Out: ${fmtDate(r.check_out_date)}</span>
          <span style="color:${daysLeft<=0?'var(--crimson)':'var(--text2)'}">${daysLeft>0?`${daysLeft}d left`:'Due out today'}</span>
          ${folio?`<span style="color:${folio.balance>0?'var(--crimson)':'var(--teal)'}">Bal: ${fmt(folio.balance)}</span>`:''}
        </div>
      </div>
      <div class="g-actions">
        <button class="action-btn-sm ab-checkout" onclick="FD.checkout.open('${r.id}')">Check-out</button>
        <button class="action-btn-sm ab-folio" onclick="FD.folio.open('${DH.getFolio(r.id)?.id||''}')">Folio</button>
      </div>
    </div>`;
  },

  reservationRow(r){
    const g=DH.getGuest(r.guest_id), rt=DH.getRoomType(r.room_type_id), room=r.room_id?DH.getRoom(r.room_id):null;
    return `<div class="res-row">
      ${UI.guestAvatar(g)}
      <div class="g-info">
        <div class="g-name">${g?.first_name} ${g?.last_name} ${UI.vipBadge(g?.vip_level||0)}</div>
        <div class="g-meta">
          <span style="color:var(--gold);font-family:var(--font-m);font-size:10px">${r.reservation_number}</span>
          <span>${rt?.name}</span>${room?`<span>Room ${room.room_number}</span>`:''}
          <span>${fmtDate(r.check_in_date)} → ${fmtDate(r.check_out_date)}</span>
          <span>${r.num_nights||nightsBetween(r.check_in_date,r.check_out_date)}n</span>
          <span class="g-badge ${UI.badgeClass(r.status)}">${r.status.replace(/_/g,' ')}</span>
        </div>
      </div>
      <div class="g-actions">
        ${['confirmed','pending','checkin_pending'].includes(r.status)?`<button class="action-btn-sm ab-checkin" onclick="FD.checkin.open('${r.id}')">Check-in</button>`:''}
        ${['checked_in','checkout_pending'].includes(r.status)?`<button class="action-btn-sm ab-checkout" onclick="FD.checkout.open('${r.id}')">Check-out</button>`:''}
        <button class="action-btn-sm ab-view" onclick="FD.modals.guestProfile('${r.guest_id}')">Guest</button>
      </div>
    </div>`;
  },
};

// ── MAIN FD NAMESPACE ─────────────────────────────────────────
const FD = {

  init(){
    FD.clock.start();
    FD.ui.setStaff();
    FD.data.refresh();
    FD.nav.go('dashboard');
    FD.walkin.reset();
    FD.ui.populateRoomTypeSelect();
    FD.ui.renderNotifBadge();
    FD.realtime.subscribe();
    if(document.getElementById('confDatePicker')) document.getElementById('confDatePicker').value=today();
    toast(`Welcome, ${S.claims.first_name}. Have a great shift.`,'info','☀️');
  },

  // ── CLOCK ───────────────────────────────────────────────────
  clock:{
    start(){
      const tick=()=>{
        const now=new Date();
        const cl=document.getElementById('cmdClock');
        const dt=document.getElementById('cmdDate');
        if(cl) cl.textContent=now.toLocaleTimeString('en-UG',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
        if(dt) dt.textContent=now.toLocaleDateString('en-UG',{weekday:'short',month:'short',day:'numeric'});
      };
      tick(); setInterval(tick,1000);
    }
  },

  // ── UI SETUP ────────────────────────────────────────────────
  ui:{
    setStaff(){
      const c=S.claims;
      const av=document.getElementById('staffAvatar');
      const nm=document.getElementById('staffNameEl');
      if(av) av.textContent=(c.first_name[0]||'')+(c.last_name[0]||'');
      if(nm) nm.textContent=`${c.first_name} ${c.last_name}`;
      const prop=document.getElementById('cmdProperty');
      if(prop) prop.textContent=c.property_name||D.property.name;
    },
    renderNotifBadge(){
      const unread=D.notifications.filter(n=>n.unread).length;
      const b=document.getElementById('notifBadge');
      if(b){b.textContent=unread;b.style.display=unread?'flex':'none';}
    },
    populateRoomTypeSelect(){
      ['arpTypeFilter'].forEach(id=>{
        const el=document.getElementById(id);
        if(el&&el.children.length<2) D.room_types.forEach(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=t.name;el.appendChild(o);});
      });
    },
    openModal:  id=>UI.openModal(id),
    closeModal: id=>UI.closeModal(id),
    showSuccess:(t,s)=>UI.showSuccess(t,s),
  },

  // ── DATA ────────────────────────────────────────────────────
  data:{
    refresh(){
      const occ=D.rooms.filter(r=>r.status==='occupied').length;
      const tot=D.rooms.length;
      const el=document.getElementById('cmdOcc');
      if(el) el.textContent=`${Math.round(occ/tot*100)}%`;
      document.getElementById('navArrivalsBadge').textContent=DH.todayArrivals().length;
      document.getElementById('navDepartureBadge').textContent=DH.todayDepartures().length;
      document.getElementById('navInhouseBadge').textContent=occ;
      const mo=D.maintenance.filter(m=>m.status!=='resolved').length;
      const mb=document.getElementById('navMaintBadge');
      if(mb){mb.textContent=mo;mb.style.display=mo?'inline-flex':'none';}
    }
  },

  // ── NAVIGATION ──────────────────────────────────────────────
  nav:{
    go(view){
      S.currentView=view;
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
      document.getElementById(`view-${view}`)?.classList.add('active');
      document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active');
      const map={
        dashboard:    FD.dashboard.render,
        arrivals:     FD.arrivals.render,
        departures:   FD.departures.render,
        inhouse:      FD.inhouse.render,
        reservations: FD.reservations.render,
        walkin:       ()=>FD.walkin.reset(),
        rooms:        FD.rooms.render,
        guests:       ()=>FD.guests.render(),
        conference:   FD.conference.render,
        dining:       FD.dining.render,
        maintenance:  FD.maintenance.render,
        folios:       FD.folios.render,
      };
      map[view]?.();
    }
  },

  // ── DASHBOARD ───────────────────────────────────────────────
  dashboard:{
    render(){
      document.getElementById('dashDate').textContent=new Date().toLocaleDateString('en-UG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
      const occ=D.rooms.filter(r=>r.status==='occupied').length;
      const tot=D.rooms.length;
      const arr=DH.todayArrivals(), dep=DH.todayDepartures();
      const clean=D.rooms.filter(r=>r.status==='vacant_clean').length;
      const dirty=D.rooms.filter(r=>['dirty','cleaning'].includes(r.status)).length;
      const rev=D.folios.reduce((s,f)=>s+f.total_charges,0);

      document.getElementById('kpiStrip').innerHTML=[
        {val:`${Math.round(occ/tot*100)}%`,lbl:'Occupancy',   sub:`${occ}/${tot} rooms`,         ico:'🏨',color:'var(--gold)'},
        {val:arr.length,                    lbl:'Arrivals',    sub:'Expected today',               ico:'⬇', color:'var(--teal)'},
        {val:dep.length,                    lbl:'Departures',  sub:'Expected today',               ico:'⬆', color:'var(--amber)'},
        {val:clean,                         lbl:'Ready',       sub:'Vacant & clean',               ico:'✓',  color:'var(--teal)'},
        {val:dirty,                         lbl:'Dirty',       sub:'Pending housekeeping',         ico:'🧹',color:'var(--amber)'},
        {val:fmt(rev),                      lbl:'Folio Revenue',sub:'Active folios total',         ico:'💰',color:'var(--gold)'},
      ].map(k=>`<div class="kpi-card" style="--kpi-color:${k.color}"><div class="kpi-ico">${k.ico}</div><div class="kpi-val">${k.val}</div><div class="kpi-lbl">${k.lbl}</div><div class="kpi-sub">${k.sub}</div></div>`).join('');

      document.getElementById('dashArrivals').innerHTML=arr.length?arr.slice(0,5).map(r=>{
        const g=DH.getGuest(r.guest_id),rt=DH.getRoomType(r.room_type_id);
        return `<div class="arrival-row" style="cursor:pointer" onclick="FD.checkin.open('${r.id}')">
          ${UI.guestAvatar(g,32)}<div class="g-info"><div class="g-name" style="font-size:12px">${g?.first_name} ${g?.last_name} ${UI.vipBadge(g?.vip_level||0)}</div>
          <div class="g-meta">${rt?.name} · ${r.num_adults} pax</div></div>
          <button class="action-btn-sm ab-checkin" onclick="event.stopPropagation();FD.checkin.open('${r.id}')">Check-in</button>
        </div>`;
      }).join(''):UI.emptyState('⬇','No arrivals today');

      document.getElementById('dashDepartures').innerHTML=dep.length?dep.slice(0,5).map(r=>{
        const g=DH.getGuest(r.guest_id),room=r.room_id?DH.getRoom(r.room_id):null;
        return `<div class="dep-row" style="cursor:pointer" onclick="FD.checkout.open('${r.id}')">
          ${UI.guestAvatar(g,32)}<div class="g-info"><div class="g-name" style="font-size:12px">${g?.first_name} ${g?.last_name}</div>
          <div class="g-meta">${room?`Room ${room.room_number}`:'—'}</div></div>
          <button class="action-btn-sm ab-checkout" onclick="event.stopPropagation();FD.checkout.open('${r.id}')">Check-out</button>
        </div>`;
      }).join(''):UI.emptyState('⬆','No departures today');

      document.getElementById('dashRoomHeatmap').innerHTML=D.rooms.map(r=>{
        const cls={vacant_clean:'rh-clean',occupied:'rh-occupied',dirty:'rh-dirty',reserved:'rh-reserved',
          maintenance:'rh-maintenance',out_of_order:'rh-maintenance',cleaning:'rh-inspection',
          inspection:'rh-inspection',checkin_pending:'rh-reserved',checkout_pending:'rh-occupied'}[r.status]||'rh-dirty';
        return `<div class="rh-cell ${cls}" onclick="FD.rooms.openDetail('${r.id}')" title="Room ${r.room_number} — ${r.status.replace(/_/g,' ')}">${r.room_number}</div>`;
      }).join('');

      const alerts=[];
      D.maintenance.filter(m=>m.priority==='critical'&&m.status!=='resolved').forEach(m=>{
        const room=DH.getRoom(m.room_id);
        alerts.push({ico:'🔧',text:`<strong>Critical:</strong> Room ${room?.room_number} — ${m.description}`,time:m.created_at.slice(11,16)});
      });
      D.reservations.filter(r=>r.status==='checkout_pending').forEach(r=>{
        const g=DH.getGuest(r.guest_id),room=r.room_id?DH.getRoom(r.room_id):null;
        alerts.push({ico:'⏰',text:`<strong>Overdue checkout:</strong> ${g?.first_name} ${g?.last_name}, Room ${room?.room_number}`,time:'Now'});
      });
      DH.todayArrivals().forEach(r=>{
        const g=DH.getGuest(r.guest_id);
        if(g?.vip_level>=2) alerts.push({ico:'⭐',text:`<strong>VIP arriving:</strong> ${g.first_name} ${g.last_name} — ${['','','VIP','VVIP'][g.vip_level]}`,time:'Today'});
      });
      document.getElementById('dashAlerts').innerHTML=alerts.length
        ?alerts.map(a=>`<div class="alert-item"><span class="ai-ico">${a.ico}</span><span class="ai-text">${a.text}</span><span class="ai-time">${a.time}</span></div>`).join('')
        :UI.emptyState('✅','No active alerts');

      const todayConf=D.conference_bookings.filter(b=>b.booking_date===today());
      document.getElementById('dashConference').innerHTML=todayConf.length
        ?todayConf.map(b=>{const cr=D.conference_rooms.find(c=>c.id===b.conference_room_id);
          return `<div class="alert-item"><span class="ai-ico">🏛</span><span class="ai-text"><strong>${b.guest_name}</strong><br>${cr?.name} · ${b.start_time}–${b.end_time} · ${b.attendees} pax</span><span class="ai-time">${b.start_time}</span></div>`;
        }).join('')
        :UI.emptyState('🏛','No conference bookings today');
    }
  },

  // ── ARRIVALS ────────────────────────────────────────────────
  arrivals:{render(){
    const f=document.getElementById('arrivalsFilter').value;
    let list=DH.todayArrivals();
    if(f!=='all') list=list.filter(r=>r.status===f);
    document.getElementById('arrivalsSub').textContent=`${list.length} expected today`;
    document.getElementById('arrivalsList').innerHTML=list.length?list.map(r=>UI.arrivalRow(r)).join(''):UI.emptyState('⬇','No arrivals today');
  }},

  // ── DEPARTURES ──────────────────────────────────────────────
  departures:{render(){
    const f=document.getElementById('departuresFilter').value;
    let list=DH.todayDepartures();
    if(f!=='all') list=list.filter(r=>r.status===f);
    document.getElementById('departuresList').innerHTML=list.length?list.map(r=>UI.departureRow(r)).join(''):UI.emptyState('⬆','No departures today');
  }},

  // ── IN HOUSE ────────────────────────────────────────────────
  inhouse:{render(){
    const list=DH.inhouse();
    document.getElementById('inhouseSub').textContent=`${list.length} guest${list.length!==1?'s':''} in house`;
    document.getElementById('inhouseList').innerHTML=list.length?list.map(r=>UI.inhouseRow(r)).join(''):UI.emptyState('👥','No guests in house');
  }},

  // ── RESERVATIONS ────────────────────────────────────────────
  reservations:{render(){
    const f=document.getElementById('resStatusFilter').value;
    let list=[...D.reservations];
    if(f!=='all') list=list.filter(r=>r.status===f);
    document.getElementById('resList').innerHTML=list.length?list.map(r=>UI.reservationRow(r)).join(''):UI.emptyState('📅','No reservations');
  }},

  // ── ROOMS ───────────────────────────────────────────────────
  rooms:{
    filter(btn){
      document.querySelectorAll('.fchip').forEach(c=>c.classList.remove('active'));
      btn.classList.add('active');
      S.currentRoomFilter=btn.dataset.status;
      FD.rooms.render();
    },
    render(){
      const rooms=S.currentRoomFilter==='all'?D.rooms:D.rooms.filter(r=>r.status===S.currentRoomFilter);
      document.getElementById('roomMapSub').textContent=`${rooms.length} rooms · ${D.rooms.filter(r=>r.status==='vacant_clean').length} clean · ${D.rooms.filter(r=>r.status==='occupied').length} occupied`;
      const floors={};
      rooms.forEach(r=>{if(!floors[r.floor])floors[r.floor]=[];floors[r.floor].push(r);});
      let html='';
      Object.keys(floors).sort().forEach(f=>{
        html+=`<div style="grid-column:1/-1;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);padding:8px 0 4px">Floor ${f}</div>`;
        html+=floors[f].map(r=>{
          const rt=DH.getRoomType(r.room_type_id);
          const res=D.reservations.find(res=>res.room_id===r.id&&['checked_in','checkout_pending'].includes(res.status));
          const g=res?DH.getGuest(res.guest_id):null;
          return `<div class="room-map-card" onclick="FD.rooms.openDetail('${r.id}')">
            ${g?.vip_level>0?'<div class="rm-vip-flag">⭐</div>':''}
            <div class="rm-num">${r.room_number}</div>
            <div class="rm-type">${rt?.name}</div>
            <div class="rm-floor">Floor ${r.floor}${r.is_accessible?' · ♿':''}</div>
            <div class="rm-status rs-${r.status}">${r.status.replace(/_/g,' ')}</div>
            ${g?`<div class="rm-guest">${g.first_name} ${g.last_name}</div>`:''}
            ${res?`<div class="rm-checkout">Out: ${fmtDate(res.check_out_date)}</div>`:''}
          </div>`;
        }).join('');
      });
      document.getElementById('roomMapGrid').innerHTML=html;
    },
    openDetail(roomId){
      const room=DH.getRoom(roomId), rt=DH.getRoomType(room.room_type_id);
      const res=D.reservations.find(r=>r.room_id===roomId&&['checked_in','checkout_pending','checkin_pending'].includes(r.status));
      const g=res?DH.getGuest(res.guest_id):null;
      const folio=res?DH.getFolio(res.id):null;
      document.getElementById('roomDetailTitle').textContent=`Room ${room.room_number} — ${rt?.name}`;
      document.getElementById('roomDetailBody').innerHTML=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px">
          <div style="background:var(--s3);border-radius:var(--r-md);padding:12px">
            <div style="color:var(--text3);font-size:9px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Room Details</div>
            <div style="display:flex;flex-direction:column;gap:5px">
              <div><span style="color:var(--text3)">Type:</span> ${rt?.name}</div>
              <div><span style="color:var(--text3)">Floor:</span> ${room.floor}</div>
              <div><span style="color:var(--text3)">Status:</span> <span class="rm-status rs-${room.status}" style="display:inline-block">${room.status.replace(/_/g,' ')}</span></div>
              <div><span style="color:var(--text3)">Accessible:</span> ${room.is_accessible?'Yes ♿':'No'}</div>
            </div>
          </div>
          ${g?`<div style="background:var(--s3);border-radius:var(--r-md);padding:12px">
            <div style="color:var(--text3);font-size:9px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Current Guest</div>
            <div style="font-weight:700;font-family:var(--font-d)">${g.first_name} ${g.last_name} ${UI.vipBadge(g.vip_level)}</div>
            <div style="color:var(--text3);margin-top:4px;font-size:11px">${res?.reservation_number}</div>
            <div style="margin-top:4px"><span style="color:var(--text3)">Check-out:</span> ${fmtDate(res?.check_out_date)}</div>
            <div style="margin-top:4px"><span style="color:var(--text3)">Balance:</span> <span style="color:${folio?.balance>0?'var(--crimson)':'var(--teal)'}">${fmt(folio?.balance||0)}</span></div>
          </div>`:`<div style="background:var(--s3);border-radius:var(--r-md);padding:12px;display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:12px">Unoccupied</div>`}
        </div>`;
      const actions=[];
      if(room.status==='vacant_clean') actions.push(`<button class="vbtn vbtn-primary" onclick="FD.nav.go('walkin');UI.closeModal('roomDetailModal')">Walk-in Check-in</button>`);
      if(['dirty','cleaning'].includes(room.status)) actions.push(`<button class="vbtn vbtn-teal" onclick="FD.rooms.markClean('${roomId}')">Mark for Inspection</button>`);
      if(res&&['checked_in','checkout_pending'].includes(res.status)){
        actions.push(`<button class="vbtn vbtn-secondary" onclick="FD.checkout.open('${res.id}');UI.closeModal('roomDetailModal')">Check-out Guest</button>`);
        actions.push(`<button class="vbtn vbtn-ghost" onclick="FD.folio.open('${folio?.id||''}');UI.closeModal('roomDetailModal')">View Folio</button>`);
      }
      actions.push(`<button class="vbtn vbtn-ghost" onclick="FD.modals.maintenanceReport('${roomId}');UI.closeModal('roomDetailModal')">Report Issue</button>`);
      document.getElementById('roomDetailFoot').innerHTML=`<button class="vbtn vbtn-ghost" onclick="UI.closeModal('roomDetailModal')">Close</button>`+actions.join('');
      UI.openModal('roomDetailModal');
    },
    markClean(roomId){
      const room=DH.getRoom(roomId);
      if(room) room.status='inspection';
      UI.closeModal('roomDetailModal');
      FD.rooms.render();
      toast(`Room ${room.room_number} marked for inspection`,'success');
    },
  },

  // ── GUESTS ──────────────────────────────────────────────────
  guests:{
    render(list){
      list=list||D.guests;
      document.getElementById('guestList').innerHTML=list.map(g=>{
        const current=D.reservations.find(r=>r.guest_id===g.id&&['checked_in','checkout_pending'].includes(r.status));
        return `<div class="guest-row" onclick="FD.modals.guestProfile('${g.id}')">
          ${UI.guestAvatar(g)}
          <div class="g-info">
            <div class="g-name">${g.first_name} ${g.last_name} ${UI.vipBadge(g.vip_level)}</div>
            <div class="g-meta">
              ${g.email?`<span>✉ ${g.email}</span>`:''}
              ${g.phone?`<span>📱 ${g.phone}</span>`:''}
              <span>🌍 ${g.nationality||'—'}</span>
              <span>🏨 ${g.total_stays} stay${g.total_stays!==1?'s':''}</span>
              ${current?`<span style="color:var(--teal)">● In house</span>`:''}
            </div>
          </div>
          <div class="g-actions">
            ${current?`<button class="action-btn-sm ab-checkout" onclick="event.stopPropagation();FD.checkout.open('${current.id}')">Check-out</button>`:''}
            <button class="action-btn-sm ab-view" onclick="event.stopPropagation();FD.modals.guestProfile('${g.id}')">Profile</button>
          </div>
        </div>`;
      }).join('');
    },
    search(q){
      if(!q.trim()){FD.guests.render();return;}
      FD.guests.render(D.guests.filter(g=>`${g.first_name} ${g.last_name} ${g.email} ${g.phone} ${g.id_number}`.toLowerCase().includes(q.toLowerCase())));
    },
    liveSearch(q,targetId){
      const el=document.getElementById(targetId);
      if(!el) return;
      if(!q.trim()){el.style.display='none';return;}
      const matches=D.guests.filter(g=>`${g.first_name} ${g.last_name} ${g.email} ${g.phone}`.toLowerCase().includes(q.toLowerCase()));
      el.style.display=matches.length?'block':'none';
      el.innerHTML=matches.map(g=>`<div class="suggest-item" onclick="FD.guests.fillForm('${g.id}','${targetId}')"><strong>${g.first_name} ${g.last_name}</strong>${g.vip_level>0?` <span style="color:var(--gold);font-size:10px">★ ${['','VIP','VVIP'][g.vip_level]}</span>`:''}<br><span style="font-size:10px;color:var(--text3)">${g.email||''} · ${g.total_stays} stays</span></div>`).join('');
    },
    fillForm(guestId,targetId){
      const g=DH.getGuest(guestId);
      document.getElementById(targetId).style.display='none';
      const inp=document.getElementById('nr_guestName');
      if(inp) inp.value=`${g.first_name} ${g.last_name}`;
      ['nr_email','nr_phone','nr_nationality'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.value=[g.email,g.phone,g.nationality][i]||'';});
    },
  },
};

// ── CHECK-IN ─────────────────────────────────────────────────
FD.checkin = {
  open(resId){
    const res=D.reservations.find(r=>r.id===resId);
    const g=DH.getGuest(res.guest_id), rt=DH.getRoomType(res.room_type_id), rp=DH.getRatePlan(res.rate_plan_id);
    const nights=nightsBetween(res.check_in_date,res.check_out_date);
    S.activeResId=resId;
    document.getElementById('checkinSteps').innerHTML=[1,2,3].map(n=>`<div class="mhs-dot ${n===1?'active':''}" id="cis-${n}"></div>`).join('');
    FD.checkin._step1(res,g,rt,rp,nights);
    UI.openModal('checkinModal');
  },
  _stepDots(active){[1,2,3].forEach(n=>{const d=document.getElementById(`cis-${n}`);if(d)d.className='mhs-dot'+(n===active?' active':n<active?' done':'');});},
  _step1(res,g,rt,rp,nights){
    FD.checkin._stepDots(1);
    document.getElementById('checkinBody').innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Guest Details</div>
          <div style="background:var(--s3);border-radius:var(--r-lg);padding:16px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              ${UI.guestAvatar(g,44)}
              <div><div style="font-family:var(--font-d);font-size:16px;font-weight:700">${g?.first_name} ${g?.last_name}</div>${UI.vipBadge(g?.vip_level||0)}</div>
            </div>
            <div style="font-size:12px;color:var(--text3);display:flex;flex-direction:column;gap:4px">
              <span>📧 ${g?.email||'—'}</span><span>📱 ${g?.phone||'—'}</span>
              <span>🌍 ${g?.nationality||'—'}</span>
              <span>🪪 ${(g?.id_type||'').replace(/_/g,' ')}: ${g?.id_number||'—'}</span>
              <span>🏨 ${g?.total_stays||0} previous stay${g?.total_stays!==1?'s':''}</span>
            </div>
            ${g?.preferences?.length?`<div style="margin-top:8px;font-size:11px;color:var(--gold)">Preferences: ${g.preferences.join(', ')}</div>`:''}
            ${g?.notes?`<div style="margin-top:6px;font-size:11px;color:var(--amber)">⚠ ${g.notes}</div>`:''}
          </div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Reservation</div>
          <div style="background:var(--s3);border-radius:var(--r-lg);padding:14px;font-size:12px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Ref</span><span style="font-family:var(--font-m);font-size:10px;color:var(--gold)">${res.reservation_number}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Source</span><span>${res.source.replace(/_/g,' ')}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Room Type</span><span>${rt?.name}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Check-out</span><span>${fmtDate(res.check_out_date)}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Nights</span><span>${nights}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Rate</span><span>${fmt(rp?.rate||res.rate_per_night)}/night</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Meal Plan</span><span>${(res.meal_plan||'').replace(/_/g,' ')}</span></div>
            ${res.special_requests?`<div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Requests</span><span style="text-align:right;font-size:11px">${res.special_requests}</span></div>`:''}
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Deposit Paid</span><span style="color:var(--teal)">${fmt(res.deposit_paid||0)}</span></div>
            ${res.channel_reference?`<div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Channel Ref</span><span>${res.channel_reference}</span></div>`:''}
          </div>
        </div>
      </div>
      <div style="margin-top:14px">
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--s3);border-radius:var(--r-md)">
          <input type="checkbox" id="idVerified" style="accent-color:var(--teal);width:16px;height:16px">
          <label for="idVerified" style="font-size:13px;color:var(--text2);cursor:pointer">I have verified the guest's ${(g?.id_type||'ID').replace(/_/g,' ')} (${g?.id_number||'—'})</label>
        </div>
      </div>`;
    document.getElementById('checkinFoot').innerHTML=`
      <button class="vbtn vbtn-ghost" onclick="UI.closeModal('checkinModal')">Cancel</button>
      <button class="vbtn vbtn-primary" onclick="FD.checkin._toStep2('${res.id}')">Next: Assign Room →</button>`;
  },
  _toStep2(resId){
    if(!document.getElementById('idVerified')?.checked){toast('Verify guest ID before proceeding','warning');return;}
    const res=D.reservations.find(r=>r.id===resId);
    const rt=DH.getRoomType(res.room_type_id), nights=nightsBetween(res.check_in_date,res.check_out_date);
    FD.checkin._stepDots(2);
    const avail=D.rooms.filter(r=>r.status==='vacant_clean'&&r.room_type_id===res.room_type_id);
    const assigned=res.room_id?DH.getRoom(res.room_id):null;
    document.getElementById('checkinBody').innerHTML=`
      <div style="margin-bottom:14px;font-size:13px;color:var(--text2)">
        Assign a <strong>${rt?.name}</strong> room
        ${assigned?`<div style="margin-top:8px;padding:8px 12px;background:var(--teal-pale);border:1px solid var(--teal-d);border-radius:var(--r-md);font-size:12px;color:var(--teal)">Pre-assigned: Room ${assigned.room_number}</div>`:''}
      </div>
      <div class="room-assign-grid" id="roomAssignGrid">
        ${avail.map(r=>`<div class="rag-tile ${res.room_id===r.id?'selected':''}" onclick="FD.checkin._selectRoom('${r.id}','${resId}')"><div class="rag-num">Room ${r.room_number}</div><div class="rag-type">Floor ${r.floor}${r.is_accessible?' · ♿':''}</div></div>`).join('')}
        ${!avail.length?`<div style="grid-column:1/-1;font-size:12px;color:var(--crimson);padding:10px">No clean ${rt?.name} rooms available. Consider upgrading guest.</div>`:''}
      </div>`;
    document.getElementById('checkinFoot').innerHTML=`
      <button class="vbtn vbtn-ghost" onclick="UI.closeModal('checkinModal')">Cancel</button>
      <button class="vbtn vbtn-primary" onclick="FD.checkin._toStep3('${resId}')">Next: Payment →</button>`;
  },
  _selectRoom(roomId,resId){
    const res=D.reservations.find(r=>r.id===resId);
    res.room_id=roomId;
    document.querySelectorAll('.rag-tile').forEach(t=>t.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
  },
  _toStep3(resId){
    const res=D.reservations.find(r=>r.id===resId);
    if(!res.room_id){toast('Assign a room first','warning');return;}
    const rp=DH.getRatePlan(res.rate_plan_id);
    const nights=nightsBetween(res.check_in_date,res.check_out_date);
    const total=Math.round((rp?.rate||res.rate_per_night)*nights*1.18);
    const room=DH.getRoom(res.room_id);
    FD.checkin._stepDots(3);
    document.getElementById('checkinBody').innerHTML=`
      <div style="background:var(--s3);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:16px;font-size:12px;display:flex;flex-direction:column;gap:7px">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Guest</span><span style="font-weight:600">${DH.getGuest(res.guest_id)?.first_name} ${DH.getGuest(res.guest_id)?.last_name}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Room</span><span style="font-weight:600">Room ${room?.room_number} — ${DH.getRoomType(res.room_type_id)?.name}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Total Stay (${nights}n)</span><span style="color:var(--gold);font-family:var(--font-m);font-size:15px">${fmt(total)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Already Paid</span><span style="color:var(--teal)">${fmt(res.deposit_paid||0)}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:700"><span style="color:var(--text1)">Balance</span><span style="color:var(--crimson);font-size:15px">${fmt(total-(res.deposit_paid||0))}</span></div>
      </div>
      <div style="background:var(--s3);border-radius:var(--r-lg);padding:16px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Additional Deposit (optional)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="form-label">Amount</label><input type="number" class="finput" id="ci_deposit" value="0" min="0"></div>
          <div><label class="form-label">Method</label><select class="finput" id="ci_paymethod"><option value="cash">Cash</option><option value="card">Card</option><option value="mobile_money">Mobile Money</option></select></div>
        </div>
      </div>
      <div style="margin-top:12px;padding:10px;background:var(--s3);border-radius:var(--r-md);font-size:11px;color:var(--text2)">✓ Key card to be issued after confirmation</div>`;
    document.getElementById('checkinFoot').innerHTML=`
      <button class="vbtn vbtn-ghost" onclick="UI.closeModal('checkinModal')">Cancel</button>
      <button class="vbtn vbtn-primary" style="font-size:13px" onclick="FD.checkin._confirm('${resId}')">✓ Complete Check-in</button>`;
  },
  async _confirm(resId){
    const res=D.reservations.find(r=>r.id===resId);
    const g=DH.getGuest(res.guest_id), room=DH.getRoom(res.room_id);
    const rp=DH.getRatePlan(res.rate_plan_id);
    const extraDep=parseFloat(document.getElementById('ci_deposit')?.value)||0;
    const payMethod=document.getElementById('ci_paymethod')?.value||'cash';
    res.status='checked_in'; res.actual_check_in=new Date().toISOString();
    res.deposit_paid=(res.deposit_paid||0)+extraDep;
    if(room){room.status='occupied'; room.current_reservation_id=resId;}
    let folio=DH.getFolio(resId);
    if(!folio){
      S.folioSeq++;
      folio={id:'f'+Date.now(),reservation_id:resId,guest_id:res.guest_id,
        folio_number:`FOL-${new Date().getFullYear()}-${String(S.folioSeq).padStart(5,'0')}`,
        status:'active',total_charges:0,total_payments:res.deposit_paid||0,balance:-(res.deposit_paid||0),charges:[]};
      D.folios.push(folio);
    }
    if(extraDep>0){folio.charges.push({id:'fc'+Date.now(),charge_date:today(),charge_type:'payment',description:`Deposit — ${payMethod}`,amount:-extraDep,is_reversal:false});folio.total_payments+=extraDep;folio.balance-=extraDep;}
    const rate=rp?.rate||res.rate_per_night||0;
    folio.charges.push({id:'fc'+(Date.now()+1),charge_date:today(),charge_type:'room_night',description:`${DH.getRoomType(res.room_type_id)?.name} — Night 1`,amount:rate,is_reversal:false});
    folio.total_charges+=rate; folio.balance+=rate;
    if(g) g.total_stays=(g.total_stays||0)+1;
    await FD.db.checkin(res,folio);
    UI.closeModal('checkinModal');
    FD.data.refresh();
    UI.showSuccess(`${g?.first_name} checked in`,`Room ${room?.room_number} · ${res.reservation_number}`);
    setTimeout(()=>FD.nav.go('inhouse'),2500);
  },
};

// ── CHECK-OUT ────────────────────────────────────────────────
FD.checkout = {
  open(resId){
    const res=D.reservations.find(r=>r.id===resId);
    const g=DH.getGuest(res.guest_id), room=res.room_id?DH.getRoom(res.room_id):null;
    const folio=DH.getFolio(resId), nights=nightsBetween(res.check_in_date,res.check_out_date);
    S.checkoutResId=resId;
    document.getElementById('checkoutBody').innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 300px;gap:20px">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:14px;background:var(--s3);border-radius:var(--r-lg)">
            ${UI.guestAvatar(g,44)}
            <div><div style="font-family:var(--font-d);font-size:16px;font-weight:700">${g?.first_name} ${g?.last_name}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:3px">Room ${room?.room_number} · ${res.reservation_number}</div>
            <div style="font-size:11px;color:var(--text3)">${fmtDate(res.check_in_date)} → ${fmtDate(res.check_out_date)} · ${nights} nights</div></div>
          </div>
          <div style="font-size:13px;font-weight:700;margin-bottom:10px;font-family:var(--font-d)">Folio — ${folio?.folio_number||'—'}</div>
          <table class="folio-charge-table">
            <thead><tr><th>Date</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
            <tbody>${(folio?.charges||[]).map(c=>`<tr class="${c.amount<0?'fct-reversal':''}"><td>${fmtDate(c.charge_date)}</td><td>${c.description}</td><td style="text-align:right;font-family:var(--font-m)">${c.amount<0?'-':''}${fmt(Math.abs(c.amount))}</td></tr>`).join('')}</tbody>
          </table>
          <div class="folio-balance-summary">
            <div class="fbs-item"><div class="fbs-val">${fmt(folio?.total_charges||0)}</div><div class="fbs-lbl">Charges</div></div>
            <div class="fbs-item"><div class="fbs-val" style="color:var(--teal)">${fmt(folio?.total_payments||0)}</div><div class="fbs-lbl">Paid</div></div>
            <div class="fbs-item"><div class="fbs-val" style="color:${(folio?.balance||0)>0?'var(--crimson)':'var(--teal)'}">${fmt(Math.abs(folio?.balance||0))}</div><div class="fbs-lbl">${(folio?.balance||0)>0?'Balance Due':'Credit'}</div></div>
          </div>
        </div>
        <div style="background:var(--s3);border:1px solid var(--border);border-radius:var(--r-xl);padding:18px">
          <div style="font-family:var(--font-d);font-size:14px;font-weight:700;margin-bottom:14px">Settle Balance</div>
          ${(folio?.balance||0)>0?`
            <div class="fg" style="margin-bottom:10px"><label class="field-lbl">Amount Due</label><div style="font-family:var(--font-m);font-size:22px;color:var(--crimson);padding:6px 0">${fmt(folio.balance)}</div></div>
            <div class="fg" style="margin-bottom:10px"><label class="field-lbl">Method</label><select class="finput" id="co_paymethod"><option value="cash">Cash</option><option value="card">Card / POS</option><option value="mobile_money">Mobile Money</option><option value="city_ledger">City Ledger</option><option value="complimentary">Complimentary</option></select></div>
            <div class="fg"><label class="field-lbl">Reference</label><input type="text" class="finput" id="co_ref" placeholder="Auth code…"></div>
          `:`<div style="padding:10px;background:var(--teal-pale);border:1px solid var(--teal-d);border-radius:var(--r-md);font-size:12px;color:var(--teal)">✓ Balance fully settled</div>`}
          <button class="vbtn vbtn-ghost" style="width:100%;margin-top:14px" onclick="FD.folio.addCharge()">+ Post Final Charge</button>
        </div>
      </div>`;
    document.getElementById('checkoutFoot').innerHTML=`
      <button class="vbtn vbtn-ghost" onclick="UI.closeModal('checkoutModal')">Cancel</button>
      <button class="vbtn vbtn-secondary" onclick="FD.folio.open('${folio?.id||''}')">Full Folio</button>
      <button class="vbtn vbtn-primary" style="font-size:13px" onclick="FD.checkout._confirm('${resId}')">⬆ Complete Check-out</button>`;
    UI.openModal('checkoutModal');
  },
  async _confirm(resId){
    const res=D.reservations.find(r=>r.id===resId);
    const g=DH.getGuest(res.guest_id), room=res.room_id?DH.getRoom(res.room_id):null;
    const folio=DH.getFolio(resId);
    const payMethod=document.getElementById('co_paymethod')?.value;
    const payRef=document.getElementById('co_ref')?.value?.trim();
    if(folio&&folio.balance>0){
      folio.charges.push({id:'fc'+Date.now(),charge_date:today(),charge_type:'payment',description:`Settlement — ${(payMethod||'cash').replace(/_/g,' ')}${payRef?' ('+payRef+')':''}`,amount:-folio.balance,is_reversal:false});
      folio.total_payments+=folio.balance; folio.balance=0; folio.status='settled';
    }
    res.status='checked_out'; res.actual_check_out=new Date().toISOString();
    if(room){room.status='dirty'; room.current_reservation_id=null;}
    if(g) g.last_stay_date=today();
    await FD.db.checkout(res,folio);
    UI.closeModal('checkoutModal');
    FD.data.refresh();
    UI.showSuccess(`${g?.first_name} checked out`,`Room ${room?.room_number} queued for housekeeping`);
    setTimeout(()=>FD.nav.go('departures'),2500);
  },
};

// ── FOLIO ────────────────────────────────────────────────────
FD.folio = {
  open(folioId){
    if(!folioId){toast('No folio found','warning');return;}
    S.activeFolioId=folioId;
    const f=D.folios.find(f=>f.id===folioId);
    const res=D.reservations.find(r=>r.id===f.reservation_id);
    const g=DH.getGuest(f.guest_id), room=res?.room_id?DH.getRoom(res.room_id):null;
    document.getElementById('folioModalTitle').textContent=`Folio — ${g?.first_name} ${g?.last_name}`;
    document.getElementById('folioRef').textContent=f.folio_number;
    document.getElementById('folioModalBody').innerHTML=`
      <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
        <div style="flex:1;background:var(--s3);border-radius:var(--r-md);padding:14px;font-size:12px">
          <div style="font-weight:700;font-family:var(--font-d);margin-bottom:6px">${g?.first_name} ${g?.last_name}</div>
          ${room?`<div style="color:var(--text3)">Room ${room.room_number}</div>`:''}
          <div style="color:var(--text3)">${fmtDate(res?.check_in_date)} → ${fmtDate(res?.check_out_date)}</div>
        </div>
        <div class="folio-balance-summary" style="flex:2;background:var(--s3);border-radius:var(--r-md);padding:14px;margin:0">
          <div class="fbs-item"><div class="fbs-val">${fmt(f.total_charges)}</div><div class="fbs-lbl">Charges</div></div>
          <div class="fbs-item"><div class="fbs-val" style="color:var(--teal)">${fmt(f.total_payments)}</div><div class="fbs-lbl">Paid</div></div>
          <div class="fbs-item"><div class="fbs-val" style="color:${f.balance>0?'var(--crimson)':'var(--teal)'}">${fmt(Math.abs(f.balance))}</div><div class="fbs-lbl">${f.balance>0?'Balance Due':'Credit'}</div></div>
        </div>
      </div>
      <table class="folio-charge-table">
        <thead><tr><th>Date</th><th>Type</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${f.charges.map(c=>`<tr class="${c.amount<0?'fct-reversal':''}"><td>${fmtDate(c.charge_date)}</td><td style="color:var(--text3)">${c.charge_type.replace(/_/g,' ')}</td><td>${c.description}</td><td style="text-align:right;font-family:var(--font-m)">${c.amount<0?'-':''}${fmt(Math.abs(c.amount))}</td></tr>`).join('')}</tbody>
      </table>`;
    document.getElementById('folioModalFoot').innerHTML=`
      <button class="vbtn vbtn-ghost" onclick="UI.closeModal('folioModal')">Close</button>
      <button class="vbtn vbtn-secondary" onclick="FD.folio.addCharge()">+ Post Charge</button>
      <button class="vbtn vbtn-secondary" onclick="FD.folio._printInvoice('${folioId}')">🖨 Invoice</button>
      ${f.balance>0?`<button class="vbtn vbtn-primary" onclick="FD.checkout.open('${f.reservation_id}');UI.closeModal('folioModal')">Settle Balance</button>`:''}`;
    UI.openModal('folioModal');
  },
  addCharge(){
    document.getElementById('ch_desc').value='';
    document.getElementById('ch_amount').value='';
    document.getElementById('ch_qty').value='1';
    document.getElementById('chargePreview').style.display='none';
    UI.openModal('chargeModal');
  },
  previewCharge(){
    const amt=parseFloat(document.getElementById('ch_amount')?.value)||0;
    const qty=parseFloat(document.getElementById('ch_qty')?.value)||1;
    const el=document.getElementById('chargePreview');
    if(amt>0){el.style.display='block';el.innerHTML=`<div style="display:flex;justify-content:space-between;font-size:12px"><span>Total</span><span>${fmt(amt*qty)}</span></div>`;}
    else el.style.display='none';
  },
  postCharge(){
    const type=document.getElementById('ch_type')?.value;
    const desc=document.getElementById('ch_desc')?.value?.trim();
    const amt=parseFloat(document.getElementById('ch_amount')?.value)||0;
    const qty=parseFloat(document.getElementById('ch_qty')?.value)||1;
    if(!desc||!amt){toast('Description and amount required','warning');return;}
    const f=D.folios.find(f=>f.id===S.activeFolioId);
    if(!f){toast('No active folio','error');return;}
    const total=amt*qty;
    f.charges.push({id:'fc'+Date.now(),charge_date:today(),charge_type:type,description:desc,quantity:qty,amount:total,is_reversal:false});
    f.total_charges+=total; f.balance+=total;
    UI.closeModal('chargeModal');
    if(document.getElementById('folioModal').classList.contains('open')) FD.folio.open(S.activeFolioId);
    toast(`${fmt(total)} posted to folio`,'success','💰');
  },
  _printInvoice(folioId){
    const f=D.folios.find(f=>f.id===folioId);
    const g=DH.getGuest(f.guest_id), res=D.reservations.find(r=>r.id===f.reservation_id), room=res?.room_id?DH.getRoom(res.room_id):null;
    const win=window.open('','_blank','width=600,height=800');
    win.document.write(`<!DOCTYPE html><html><head><style>body{font-family:'Courier New',monospace;font-size:12px;margin:30px;color:#000}h1{font-family:serif;font-size:22px;margin-bottom:4px}.sub{color:#777;font-size:11px;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin:16px 0}th{border-bottom:2px solid #000;padding:6px 0;text-align:left;font-size:10px;text-transform:uppercase}td{padding:7px 0;border-bottom:1px solid #eee}.r{text-align:right}.total td{border-top:2px solid #000;font-weight:bold;font-size:14px}.footer{text-align:center;font-size:10px;color:#999;margin-top:24px}</style></head><body>
      <h1>${S.claims?.property_name||'Hotel'}</h1><div class="sub">Tax Invoice · ${f.folio_number} · ${new Date().toLocaleDateString('en-UG')}</div>
      <div><strong>Guest:</strong> ${g?.first_name} ${g?.last_name}</div>${room?`<div><strong>Room:</strong> ${room.room_number}</div>`:''}
      <div><strong>Check-in:</strong> ${fmtDate(res?.check_in_date)} &nbsp; <strong>Check-out:</strong> ${fmtDate(res?.check_out_date)}</div>
      <table><thead><tr><th>Date</th><th>Description</th><th class="r">Amount (${S.claims?.currency_code||'UGX'})</th></tr></thead>
      <tbody>${f.charges.map(c=>`<tr><td>${fmtDate(c.charge_date)}</td><td>${c.description}</td><td class="r">${c.amount<0?'-':''}${Math.round(Math.abs(c.amount)).toLocaleString()}</td></tr>`).join('')}</tbody>
      <tfoot><tr class="total"><td colspan="2">TOTAL DUE</td><td class="r">${Math.round(f.balance).toLocaleString()}</td></tr></tfoot></table>
      <div class="footer">Thank you for your stay · ${S.claims?.property_name}</div>
      </body></html>`);
    win.document.close(); win.print();
  },
};

// ── FOLIOS VIEW ──────────────────────────────────────────────
FD.folios = {
  render(){
    const f=document.getElementById('folioFilter')?.value||'active';
    const list=f==='all'?D.folios:D.folios.filter(fo=>fo.status===f);
    document.getElementById('folioList').innerHTML=list.map(fo=>{
      const res=D.reservations.find(r=>r.id===fo.reservation_id);
      const g=DH.getGuest(fo.guest_id), room=res?.room_id?DH.getRoom(res.room_id):null;
      return `<div class="folio-card" onclick="FD.folio.open('${fo.id}')">
        <div style="flex:1"><div class="fc-folio-num">${fo.folio_number}</div><div class="fc-guest">${g?.first_name} ${g?.last_name}</div><div class="fc-room">${room?`Room ${room.room_number} · `:''}Out: ${fmtDate(res?.check_out_date)}</div></div>
        <div class="fc-balance ${fo.balance>0?'positive':'zero'}">${fmt(fo.balance)}</div>
      </div>`;
    }).join('')||UI.emptyState('📋','No folios found');
  },
};

// ── WALK-IN WIZARD ───────────────────────────────────────────
FD.walkin = {
  reset(){
    S.walkin={step:1,guest:null,room:null,ratePlan:null,checkin:today(),checkout:addDays(today(),1),adults:1,children:0,mealPlan:'room_only',source:'walk_in',requests:'',depositPaid:0};
    FD.walkin.renderStep(1);
  },
  renderStep(step){
    S.walkin.step=step;
    document.querySelectorAll('.wstep').forEach(el=>{const n=parseInt(el.dataset.step);el.classList.remove('active','done');if(n===step)el.classList.add('active');if(n<step)el.classList.add('done');});
    const body=document.getElementById('walkinBody');
    if(!body) return;
    switch(step){
      case 1: body.innerHTML=FD.walkin._step1HTML(); break;
      case 2: body.innerHTML=FD.walkin._step2HTML(); break;
      case 3: body.innerHTML=FD.walkin._step3HTML(); break;
      case 4: body.innerHTML=FD.walkin._step4HTML(); break;
    }
    FD.walkin.renderSummary();
    FD.walkin.renderAvailRooms();
  },
  _step1HTML:()=>`
    <div class="walkin-step-body">
      <div class="step-title">Guest Information</div>
      <div class="fg" style="margin-bottom:12px"><label>Search existing guest</label>
        <input type="text" class="finput" id="wi_search" placeholder="Name, email, phone…" oninput="FD.walkin.searchGuest(this.value)">
        <div class="suggest-dropdown" id="wi_suggest" style="display:none"></div>
      </div>
      <div style="text-align:center;color:var(--text3);font-size:11px;margin:8px 0">— or enter new guest —</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="fg"><label>First Name *</label><input type="text" class="finput" id="wi_fname" value="${S.walkin.guest?.first_name||''}"></div>
        <div class="fg"><label>Last Name *</label><input type="text" class="finput" id="wi_lname" value="${S.walkin.guest?.last_name||''}"></div>
        <div class="fg"><label>Email</label><input type="email" class="finput" id="wi_email" value="${S.walkin.guest?.email||''}"></div>
        <div class="fg"><label>Phone</label><input type="text" class="finput" id="wi_phone" value="${S.walkin.guest?.phone||''}"></div>
        <div class="fg"><label>ID Type</label><select class="finput" id="wi_idtype"><option value="passport">Passport</option><option value="national_id">National ID</option><option value="driving_licence">Driving Licence</option></select></div>
        <div class="fg"><label>ID Number *</label><input type="text" class="finput" id="wi_idnum" value="${S.walkin.guest?.id_number||''}"></div>
      </div>
      <div class="fg" style="margin-top:10px"><label>Nationality</label><input type="text" class="finput" id="wi_nat" value="${S.walkin.guest?.nationality||''}"></div>
      <div class="step-nav"><div></div><button class="vbtn vbtn-primary" onclick="FD.walkin.next(1)">Next: Dates →</button></div>
    </div>`,
  _step2HTML:()=>`
    <div class="walkin-step-body">
      <div class="step-title">Dates & Occupancy</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="fg"><label>Check-in *</label><input type="date" class="finput" id="wi_ci" value="${S.walkin.checkin}" onchange="FD.walkin.onDates()"></div>
        <div class="fg"><label>Check-out *</label><input type="date" class="finput" id="wi_co" value="${S.walkin.checkout}" onchange="FD.walkin.onDates()"></div>
        <div class="fg"><label>Adults</label><input type="number" class="finput" id="wi_adults" value="${S.walkin.adults}" min="1"></div>
        <div class="fg"><label>Children</label><input type="number" class="finput" id="wi_children" value="${S.walkin.children}" min="0"></div>
      </div>
      <div class="step-nav"><button class="vbtn vbtn-ghost" onclick="FD.walkin.renderStep(1)">← Back</button><button class="vbtn vbtn-primary" onclick="FD.walkin.next(2)">Next: Rate →</button></div>
    </div>`,
  _step3HTML:()=>`
    <div class="walkin-step-body">
      <div class="step-title">Room Type & Rate</div>
      <div class="fg"><label>Room Type *</label>
        <select class="finput" id="wi_type" onchange="FD.walkin.onRoomType()">
          <option value="">Select…</option>
          ${D.room_types.map(t=>`<option value="${t.id}" ${S.walkin.room?.room_type_id===t.id?'selected':''}>${t.name} — from ${fmt(t.base_rate)}/night</option>`).join('')}
        </select>
      </div>
      <div class="fg" style="margin-top:10px"><label>Rate Plan *</label>
        <select class="finput" id="wi_rate" onchange="FD.walkin.onRatePlan()"><option value="">Select room type first…</option></select>
      </div>
      <div class="fg" style="margin-top:10px"><label>Meal Plan</label>
        <select class="finput" id="wi_meal">
          <option value="room_only">Room Only</option><option value="bed_breakfast">Bed & Breakfast</option>
          <option value="half_board">Half Board</option><option value="full_board">Full Board</option>
        </select>
      </div>
      <div class="fg" style="margin-top:10px"><label>Booking Source</label>
        <select class="finput" id="wi_src">
          <option value="walk_in">Walk-in</option><option value="phone">Phone</option>
          <option value="booking_com">Booking.com</option><option value="corporate">Corporate</option>
        </select>
      </div>
      <div class="fg" style="margin-top:10px"><label>Special Requests</label>
        <textarea class="finput ftextarea" id="wi_req" rows="2">${S.walkin.requests}</textarea>
      </div>
      <div class="step-nav"><button class="vbtn vbtn-ghost" onclick="FD.walkin.renderStep(2)">← Back</button><button class="vbtn vbtn-primary" onclick="FD.walkin.next(3)">Next: Confirm →</button></div>
    </div>`,
  _step4HTML(){
    const nights=nightsBetween(S.walkin.checkin,S.walkin.checkout);
    const rate=S.walkin.ratePlan?.rate||0;
    const subtotal=rate*nights, tax=Math.round(subtotal*D.tax_rate), total=subtotal+tax;
    const g=S.walkin.guest, r=S.walkin.room, rt=r?DH.getRoomType(r.room_type_id):null;
    return `<div class="walkin-step-body">
      <div class="step-title">Confirm & Check-in</div>
      <div style="background:var(--s3);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:14px;font-size:12px;display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Guest</span><span style="font-weight:600">${g?.first_name||'—'} ${g?.last_name||''}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Room</span><span style="font-weight:600">${r?`Room ${r.room_number} — ${rt?.name}`:'Not yet assigned'}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Check-in</span><span>${fmtDate(S.walkin.checkin)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Check-out</span><span>${fmtDate(S.walkin.checkout)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Nights</span><span>${nights}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Rate</span><span>${fmt(rate)}/night · ${S.walkin.ratePlan?.name||'—'}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">Subtotal</span><span>${fmt(subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text3)">VAT (18%)</span><span>${fmt(tax)}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--border);padding-top:8px;margin-top:4px"><span style="color:var(--text1)">Total Stay</span><span style="color:var(--gold);font-family:var(--font-m);font-size:16px">${fmt(total)}</span></div>
      </div>
      <div style="background:var(--s3);border-radius:var(--r-lg);padding:14px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Deposit Collection</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="fg"><label>Amount</label><input type="number" class="finput" id="wi_dep" value="${Math.round(rate)}" min="0"></div>
          <div class="fg"><label>Method</label><select class="finput" id="wi_pm"><option value="cash">Cash</option><option value="card">Card</option><option value="mobile_money">Mobile Money</option></select></div>
        </div>
      </div>
      <div class="step-nav"><button class="vbtn vbtn-ghost" onclick="FD.walkin.renderStep(3)">← Back</button><button class="vbtn vbtn-primary" style="font-size:14px;padding:12px 24px" onclick="FD.walkin.confirm()">✓ Check-in Guest</button></div>
    </div>`;
  },
  searchGuest(q){
    const el=document.getElementById('wi_suggest');
    if(!q.trim()){el.style.display='none';return;}
    const m=D.guests.filter(g=>`${g.first_name} ${g.last_name} ${g.email} ${g.phone}`.toLowerCase().includes(q.toLowerCase()));
    el.style.display=m.length?'block':'none';
    el.innerHTML=m.map(g=>`<div class="suggest-item" onclick="FD.walkin.selectGuest('${g.id}')"><strong>${g.first_name} ${g.last_name}</strong>${g.vip_level>0?` <span style="color:var(--gold);font-size:10px">★ ${['','VIP','VVIP'][g.vip_level]}</span>`:''}<br><span style="font-size:10px;color:var(--text3)">${g.email||''} · ${g.total_stays} stays</span></div>`).join('');
  },
  selectGuest(id){
    const g=DH.getGuest(id); S.walkin.guest={...g};
    document.getElementById('wi_suggest').style.display='none';
    document.getElementById('wi_search').value=`${g.first_name} ${g.last_name}`;
    ['wi_fname','wi_lname','wi_email','wi_phone','wi_idnum','wi_nat'].forEach((fid,i)=>{const el=document.getElementById(fid);if(el)el.value=[g.first_name,g.last_name,g.email,g.phone,g.id_number,g.nationality][i]||'';});
    FD.walkin.renderSummary();
  },
  onDates(){S.walkin.checkin=document.getElementById('wi_ci')?.value;S.walkin.checkout=document.getElementById('wi_co')?.value;FD.walkin.renderAvailRooms();FD.walkin.renderSummary();},
  onRoomType(){
    const typeId=document.getElementById('wi_type')?.value;
    const plans=D.rate_plans.filter(p=>p.room_type_id===typeId);
    const sel=document.getElementById('wi_rate');
    if(sel){sel.innerHTML=plans.map(p=>`<option value="${p.id}">${p.name} — ${fmt(p.rate)}/night${p.includes_breakfast?' (incl. breakfast)':''}</option>`).join('');S.walkin.ratePlan=plans[0]||null;}
    FD.walkin.renderAvailRooms(typeId); FD.walkin.renderSummary();
  },
  onRatePlan(){const id=document.getElementById('wi_rate')?.value;S.walkin.ratePlan=D.rate_plans.find(p=>p.id===id)||null;FD.walkin.renderSummary();},
  filterRooms(){FD.walkin.renderAvailRooms(document.getElementById('arpTypeFilter')?.value||null);},
  renderAvailRooms(typeId,floor){
    const rooms=D.rooms.filter(r=>r.status==='vacant_clean'&&(!typeId||r.room_type_id===typeId)&&(!floor||r.floor===parseInt(floor)));
    const grid=document.getElementById('availRoomsGrid');
    if(!grid) return;
    grid.innerHTML=rooms.length?rooms.map(r=>{const rt=DH.getRoomType(r.room_type_id);return `<div class="avail-room-tile ${S.walkin.room?.id===r.id?'selected':''}" onclick="FD.walkin.selectRoom('${r.id}')"><div class="art-num">Room ${r.room_number}</div><div class="art-type">Floor ${r.floor} · ${rt?.name}</div><div class="art-features">${r.is_accessible?'<span class="art-feat">♿</span>':''}</div><div class="art-rate">${fmt(rt?.base_rate||0)}/night</div></div>`;}).join(''):'<div style="font-size:11px;color:var(--text3);grid-column:1/-1;padding:12px 0">No available rooms</div>';
  },
  selectRoom(id){S.walkin.room=DH.getRoom(id);FD.walkin.renderAvailRooms();FD.walkin.renderSummary();toast(`Room ${S.walkin.room.room_number} selected`,'success','🛏');},
  renderSummary(){
    const el=document.getElementById('walkinSummary'); if(!el) return;
    const g=S.walkin.guest,r=S.walkin.room,rp=S.walkin.ratePlan;
    const nights=S.walkin.checkin&&S.walkin.checkout?nightsBetween(S.walkin.checkin,S.walkin.checkout):0;
    const total=(rp?.rate||0)*nights,tax=Math.round(total*D.tax_rate);
    el.innerHTML=`<div class="bs-title">Booking Summary</div>
      ${g?`<div class="bs-row"><span class="bs-lbl">Guest</span><span class="bs-val">${g.first_name} ${g.last_name}</span></div>`:''}
      ${r?`<div class="bs-row"><span class="bs-lbl">Room</span><span class="bs-val">${r.room_number} — ${DH.getRoomType(r.room_type_id)?.name}</span></div>`:''}
      ${S.walkin.checkin?`<div class="bs-row"><span class="bs-lbl">Check-in</span><span class="bs-val">${fmtDate(S.walkin.checkin)}</span></div>`:''}
      ${S.walkin.checkout?`<div class="bs-row"><span class="bs-lbl">Check-out</span><span class="bs-val">${fmtDate(S.walkin.checkout)}</span></div>`:''}
      ${nights>0?`<div class="bs-row"><span class="bs-lbl">Nights</span><span class="bs-val">${nights}</span></div>`:''}
      ${rp?`<div class="bs-row"><span class="bs-lbl">Rate</span><span class="bs-val">${fmt(rp.rate)}/night</span></div>`:''}
      ${total>0?`<div class="bs-row"><span class="bs-lbl">VAT</span><span class="bs-val">${fmt(tax)}</span></div><div class="bs-row bs-total"><span class="bs-lbl">Total Stay</span><span class="bs-val">${fmt(total+tax)}</span></div>`:''}`;
  },
  next(current){
    if(current===1){
      const fn=document.getElementById('wi_fname')?.value?.trim(), ln=document.getElementById('wi_lname')?.value?.trim(), idn=document.getElementById('wi_idnum')?.value?.trim();
      if(!fn||!ln){toast('First and last name required','warning');return;}
      if(!idn){toast('ID number required','warning');return;}
      S.walkin.guest={...(S.walkin.guest||{}),first_name:fn,last_name:ln,email:document.getElementById('wi_email')?.value?.trim(),phone:document.getElementById('wi_phone')?.value?.trim(),id_type:document.getElementById('wi_idtype')?.value,id_number:idn,nationality:document.getElementById('wi_nat')?.value?.trim()};
    }
    if(current===2){
      S.walkin.checkin=document.getElementById('wi_ci')?.value;S.walkin.checkout=document.getElementById('wi_co')?.value;
      S.walkin.adults=parseInt(document.getElementById('wi_adults')?.value)||1;S.walkin.children=parseInt(document.getElementById('wi_children')?.value)||0;
      if(!S.walkin.checkin||!S.walkin.checkout){toast('Select dates','warning');return;}
      if(S.walkin.checkout<=S.walkin.checkin){toast('Check-out must be after check-in','warning');return;}
    }
    if(current===3){
      S.walkin.mealPlan=document.getElementById('wi_meal')?.value;S.walkin.source=document.getElementById('wi_src')?.value;S.walkin.requests=document.getElementById('wi_req')?.value?.trim();
      if(!S.walkin.ratePlan){toast('Select a rate plan','warning');return;}
    }
    FD.walkin.renderStep(current+1);
  },
  async confirm(){
    if(!S.walkin.guest){toast('Guest information required','warning');return;}
    if(!S.walkin.room){toast('Select a room','warning');return;}
    if(!S.walkin.ratePlan){toast('Select a rate plan','warning');return;}
    const deposit=parseFloat(document.getElementById('wi_dep')?.value)||0, payMethod=document.getElementById('wi_pm')?.value||'cash';
    S.walkin.depositPaid=deposit;
    let guestId=S.walkin.guest.id;
    if(!guestId){const ng={...S.walkin.guest,id:'g'+Date.now(),total_stays:0,vip_level:0};D.guests.unshift(ng);guestId=ng.id;}
    else{const g=DH.getGuest(guestId);if(g)g.total_stays=(g.total_stays||0)+1;}
    const nights=nightsBetween(S.walkin.checkin,S.walkin.checkout);
    S.resSeq++;
    const newRes={id:'res'+Date.now(),reservation_number:`RES-${new Date().getFullYear()}-${String(S.resSeq).padStart(5,'0')}`,
      guest_id:guestId,room_id:S.walkin.room.id,room_type_id:S.walkin.room.room_type_id,rate_plan_id:S.walkin.ratePlan.id,
      source:S.walkin.source,status:'checked_in',check_in_date:S.walkin.checkin,check_out_date:S.walkin.checkout,
      num_adults:S.walkin.adults,num_children:S.walkin.children,rate_per_night:S.walkin.ratePlan.rate,
      meal_plan:S.walkin.mealPlan,special_requests:S.walkin.requests,deposit_paid:deposit,
      actual_check_in:new Date().toISOString(),num_nights:nights,created_at:new Date().toISOString()};
    D.reservations.unshift(newRes);
    S.folioSeq++;
    const newFolio={id:'f'+Date.now(),reservation_id:newRes.id,guest_id:guestId,
      folio_number:`FOL-${new Date().getFullYear()}-${String(S.folioSeq).padStart(5,'0')}`,status:'active',
      total_charges:S.walkin.ratePlan.rate,total_payments:deposit,balance:S.walkin.ratePlan.rate-deposit,
      charges:[
        deposit>0?{id:'fc'+Date.now(),charge_date:today(),charge_type:'payment',description:`Deposit — ${payMethod}`,amount:-deposit,is_reversal:false}:null,
        {id:'fc'+(Date.now()+1),charge_date:today(),charge_type:'room_night',description:`${DH.getRoomType(S.walkin.room.room_type_id)?.name} — Night 1`,amount:S.walkin.ratePlan.rate,is_reversal:false},
      ].filter(Boolean)};
    D.folios.push(newFolio);
    const room=DH.getRoom(S.walkin.room.id);
    if(room){room.status='occupied';room.current_reservation_id=newRes.id;}
    await FD.db.checkin(newRes,newFolio);
    const guest=DH.getGuest(guestId);
    FD.data.refresh();
    UI.showSuccess(`${guest?.first_name} ${guest?.last_name} checked in`,`Room ${newRes.reservation_number} · ${nights} night${nights!==1?'s':''}`);
    S.walkin={step:1,guest:null,room:null,ratePlan:null,checkin:today(),checkout:addDays(today(),1),adults:1,children:0,mealPlan:'room_only',source:'walk_in',requests:'',depositPaid:0};
    setTimeout(()=>{FD.nav.go('inhouse');FD.walkin.reset();},2600);
  },
};

// ── CONFERENCE ───────────────────────────────────────────────
FD.conference = {
  render(){
    const date=document.getElementById('confDatePicker')?.value||today();
    document.getElementById('confRoomsCol').innerHTML=D.conference_rooms.map(cr=>{
      const booked=D.conference_bookings.filter(b=>b.conference_room_id===cr.id&&b.booking_date===date);
      return `<div class="conf-room-card"><div class="conf-room-name">${cr.name}</div><div class="conf-room-cap">Capacity: ${cr.capacity} pax</div><div class="conf-room-rate">${fmt(cr.rate_per_hour)}/hr · ${fmt(cr.rate_per_day)}/day</div><div class="conf-amenities">${cr.amenities.map(a=>`<span class="conf-amenity">${a}</span>`).join('')}</div><div style="margin-top:8px;font-size:11px;color:${booked.length?'var(--amber)':'var(--teal)'}">${booked.length?`${booked.length} booking${booked.length>1?'s':''} today`:'Available today'}</div><button class="vbtn vbtn-primary" style="margin-top:8px;width:100%;font-size:11px" onclick="FD.modals.newConference('${cr.id}')">+ Book</button></div>`;
    }).join('');
    const tb=D.conference_bookings.filter(b=>b.booking_date===date);
    document.getElementById('confBookingsList').innerHTML=tb.length?tb.map(b=>{
      const cr=D.conference_rooms.find(c=>c.id===b.conference_room_id);
      return `<div class="conf-booking-card"><div class="cbc-time">${b.start_time} – ${b.end_time}</div><div class="cbc-info"><div class="cbc-title">${b.guest_name}${b.company_name?` · ${b.company_name}`:''}</div><div class="cbc-meta">${cr?.name} · ${b.attendees} pax · ${b.setup_type.replace(/_/g,' ')}${b.catering_required?' · 🍽 Catering':''}${b.av_required?' · 📽 AV':''}</div></div><span style="font-family:var(--font-m);font-size:13px;color:var(--gold)">${fmt(b.total_amount)}</span><span class="g-badge badge-confirmed">Confirmed</span></div>`;
    }).join(''):UI.emptyState('🏛',`No bookings on ${fmtDate(date)}`);
  },
  checkAvail(){
    const roomId=document.getElementById('cf_room')?.value,date=document.getElementById('cf_date')?.value,start=document.getElementById('cf_start')?.value,end=document.getElementById('cf_end')?.value;
    const el=document.getElementById('confAvailStatus'); if(!el) return;
    if(!roomId||!date||!start||!end){el.className='conf-avail-status';return;}
    const conflicts=D.conference_bookings.filter(b=>b.conference_room_id===roomId&&b.booking_date===date&&b.status!=='cancelled'&&!(end<=b.start_time||start>=b.end_time));
    if(conflicts.length){el.className='conf-avail-status cas-busy';el.textContent=`⚠ Conflict: ${conflicts[0].guest_name} booked ${conflicts[0].start_time}–${conflicts[0].end_time}`;}
    else{el.className='conf-avail-status cas-ok';el.textContent='✓ Room available for this time slot';}
    FD.conference.calcCost();
  },
  calcCost(){
    const roomId=document.getElementById('cf_room')?.value,start=document.getElementById('cf_start')?.value,end=document.getElementById('cf_end')?.value;
    const el=document.getElementById('confCostSummary'); if(!el||!roomId||!start||!end) return;
    const cr=D.conference_rooms.find(c=>c.id===roomId); if(!cr) return;
    const hours=timeToHours(end)-timeToHours(start); if(hours<=0) return;
    const base=hours>=8?cr.rate_per_day:Math.round(cr.rate_per_hour*hours);
    const cat=document.getElementById('cf_catering')?.checked?Math.round(base*.3):0;
    const av=document.getElementById('cf_av')?.checked?50000:0;
    const tax=Math.round((base+cat+av)*D.tax_rate),total=base+cat+av+tax;
    el.style.display='block';
    el.innerHTML=`<div class="rcs-row"><span class="rcs-label">Room hire (${hours.toFixed(1)}h)</span><span>${fmt(base)}</span></div>${cat?`<div class="rcs-row"><span class="rcs-label">Catering</span><span>${fmt(cat)}</span></div>`:''}<div class="rcs-row"><span class="rcs-label">VAT (18%)</span><span>${fmt(tax)}</span></div><div class="rcs-row"><span>Total</span><span>${fmt(total)}</span></div>`;
  },
  book(){
    const roomId=document.getElementById('cf_room')?.value,guest=document.getElementById('cf_guest')?.value?.trim(),date=document.getElementById('cf_date')?.value,start=document.getElementById('cf_start')?.value,end=document.getElementById('cf_end')?.value,att=parseInt(document.getElementById('cf_attendees')?.value)||10;
    if(!roomId||!guest||!date||!start||!end){toast('Fill all required fields','warning');return;}
    const cr=D.conference_rooms.find(c=>c.id===roomId);
    const hours=timeToHours(end)-timeToHours(start);
    const total=Math.round((hours>=8?cr.rate_per_day:cr.rate_per_hour*hours)*1.18);
    D.conference_bookings.push({id:'cb'+Date.now(),conference_room_id:roomId,guest_name:guest,company_name:'',booking_date:date,start_time:start,end_time:end,attendees:att,setup_type:document.getElementById('cf_setup')?.value||'boardroom',total_amount:total,catering_required:document.getElementById('cf_catering')?.checked||false,av_required:document.getElementById('cf_av')?.checked||false,status:'confirmed'});
    UI.closeModal('confModal');
    FD.conference.render();
    toast(`Conference booking confirmed — ${cr.name}`,'success','🏛');
  },
};

// ── DINING ───────────────────────────────────────────────────
FD.dining = {
  render(){
    document.getElementById('diningAreaTabs').innerHTML=D.dining_areas.map(a=>`<button class="dat ${a.id===S.currentDiningArea?'active':''}" onclick="FD.dining.switchArea('${a.id}')">${a.name}</button>`).join('');
    FD.dining._renderFloor();
    const sel=document.getElementById('tr_tableId');
    if(sel){sel.innerHTML='<option value="">No preference</option>'+D.dining_tables.filter(t=>t.status==='free').map(t=>`<option value="${t.id}">Table ${t.table_number} (seats ${t.capacity})</option>`).join('');}
  },
  switchArea(id){S.currentDiningArea=id;document.querySelectorAll('.dat').forEach(t=>t.classList.toggle('active',t.textContent===D.dining_areas.find(a=>a.id===id)?.name));FD.dining._renderFloor();},
  _renderFloor(){
    const tables=D.dining_tables.filter(t=>t.dining_area_id===S.currentDiningArea);
    document.getElementById('diningFloorPlan').innerHTML=tables.map(t=>{
      const color={free:'var(--teal)',occupied:'var(--gold)',reserved:'var(--purple)'}[t.status]||'var(--text3)';
      return `<div class="dtile ${t.status}" onclick="FD.dining._tableClick('${t.id}')"><div class="dt-num">${t.table_number}</div><div class="dt-cap">Seats ${t.capacity}</div><div class="dt-status" style="color:${color};background:${color}22;border:1px solid ${color}44">${t.status}</div></div>`;
    }).join('');
  },
  _tableClick(id){const t=D.dining_tables.find(t=>t.id===id);if(t.status==='free'){document.getElementById('tr_tableId').value=id;FD.modals.tableReservation();}else toast(`Table ${t.table_number} is ${t.status}`,'info');},
  reserveTable(){
    const guest=document.getElementById('tr_guest')?.value?.trim(),date=document.getElementById('tr_date')?.value,time=document.getElementById('tr_time')?.value,tableId=document.getElementById('tr_tableId')?.value;
    if(!guest||!date||!time){toast('Guest, date and time required','warning');return;}
    if(tableId){const t=D.dining_tables.find(t=>t.id===tableId);if(t)t.status='reserved';}
    UI.closeModal('tableResModal'); FD.dining._renderFloor();
    toast(`Table reserved for ${guest} at ${time}`,'success','🍽');
  },
};

// ── MAINTENANCE ──────────────────────────────────────────────
FD.maintenance = {
  render(){
    const f=document.getElementById('maintFilter')?.value||'all';
    let list=D.maintenance; if(f!=='all')list=list.filter(m=>m.status===f);
    const pColors={critical:'mpd-critical',high:'mpd-high',normal:'mpd-normal',low:'mpd-low'};
    const sColor={open:'var(--crimson)',in_progress:'var(--amber)',resolved:'var(--teal)',closed:'var(--text3)'};
    document.getElementById('maintList').innerHTML=list.map(m=>{
      const room=DH.getRoom(m.room_id);
      return `<div class="maint-card"><div class="maint-priority-dot ${pColors[m.priority]}"></div><div class="maint-info"><div class="maint-title">Room ${room?.room_number||'—'} — ${m.issue_type.replace(/_/g,' ')}</div><div class="maint-meta">${m.description}</div><div class="maint-meta" style="margin-top:3px">Reported by ${m.reported_by} · ${new Date(m.created_at).toLocaleString('en-UG',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div></div><div class="maint-status" style="background:${sColor[m.status]}22;color:${sColor[m.status]};border:1px solid ${sColor[m.status]}44">${m.status.replace(/_/g,' ')}</div></div>`;
    }).join('')||UI.emptyState('🔧','No maintenance issues');
  },
  submit(){
    const roomId=document.getElementById('maint_room')?.value,type=document.getElementById('maint_type')?.value,priority=document.getElementById('maint_priority')?.value,desc=document.getElementById('maint_desc')?.value?.trim();
    if(!desc){toast('Description required','warning');return;}
    D.maintenance.unshift({id:'m'+Date.now(),room_id:roomId,issue_type:type,description:desc,priority,status:'open',reported_by:`${S.claims.first_name} ${S.claims.last_name}`,created_at:new Date().toISOString()});
    if(['critical','high'].includes(priority)){const room=DH.getRoom(roomId);if(room&&room.status!=='occupied')room.status='maintenance';}
    UI.closeModal('maintModal'); FD.maintenance.render(); FD.data.refresh();
    toast('Maintenance report submitted','success','🔧');
  },
};

// ── MODALS ───────────────────────────────────────────────────
FD.modals = {
  newReservation(){
    const sel=document.getElementById('nr_roomType');
    if(sel){sel.innerHTML='<option value="">Select…</option>'+D.room_types.map(t=>`<option value="${t.id}">${t.name} — from ${fmt(t.base_rate)}/night</option>`).join('');}
    document.getElementById('nr_checkin').value=today();
    document.getElementById('nr_checkout').value=addDays(today(),1);
    ['nr_guestName','nr_email','nr_phone','nr_nationality','nr_idNumber'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.getElementById('resCostSummary').style.display='none';
    UI.openModal('newResModal');
  },
  newConference(preRoomId){
    const sel=document.getElementById('cf_room');
    if(sel)sel.innerHTML='<option value="">Select…</option>'+D.conference_rooms.map(c=>`<option value="${c.id}" ${c.id===preRoomId?'selected':''}>${c.name} (${c.capacity} pax)</option>`).join('');
    document.getElementById('cf_date').value=today();
    document.getElementById('confAvailStatus').className='conf-avail-status';
    document.getElementById('confCostSummary').style.display='none';
    UI.openModal('confModal');
  },
  guestProfile(guestId){
    const g=DH.getGuest(guestId);
    const stays=D.reservations.filter(r=>r.guest_id===guestId);
    const current=stays.find(r=>['checked_in','checkout_pending'].includes(r.status));
    document.getElementById('guestModalTitle').textContent=`${g.first_name} ${g.last_name}`;
    document.getElementById('guestModalBody').innerHTML=`
      <div style="display:grid;grid-template-columns:180px 1fr;gap:20px">
        <div style="text-align:center">
          ${UI.guestAvatar(g,72).replace('class="g-avatar"','class="g-avatar" style="width:72px;height:72px;font-size:26px;margin:0 auto 12px"')}
          ${UI.vipBadge(g.vip_level)}
          <div style="font-size:28px;font-family:var(--font-d);font-weight:700;margin-top:10px">${g.total_stays}</div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase">Total Stays</div>
        </div>
        <div style="font-size:12px;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Email</span><span>${g.email||'—'}</span></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Phone</span><span>${g.phone||'—'}</span></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Nationality</span><span>${g.nationality||'—'}</span></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">ID</span><span>${(g.id_type||'').replace(/_/g,' ')}: ${g.id_number||'—'}</span></div>
          ${current?`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Current Stay</span><span style="color:var(--teal)">Room ${DH.getRoom(current.room_id)?.room_number} · Out ${fmtDate(current.check_out_date)}</span></div>`:''}
          ${g.preferences?.length?`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Preferences</span><span>${g.preferences.join(', ')}</span></div>`:''}
          ${g.notes?`<div style="margin-top:6px;padding:8px;background:var(--amber-pale);border:1px solid var(--amber-d);border-radius:var(--r-sm);color:var(--amber);font-size:11px">⚠ ${g.notes}</div>`:''}
        </div>
      </div>
      <div style="margin-top:16px">
        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Stay History</div>
        ${stays.slice(0,5).map(r=>{const room=r.room_id?DH.getRoom(r.room_id):null;return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="font-family:var(--font-m);font-size:10px;color:var(--gold)">${r.reservation_number}</span><span style="flex:1">${fmtDate(r.check_in_date)} → ${fmtDate(r.check_out_date)}</span>${room?`<span style="color:var(--text3)">Room ${room.room_number}</span>`:''}<span class="g-badge ${UI.badgeClass(r.status)}">${r.status.replace(/_/g,' ')}</span></div>`;}).join('')}
      </div>`;
    document.getElementById('guestModalFoot').innerHTML=`
      <button class="vbtn vbtn-ghost" onclick="UI.closeModal('guestModal')">Close</button>
      ${current?`<button class="vbtn vbtn-secondary" onclick="FD.folio.open('${DH.getFolio(current.id)?.id||''}');UI.closeModal('guestModal')">View Folio</button>`:''}
      ${current?`<button class="vbtn vbtn-primary" onclick="FD.checkout.open('${current.id}');UI.closeModal('guestModal')">Check-out</button>`:''}`;
    UI.openModal('guestModal');
  },
  newGuest(){
    document.getElementById('guestModalTitle').textContent='New Guest Profile';
    document.getElementById('guestModalBody').innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="fg"><label>First Name *</label><input type="text" class="finput" id="ng_fn"></div>
        <div class="fg"><label>Last Name *</label><input type="text" class="finput" id="ng_ln"></div>
        <div class="fg"><label>Email</label><input type="email" class="finput" id="ng_em"></div>
        <div class="fg"><label>Phone</label><input type="text" class="finput" id="ng_ph"></div>
        <div class="fg"><label>Nationality</label><input type="text" class="finput" id="ng_nat"></div>
        <div class="fg"><label>ID Type</label><select class="finput" id="ng_idt"><option value="passport">Passport</option><option value="national_id">National ID</option></select></div>
        <div class="fg"><label>ID Number</label><input type="text" class="finput" id="ng_idn"></div>
        <div class="fg"><label>Notes</label><input type="text" class="finput" id="ng_notes"></div>
      </div>`;
    document.getElementById('guestModalFoot').innerHTML=`
      <button class="vbtn vbtn-ghost" onclick="UI.closeModal('guestModal')">Cancel</button>
      <button class="vbtn vbtn-primary" onclick="FD.modals._saveGuest()">Save Guest</button>`;
    UI.openModal('guestModal');
  },
  _saveGuest(){
    const fn=document.getElementById('ng_fn')?.value?.trim(), ln=document.getElementById('ng_ln')?.value?.trim();
    if(!fn||!ln){toast('Name required','warning');return;}
    D.guests.unshift({id:'g'+Date.now(),first_name:fn,last_name:ln,email:document.getElementById('ng_em')?.value?.trim(),phone:document.getElementById('ng_ph')?.value?.trim(),nationality:document.getElementById('ng_nat')?.value?.trim(),id_type:document.getElementById('ng_idt')?.value,id_number:document.getElementById('ng_idn')?.value?.trim(),notes:document.getElementById('ng_notes')?.value?.trim(),vip_level:0,total_stays:0,preferences:[]});
    UI.closeModal('guestModal'); FD.guests.render();
    toast(`${fn} ${ln} created`,'success','🪪');
  },
  maintenanceReport(roomId){
    const sel=document.getElementById('maint_room');
    if(sel)sel.innerHTML=D.rooms.map(r=>`<option value="${r.id}" ${r.id===roomId?'selected':''}>Room ${r.room_number} — ${DH.getRoomType(r.room_type_id)?.name} (${r.status.replace(/_/g,' ')})</option>`).join('');
    document.getElementById('maint_desc').value='';
    UI.openModal('maintModal');
  },
  tableReservation(){document.getElementById('tr_date').value=today();UI.openModal('tableResModal');},
  openNotifications(){
    document.getElementById('notifBody').innerHTML=D.notifications.map(n=>`<div class="notif-item ${n.unread?'unread':''}" onclick="FD.modals._dismissNotif('${n.id}')"><span class="ni-ico">${n.icon}</span><div class="ni-body"><div class="ni-title">${n.title}</div><div class="ni-sub">${n.body}</div></div><div class="ni-time">${n.time}</div></div>`).join('');
    UI.openModal('notifModal');
  },
  _dismissNotif(id){const n=D.notifications.find(n=>n.id===id);if(n)n.unread=false;FD.ui.renderNotifBadge();FD.modals.openNotifications();},
};

// ── NEW RESERVATION ──────────────────────────────────────────
FD.newRes = {
  onRoomTypeChange(){
    const typeId=document.getElementById('nr_roomType')?.value, plans=D.rate_plans.filter(p=>p.room_type_id===typeId), sel=document.getElementById('nr_ratePlan');
    if(sel)sel.innerHTML=plans.map(p=>`<option value="${p.id}">${p.name} — ${fmt(p.rate)}/night${p.includes_breakfast?' (incl. breakfast)':''}</option>`).join('');
    FD.newRes.calcTotal();
  },
  calcTotal(){
    const ci=document.getElementById('nr_checkin')?.value, co=document.getElementById('nr_checkout')?.value, pid=document.getElementById('nr_ratePlan')?.value, el=document.getElementById('resCostSummary');
    if(!ci||!co||!pid||!el) return;
    const plan=D.rate_plans.find(p=>p.id===pid); if(!plan) return;
    const nights=nightsBetween(ci,co); if(nights<=0) return;
    const sub=plan.rate*nights, tax=Math.round(sub*D.tax_rate);
    el.style.display='block';
    el.innerHTML=`<div class="rcs-row"><span class="rcs-label">${plan.name} × ${nights} night${nights!==1?'s':''}</span><span>${fmt(sub)}</span></div><div class="rcs-row"><span class="rcs-label">VAT (18%)</span><span>${fmt(tax)}</span></div><div class="rcs-row"><span>Total</span><span>${fmt(sub+tax)}</span></div>`;
  },
  save(status){
    const guestName=document.getElementById('nr_guestName')?.value?.trim(), typeId=document.getElementById('nr_roomType')?.value, planId=document.getElementById('nr_ratePlan')?.value, ci=document.getElementById('nr_checkin')?.value, co=document.getElementById('nr_checkout')?.value;
    if(!guestName||!typeId||!planId||!ci||!co){toast('Fill all required fields','warning');return null;}
    const nameParts=guestName.split(' ');
    let g=D.guests.find(g=>`${g.first_name} ${g.last_name}`.toLowerCase()===guestName.toLowerCase());
    if(!g){g={id:'g'+Date.now(),first_name:nameParts[0],last_name:nameParts.slice(1).join(' ')||'Guest',email:document.getElementById('nr_email')?.value?.trim(),phone:document.getElementById('nr_phone')?.value?.trim(),nationality:document.getElementById('nr_nationality')?.value?.trim(),id_type:document.getElementById('nr_idType')?.value,id_number:document.getElementById('nr_idNumber')?.value?.trim(),vip_level:0,total_stays:0,preferences:[]};D.guests.unshift(g);}
    S.resSeq++;
    const plan=D.rate_plans.find(p=>p.id===planId);
    const res={id:'res'+Date.now(),reservation_number:`RES-${new Date().getFullYear()}-${String(S.resSeq).padStart(5,'0')}`,guest_id:g.id,room_id:null,room_type_id:typeId,rate_plan_id:planId,source:document.getElementById('nr_source')?.value||'walk_in',status,check_in_date:ci,check_out_date:co,num_adults:parseInt(document.getElementById('nr_adults')?.value)||1,num_children:parseInt(document.getElementById('nr_children')?.value)||0,rate_per_night:plan?.rate||0,meal_plan:document.getElementById('nr_mealPlan')?.value||'room_only',special_requests:document.getElementById('nr_requests')?.value?.trim(),deposit_paid:0,num_nights:nightsBetween(ci,co),created_at:new Date().toISOString()};
    D.reservations.unshift(res); UI.closeModal('newResModal'); FD.data.refresh(); FD.reservations.render();
    toast(`${res.reservation_number} created`,'success','📅');
    return res;
  },
};

// ── GLOBAL SEARCH ────────────────────────────────────────────
FD.search = {
  query(q){
    const ol=document.getElementById('searchOverlay'), rs=document.getElementById('searchResults');
    if(!q.trim()){ol.style.display='none';return;} ol.style.display='block';
    const ql=q.toLowerCase();
    const guests=D.guests.filter(g=>`${g.first_name} ${g.last_name} ${g.email} ${g.phone}`.toLowerCase().includes(ql));
    const rooms=D.rooms.filter(r=>r.room_number.toLowerCase().includes(ql));
    const res=D.reservations.filter(r=>r.reservation_number.toLowerCase().includes(ql));
    let html='';
    if(guests.length){html+=`<div class="sr-section-lbl">Guests</div>`;html+=guests.slice(0,4).map(g=>`<div class="sr-item" onclick="FD.modals.guestProfile('${g.id}');FD.search.close()"><span class="sr-item-ico">🪪</span><div><div class="sr-item-main">${g.first_name} ${g.last_name}</div><div class="sr-item-sub">${g.email||''} · ${g.phone||''}</div></div><span class="sr-item-action">View →</span></div>`).join('');}
    if(rooms.length){html+=`<div class="sr-section-lbl">Rooms</div>`;html+=rooms.slice(0,4).map(r=>{const rt=DH.getRoomType(r.room_type_id);return `<div class="sr-item" onclick="FD.rooms.openDetail('${r.id}');FD.search.close()"><span class="sr-item-ico">🛏</span><div><div class="sr-item-main">Room ${r.room_number} — ${rt?.name}</div><div class="sr-item-sub">${r.status.replace(/_/g,' ')}</div></div><span class="sr-item-action">Open →</span></div>`;}).join('');}
    if(res.length){html+=`<div class="sr-section-lbl">Reservations</div>`;html+=res.slice(0,4).map(r=>{const g=DH.getGuest(r.guest_id);return `<div class="sr-item" onclick="FD.search._openRes('${r.id}');FD.search.close()"><span class="sr-item-ico">📅</span><div><div class="sr-item-main">${r.reservation_number}</div><div class="sr-item-sub">${g?.first_name} ${g?.last_name} · ${fmtDate(r.check_in_date)}→${fmtDate(r.check_out_date)}</div></div><span class="sr-item-action">${r.status.replace(/_/g,' ')}</span></div>`;}).join('');}
    rs.innerHTML=html||`<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">No results for "${q}"</div>`;
  },
  close(){document.getElementById('searchOverlay').style.display='none';document.getElementById('globalSearch').value='';},
  _openRes(resId){const r=D.reservations.find(r=>r.id===resId);if(['confirmed','checkin_pending'].includes(r?.status))FD.checkin.open(resId);else if(['checked_in','checkout_pending'].includes(r?.status))FD.checkout.open(resId);},
};

// ── REALTIME ─────────────────────────────────────────────────
FD.realtime = {
  subscribe(){
    const sb=getSB(); if(!sb||DEMO_MODE) return;
    sb.channel('frontdesk')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'rooms',filter:`tenant_id=eq.${S.claims.tenant_id}`},(p)=>{
        const idx=D.rooms.findIndex(r=>r.id===p.new.id); if(idx!==-1)D.rooms[idx]={...D.rooms[idx],...p.new};
        if(S.currentView==='rooms')FD.rooms.render(); if(S.currentView==='dashboard')FD.dashboard.render(); FD.data.refresh();
      })
      .on('postgres_changes',{event:'*',schema:'public',table:'reservations',filter:`tenant_id=eq.${S.claims.tenant_id}`},()=>{
        if(S.currentView==='arrivals')FD.arrivals.render(); if(S.currentView==='departures')FD.departures.render();
        if(S.currentView==='inhouse')FD.inhouse.render(); FD.data.refresh();
      }).subscribe();
  },
};

// ── DB ────────────────────────────────────────────────────────
FD.db = {
  async checkin(res, folio) {
    if (DEMO_MODE) return;
    try {
      const sb = getSB();
      const { error: resErr } = await sb.from('reservations')
        .update({ status:'checked_in', room_id:res.room_id, actual_check_in:res.actual_check_in, checked_in_by:S.claims.staff_id })
        .eq('id', res.id);
      if (resErr) throw resErr;

      const { error: roomErr } = await sb.from('rooms')
        .update({ status:'occupied', current_reservation_id:res.id, updated_at:new Date().toISOString() })
        .eq('id', res.room_id);
      if (roomErr) throw roomErr;

      const { data: folioData, error: folioErr } = await sb.from('guest_folios')
        .insert({ tenant_id:S.claims.tenant_id, property_id:S.claims.property_id, reservation_id:res.id, guest_id:res.guest_id,
          folio_number:folio.folio_number, status:'active', total_charges:folio.total_charges,
          total_payments:folio.total_payments, balance:folio.balance, opened_by:S.claims.staff_id })
        .select('id').single();
      if (folioErr) throw folioErr;

      if (folio.charges?.length && folioData?.id) {
        const { error: chErr } = await sb.from('folio_charges').insert(
          folio.charges.map(c => ({ tenant_id:S.claims.tenant_id, folio_id:folioData.id,
            charge_date:c.charge_date, charge_type:c.charge_type, description:c.description,
            amount:c.amount, tax_amount:0, posted_by:S.claims.staff_id, is_reversal:c.amount<0 }))
        );
        if (chErr) console.error('[QS] folio_charges insert:', chErr);
      }
    } catch(e) { console.error('[QS] DB checkin error:', e); }
  },

  async checkout(res, folio) {
    if (DEMO_MODE) return;
    try {
      const sb = getSB();
      const { error: resErr } = await sb.from('reservations')
        .update({ status:'checked_out', actual_check_out:res.actual_check_out, checked_out_by:S.claims.staff_id })
        .eq('id', res.id);
      if (resErr) throw resErr;

      const { error: roomErr } = await sb.from('rooms')
        .update({ status:'dirty', current_reservation_id:null, current_folio_id:null, updated_at:new Date().toISOString() })
        .eq('id', res.room_id);
      if (roomErr) throw roomErr;

      const { error: folioErr } = await sb.from('guest_folios')
        .update({ status:'settled', balance:0, total_payments:folio.total_payments,
          settled_by:S.claims.staff_id, settled_at:new Date().toISOString(), closed_at:new Date().toISOString() })
        .eq('id', folio.id);
      if (folioErr) throw folioErr;

      const settlement = folio.charges?.find(c => c.charge_type==='payment' && c.amount<0 && c.description?.startsWith('Settlement'));
      if (settlement) {
        await sb.from('folio_charges').insert({ tenant_id:S.claims.tenant_id, folio_id:folio.id,
          charge_date:settlement.charge_date, charge_type:'payment', description:settlement.description,
          amount:settlement.amount, tax_amount:0, posted_by:S.claims.staff_id, is_reversal:false });
      }
    } catch(e) { console.error('[QS] DB checkout error:', e); }
  },
};

// ── AUTH ──────────────────────────────────────────────────────
FD.auth = { logout(){ if(typeof QS!=='undefined')QS.logout(); else window.location.href='index.html'; } };

// ── EVENT LISTENERS ───────────────────────────────────────────
document.addEventListener('click',e=>{
  if(!e.target.closest('.global-search')&&!e.target.closest('.search-results-panel'))FD.search.close();
  if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){UI.closeAll();FD.search.close();}
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();document.getElementById('globalSearch')?.focus();}
});

