import React from "react";
import { PageGroup } from "@/utils/paginationUtils";

const MobileThumbnailContent: React.FC<{ page: HTMLElement; refreshKey?: string }> = ({ page, refreshKey }) => {
    const [content, setContent] = React.useState('');
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        if (!page) return;
        
        // Get actual rendered dimensions of the page
        const rect = page.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });

        // Clone and prepare content
        const clonedPage = page.cloneNode(true) as HTMLElement;
        
        // Apply styling overrides for better mobile viewing
        const applyStyleOverrides = (element: HTMLElement) => {
            const computedStyle = window.getComputedStyle(element);
            
            // Preserve backgrounds and colors
            const background = computedStyle.background;
            const backgroundColor = computedStyle.backgroundColor;
            const backgroundImage = computedStyle.backgroundImage;
            
            if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
                element.style.background = background;
            }
            if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                element.style.backgroundColor = backgroundColor;
            }
            if (backgroundImage && backgroundImage !== 'none') {
                element.style.backgroundImage = backgroundImage;
            }
            
            // Preserve text alignment
            const textAlign = computedStyle.textAlign;
            if (textAlign === 'center' || element.classList.contains('text-center')) {
                element.style.textAlign = 'center';
            } else if (textAlign === 'right' || element.classList.contains('text-right')) {
                element.style.textAlign = 'right';
            } else {
                element.style.textAlign = 'left';
            }
            
            element.style.color = computedStyle.color || '#000';
            
            // Preserve layout properties
            if (element.classList.contains('flex')) {
                element.style.display = 'flex';
            }
            if (element.classList.contains('justify-center')) {
                element.style.justifyContent = 'center';
            }
            if (element.classList.contains('items-center')) {
                element.style.alignItems = 'center';
            }
            if (element.classList.contains('mx-auto')) {
                element.style.marginLeft = 'auto';
                element.style.marginRight = 'auto';
            }
            
            element.style.padding = computedStyle.padding;
            element.style.margin = computedStyle.margin;
            
            // Recursively apply to children
            Array.from(element.children).forEach(child => {
                if (child instanceof HTMLElement) {
                    applyStyleOverrides(child);
                }
            });
        };

        applyStyleOverrides(clonedPage);
        setContent(clonedPage.innerHTML);
    }, [page, refreshKey]);

    // Calculate scale for mobile viewing
    const scale = 0.25; // Smaller scale for mobile grid

    return (
        <div className="bg-white w-full h-full overflow-hidden relative">
            <div 
                dangerouslySetInnerHTML={{ __html: content }}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: dimensions.width,
                    height: dimensions.height,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />
        </div>
    );
};

interface MobileThumbnailGridProps {
    containerRef: React.RefObject<HTMLElement>;
    report?: any;
    pageGroups?: PageGroup[];
}

const MobileThumbnailGrid: React.FC<MobileThumbnailGridProps> = ({
    containerRef, 
    report,
    pageGroups
}) => {
    const [pages, setPages] = React.useState<HTMLElement[]>([]);
    const [sections, setSections] = React.useState<Array<{name: string, pageIndex: number}>>([]);
    
    // Create composite refresh key for template changes
    const refreshKey = React.useMemo(() => {
        return `${report?.previewTemplate || ''}-${report?.coverTemplate || ''}-${report?.colorScheme || ''}-${JSON.stringify(report?.customColors || {})}`;
    }, [report?.previewTemplate, report?.coverTemplate, report?.colorScheme, report?.customColors]);

    // Capture page elements
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const capturePages = () => {
            const pageNodes = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
            setPages(pageNodes);
            
            // Create simplified section mapping
            const sectionMapping = [];
            let currentPageIndex = 0;

            // Cover page
            sectionMapping.push({ name: 'Cover', pageIndex: currentPageIndex });
            currentPageIndex++;

            // Report details
            sectionMapping.push({ name: 'Details', pageIndex: currentPageIndex });
            currentPageIndex++;

            // Summary (if exists)
            if (report?.sections?.some((s: any) => s.findings?.length > 0)) {
                sectionMapping.push({ name: 'Summary', pageIndex: currentPageIndex });
                currentPageIndex++;
            }

            // Report sections
            if (pageGroups && pageGroups.length > 0) {
                pageGroups.forEach((pageGroup) => {
                    if (pageGroup.sections.length === 1) {
                        sectionMapping.push({ 
                            name: pageGroup.sections[0].title.slice(0, 15) + (pageGroup.sections[0].title.length > 15 ? '...' : ''), 
                            pageIndex: currentPageIndex
                        });
                    } else {
                        sectionMapping.push({ 
                            name: `${pageGroup.sections[0].title.slice(0, 10)}... +${pageGroup.sections.length - 1}`, 
                            pageIndex: currentPageIndex
                        });
                    }
                    currentPageIndex++;
                });
            } else if (report?.sections?.length > 0) {
                report.sections.forEach((section: any) => {
                    if (section.key !== 'report_details') {
                        sectionMapping.push({ 
                            name: (section.title || section.name).slice(0, 15) + ((section.title || section.name).length > 15 ? '...' : ''), 
                            pageIndex: currentPageIndex
                        });
                        currentPageIndex++;
                    }
                });
            }

            // Other pages
            sectionMapping.push({ name: 'Certification', pageIndex: currentPageIndex });
            currentPageIndex++;
            
            if (report?.reportType === 'home_inspection') {
                sectionMapping.push({ name: 'Standards', pageIndex: currentPageIndex });
                currentPageIndex += 3;
            }

            setSections(sectionMapping);
        };

        // Initial capture
        capturePages();

        // Set up mutation observer to detect content changes
        const observer = new MutationObserver(() => {
            setTimeout(capturePages, 100);
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });

        return () => observer.disconnect();
    }, [containerRef, report, pageGroups, refreshKey]);

    const handlePageClick = (pageIndex: number) => {
        const page = pages[pageIndex];
        if (!page) return;
        
        // Scroll to full page view
        const pageTop = page.offsetTop;
        const scrollOffset = pageTop - 90; // Account for mobile header
        
        window.scrollTo({
            top: Math.max(0, scrollOffset),
            behavior: "smooth"
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-4">Report Pages</h2>
            
            {/* Grid of thumbnails */}
            <div className="grid grid-cols-2 gap-4">
                {pages.map((page, i) => {
                    const section = sections.find(s => s.pageIndex === i);
                    
                    return (
                        <button
                            key={i}
                            onClick={() => handlePageClick(i)}
                            className="border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-lg bg-white"
                        >
                            {/* Thumbnail container optimized for mobile */}
                            <div className="w-full aspect-[85/110] relative overflow-hidden">
                                <MobileThumbnailContent 
                                    key={`${i}-${refreshKey}`} 
                                    page={page} 
                                    refreshKey={refreshKey} 
                                />
                                
                                {/* Page number and section overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                                    <div className="text-white text-xs font-medium">
                                        Page {i + 1}
                                    </div>
                                    {section && (
                                        <div className="text-white/90 text-xs truncate">
                                            {section.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Helpful instruction */}
            <div className="text-center text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                <p>Tap any page to view full size. Use the PDF button above to download the complete report.</p>
            </div>
        </div>
    );
};

export default MobileThumbnailGrid;
