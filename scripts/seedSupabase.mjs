import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const seededAt = '2026-03-28T00:00:00.000Z';

// Try to load .env from project root if present
function loadDotEnv() {
  try {
    const envPath = new URL('../.env', import.meta.url);
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (!(key in process.env)) process.env[key] = value;
    });
  } catch (e) {
    // ignore if no .env found
  }
}

loadDotEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or env.');
  process.exit(1);
}

if (String(SUPABASE_KEY).startsWith('sb_publishable_')) {
  console.error('The seed script needs a Supabase service role key, not a publishable key. Set SUPABASE_SERVICE_ROLE_KEY and try again.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@krishiseva.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Krishiseva Admin';
const defaultAvailableSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

async function ensureAdminUser() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    throw error;
  }

  const existingAdmin = data.users.find((user) => user.email === ADMIN_EMAIL);
  if (existingAdmin) {
    return existingAdmin.id;
  }

  const created = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_NAME },
  });

  if (created.error) {
    throw created.error;
  }

  return created.data.user.id;
}

const services = [
  { id: 'example-service-1', title: 'Electrician', description: 'Wiring, repairs, installations', created_at: seededAt },
  { id: 'example-service-2', title: 'Plumber', description: 'Pipe fitting, leak repairs', created_at: seededAt },
  { id: 'example-service-3', title: 'Painter', description: 'Interior & exterior painting', created_at: seededAt },
  { id: 'example-service-4', title: 'Carpenter', description: 'Furniture, woodwork, repairs', created_at: seededAt },
  { id: 'example-service-5', title: 'Cleaner', description: 'Deep cleaning, sanitization', created_at: seededAt },
  { id: 'example-service-6', title: 'Agricultural Labour', description: 'Farm support, harvesting, planting, and field work', created_at: seededAt },
];

const workers = [
  {
    id: 'example-worker-1',
    user_id: 'example-user-1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 10001',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
    skill: 'Electrician',
    experience: '8 yrs',
    price: 450,
    rating: 4.8,
    reviews_count: 124,
    location: 'Andheri East, Mumbai',
    latitude: 19.1197,
    longitude: 72.8468,
    bio: 'Home wiring specialist for apartments and small offices. Fast with fault tracing, switchboard upgrades, and inverter setup.',
    is_verified: true,
    is_available: true,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 'example-worker-2',
    user_id: 'example-user-2',
    name: 'Suresh Patel',
    phone: '+91 98765 10002',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    skill: 'Plumber',
    experience: '5 yrs',
    price: 400,
    rating: 4.6,
    reviews_count: 89,
    location: 'Karol Bagh, Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    bio: 'Reliable plumber for leak repair, bathroom fittings, and kitchen pipeline work with a clean finish.',
    is_verified: true,
    is_available: true,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 'example-worker-3',
    user_id: 'example-user-3',
    name: 'Amit Singh',
    phone: '+91 98765 10003',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
    skill: 'Carpenter',
    experience: '12 yrs',
    price: 500,
    rating: 4.9,
    reviews_count: 203,
    location: 'Indiranagar, Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    bio: 'Custom furniture and wood repair expert with strong experience in modular storage, doors, and polishing touch-ups.',
    is_verified: true,
    is_available: true,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 'example-worker-4',
    user_id: 'example-user-4',
    name: 'Vikram Sharma',
    phone: '+91 98765 10004',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
    skill: 'Painter',
    experience: '6 yrs',
    price: 350,
    rating: 4.7,
    reviews_count: 156,
    location: 'Kothrud, Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    bio: 'Interior painter known for neat edging, quick prep work, and low-odor premium paint applications.',
    is_verified: false,
    is_available: true,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 'example-worker-5',
    user_id: 'example-user-5',
    name: 'Manoj Yadav',
    phone: '+91 98765 10005',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop',
    skill: 'Cleaner',
    experience: '4 yrs',
    price: 300,
    rating: 4.5,
    reviews_count: 67,
    location: 'Anna Nagar, Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    bio: 'Deep cleaning professional for homes, rental move-outs, and post-renovation cleanup jobs.',
    is_verified: true,
    is_available: true,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 'example-worker-6',
    user_id: 'example-user-6',
    name: 'Deepak Verma',
    phone: '+91 98765 10006',
    photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=300&fit=crop',
    skill: 'Agricultural Labour',
    experience: '10 yrs',
    price: 450,
    rating: 4.8,
    reviews_count: 189,
    location: 'Madhapur, Hyderabad',
    latitude: 17.385,
    longitude: 78.4867,
    bio: 'Agricultural labourer experienced in harvesting, field preparation, irrigation support, and seasonal farm work.',
    is_verified: true,
    is_available: true,
    created_at: seededAt,
    updated_at: seededAt,
  },
].map((worker) => ({
  ...worker,
  available_slots: defaultAvailableSlots,
}));

const profiles = [
  ...workers.map((worker) => ({
    id: worker.id.replace('worker', 'profile'),
    user_id: worker.user_id,
    full_name: worker.name,
    phone: worker.phone,
    address: worker.location,
    avatar_url: worker.photo,
    latitude: worker.latitude,
    longitude: worker.longitude,
    created_at: seededAt,
    updated_at: seededAt,
  })),
  { id: 'example-profile-1', user_id: 'example-customer-1', full_name: 'Priya Mehta', phone: '+91 90000 10001', address: 'Mumbai', created_at: seededAt, updated_at: seededAt },
  { id: 'example-profile-2', user_id: 'example-customer-2', full_name: 'Arjun Reddy', phone: '+91 90000 10002', address: 'Bangalore', created_at: seededAt, updated_at: seededAt },
  { id: 'example-profile-3', user_id: 'example-customer-3', full_name: 'Neha Kapoor', phone: '+91 90000 10003', address: 'Delhi', created_at: seededAt, updated_at: seededAt },
  { id: 'example-profile-4', user_id: 'example-customer-4', full_name: 'Asha Iyer', phone: '+91 90000 10004', address: 'Pune', created_at: seededAt, updated_at: seededAt },
];

const userRoles = [
  ...workers.map((worker) => ({ id: worker.id.replace('worker', 'role'), user_id: worker.user_id, role: 'user', created_at: seededAt })),
  { id: 'example-role-1', user_id: 'example-customer-1', role: 'user', created_at: seededAt },
  { id: 'example-role-2', user_id: 'example-customer-2', role: 'user', created_at: seededAt },
  { id: 'example-role-3', user_id: 'example-customer-3', role: 'user', created_at: seededAt },
  { id: 'example-role-4', user_id: 'example-customer-4', role: 'user', created_at: seededAt },
];

const bookings = [
  {
    id: 'example-booking-1',
    user_id: 'example-customer-1',
    worker_id: 'example-worker-1',
    service: 'Electrician',
    booking_date: '2026-03-30',
    time_slot: '10:00 AM',
    address: 'Mumbai',
    description: 'Fix wiring and install two new lights.',
    status: 'completed',
    total_price: 500,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 'example-booking-2',
    user_id: 'example-customer-2',
    worker_id: 'example-worker-2',
    service: 'Plumber',
    booking_date: '2026-03-31',
    time_slot: '11:00 AM',
    address: 'Delhi',
    description: 'Repair a leaking sink and replace a valve.',
    status: 'in_progress',
    total_price: 450,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 'example-booking-3',
    user_id: 'example-customer-3',
    worker_id: 'example-worker-3',
    service: 'Carpenter',
    booking_date: '2026-04-01',
    time_slot: '2:00 PM',
    address: 'Bangalore',
    description: 'Wardrobe hinge repair and polishing.',
    status: 'confirmed',
    total_price: 550,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 'example-booking-4',
    user_id: 'example-customer-4',
    worker_id: 'example-worker-4',
    service: 'Painter',
    booking_date: '2026-04-02',
    time_slot: '3:00 PM',
    address: 'Pune',
    description: 'Accent wall repaint and cleanup.',
    status: 'pending',
    total_price: 400,
    created_at: seededAt,
    updated_at: seededAt,
  },
];

const reviews = [
  {
    id: 'example-review-1',
    booking_id: 'example-booking-1',
    user_id: 'example-customer-1',
    worker_id: 'example-worker-1',
    rating: 5,
    comment: 'Quick wiring fix and very tidy work. Reached within an hour.',
    created_at: seededAt,
  },
  {
    id: 'example-review-2',
    booking_id: 'example-booking-2',
    user_id: 'example-customer-2',
    worker_id: 'example-worker-2',
    rating: 4,
    comment: 'Solved the leak and explained everything clearly.',
    created_at: seededAt,
  },
  {
    id: 'example-review-3',
    booking_id: 'example-booking-3',
    user_id: 'example-customer-3',
    worker_id: 'example-worker-3',
    rating: 5,
    comment: 'Great finish on the woodwork and very punctual.',
    created_at: seededAt,
  },
  {
    id: 'example-review-4',
    booking_id: 'example-booking-4',
    user_id: 'example-customer-4',
    worker_id: 'example-worker-4',
    rating: 4,
    comment: 'Clean paint job and left the place neat.',
    created_at: seededAt,
  },
];

async function upsertTable(table, rows, label) {
  const { data, error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error(`${label} error:`, error);
  } else {
    console.log(`${label} upserted:`, (data && data.length) || data);
  }
}

async function seed() {
  try {
    console.log('Ensuring admin user exists...');
    const adminUserId = await ensureAdminUser();

    console.log('Upserting services...');
    await upsertTable('services', services, 'Services');

    console.log('Upserting workers...');
    await upsertTable('workers', workers, 'Workers');

    console.log('Upserting profiles...');
    await upsertTable('profiles', profiles, 'Profiles');

    console.log('Upserting roles...');
    await upsertTable('user_roles', userRoles, 'Roles');

    console.log('Upserting bookings...');
    await upsertTable('bookings', bookings, 'Bookings');

    console.log('Upserting reviews...');
    await upsertTable('reviews', reviews, 'Reviews');

    console.log('Upserting admin profile...');
    await upsertTable('profiles', [
      {
        id: 'admin-profile',
        user_id: adminUserId,
        full_name: ADMIN_NAME,
        phone: null,
        address: null,
        avatar_url: null,
        created_at: seededAt,
        updated_at: seededAt,
      },
    ], 'Admin profile');

    console.log('Upserting admin role...');
    await upsertTable('user_roles', [
      {
        id: 'admin-role',
        user_id: adminUserId,
        role: 'admin',
        created_at: seededAt,
      },
    ], 'Admin role');

    console.log('Done.');
  } catch (e) {
    console.error('Seeding failed:', e);
  }
}

seed().then(() => process.exit(0));
