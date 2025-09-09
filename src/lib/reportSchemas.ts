import {z} from "zod";
import type {SectionKey} from "@/constants/sop";

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
    clientEmail: z.string().optional(),
    clientPhone: z.string().optional(),
    county: z.string().optional(),
    ofStories: z.string().optional(),
    inspectionDate: z.string(), // ISO
    weatherConditions: z.string().optional(),
    status: z.enum(["Draft", "Final"]).default("Draft"),
    contactId: z.string().optional(), // Deprecated, use contactIds
    contactIds: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).default([]),
    finalComments: z.string().optional().default(""),
    termsHtml: z.string().optional(),
    agreementId: z.string().optional(),
    includeStandardsOfPractice: z.boolean().default(true),
    coverImage: z.string().optional().default(""),
    coverTemplate: z
        .enum(["templateOne", "templateTwo", "templateThree", "templateFour", "templateFive", "templateSix",
            "templateSeven", "templateEight", "templateNine", "templateTen", "templateEleven", "templateTwelve",
            "templateThirteen", "templateFourteen", "templateFifteen", "templateSixteen"])
        .default("templateOne"),
    previewTemplate: z.enum(["classic", "modern", "minimal"]).default("classic"),
    colorScheme: z
        .enum(["default", "coralAmber", "indigoOrchid", "forestMint", "slateSky", "royalAqua", "burgundyGold", "emeraldLime", "navyOrange", "charcoalNeon", "cocoaPeach", "custom"])
        .default("default"),
    customColors: z
        .object({
            primary: z.string().optional(),
            secondary: z.string().optional(),
            accent: z.string().optional(),
            headingText: z.string().optional(),
            bodyText: z.string().optional(),
        })
        .optional(),
    shareToken: z.string().optional(),
    archived: z.boolean().default(false),
    reportType: z.enum([
        "home_inspection",
        "wind_mitigation",
        "fl_wind_mitigation_oir_b1_1802",
        "fl_four_point_citizens",
        "tx_coastal_windstorm_mitigation",
        "ca_wildfire_defensible_space",
        "roof_certification_nationwide",
        "manufactured_home_insurance_prep",
    ]),
});

// Home Inspection Report Schema (original)
export const HomeInspectionReportSchema = BaseReportSchema.extend({
    reportType: z.literal("home_inspection"),
    sections: z.array(SectionSchema),
});

// Wind Mitigation Data Schema - matches the form field structure
export const WindMitigationDataSchema = z.object({
    // Question 1: Building Code
    "1_building_code": z.object({
        selectedOption: z.string().optional(),
        fields: z.record(z.any()).optional().default({})
    }).optional().default({}),

    // Question 2: Roof Covering
    "2_roof_covering": z.object({
        coverings: z.record(z.object({
            selected: z.boolean().optional(),
            permit_application_date: z.string().optional(),
            fbc_or_mdc_product_approval_number: z.string().optional(),
            year_of_original_install_or_replacement: z.string().optional(),
            no_information_provided_for_compliance: z.boolean().optional(),
        })).optional().default({}),
        overall_compliance: z.string().optional()
    }).optional().default({}),

    // Questions 3-6: Generic questions
    "3_roof_deck_attachment": z.object({
        selectedOption: z.string().optional(),
        fields: z.record(z.any()).optional().default({})
    }).optional().default({}),

    "4_roof_to_wall_attachment": z.object({
        selectedOption: z.string().optional(),
        fields: z.record(z.any()).optional().default({})
    }).optional().default({}),

    "5_roof_geometry": z.object({
        selectedOption: z.string().optional(),
        fields: z.record(z.any()).optional().default({})
    }).optional().default({}),

    "6_secondary_water_resistance": z.object({
        selectedOption: z.string().optional(),
        fields: z.record(z.any()).optional().default({})
    }).optional().default({}),

    // Question 7: Opening Protection
    "7_opening_protection": z.object({
        openingProtection: z
            .record(
                z.object({
                    NA: z.boolean().optional().default(false),
                    A: z.boolean().optional().default(false),
                    B: z.boolean().optional().default(false),
                    C: z.boolean().optional().default(false),
                    D: z.boolean().optional().default(false),
                    N: z.boolean().optional().default(false),
                    X: z.boolean().optional().default(false),
                })
            )
            .optional()
            .default({}),
        glazedOverall: z.string().optional(),
        nonGlazedSubclass: z.string().optional(),
    })
        .optional()
        .default({}),

    inspectorComments: z.string().optional().default(""),
});

// Wind Mitigation Report Schema
export const WindMitigationReportSchema = BaseReportSchema.extend({
    reportType: z.literal("wind_mitigation"),
    reportData: WindMitigationDataSchema,
    phoneHome: z.string().optional(),
    phoneWork: z.string().optional(),
    phoneCell: z.string().optional(),
    insuranceCompany: z.string().optional(),
    policyNumber: z.string().optional(),
    email: z.string().optional(),
});

// Generic report schema for forms defined by JSON specs
const GenericReportDataSchema = z.record(z.any()).default({});

export const FlWindMitigationOirB11802ReportSchema = BaseReportSchema.extend({
    reportType: z.literal("fl_wind_mitigation_oir_b1_1802"),
    reportData: GenericReportDataSchema,
});

export const FlFourPointCitizensReportSchema = BaseReportSchema.extend({
    reportType: z.literal("fl_four_point_citizens"),
    reportData: GenericReportDataSchema,
});

export const TxCoastalWindstormMitigationReportSchema = BaseReportSchema.extend({
    reportType: z.literal("tx_coastal_windstorm_mitigation"),
    reportData: GenericReportDataSchema,
});

export const CaWildfireDefensibleSpaceReportSchema = BaseReportSchema.extend({
    reportType: z.literal("ca_wildfire_defensible_space"),
    reportData: GenericReportDataSchema,
});

export const RoofCertificationNationwideReportSchema = BaseReportSchema.extend({
    reportType: z.literal("roof_certification_nationwide"),
    reportData: GenericReportDataSchema,
});

export const ManufacturedHomeInsurancePrepReportSchema = BaseReportSchema.extend({
    reportType: z.literal("manufactured_home_insurance_prep"),
    reportData: GenericReportDataSchema,
});

// Union type for all report types
export const ReportSchema = z.discriminatedUnion("reportType", [
    HomeInspectionReportSchema,
    WindMitigationReportSchema,
    FlWindMitigationOirB11802ReportSchema,
    FlFourPointCitizensReportSchema,
    TxCoastalWindstormMitigationReportSchema,
    CaWildfireDefensibleSpaceReportSchema,
    RoofCertificationNationwideReportSchema,
    ManufacturedHomeInsurancePrepReportSchema,
]);

export type BaseReport = z.infer<typeof BaseReportSchema>;
export type HomeInspectionReport = z.infer<typeof HomeInspectionReportSchema>;
export type WindMitigationReport = z.infer<typeof WindMitigationReportSchema>;
export type WindMitigationData = z.infer<typeof WindMitigationDataSchema>;
export type FlWindMitigationOirB11802Report = z.infer<typeof FlWindMitigationOirB11802ReportSchema>;
export type FlFourPointCitizensReport = z.infer<typeof FlFourPointCitizensReportSchema>;
export type TxCoastalWindstormMitigationReport = z.infer<typeof TxCoastalWindstormMitigationReportSchema>;
export type CaWildfireDefensibleSpaceReport = z.infer<typeof CaWildfireDefensibleSpaceReportSchema>;
export type RoofCertificationNationwideReport = z.infer<typeof RoofCertificationNationwideReportSchema>;
export type ManufacturedHomeInsurancePrepReport = z.infer<typeof ManufacturedHomeInsurancePrepReportSchema>;
export type Report = z.infer<typeof ReportSchema>;

// Legacy type for backwards compatibility
export type {HomeInspectionReport as LegacyReport};
