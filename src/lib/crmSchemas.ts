import { z } from "zod";

export const ContactSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  organization_id: z.string().nullable().optional(),
  contact_type: z.enum(["client", "realtor", "vendor", "contractor", "other"]),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  formatted_address: z.string().optional().nullable(),
  place_id: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  address_components: z.any().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateContactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  contact_type: z.enum(["client", "realtor", "vendor", "contractor", "other"]),
  formatted_address: z.string().optional().nullable(),
  place_id: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  address_components: z.any().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});
export type Contact = z.infer<typeof ContactSchema>;

export const AppointmentSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  organization_id: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
  report_id: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  appointment_date: z.string(),
  duration_minutes: z.number().default(120),
  location: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "rescheduled"]),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Appointment = z.infer<typeof AppointmentSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  organization_id: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
  appointment_id: z.string().nullable().optional(),
  report_id: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  task_type: z.string().optional().nullable(),
  due_date: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  organization_id: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
  appointment_id: z.string().nullable().optional(),
  report_id: z.string().nullable().optional(),
  task_id: z.string().nullable().optional(),
  activity_type: z.enum(["call", "email", "meeting", "note", "task_completed", "appointment_created", "report_delivered", "report_created", "contact_created"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  created_at: z.string(),
});
export type Activity = z.infer<typeof ActivitySchema>;