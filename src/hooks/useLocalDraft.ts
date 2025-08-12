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
}): Report {
  const id = crypto.randomUUID();
  const sections: Section[] = SOP_SECTIONS.map((s, idx) => ({
    id: `${id}-sec-${idx + 1}`,
    key: s.key as any,
    title: s.name,
    findings: [],
  }));

  const report: Report = {
    id,
    title: meta.title,
    clientName: meta.clientName,
    address: meta.address,
    inspectionDate: meta.inspectionDate,
    status: "Draft",
    finalComments: "",
    coverImage: "",
    previewTemplate: "classic",
    sections,
  };
  saveReport(report);
  return report;
}
