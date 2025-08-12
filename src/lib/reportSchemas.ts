import { z } from "zod";
import type { SectionKey } from "@/constants/sop";

export const MediaSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "video", "audio"]),
  url: z.string(),
  caption: z.string().optional().default(""),
});
export type Media = z.infer<typeof MediaSchema>;

export const FindingSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  severity: z.enum([
    "Info",
    "Maintenance",
    "Minor",
    "Moderate",
    "Major",
    "Safety",
  ]),
  narrative: z.string().optional().default(""),
  recommendation: z.string().optional().default(""),
  mediaGuidance: z.string().optional().default(""),
  defectId: z.string().nullable().optional().default(null),
  media: z.array(MediaSchema).default([]),
  includeInSummary: z.boolean().default(false),
});
export type Finding = z.infer<typeof FindingSchema>;

export const SectionSchema = z.object({
  id: z.string(),
  key: z.custom<SectionKey>(),
  title: z.string(),
  findings: z.array(FindingSchema).default([]),
});
export type Section = z.infer<typeof SectionSchema>;

export const ReportSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Report title is required"),
  clientName: z.string().min(1, "Client name is required"),
  address: z.string().min(1, "Address is required"),
  inspectionDate: z.string(), // ISO
  status: z.enum(["Draft", "Final"]).default("Draft"),
  finalComments: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  previewTemplate: z.enum(["classic", "modern"]).default("classic"),
  sections: z.array(SectionSchema),
});
export type Report = z.infer<typeof ReportSchema>;
