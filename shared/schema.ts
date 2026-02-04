import { z } from "zod";

export const roleOptions = ["Student", "Parent", "Visitor", "Staff", "Other"] as const;
export type Role = typeof roleOptions[number];

export const statusOptions = ["Pending", "Approved", "Rejected"] as const;
export type Status = typeof statusOptions[number];

export const timeSlotOptions = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
] as const;
export type TimeSlot = typeof timeSlotOptions[number];

export interface Appointment {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  meetingReason: string;
  preferredDate: string;
  status: Status;
  timeSlot: string | null;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
}

export const createAppointmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(roleOptions),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  meetingReason: z.string().min(10, "Please provide more details about the meeting reason"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
});

export type CreateAppointment = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  status: z.enum(statusOptions),
  timeSlot: z.string().nullable(),
});

export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export type User = Admin;
export type InsertUser = Omit<Admin, "id">;
