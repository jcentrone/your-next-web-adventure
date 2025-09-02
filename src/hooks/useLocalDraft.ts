import { SOP_SECTIONS } from "@/constants/sop";
import { Report, ReportSchema, Section } from "@/lib/reportSchemas";

const INDEX_KEY = "reports:index";
const DATA_PREFIX = "reports:data:";

function getIndex(): string[] {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
  } catch {
    return [];
  }
}

function setIndex(ids: string[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

export function listReports(): Pick<Report, "id" | "title" | "clientName" | "inspectionDate" | "status">[] {
  const ids = getIndex();
  return ids
    .map((id) => loadReport(id))
    .filter(Boolean)
    .map((r) => ({
      id: r!.id,
      title: r!.title,
      clientName: r!.clientName,
      inspectionDate: r!.inspectionDate,
      status: r!.status,
    }));
}

export function loadReport(id: string): Report | null {
  const raw = localStorage.getItem(DATA_PREFIX + id);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const result = ReportSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function saveReport(report: Report) {
  localStorage.setItem(DATA_PREFIX + report.id, JSON.stringify(report));
  const ids = new Set(getIndex());
  ids.add(report.id);
  setIndex(Array.from(ids));
}

export function deleteReport(id: string) {
  localStorage.removeItem(DATA_PREFIX + id);
  const ids = getIndex().filter((x) => x !== id);
  setIndex(ids);
}

export function createReport(meta: {
  title: string;
  clientName: string;
  address: string;
  inspectionDate: string;
  reportType?: Report["reportType"];
}): Report {
  const id = crypto.randomUUID();
  const reportType = meta.reportType || "home_inspection";

  let report: Report;

  if (reportType === "home_inspection") {
    const sections: Section[] = SOP_SECTIONS.map((s, idx) => ({
      id: `${id}-sec-${idx + 1}`,
      key: s.key as any,
      title: s.name,
      findings: [],
    }));

    report = {
      id,
      title: meta.title,
      clientName: meta.clientName,
      address: meta.address,
      inspectionDate: meta.inspectionDate,
      status: "Draft",
      finalComments: "",
      coverImage: "",
      previewTemplate: "classic",
      reportType: "home_inspection",
      sections,
    };
  } else if (reportType === "wind_mitigation") {
    report = {
      id,
      title: meta.title,
      clientName: meta.clientName,
      address: meta.address,
      inspectionDate: meta.inspectionDate,
      status: "Draft",
      finalComments: "",
      coverImage: "",
      previewTemplate: "classic",
      reportType: "wind_mitigation",
      reportData: {
        "1_building_code": {},
        "2_roof_covering": {},
        "3_roof_deck_attachment": {},
        "4_roof_to_wall_attachment": {},
        "5_roof_geometry": {},
        "6_secondary_water_resistance": {},
        "7_opening_protection": {},
      },
    };
  } else {
    report = {
      id,
      title: meta.title,
      clientName: meta.clientName,
      address: meta.address,
      inspectionDate: meta.inspectionDate,
      status: "Draft",
      finalComments: "",
      coverImage: "",
      previewTemplate: "classic",
      reportType,
      reportData: {},
    };
  }
  saveReport(report);
  return report;
}
