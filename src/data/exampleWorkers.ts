import type { Tables } from "@/integrations/supabase/types";
import { services as mockServices, workers as mockWorkers } from "./mockData";

type Worker = Tables<"workers">;
type Service = Tables<"services">;
type Review = Tables<"reviews">;

const seededAt = "2026-03-28T00:00:00.000Z";
const defaultAvailableSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

const workerMeta: Record<
  string,
  {
    bio: string;
    phone: string;
    latitude: number;
    longitude: number;
    location: string;
    isVerified: boolean;
  }
> = {
  "Rajesh Kumar": {
    bio: "Home wiring specialist for apartments and small offices. Fast with fault tracing, switchboard upgrades, and inverter setup.",
    phone: "+91 98765 10001",
    latitude: 19.1197,
    longitude: 72.8468,
    location: "Andheri East, Mumbai",
    isVerified: true,
  },
  "Suresh Patel": {
    bio: "Reliable plumber for leak repair, bathroom fittings, and kitchen pipeline work with a clean finish.",
    phone: "+91 98765 10002",
    latitude: 28.6139,
    longitude: 77.209,
    location: "Karol Bagh, Delhi",
    isVerified: true,
  },
  "Amit Singh": {
    bio: "Custom furniture and wood repair expert with strong experience in modular storage, doors, and polishing touch-ups.",
    phone: "+91 98765 10003",
    latitude: 12.9716,
    longitude: 77.5946,
    location: "Indiranagar, Bangalore",
    isVerified: true,
  },
  "Vikram Sharma": {
    bio: "Interior painter known for neat edging, quick prep work, and low-odor premium paint applications.",
    phone: "+91 98765 10004",
    latitude: 18.5204,
    longitude: 73.8567,
    location: "Kothrud, Pune",
    isVerified: false,
  },
  "Manoj Yadav": {
    bio: "Deep cleaning professional for homes, rental move-outs, and post-renovation cleanup jobs.",
    phone: "+91 98765 10005",
    latitude: 13.0827,
    longitude: 80.2707,
    location: "Anna Nagar, Chennai",
    isVerified: true,
  },
  "Deepak Verma": {
    bio: "Agricultural labourer experienced in harvesting, field preparation, irrigation support, and seasonal farm work.",
    phone: "+91 98765 10006",
    latitude: 17.385,
    longitude: 78.4867,
    location: "Madhapur, Hyderabad",
    isVerified: true,
  },
  "Rohit Gupta": {
    bio: "Budget-friendly electrician for fans, lighting, fittings, and emergency household electrical jobs.",
    phone: "+91 98765 10007",
    latitude: 22.5726,
    longitude: 88.3639,
    location: "Salt Lake, Kolkata",
    isVerified: false,
  },
  "Sandeep Joshi": {
    bio: "Senior plumber focused on concealed line work, motor connections, pressure issues, and bathroom remodel support.",
    phone: "+91 98765 10008",
    latitude: 23.0225,
    longitude: 72.5714,
    location: "Navrangpura, Ahmedabad",
    isVerified: true,
  },
  "Karan Malhotra": {
    bio: "Painter for accent walls, exterior refreshes, and waterproof coating touch-ups for residential projects.",
    phone: "+91 98765 10009",
    latitude: 26.9124,
    longitude: 75.7873,
    location: "Malviya Nagar, Jaipur",
    isVerified: true,
  },
  "Imran Sheikh": {
    bio: "Carpenter skilled in wardrobe adjustments, bed repairs, window frames, and office woodwork fixes.",
    phone: "+91 98765 10010",
    latitude: 23.2599,
    longitude: 77.4126,
    location: "MP Nagar, Bhopal",
    isVerified: false,
  },
  "Naveen Kumar": {
    bio: "Cleaner for sofas, kitchens, bathrooms, and recurring home maintenance visits with eco-safe supplies.",
    phone: "+91 98765 10011",
    latitude: 26.8467,
    longitude: 80.9462,
    location: "Gomti Nagar, Lucknow",
    isVerified: true,
  },
  "Prakash Jena": {
    bio: "Agricultural labourer available for crop care, planting support, loading, sorting, and general farm assistance.",
    phone: "+91 98765 10012",
    latitude: 20.2961,
    longitude: 85.8245,
    location: "Patia, Bhubaneswar",
    isVerified: true,
  },
};

export const exampleServices: Service[] = mockServices.map((service, index) => ({
  id: `example-service-${index + 1}`,
  title: service.title,
  description: service.description,
  icon: null,
  created_at: seededAt,
}));

const expandedMockWorkers = [
  ...mockWorkers,
  {
    id: 9,
    name: "Karan Malhotra",
    photo: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 98,
    experience: "7 yrs",
    price: 420,
    skill: "Painter",
    location: "Jaipur",
  },
  {
    id: 10,
    name: "Imran Sheikh",
    photo: "https://images.unsplash.com/photo-1503235930437-8c6293ba41f5?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 76,
    experience: "9 yrs",
    price: 520,
    skill: "Carpenter",
    location: "Bhopal",
  },
  {
    id: 11,
    name: "Naveen Kumar",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 58,
    experience: "5 yrs",
    price: 280,
    skill: "Cleaner",
    location: "Lucknow",
  },
  {
    id: 12,
    name: "Prakash Jena",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 132,
    experience: "11 yrs",
    price: 560,
    skill: "Agricultural Labour",
    location: "Bhubaneswar",
  },
];

export const exampleWorkers: Worker[] = expandedMockWorkers.map((worker) => {
  const meta = workerMeta[worker.name] ?? {
    bio: `Reliable ${worker.skill.toLowerCase()} available for local jobs with flexible scheduling and practical on-site experience.`,
    phone: "+91 90000 00000",
    latitude: 20.5937,
    longitude: 78.9629,
    location: worker.location,
    isVerified: false,
  };

  return {
    id: `example-worker-${worker.id}`,
    user_id: `example-user-${worker.id}`,
    name: worker.name,
    phone: meta.phone,
    photo: worker.photo,
    skill: worker.skill,
    experience: worker.experience,
    price: worker.price,
    rating: worker.rating,
    reviews_count: worker.reviews,
    location: meta.location,
    latitude: meta.latitude,
    longitude: meta.longitude,
    available_slots: defaultAvailableSlots,
    bio: meta.bio,
    is_verified: meta.isVerified,
    is_available: true,
    created_at: seededAt,
    updated_at: seededAt,
  };
});

const exampleReviews: Record<string, Review[]> = {
  "example-worker-1": [
    {
      id: "example-review-1",
      booking_id: "example-booking-1",
      user_id: "example-customer-1",
      worker_id: "example-worker-1",
      rating: 5,
      comment: "Quick wiring fix and very tidy work. Reached within an hour.",
      created_at: seededAt,
    },
    {
      id: "example-review-2",
      booking_id: "example-booking-2",
      user_id: "example-customer-2",
      worker_id: "example-worker-1",
      rating: 4,
      comment: "Installed new lights and explained the load issue clearly.",
      created_at: seededAt,
    },
  ],
  "example-worker-2": [
    {
      id: "example-review-3",
      booking_id: "example-booking-3",
      user_id: "example-customer-3",
      worker_id: "example-worker-2",
      rating: 5,
      comment: "Solved a stubborn kitchen leak and replaced the fittings neatly.",
      created_at: seededAt,
    },
  ],
  "example-worker-3": [
    {
      id: "example-review-4",
      booking_id: "example-booking-4",
      user_id: "example-customer-4",
      worker_id: "example-worker-3",
      rating: 5,
      comment: "Wardrobe repair was solid and the finish matched the original wood.",
      created_at: seededAt,
    },
  ],
};

export const isExampleWorkerId = (workerId: string) => workerId.startsWith("example-worker-");

export const findExampleWorkerById = (workerId: string) =>
  exampleWorkers.find((worker) => worker.id === workerId) ?? null;

export const getExampleReviews = (workerId: string) => exampleReviews[workerId] ?? [];
