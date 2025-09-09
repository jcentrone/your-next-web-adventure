import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/storage", () => ({
  isSupabaseUrl: () => false,
}));

vi.mock("./ReportDetailsSection", () => ({
  default: () => <div />,
}));

vi.mock("./TableOfContents", () => ({
  default: () => <div />,
}));

vi.mock("./SectionInfoDisplay", () => ({
  default: () => <div />,
}));

vi.mock("./InspectorCertificationPage", () => ({
  default: () => <div />,
}));

vi.mock("@/constants/coverTemplates", () => ({
  COVER_TEMPLATES: {
    templateOne: { component: () => <div /> },
  },
}));

vi.mock("@/utils/internachiStandardsContent", () => ({
  renderInternachiStandards: () => <div />,
}));

import PDFDocument from "./PDFDocument";

describe("PDFDocument", () => {
  const report: any = {
    id: "1",
    title: "Test Report",
    clientName: "John Doe",
    address: "123 Main St",
    inspectionDate: "2024-01-01",
    reportType: "home_inspection",
    sections: [
      { id: "sec1", key: "report_details", title: "Details", findings: [], info: {} },
    ],
    previewTemplate: "classic",
    coverTemplate: "templateOne",
    colorScheme: "default",
    tags: [],
    contactIds: [],
    includeStandardsOfPractice: true,
  };

  it("renders termsHtml when provided", () => {
    render(
      <PDFDocument
        report={report}
        mediaUrlMap={{}}
        coverUrl=""
        termsHtml="<p>Terms and Conditions</p>"
      />
    );

    expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
  });
});

