import type { PostgrestError } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

type Worker = Tables<"workers">;

type DemoWorker = Worker & {
  source: "demo";
};

type DemoWorkerInput = {
  userId: string;
  name: string;
  phone: string;
  skill: string;
  experience: string;
  price: number;
  location: string;
  bio: string;
  availableSlots: string[];
};

const STORAGE_KEY = "krishiseva-demo-workers";
const isBrowser = typeof window !== "undefined";

const readWorkers = (): DemoWorker[] => {
  if (!isBrowser) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as DemoWorker[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeWorkers = (workers: DemoWorker[]) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workers));
};

export const isMissingWorkersTableError = (error: PostgrestError | null | undefined) => {
  if (!error) return false;

  const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return (
    error.code === "42P01" ||
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    message.includes("relation \"public.workers\" does not exist") ||
    message.includes("relation public.workers does not exist")
  );
};

export const getDemoWorkerForUser = (userId: string) =>
  readWorkers().find((worker) => worker.user_id === userId) ?? null;

export const getDemoWorkerById = (workerId: string) =>
  readWorkers().find((worker) => worker.id === workerId) ?? null;

export const getAllDemoWorkers = () => readWorkers();

export const removeDemoWorkerForUser = (userId: string) => {
  const current = readWorkers();
  const worker = current.find((item) => item.user_id === userId) ?? null;
  const next = current.filter((item) => item.user_id !== userId);
  writeWorkers(next);
  return worker;
};

export const upsertDemoWorker = (input: DemoWorkerInput) => {
  const current = readWorkers();
  const existingIndex = current.findIndex((worker) => worker.user_id === input.userId);
  const now = new Date().toISOString();

  const worker: DemoWorker = {
    id: `demo-worker-${input.userId}`,
    user_id: input.userId,
    name: input.name,
    phone: input.phone,
    photo: null,
    skill: input.skill,
    experience: input.experience,
    price: input.price,
    rating: 0,
    reviews_count: 0,
    location: input.location,
    latitude: null,
    longitude: null,
    available_slots: input.availableSlots,
    bio: input.bio,
    is_available: true,
    is_verified: false,
    created_at: now,
    updated_at: now,
    source: "demo",
  };

  const nextWorkers = existingIndex >= 0 ? current.map((item, index) => (index === existingIndex ? worker : item)) : [worker, ...current];
  writeWorkers(nextWorkers);
  return worker;
};
