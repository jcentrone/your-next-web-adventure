import { z } from "zod";

export const AccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Account name is required"),
  type: z.string().default("company"),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
  annual_revenue: z.number().optional(),
  employee_count: z.number().optional(),
  user_id: z.string().uuid(),
  organization_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  user_id: true,
});

export const UpdateAccountSchema = CreateAccountSchema.partial();

export type Account = z.infer<typeof AccountSchema>;
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;