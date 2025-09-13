import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { loadReport as loadLocalReport } from "@/hooks/useLocalDraft";
import { useAuth } from "@/contexts/AuthContext";
import { dbGetReport } from "@/integrations/supabase/reportsApi";
import { Report } from "@/lib/reportSchemas";
import { getSignedUrlFromSupabaseUrl, isSupabaseUrl } from "@/integrations/supabase/storage";
import { useReactToPrint } from "react-to-print";
import SpecializedReportPreview from "@/components/reports/SpecializedReportPreview";
import PDFDocument from "@/components/reports/PDFDocument";
import {
  getMyOrganization,
  getMyProfile,
  getTermsConditions,
  Organization,
  Profile,
} from "@/integrations/supabase/organizationsApi";
import { toast } from "@/components/ui/use-toast";
import { fillWindMitigationPDF } from "@/utils/fillWindMitigationPDF";
import "../styles/pdf.css";

const ReportPreviewMobile: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = React.useState<Report | null>(null);
  const [mediaUrlMap, setMediaUrlMap] = React.useState<Record<string, string>>({});
  const [coverUrl, setCoverUrl] = React.useState(" ");
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [inspector, setInspector] = React.useState<Profile | null>(null);
  const [termsHtml, setTermsHtml] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const nav = useNavigate();
  const pdfContainerRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: pdfContainerRef,
    documentTitle: `${report?.title || "Report"} - ${report?.clientName || "Client"}`,
  });

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = user ? await dbGetReport(id) : loadLocalReport(id);
        setReport(r);
      } catch (e) {
        console.error(e);
        setReport(null);
      }
    })();
  }, [id, user]);

  React.useEffect(() => {
    if (!user || !report) return;
    let cancelled = false;
    (async () => {
      try {
        if (report.reportType === "home_inspection") {
          const allMedia = report.sections.flatMap((s) => s.findings.flatMap((f) => f.media));
          const needsSigned = allMedia.filter((m) => isSupabaseUrl(m.url));
          if (needsSigned.length > 0) {
            const entries = await Promise.all(
              needsSigned.map(async (m) => {
                const signed = await getSignedUrlFromSupabaseUrl(m.url);
                return m.id ? ([m.id, signed] as const) : null;
              })
            );
            if (!cancelled) {
              setMediaUrlMap((prev) => {
                const next = { ...prev };
                for (const e of entries) if (e) next[e[0]] = e[1];
                return next;
              });
            }
          }
        }

        if (report.coverImage) {
          if (isSupabaseUrl(report.coverImage)) {
            const signed = await getSignedUrlFromSupabaseUrl(report.coverImage);
            if (!cancelled) setCoverUrl(signed);
          } else if (!cancelled) {
            setCoverUrl(report.coverImage);
          }
        }

        const org = await getMyOrganization();
        const prof = await getMyProfile();
        if (!cancelled) {
          setOrganization(org);
          setInspector(prof);
        }
      } catch (err) {
        console.error("Error preparing report preview:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, report]);

  React.useEffect(() => {
    if (!organization || !report) return;
    if (report.termsHtml) {
      setTermsHtml(report.termsHtml);
      return;
    }
    (async () => {
      try {
        const terms = await getTermsConditions(organization.id);
        const match =
          terms.find((t) => t.report_type === report.reportType) ||
          terms.find((t) => t.report_type === null);
        setTermsHtml(match?.content_html || null);
      } catch (e) {
        console.error("Failed to fetch terms:", e);
      }
    })();
  }, [organization, report]);

  React.useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;
    const update = () => {
      const pages = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
      setTotalPages(pages.length);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [report]);

  const scrollToPage = (pageIndex: number) => {
    const container = pdfContainerRef.current;
    if (!container) return;
    const pages = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
    const page = pages[pageIndex];
    if (!page) return;
    page.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      scrollToPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      scrollToPage(newPage);
    }
  };

  const onPrintClick = () => {
    try {
      handlePrint();
      toast({ title: "PDF Generated", description: "Your report has been generated successfully." });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWindMitigationDownload = async () => {
    if (!report) return;
    try {
      const pdfBlob = await fillWindMitigationPDF(report);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "uniform_mitigation_report.pdf";
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: "PDF Generated",
        description: "Your Uniform Mitigation Report has been generated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate Uniform Mitigation Report.",
        variant: "destructive",
      });
    }
  };

  if (!report) return null;

  const colorVars =
    report.colorScheme === "custom" && report.customColors
      ? ({
          "--heading-text-color": `hsl(${report.customColors.headingText || "222 47% 11%"})`,
          "--body-text-color": `hsl(${report.customColors.bodyText || "222 47% 11%"})`,
        } as any)
      : undefined;

  if (report.reportType === "wind_mitigation") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center" style={{ ...(colorVars ?? {}), color: "var(--body-text-color)" }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--heading-text-color)" }}>
          Uniform Mitigation Report
        </h1>
        <p className="text-muted-foreground mb-6">Generate your completed Uniform Mitigation Report as a PDF.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleWindMitigationDownload}>Download Uniform Mitigation PDF</Button>
          <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)}>Back to Editor</Button>
        </div>
      </div>
    );
  }

  const topBar = (
    <div className="sticky top-0 z-50 flex items-center justify-between p-2 border-b bg-background">
      <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)} aria-label="Close preview">
        Back
      </Button>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={currentPage === 0} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {currentPage + 1} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button size="sm" onClick={onPrintClick} aria-label="Download PDF">
        Download PDF
      </Button>
    </div>
  );

  return (
    <>
      <Seo
        title={`${report.title} | Preview`}
        description={`Preview of report for ${report.clientName}`}
        canonical={window.location.origin + `/reports/${report.id}/preview`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: report.title,
          datePublished: report.inspectionDate,
        }}
      />
      <div className="flex flex-col h-full">
        {topBar}
        <div ref={pdfContainerRef} className="flex-1 overflow-y-auto p-4" style={colorVars}>
          {report.reportType === "home_inspection" ? (
            <PDFDocument
              report={report}
              mediaUrlMap={mediaUrlMap}
              coverUrl={coverUrl}
              company={organization?.name || ""}
              termsHtml={termsHtml || undefined}
              inspector={inspector}
              organization={organization}
            />
          ) : (
            <SpecializedReportPreview
              report={report}
              inspector={inspector}
              organization={organization}
              mediaUrlMap={mediaUrlMap}
              coverUrl={coverUrl}
              className=""
              termsHtml={termsHtml}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ReportPreviewMobile;
