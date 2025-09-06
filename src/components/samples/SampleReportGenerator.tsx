import React from 'react';
import { SampleReport } from '@/constants/sampleData';
import { getSectionsByReportType } from '@/constants/sampleReportContent';
import PDFDocument from '@/components/reports/PDFDocument';
import SpecializedReportPreview from '@/components/reports/SpecializedReportPreview';

interface SampleReportGeneratorProps {
  report: SampleReport;
  onGenerated: (element: HTMLElement) => void;
}

export const SampleReportGenerator: React.FC<SampleReportGeneratorProps> = ({ report, onGenerated }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      onGenerated(ref.current);
    }
  }, [onGenerated]);

  // Convert sample data to report format
  const mockReport = {
    id: report.id,
    reportType: report.reportType as any,
    title: report.title,
    sections: getSectionsByReportType(report.reportType).map(section => ({
      id: section.id,
      title: section.title,
      items: section.findings.map(finding => ({
        id: finding.id,
        text: finding.description,
        severity: finding.severity,
        photos: finding.photos || [],
        videos: [],
        audio: []
      }))
    })),
    coverTemplate: report.coverTemplate as any,
    previewTemplate: report.previewTemplate as any,
    colorScheme: 'custom' as const,
    customColors: {
      primary: report.colorScheme.primary,
      secondary: report.colorScheme.secondary,
      accent: report.colorScheme.accent
    }
  };

  const mediaUrlMap: Record<string, string> = {};
  const coverUrl = `/sampleImgs/sampleReportCoverImg1.jpg`;

  if (report.reportType === 'home_inspection') {
    return (
      <div ref={ref} className="bg-white">
        <PDFDocument
          report={mockReport}
          mediaUrlMap={mediaUrlMap}
          coverUrl={coverUrl}
          organization={report.organization}
          inspector={report.inspector}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="bg-white">
      <SpecializedReportPreview
        report={mockReport}
        mediaUrlMap={mediaUrlMap}
        coverUrl={coverUrl}
        organization={report.organization}
        inspector={report.inspector}
      />
    </div>
  );
};