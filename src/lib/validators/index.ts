import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is too short").max(60),
    lastName: z.string().min(2, "Last name is too short").max(60),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms & Conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your full name").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().min(3, "Enter a subject").max(160),
  message: z.string().min(10, "Tell us a bit more (min. 10 characters)").max(4000),
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")), // honeypot
});

export const teacherApplicationSchema = z.object({
  fullName: z.string().min(3, "Enter your full name").max(120),
  email: z.string().email("Enter a valid email"),
  specialization: z.string().min(2, "Enter your specialization").max(160),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  bio: z.string().min(30, "Tell us about your background (min. 30 characters)").max(4000),
});

export const bookingSchema = z.object({
  teacherId: z.string().min(1),
  courseId: z.string().min(1),
  startsAt: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

export const availabilitySlotSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"),
});

export const blockedTimeSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().max(200).optional(),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const checkoutSchema = z.object({
  provider: z.enum(["STRIPE", "PAYPAL", "MERCADOPAGO"]),
  bookingId: z.string().optional(),
  packageId: z.string().optional(),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1).max(5000),
});

export const teacherProfileSchema = z.object({
  title: z.string().max(160).optional(),
  specialization: z.string().max(160).optional(),
  bio: z.string().max(6000).optional(),
  languages: z.string().max(300).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  softwareTags: z.array(z.string().min(1).max(40)).max(30).optional(),
});
