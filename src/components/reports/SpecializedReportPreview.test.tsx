import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("./InspectorCertificationPage", () => ({
  default: () => <div />,
}));

vi.mock("./TableOfContents", () => ({
  default: () => <div />,
}));

vi.mock("@/constants/coverTemplates.ts", () => ({
  COVER_TEMPLATES: {
    templateOne: { component: () => <div /> },
  },
}));

vi.mock("@/constants/flFourPointQuestions", () => ({
  FL_FOUR_POINT_QUESTIONS: { sections: [] },
}));
vi.mock("@/constants/txWindstormQuestions", () => ({
  TX_WINDSTORM_QUESTIONS: { sections: [] },
}));
vi.mock("@/constants/caWildfireQuestions", () => ({
  CA_WILDFIRE_QUESTIONS: { sections: [] },
}));
vi.mock("@/constants/manufacturedHomeQuestions", () => ({
  MANUFACTURED_HOME_QUESTIONS: { sections: [] },
}));
vi.mock("@/constants/roofCertificationQuestions", () => ({
  ROOF_CERTIFICATION_QUESTIONS: { sections: [] },
}));

vi.mock("@/utils/internachiStandardsContent", () => ({
  renderInternachiStandards: () => <div />,
}));

import SpecializedReportPreview from "./SpecializedReportPreview";

describe("SpecializedReportPreview", () => {
  const report: any = {
    id: "1",
    title: "Test Report",
    clientName: "John Doe",
    address: "123 Main St",
    inspectionDate: "2024-01-01",
    reportType: "fl_four_point_citizens",
    reportData: {},
    coverTemplate: "templateOne",
    colorScheme: "default",
    tags: [],
    contactIds: [],
  };

  it("renders termsHtml when provided", () => {
    render(
      <SpecializedReportPreview
        report={report}
        mediaUrlMap={{}}
        coverUrl=""
        termsHtml="<p>Terms and Conditions</p>"
      />
    );

    expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
  });
});

