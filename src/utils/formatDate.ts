import { format, parseISO } from "date-fns";

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MM/dd/yyyy");
  } catch {
    return dateStr;
  }
}
