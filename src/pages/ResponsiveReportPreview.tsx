import React from "react";
import ReportPreview from "@/pages/ReportPreview";
import ReportPreviewMobile from "@/pages/ReportPreviewMobile";
import { useIsMobile } from "@/hooks/use-mobile";

const ResponsiveReportPreview: React.FC = () => {
  const isMobile = useIsMobile();
  return isMobile ? <ReportPreviewMobile /> : <ReportPreview />;
};

export default ResponsiveReportPreview;
