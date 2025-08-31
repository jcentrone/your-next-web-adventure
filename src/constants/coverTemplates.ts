import CoverTemplateOne from "@/components/report-covers/CoverTemplateOne";
import CoverTemplateTwo from "@/components/report-covers/CoverTemplateTwo";
import CoverTemplateThree from "@/components/report-covers/CoverTemplateThree";
import CoverTemplateFour from "@/components/report-covers/CoverTemplateFour";
import CoverTemplateFive from "@/components/report-covers/CoverTemplateFive";
import CoverTemplateSix from "@/components/report-covers/CoverTemplateSix";
import CoverTemplateSeven from "@/components/report-covers/CoverTemplateSeven";
import CoverTemplateEight from "@/components/report-covers/CoverTemplateEight";
import CoverTemplateNine from "@/components/report-covers/CoverTemplateNine";
import CoverTemplateTen from "@/components/report-covers/CoverTemplateTen";
import CoverTemplateEleven from "@/components/report-covers/CoverTemplateEleven";
import CoverTemplateTwelve from "@/components/report-covers/CoverTemplateTwelve";

export const COVER_TEMPLATES = {
  templateOne: { label: "Template One", component: CoverTemplateOne },
  templateTwo: { label: "Template Two", component: CoverTemplateTwo },
  templateThree: { label: "Template Three", component: CoverTemplateThree },
  templateFour: { label: "Template Four", component: CoverTemplateFour },
  templateFive: { label: "Template Five", component: CoverTemplateFive },
  templateSix: { label: "Template Six", component: CoverTemplateSix },
  templateSeven: { label: "Template Seven", component: CoverTemplateSeven },
  templateEight: { label: "Template Eight", component: CoverTemplateEight },
  templateNine: { label: "Template Nine", component: CoverTemplateNine },
  templateTen: { label: "Template Ten", component: CoverTemplateTen },
  templateEleven: { label: "Template Eleven", component: CoverTemplateEleven },
  templateTwelve: { label: "Template Twelve", component: CoverTemplateTwelve },
} as const;

export type CoverTemplateId = keyof typeof COVER_TEMPLATES;
