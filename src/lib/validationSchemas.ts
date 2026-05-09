import { z } from "zod";
import { VALIDATION, RATING, PRICE_CONSTRAINTS } from "./constants";

// Common validation patterns
const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z
  .string()
  .min(VALIDATION.PASSWORD_MIN_SIMPLE, `Password must be at least ${VALIDATION.PASSWORD_MIN_SIMPLE} characters`)
  .min(VALIDATION.PASSWORD_MIN, `Password should be at least ${VALIDATION.PASSWORD_MIN} characters for better security`)
  .refine(
    (pwd) => /[A-Z]/.test(pwd),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (pwd) => /[0-9]/.test(pwd),
    "Password must contain at least one number"
  );

const phoneSchema = z
  .string()
  .regex(
    /^(\+91[-\s]?)?[0-9]{10}$/,
    `Invalid phone number. Use format: ${VALIDATION.PHONE_LENGTH} digits or +91XXXXXXXXXX`
  );

const addressSchema = z
  .string()
  .min(VALIDATION.ADDRESS_MIN, `Address must be at least ${VALIDATION.ADDRESS_MIN} characters`)
  .max(VALIDATION.ADDRESS_MAX, `Address must be less than ${VALIDATION.ADDRESS_MAX} characters`);

const fullNameSchema = z
  .string()
  .min(VALIDATION.NAME_MIN, `Name must be at least ${VALIDATION.NAME_MIN} characters`)
  .max(VALIDATION.NAME_MAX, `Name must be less than ${VALIDATION.NAME_MAX} characters`)
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  email: emailSchema,
  address: addressSchema.optional().or(z.literal("")),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Booking schema
export const bookingSchema = z.object({
  selectedDate: z.string()
    .refine((date) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= tomorrow;
    }, "Booking must be at least 1 day in advance"),
  selectedSlot: z.string().min(1, "Time slot is required"),
  address: addressSchema,
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Become Worker schema
export const becomeWorkerSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  skill: z.string().min(2, "Please select a skill"),
  price: z
    .number()
    .min(PRICE_CONSTRAINTS.MIN, `Price must be at least Rs. ${PRICE_CONSTRAINTS.MIN}`)
    .max(PRICE_CONSTRAINTS.MAX, `Price must be less than Rs. ${PRICE_CONSTRAINTS.MAX}`),
  experience: z
    .string()
    .min(1, "Experience is required")
    .max(VALIDATION.EXPERIENCE_MAX, `Experience description is too long`),
  location: addressSchema,
  bio: z
    .string()
    .max(VALIDATION.BIO_MAX, `Bio must be less than ${VALIDATION.BIO_MAX} characters`)
    .optional()
    .or(z.literal("")),
  availableSlots: z
    .string()
    .refine(
      (slots) => {
        const timeSlotRegex = /^\d{1,2}:\d{2}\s?(AM|PM)$/i;
        return slots
          .split(",")
          .every((slot) => timeSlotRegex.test(slot.trim()));
      },
      "Slots must be in format: 9:00 AM, 10:00 AM, etc. (comma-separated)"
    ),
  phone: phoneSchema.optional().or(z.literal("")),
});

export type BecomeWorkerFormData = z.infer<typeof becomeWorkerSchema>;

// Review schema
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(RATING.MIN, `Rating must be at least ${RATING.MIN}`)
    .max(RATING.MAX, `Rating must be between ${RATING.MIN} and ${RATING.MAX}`),
  comment: z
    .string()
    .min(VALIDATION.REVIEW_MIN, `Review must be at least ${VALIDATION.REVIEW_MIN} characters`)
    .max(VALIDATION.REVIEW_MAX, `Review must be less than ${VALIDATION.REVIEW_MAX} characters`),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string;
  isStrong: boolean;
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push("Use at least 8 characters");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Add numbers");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Add special characters");

  return {
    score,
    feedback: feedback.length > 0 ? feedback.join(", ") : "Strong password",
    isStrong: score >= 4,
  };
};
