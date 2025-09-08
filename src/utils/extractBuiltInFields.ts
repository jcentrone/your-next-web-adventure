import { FL_FOUR_POINT_QUESTIONS } from "@/constants/flFourPointQuestions";
import { HOME_INSPECTION_FIELDS } from "@/constants/homeInspectionFields";
import { WIND_MITIGATION_QUESTIONS } from "@/constants/windMitigationQuestions";
import { TX_WINDSTORM_QUESTIONS } from "@/constants/txWindstormQuestions";
import { CA_WILDFIRE_QUESTIONS } from "@/constants/caWildfireQuestions";
import { MANUFACTURED_HOME_QUESTIONS } from "@/constants/manufacturedHomeQuestions";
import { ROOF_CERTIFICATION_QUESTIONS } from "@/constants/roofCertificationQuestions";
import type { Report } from "@/lib/reportSchemas";

// Unified field interface for displaying in section manager
export interface UnifiedField {
  name: string;
  label: string;
  widget: string;
  required: boolean;
  options?: string[];
  description?: string;
}

// Section key to question ID mapping for wind mitigation
const WIND_MITIGATION_SECTION_MAP: Record<string, string> = {
  "building_code": "1_building_code",
  "roof_covering": "2_roof_covering", 
  "roof_deck_attachment": "3_roof_deck_attachment",
  "roof_to_wall_attachment": "4_roof_to_wall_attachment",
  "roof_geometry": "5_roof_geometry",
  "secondary_water_resistance": "6_secondary_water_resistance",
  "opening_protection": "7_opening_protection"
};

/**
 * Extracts built-in fields from different report structures and converts them
 * to a unified format for display in the section manager
 */
export function extractBuiltInFields(reportType: Report["reportType"], sectionKey: string): UnifiedField[] {
  if (!sectionKey) return [];

  switch (reportType) {
    case "home_inspection":
      return extractHomeInspectionFields(sectionKey);
    
    case "wind_mitigation":
    case "fl_wind_mitigation_oir_b1_1802":
      return extractWindMitigationFields(sectionKey);
    
    case "fl_four_point_citizens":
      return extractFlFourPointFields(sectionKey);
    
    case "tx_coastal_windstorm_mitigation":
      return extractTxWindstormFields(sectionKey);
    
    case "ca_wildfire_defensible_space":
      return extractCaWildfireFields(sectionKey);
    
    case "manufactured_home_insurance_prep":
      return extractManufacturedHomeFields(sectionKey);
    
    case "roof_certification_nationwide":
      return extractRoofCertificationFields(sectionKey);
    
    default:
      console.warn(`Unknown report type: ${reportType}`);
      return [];
  }
}

function extractHomeInspectionFields(sectionKey: string): UnifiedField[] {
  const section = HOME_INSPECTION_FIELDS.sections.find(s => s.name === sectionKey);
  if (!section) return [];

  return section.fields.map(field => ({
    name: field.name,
    label: field.label,
    widget: field.widget,
    required: field.required,
    options: field.options
  }));
}

function extractWindMitigationFields(sectionKey: string): UnifiedField[] {
  const questionId = WIND_MITIGATION_SECTION_MAP[sectionKey];
  if (!questionId) return [];

  const question = WIND_MITIGATION_QUESTIONS.questions.find(q => q.id === questionId);
  if (!question) return [];

  const fields: UnifiedField[] = [];

  // Add main question prompt as a description field
  fields.push({
    name: `${questionId}_prompt`,
    label: "Question",
    widget: "textarea",
    required: false,
    description: question.prompt
  });

  // Handle different question structures
  if (question.id === "2_roof_covering") {
    // Roof covering has special structure with coverings
    fields.push({
      name: "roof_covering_types",
      label: "Roof Covering Types",
      widget: "select",
      required: true,
      options: question.coverings?.map(c => c.label) || []
    });

    fields.push({
      name: "overall_compliance",
      label: "Overall Compliance",
      widget: "select", 
      required: true,
      options: question.overall_compliance?.options.map(o => `${o.code}: ${o.label}`) || []
    });
  } else if (question.id === "7_opening_protection") {
    // Opening protection has special structure
    fields.push({
      name: "opening_types",
      label: "Opening Types",
      widget: "select",
      required: true,
      options: question.opening_types?.map(ot => ot.label) || []
    });

    fields.push({
      name: "glazed_classification",
      label: "Glazed Overall Classification",
      widget: "select",
      required: true,
      options: question.glazed_overall_classification?.options.map(o => `${o.code}: ${o.label}`) || []
    });
  } else {
    // Standard questions with options
    if (question.options) {
      fields.push({
        name: "selected_option",
        label: "Selected Option",
        widget: "select",
        required: true,
        options: question.options.map(opt => `${opt.code}: ${opt.label}`)
      });
    }

    // Add fields from question root level
    if ('fields' in question && question.fields) {
      question.fields.forEach(field => {
        fields.push({
          name: field.name,
          label: field.label || field.name,
          widget: getWidgetFromType(field.type),
          required: false
        });
      });
    }
  }

  return fields;
}

function extractFlFourPointFields(sectionKey: string): UnifiedField[] {
  const section = FL_FOUR_POINT_QUESTIONS.sections.find(s => s.name === sectionKey);
  if (!section) return [];

  return section.fields.map(field => ({
    name: field.name,
    label: field.label,
    widget: field.widget,
    required: field.required,
    options: field.options
  }));
}

function extractTxWindstormFields(sectionKey: string): UnifiedField[] {
  const section = TX_WINDSTORM_QUESTIONS.sections.find(s => s.name === sectionKey);
  if (!section) return [];

  return section.fields.map(field => ({
    name: field.name,
    label: field.label,
    widget: field.widget,
    required: field.required,
    options: field.options
  }));
}

function extractCaWildfireFields(sectionKey: string): UnifiedField[] {
  const section = CA_WILDFIRE_QUESTIONS.sections.find(s => s.name === sectionKey);
  if (!section) return [];

  return section.fields.map(field => ({
    name: field.name,
    label: field.label,
    widget: field.widget,
    required: field.required,
    options: field.options
  }));
}

function extractManufacturedHomeFields(sectionKey: string): UnifiedField[] {
  const section = MANUFACTURED_HOME_QUESTIONS.sections.find(s => s.name === sectionKey);
  if (!section) return [];

  return section.fields.map(field => ({
    name: field.name,
    label: field.label,
    widget: field.widget,
    required: field.required,
    options: field.options
  }));
}

function extractRoofCertificationFields(sectionKey: string): UnifiedField[] {
  const section = ROOF_CERTIFICATION_QUESTIONS.sections.find(s => s.name === sectionKey);
  if (!section) return [];

  return section.fields.map(field => ({
    name: field.name,
    label: field.label,
    widget: field.widget,
    required: field.required,
    options: field.options
  }));
}

function getWidgetFromType(type: string): string {
  switch (type) {
    case "string":
    case "text":
      return "text";
    case "number":
      return "number";
    case "date":
      return "date";
    case "year":
      return "number";
    case "boolean":
      return "checkbox";
    default:
      return "text";
  }
}