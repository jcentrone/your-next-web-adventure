import { AlertTriangle, AlertCircle, Info, Wrench, CheckCircle, MinusCircle } from "lucide-react";

export const PREVIEW_TEMPLATES = {
  classic: {
    container: "m-8 px-8 py-10 bg-white text-gray-900",
    cover: "cover flex flex-col items-center justify-center bg-gray-100 text-center print:justify-start print:min-h-0 print:py-12",
    coverTitle: "text-5xl font-bold mb-4",
    coverSubtitle: "text-lg text-gray-500",
    summaryTitle: "text-2xl font-semibold mb-4 border-b pb-2",
    sectionWrapper: "mb-10 border-b border-gray-300 pb-4",
    findingWrapper: "mb-4 p-4 border rounded bg-gray-50",
    severityBadge: {
      Safety: { className: "bg-red-100 text-red-800", icon: AlertTriangle },
      Major: { className: "bg-orange-100 text-orange-800", icon: AlertCircle },
      Moderate: { className: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      Minor: { className: "bg-blue-100 text-blue-800", icon: MinusCircle },
      Maintenance: { className: "bg-green-100 text-green-800", icon: Wrench },
      Info: { className: "bg-gray-100 text-gray-800", icon: Info }
    },
    h1: "text-3xl font-bold",
    h2: "mt-6 border-b border-gray-300 pb-1 text-xl font-semibold",
    h3: "text-md text-muted-foreground"
  },
  modern: {
    container: "px-10 py-12 bg-gradient-to-br from-white to-gray-50 text-gray-900",
    cover: "flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary to-accent text-white print:justify-start print:min-h-0 print:py-12",
    coverTitle: "text-6xl font-extrabold drop-shadow mb-2",
    coverSubtitle: "text-xl opacity-80",
    summaryTitle: "text-3xl font-bold mb-4 text-primary",
    sectionWrapper: "mb-12 pb-4 border-b border-gray-200",
    findingWrapper: "mb-4 p-6 rounded-lg shadow bg-white",
    severityBadge: {
      Safety: "bg-red-600 text-white",
      Major: "bg-orange-500 text-white",
      Moderate: "bg-yellow-400 text-black",
      Minor: "bg-blue-400 text-white",
      Maintenance: "bg-green-500 text-white",
      Info: "bg-gray-300 text-black"
    },
    h1: "text-4xl font-extrabold",
    h2: "mt-6 tracking-wide text-2xl font-bold",
    h3: "text-lg text-gray-500"
  },
  minimal: {
    container: "px-6 py-8 bg-white text-gray-800",
    cover: "flex flex-col items-center justify-center min-h-screen text-center print:justify-start print:min-h-0 print:py-12",
    coverTitle: "text-4xl font-medium",
    coverSubtitle: "text-sm text-gray-400",
    summaryTitle: "text-xl font-medium mb-2",
    sectionWrapper: "mb-8",
    findingWrapper: "mb-3 p-3 border-b",
    severityBadge: {
      Safety: "border border-red-400 text-red-600",
      Major: "border border-orange-400 text-orange-600",
      Moderate: "border border-yellow-400 text-yellow-600",
      Minor: "border border-blue-400 text-blue-600",
      Maintenance: "border border-green-400 text-green-600",
      Info: "border border-gray-300 text-gray-600"
    },
    h1: "text-2xl font-semibold",
    h2: "mt-4 text-lg font-medium",
    h3: "text-sm text-gray-500"
  }
} as const;
