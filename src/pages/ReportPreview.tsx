import React, { useMemo } from "react";
import {Button} from "@/components/ui/button";
import {useNavigate, useParams} from "react-router-dom";
import {ChevronLeft, ChevronRight} from "lucide-react";
import Seo from "@/components/Seo";
import {loadReport as loadLocalReport, saveReport as saveLocalReport} from "@/hooks/useLocalDraft";
import {useAuth} from "@/contexts/AuthContext";
import {dbGetReport, dbUpdateReport} from "@/integrations/supabase/reportsApi";
import {Report} from "@/lib/reportSchemas";
import {getSignedUrlFromSupabaseUrl, isSupabaseUrl} from "@/integrations/supabase/storage";
import {PREVIEW_TEMPLATES, PreviewTemplateId} from "@/constants/previewTemplates";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {toast} from "@/components/ui/use-toast";
import {useReactToPrint} from "react-to-print";
import SpecializedReportPreview from "@/components/reports/SpecializedReportPreview";
import PDFDocument from "@/components/reports/PDFDocument";
import PreviewThumbnailNav from "@/components/reports/PreviewThumbnailNav";
import "../styles/pdf.css";
import {fillWindMitigationPDF} from "@/utils/fillWindMitigationPDF";
import {calculatePageLayout} from "@/utils/paginationUtils";
import {
    getMyOrganization,
    getMyProfile,
    getTermsConditions,
    Organization,
    Profile
} from "@/integrations/supabase/organizationsApi";
import type {CoverTemplateId} from "@/constants/coverTemplates";
import {CoverTemplateSelector} from "@/components/ui/cover-template-selector";
import {ColorScheme, ColorSchemePicker, CustomColors} from "@/components/ui/color-scheme-picker";
import {CoverTemplateProps} from "@/components/report-covers/types";

function StyleSelector({
                           value,
                           onChange,
                           disabled,
                       }: {
    value: PreviewTemplateId;
    onChange: (v: PreviewTemplateId) => void;
    disabled?: boolean;
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as PreviewTemplateId)} disabled={disabled}>
            <SelectTrigger className="w-[200px] capitalize font-medium" aria-label="Choose style template">
                <SelectValue placeholder="Choose style"/>
            </SelectTrigger>
            <SelectContent>
                {Object.keys(PREVIEW_TEMPLATES).map((key) => (
                    <SelectItem key={key} value={key} className="capitalize">
                        {key}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

const ReportPreview: React.FC = () => {
    const {id} = useParams();
    const {user} = useAuth();
    const [report, setReport] = React.useState<Report | null>(null);
    const [mediaUrlMap, setMediaUrlMap] = React.useState<Record<string, string>>({});
    const [coverUrl, setCoverUrl] = React.useState<string>("");
    const [organization, setOrganization] = React.useState<Organization | null>(null);
    const [inspector, setInspector] = React.useState<Profile | null>(null);
    const [termsHtml, setTermsHtml] = React.useState<string | null>(null);
    
    // Calculate smart pagination for home inspection reports
    const pageGroups = useMemo(() => {
        if (report?.reportType === "home_inspection" && "sections" in report) {
            return calculatePageLayout(report.sections);
        }
        return undefined;
    }, [report]);

    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
    const [savingCoverTpl, setSavingCoverTpl] = React.useState(false);
    const [savingStyleTpl, setSavingStyleTpl] = React.useState(false);
    const [savingColorScheme, setSavingColorScheme] = React.useState(false);
    
    // Page navigation state
    const [currentPage, setCurrentPage] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(0);
    
    const nav = useNavigate();

    // react-to-print
    const pdfContainerRef = React.useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: pdfContainerRef,
        documentTitle: `${report?.title || "Report"} - ${report?.clientName || "Client"}`,
    });

    // Page navigation functions
    const scrollToPage = (pageIndex: number) => {
        const container = pdfContainerRef.current;
        if (!container) return;

        const pages = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
        const page = pages[pageIndex];
        if (!page) return;

        const pageTop = page.offsetTop;
        const scrollOffset = pageTop - 140; // 129px topbar + 11px padding

        window.scrollTo({
            top: Math.max(0, scrollOffset),
            behavior: "smooth"
        });
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

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    handlePrevPage();
                    break;
                case 'ArrowRight':
                case 'PageDown':
                    e.preventDefault();
                    handleNextPage();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, totalPages]);

    // Update page count when container changes
    React.useEffect(() => {
        const container = pdfContainerRef.current;
        if (!container) return;

        const updatePageCount = () => {
            const pages = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
            setTotalPages(pages.length);
        };

        updatePageCount();
        
        // Use MutationObserver to watch for page changes
        const observer = new MutationObserver(updatePageCount);
        observer.observe(container, { childList: true, subtree: true });
        
        return () => observer.disconnect();
    }, [report]);

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
                description: "Your Uniform Mitigation Report has been generated successfully."
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

    const onPrintClick = () => {
        setIsGeneratingPDF(true);
        try {
            handlePrint();
            setTimeout(() => {
                setIsGeneratingPDF(false);
                toast({title: "PDF Generated", description: "Your report has been generated successfully."});
            }, 1000);
        } catch (error) {
            setIsGeneratingPDF(false);
            toast({
                title: "PDF Generation Failed",
                description: "Failed to generate PDF. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleCoverTemplateChange = async (tplId: CoverTemplateId) => {
        if (!report) return;
        setSavingCoverTpl(true);
        try {
            const next = {...report, coverTemplate: tplId} as Report;
            if (user) {
                await dbUpdateReport(next);
                setReport(next);
            } else {
                saveLocalReport(next);
                setReport(next);
            }
            toast({title: "Cover template updated", description: `Applied ${tplId}`});
        } catch (e) {
            console.error(e);
            toast({title: "Failed to update cover template", description: "Please try again.", variant: "destructive"});
        } finally {
            setSavingCoverTpl(false);
        }
    };

    const handleStyleTemplateChange = async (tplId: PreviewTemplateId) => {
        if (!report) return;
        setSavingStyleTpl(true);
        try {
            const next = {...report, previewTemplate: tplId} as Report;
            if (user) {
                await dbUpdateReport(next);
                setReport(next);
            } else {
                saveLocalReport(next);
                setReport(next);
            }
            toast({title: "Style updated", description: `Applied ${tplId}`});
        } catch (e) {
            console.error(e);
            toast({title: "Failed to update style", description: "Please try again.", variant: "destructive"});
        } finally {
            setSavingStyleTpl(false);
        }
    };

    const handleColorSchemeChange = async (scheme: ColorScheme, colors?: CustomColors) => {
        if (!report) return;
        setSavingColorScheme(true);
        try {
            const next = {
                ...report,
                colorScheme: scheme,
                customColors: scheme === "custom" ? colors : undefined,
            } as Report;
            if (user) {
                await dbUpdateReport(next);
                setReport(next);
            } else {
                saveLocalReport(next);
                setReport(next);
            }
            toast({
                title: "Color scheme updated",
                description: scheme === "custom" ? "Applied custom scheme" : `Applied ${scheme}`,
            });
        } catch (e) {
            console.error(e);
            toast({title: "Failed to update color scheme", description: "Please try again.", variant: "destructive"});
        } finally {
            setSavingColorScheme(false);
        }
    };

    React.useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                if (user) {
                    const r = await dbGetReport(id);
                    setReport(r);
                } else {
                    const r = loadLocalReport(id);
                    setReport(r);
                }
            } catch (e) {
                console.error(e);
                setReport(null);
            }
        })();
    }, [id, user]);

    // Resolve media URLs and sign cover image
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
                                const next = {...prev};
                                for (const e of entries) if (e) next[e[0]] = e[1];
                                return next;
                            });
                        }
                    }
                }

                if (report.reportType === "tx_coastal_windstorm_mitigation") {
                    const photos = (report.reportData?.photos?.photos || []).filter((p: string) => isSupabaseUrl(p));
                    if (photos.length > 0) {
                        const entries = await Promise.all(
                            photos.map(async (url: string) => {
                                const signed = await getSignedUrlFromSupabaseUrl(url);
                                return [url, signed] as const;
                            })
                        );
                        if (!cancelled) {
                            setMediaUrlMap((prev) => {
                                const next = {...prev};
                                for (const [url, signed] of entries) next[url] = signed;
                                return next;
                            });
                        }
                    }
                }

                if (report.reportType === "ca_wildfire_defensible_space") {
                    const photos = (report.reportData?.photos?.photos || []).filter((p: string) => isSupabaseUrl(p));
                    if (photos.length > 0) {
                        const entries = await Promise.all(
                            photos.map(async (url: string) => {
                                const signed = await getSignedUrlFromSupabaseUrl(url);
                                return [url, signed] as const;
                            })
                        );
                        if (!cancelled) {
                            setMediaUrlMap((prev) => {
                                const next = {...prev};
                                for (const [url, signed] of entries) next[url] = signed;
                                return next;
                            });
                        }
                    }
                }

                if (report.reportType === "roof_certification_nationwide") {
                    const photos = (report.reportData?.photos?.photos || []).filter((p: string) => isSupabaseUrl(p));
                    if (photos.length > 0) {
                        const entries = await Promise.all(
                            photos.map(async (url: string) => {
                                const signed = await getSignedUrlFromSupabaseUrl(url);
                                return [url, signed] as const;
                            })
                        );
                        if (!cancelled) {
                            setMediaUrlMap((prev) => {
                                const next = {...prev};
                                for (const [url, signed] of entries) next[url] = signed;
                                return next;
                            });
                        }
                    }
                }
                if (report.reportType === "manufactured_home_insurance_prep") {
                    const photos = (report.reportData?.photos_notes?.photos || []).filter((p: string) => isSupabaseUrl(p));
                    if (photos.length > 0) {
                        const entries = await Promise.all(
                            photos.map(async (url: string) => {
                                const signed = await getSignedUrlFromSupabaseUrl(url);
                                return [url, signed] as const;
                            })
                        );
                        if (!cancelled) {
                            setMediaUrlMap((prev) => {
                                const next = {...prev};
                                for (const [url, signed] of entries) next[url] = signed;
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

                const organization = await getMyOrganization();
                const profile = await getMyProfile();
                if (!cancelled) {
                    setOrganization(organization);
                    setInspector(profile);
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

    if (!report) return null;

    const tpl = PREVIEW_TEMPLATES[report.previewTemplate] || PREVIEW_TEMPLATES.classic;

    const DEFAULT_TEXT_COLOR = "222 47% 11%";
    const colorVars =
        report.colorScheme === "custom" && report.customColors
            ? ({
                "--heading-text-color": `hsl(${report.customColors.headingText || DEFAULT_TEXT_COLOR})`,
                "--body-text-color": `hsl(${report.customColors.bodyText || DEFAULT_TEXT_COLOR})`,
            } as any)
            : undefined;

    const coverPreviewData: CoverTemplateProps = {
        reportTitle: report.title,
        clientName: report.clientName,
        coverImage: coverUrl,
        organizationName: organization?.name || "",
        organizationAddress: organization?.address || "",
        organizationPhone: organization?.phone || "",
        organizationEmail: organization?.email || "",
        organizationWebsite: organization?.website || "",
        organizationLogo: organization?.logo_url || "",
        inspectorName: inspector?.full_name || "",
        inspectorLicenseNumber: inspector?.license_number || "",
        inspectorPhone: inspector?.phone || "",
        inspectorEmail: inspector?.email || "",
        clientAddress: report.address,
        clientEmail: report.clientEmail || "",
        clientPhone: report.clientPhone || "",
        inspectionDate: report.inspectionDate,
        weatherConditions: report.weatherConditions || "",
    };

    if (report.reportType === "wind_mitigation") {
        return (
            <div
                className="max-w-4xl mx-auto px-4 py-10 text-center"
                style={{...(colorVars ?? {}), color: "var(--body-text-color)"}}
            >
                <h1 className="text-2xl font-bold mb-4" style={{color: "var(--heading-text-color)"}}>
                    Uniform Mitigation Report
                </h1>
                <p className="text-muted-foreground mb-6">Generate your completed Uniform Mitigation Report as a
                    PDF.</p>
                <div className="flex justify-center gap-4">
                    <Button onClick={handleWindMitigationDownload}>Download Uniform Mitigation PDF</Button>
                    <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)}>Back to Editor</Button>
                </div>
            </div>
        );
    }

    const TOPBAR_HEIGHT = 129;

    const topBar = (
        <div className="fixed top-0 right-0 left-0 h-[80px] z-50">
            <div
                className="bg-background shadow print-hidden relative z-50"
                style={{height: TOPBAR_HEIGHT}}
            >
                <div className="mx-auto px-4 py-4 flex items-end justify-between gap-2 h-full">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => nav(`/reports/${report.id}`)}
                            aria-label="Close preview and return to editor"
                        >
                            Close Preview
                        </Button>
                        
                        {/* Page Navigation */}
                        <div className="flex items-center gap-1 border rounded-md">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                aria-label="Previous page"
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-2 text-sm text-muted-foreground whitespace-nowrap">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1}
                                aria-label="Next page"
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <CoverTemplateSelector
                            value={report.coverTemplate}
                            onChange={handleCoverTemplateChange}
                            disabled={savingCoverTpl}
                            data={coverPreviewData}
                        />
                        <StyleSelector
                            value={report.previewTemplate}
                            onChange={handleStyleTemplateChange}
                            disabled={savingStyleTpl}
                        />
                        <ColorSchemePicker
                            value={report.colorScheme || "default"}
                            customColors={report.customColors}
                            onChange={handleColorSchemeChange}
                            disabled={savingColorScheme}
                        />
                    </div>
                    
                    <Button onClick={onPrintClick} disabled={isGeneratingPDF} aria-label="Download PDF">
                        {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                    </Button>
                </div>
            </div>
        </div>
    );

    if (report.reportType !== "home_inspection") {
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
                {topBar}
                <div className="flex mt-1 print:mt-0">
                    <PreviewThumbnailNav 
                        containerRef={pdfContainerRef}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        report={report}
                        pageGroups={[]}
                    />
                    <div className="flex-1 pt-24 flex justify-center">
                        <div className="w-full ms-80 max-w-4xl px-4 py-10">
                            <div ref={pdfContainerRef} style={colorVars}>
                                <SpecializedReportPreview
                                    report={report}
                                    inspector={inspector}
                                    organization={organization}
                                    mediaUrlMap={mediaUrlMap}
                                    coverUrl={coverUrl}
                                    className={tpl.cover}
                                    termsHtml={termsHtml}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

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

            {/* Top bar */}
            {topBar}

            <div className="flex mt-1 print:mt-0">
                <PreviewThumbnailNav 
                    containerRef={pdfContainerRef}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    report={report}
                    pageGroups={pageGroups}
                />
                <div className="flex-1 pt-24 ms-80 flex justify-center">
                    <div className="w-full max-w-4xl px-4 py-10">
                        <PDFDocument
                            ref={pdfContainerRef}
                            report={report}
                            mediaUrlMap={mediaUrlMap}
                            coverUrl={coverUrl}
                            company={organization?.name || ""}
                            termsHtml={termsHtml || undefined}
                            inspector={inspector}
                            organization={organization}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportPreview;
