import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Trash2, Archive, ArchiveRestore, Wind, Flame, ShieldCheck, Home } from "lucide-react";
import { downloadWindMitigationReport } from "@/utils/fillWindMitigationPDF";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import type { Report } from "@/lib/reportSchemas";

interface ReportsListViewProps {
  reports: any[];
  onDelete: (id: string) => void;
  onArchive?: (id: string, archived: boolean) => void;
  showArchived?: boolean;
}

export const ReportsListView: React.FC<ReportsListViewProps> = ({ 
  reports, 
  onDelete, 
  onArchive, 
  showArchived = false 
}) => {
  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {(report.reportType as string).includes("wind") ? (
                <Wind className="h-5 w-5 text-muted-foreground" />
              ) : (report.reportType as string).includes("wildfire") ? (
                <Flame className="h-5 w-5 text-muted-foreground" />
              ) : (report.reportType as string).includes("roof") ? (
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              ) : (report.reportType as string).includes("home") ? (
                <Home className="h-5 w-5 text-muted-foreground" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
