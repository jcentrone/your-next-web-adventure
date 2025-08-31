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
import CoverTemplateThirteen from "@/components/report-covers/CoverTemplateThirteen";
import CoverTemplateFourteen from "@/components/report-covers/CoverTemplateFourteen";
import CoverTemplateFifteen from "@/components/report-covers/CoverTemplateFifteen";
import CoverTemplateSixteen from "@/components/report-covers/CoverTemplateSixteen";

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
  templateThirteen: { label: "Template Thirteen", component: CoverTemplateThirteen },
  templateFourteen: { label: "Template Fourteen", component: CoverTemplateFourteen },
  templateFifteen: { label: "Template Fifteen", component: CoverTemplateFifteen },
  templateSixteen: { label: "Template Sixteen", component: CoverTemplateSixteen },
} as const;

export type CoverTemplateId = keyof typeof COVER_TEMPLATES;
