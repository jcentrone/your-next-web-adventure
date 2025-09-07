import React from "react";
import { Report } from "@/lib/reportSchemas";
import { FileText, Users, BookOpen, FileCheck, Shield } from "lucide-react";

interface TableOfContentsProps {
  report: Report;
  pageGroups?: any[];
  className?: string;
  termsHtml?: string;
}

interface TocEntry {
  title: string;
  pageNumber: number;
  icon: React.ElementType;
  findingCount?: number;
  subEntries?: TocEntry[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  report, 
  pageGroups = [], 
  className = "",
  termsHtml 
}) => {
  // Calculate page numbers based on the correct structure
  let currentPage = 1;
  const tocEntries: TocEntry[] = [];

  // Cover Page
  tocEntries.push({
    title: "Cover Page",
    pageNumber: currentPage++,
    icon: FileText,
  });

  // Table of Contents (this page)
  tocEntries.push({
    title: "Table of Contents",
    pageNumber: currentPage++,
    icon: BookOpen,
  });

  // Report Details
  tocEntries.push({
    title: "Report Details",
    pageNumber: currentPage++,
    icon: FileCheck,
  });

  // Summary (if there are findings)
  if (report.reportType === "home_inspection" && "sections" in report) {
    const totalFindings = report.sections.reduce((total, section) => 
      total + section.findings.filter(f => 
        f.includeInSummary || 
        ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"].includes(f.severity)
      ).length, 0
    );

    if (totalFindings > 0) {
      tocEntries.push({
        title: "Summary of Deficiencies",
        pageNumber: currentPage++,
        icon: Shield,
        findingCount: totalFindings,
      });
    }

    // Sections
    pageGroups.forEach((pageGroup) => {
      const sectionEntries: TocEntry[] = [];
      
      pageGroup.sections.forEach((sectionAnalysis: any) => {
        const section = report.sections.find((s: any) => s.id === sectionAnalysis.sectionId);
        if (section) {
          sectionEntries.push({
            title: section.title,
            pageNumber: currentPage,
            icon: FileText,
            findingCount: section.findings.length,
          });
        }
      });

      if (sectionEntries.length > 0) {
        tocEntries.push({
          title: `Report Sections (Page ${currentPage})`,
          pageNumber: currentPage++,
          icon: FileText,
          subEntries: sectionEntries,
        });
      }
    });
  } else {
    // For specialized reports
    tocEntries.push({
      title: "Report Content",
      pageNumber: currentPage++,
      icon: FileText,
    });

    // Check if there are images for specialized reports
    if ("reportData" in report && report.reportData) {
      let hasImages = false;
      Object.values(report.reportData).forEach((sectionData: any) => {
        if (sectionData && typeof sectionData === 'object') {
          Object.values(sectionData).forEach((value: any) => {
            if (Array.isArray(value) && value.length > 0) {
              hasImages = true;
            }
          });
        }
      });

      if (hasImages) {
        tocEntries.push({
          title: "Supporting Images",
          pageNumber: currentPage++,
          icon: FileText,
        });
      }
    }
  }

  // Inspector Certification
  tocEntries.push({
    title: "Inspector Certification",
    pageNumber: currentPage++,
    icon: Users,
  });

  // InterNACHI Standards (for home inspections)
  if (report.reportType === "home_inspection") {
    tocEntries.push({
      title: "InterNACHI Standards of Practice",
      pageNumber: currentPage++,
      icon: BookOpen,
    });
  }

  // Terms and Conditions (if present)
  if (termsHtml) {
    tocEntries.push({
      title: "Terms and Conditions",
      pageNumber: currentPage++,
      icon: FileCheck,
    });
  }

  return (
    <section className={`space-y-6 pdf-table-of-contents ${className}`}>
      <h2 className="text-xl font-semibold border-b pb-2">Table of Contents</h2>
      
      <div className="space-y-3">
        {tocEntries.map((entry, index) => (
          <div key={index}>
            <div className="flex items-center justify-between py-2 border-b border-dotted border-gray-300">
              <div className="flex items-center gap-3">
                <entry.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{entry.title}</span>
                {entry.findingCount !== undefined && entry.findingCount > 0 && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {entry.findingCount} finding{entry.findingCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {entry.pageNumber}
              </span>
            </div>
            
            {/* Sub-entries for section pages */}
            {entry.subEntries && (
              <div className="ml-7 mt-1 space-y-1">
                {entry.subEntries.map((subEntry, subIndex) => (
                  <div key={subIndex} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs">{subEntry.title}</span>
                      {subEntry.findingCount !== undefined && subEntry.findingCount > 0 && (
                        <span className="text-xs bg-gray-50 px-1 py-0.5 rounded">
                          {subEntry.findingCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {subEntry.pageNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Report Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Total Pages:</span>
            <span className="ml-2 font-medium">{currentPage - 1}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Report Type:</span>
            <span className="ml-2 font-medium capitalize">
              {report.reportType?.replace(/_/g, ' ')}
            </span>
          </div>
          {report.reportType === "home_inspection" && "sections" in report && (
            <>
              <div>
                <span className="text-muted-foreground">Sections:</span>
                <span className="ml-2 font-medium">{report.sections.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Findings:</span>
                <span className="ml-2 font-medium">
                  {report.sections.reduce((total, section) => total + section.findings.length, 0)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TableOfContents;