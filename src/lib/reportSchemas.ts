import { z } from "zod";
import type { SectionKey } from "@/constants/sop";

export const MediaSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "video", "audio"]),
  url: z.string(),
  caption: z.string().optional().default(""),
  annotations: z.string().optional().default(""),
  isAnnotated: z.boolean().optional().default(false),
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
  info: z.record(z.string()).optional().default({}),
});
export type Section = z.infer<typeof SectionSchema>;

// Base schema for common report fields
export const BaseReportSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Report title is required"),
  clientName: z.string().min(1, "Client name is required"),
  address: z.string().min(1, "Address is required"),
  inspectionDate: z.string(), // ISO
  status: z.enum(["Draft", "Final"]).default("Draft"),
  finalComments: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  previewTemplate: z.enum(["classic", "modern", "minimal"]).default("classic"),
  reportType: z.enum(["home_inspection", "wind_mitigation"]),
});

// Home Inspection Report Schema (original)
export const HomeInspectionReportSchema = BaseReportSchema.extend({
  reportType: z.literal("home_inspection"),
  sections: z.array(SectionSchema),
});

// Wind Mitigation Question Schemas
export const WindMitigationAnswerSchema = z.object({
  questionId: z.string(),
  selectedOption: z.string().optional(),
  fields: z.record(z.any()).optional().default({}),
  coverings: z.array(z.object({
    type: z.string(),
    fields: z.record(z.any()).default({})
  })).optional().default([]),
  openingProtection: z.record(z.string()).optional().default({}),
  glazedOverall: z.string().optional(),
  nonGlazedSubclass: z.string().optional(),
});

export const WindMitigationDataSchema = z.object({
  answers: z.array(WindMitigationAnswerSchema).default([]),
  inspectorComments: z.string().optional().default(""),
});

// Wind Mitigation Report Schema
export const WindMitigationReportSchema = BaseReportSchema.extend({
  reportType: z.literal("wind_mitigation"),
  reportData: WindMitigationDataSchema,
});

// Union type for all report types
export const ReportSchema = z.discriminatedUnion("reportType", [
  HomeInspectionReportSchema,
  WindMitigationReportSchema,
]);

export type BaseReport = z.infer<typeof BaseReportSchema>;
export type HomeInspectionReport = z.infer<typeof HomeInspectionReportSchema>;
export type WindMitigationReport = z.infer<typeof WindMitigationReportSchema>;
export type WindMitigationData = z.infer<typeof WindMitigationDataSchema>;
export type WindMitigationAnswer = z.infer<typeof WindMitigationAnswerSchema>;
export type Report = z.infer<typeof ReportSchema>;

// Legacy type for backwards compatibility
export type { HomeInspectionReport as LegacyReport };
