import CoverTemplateOne from "@/components/report-covers/CoverTemplateOne";
import CoverTemplateTwo from "@/components/report-covers/CoverTemplateTwo";
import CoverTemplateThree from "@/components/report-covers/CoverTemplateThree";
import CoverTemplateFour from "@/components/report-covers/CoverTemplateFour";
import CoverTemplateFive from "@/components/report-covers/CoverTemplateFive";

export const COVER_TEMPLATES = {
  templateOne: { label: "Template One", component: CoverTemplateOne },
  templateTwo: { label: "Template Two", component: CoverTemplateTwo },
  templateThree: { label: "Template Three", component: CoverTemplateThree },
  templateFour: { label: "Template Four", component: CoverTemplateFour },
  templateFive: { label: "Template Five", component: CoverTemplateFive },
} as const;

export type CoverTemplateId = keyof typeof COVER_TEMPLATES;
