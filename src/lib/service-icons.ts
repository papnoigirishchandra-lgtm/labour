import type { LucideIcon } from "lucide-react";
import {
  Blocks,
  Droplets,
  Hammer,
  Paintbrush,
  SprayCan,
  Wrench,
  Zap,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  AgriculturalLabour: Blocks,
  Blocks,
  Carpenter: Hammer,
  Cleaner: SprayCan,
  Droplets,
  Electrician: Zap,
  Hammer,
  Mason: Blocks,
  Paintbrush,
  Painter: Paintbrush,
  Plumber: Droplets,
  SprayCan,
  Wheat: Blocks,
  Wrench,
  Zap,
};

const normalizeKey = (value?: string | null) =>
  (value ?? "").replace(/[^a-z0-9]/gi, "");

export const getServiceIcon = (title?: string | null, icon?: string | null): LucideIcon =>
  iconMap[normalizeKey(icon)] ??
  iconMap[normalizeKey(title)] ??
  Wrench;
