export const ROLES = ["ADMIN", "STUDENT", "TEACHER"] as const;
export type Role = (typeof ROLES)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "RESCHEDULED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_PROVIDERS = ["STRIPE", "PAYPAL", "MERCADOPAGO"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  timezone: string;
}

export interface AvailableSlot {
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
}

/** Socket.IO event payloads shared between server and client */
export interface ChatMessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  sentAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
}
