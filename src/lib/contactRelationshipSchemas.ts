import { z } from "zod";

export const ContactRelationshipSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  organization_id: z.string().nullable().optional(),
  from_contact_id: z.string(),
  to_contact_id: z.string(),
  relationship_type: z.enum(["client-realtor", "client-contractor", "client-vendor", "realtor-contractor", "custom"]),
  custom_relationship_label: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ContactRelationship = z.infer<typeof ContactRelationshipSchema>;

export const CreateContactRelationshipSchema = z.object({
  to_contact_id: z.string().min(1, "Contact is required"),
  relationship_type: z.enum(["client-realtor", "client-contractor", "client-vendor", "realtor-contractor", "custom"]),
  custom_relationship_label: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateContactRelationship = z.infer<typeof CreateContactRelationshipSchema>;