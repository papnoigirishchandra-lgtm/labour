import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings"> & {
  workers: { name: string; skill: string; photo: string | null } | null;
  source?: "supabase" | "demo";
};

const STORAGE_KEY = "krishiseva-demo-bookings";

const isBrowser = typeof window !== "undefined";

const readBookings = (): Booking[] => {
  if (!isBrowser) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBookings = (bookings: Booking[]) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

export const getDemoBookingsForUser = (userId: string) =>
  readBookings().filter((booking) => booking.user_id === userId);

export const getDemoBookingsForWorker = (workerId: string) =>
  readBookings().filter((booking) => booking.worker_id === workerId);

export const addDemoBooking = (booking: Booking) => {
  const current = readBookings();
  writeBookings([booking, ...current]);
};

export const updateDemoBookingStatus = (
  bookingId: string,
  status: Booking["status"],
) => {
  const current = readBookings();
  const next = current.map((booking) =>
    booking.id === bookingId ? { ...booking, status, updated_at: new Date().toISOString() } : booking,
  );
  writeBookings(next);
};

export const removeDemoBookingsForWorker = (workerId: string) => {
  const current = readBookings();
  const next = current.filter((booking) => booking.worker_id !== workerId);
  writeBookings(next);
};
