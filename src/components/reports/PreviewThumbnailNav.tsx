import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageGroup } from "@/utils/paginationUtils";

// Enhanced thumbnail content component with dynamic scaling and content awareness
const ThumbnailContent: React.FC<{ page: HTMLElement }> = ({ page }) => {
    const [content, setContent] = React.useState('');
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        // Get actual rendered dimensions of the page
        const rect = page.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });

        // Clone and prepare content with smart cropping
        const clonedPage = page.cloneNode(true) as HTMLElement;
        
        // Apply styling overrides with better content preservation
        const applyStyleOverrides = (element: HTMLElement) => {
            // Preserve original text alignment but ensure visibility
            const computedStyle = window.getComputedStyle(element);
            element.style.textAlign = computedStyle.textAlign || 'left';
            element.style.color = computedStyle.color || '#000';
            element.style.backgroundColor = computedStyle.backgroundColor || 'transparent';
            
            // Handle specific alignment classes
            if (element.classList.contains('text-center') || 
                element.tagName === 'H1' || 
                element.tagName === 'H2') {
                element.style.textAlign = 'center';
            }
            if (element.classList.contains('text-right')) {
                element.style.textAlign = 'right';
            }
            
            // Ensure flex layouts work properly
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
            
            // Recursively apply to children
            Array.from(element.children).forEach(child => {
                if (child instanceof HTMLElement) {
                    applyStyleOverrides(child);
                }
            });
        };

        applyStyleOverrides(clonedPage);
        setContent(clonedPage.innerHTML);
    }, [page]);

    // Calculate optimal scale based on content dimensions
    const getOptimalScale = () => {
        const containerWidth = 240; // Approximate thumbnail container width
        const containerHeight = 310; // Approximate thumbnail container height
        
        if (dimensions.width === 0 || dimensions.height === 0) return 0.39;
        
        const scaleX = containerWidth / dimensions.width;
        const scaleY = containerHeight / dimensions.height;
        
        // Use the smaller scale to ensure content fits
        return Math.min(scaleX, scaleY, 0.5); // Cap at 0.5 for readability
    };

    const scale = getOptimalScale();

    return (
        <div 
            dangerouslySetInnerHTML={{ __html: content }}
            className="bg-white w-full h-full overflow-hidden"
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${100 / scale}%`,
                height: `${100 / scale}%`
            }}
        />
    );
};

interface PreviewThumbnailNavProps {
    containerRef: React.RefObject<HTMLElement>;
    currentPage?: number;
    onPageChange?: (pageIndex: number) => void;
    report?: any;
    pageGroups?: PageGroup[];
}

const PreviewThumbnailNav: React.FC<PreviewThumbnailNavProps> = ({
    containerRef, 
    currentPage, 
    onPageChange,
    report,
    pageGroups
}) => {
    const [pages, setPages] = React.useState<HTMLElement[]>([]);
    const [activePage, setActivePage] = React.useState(currentPage || 0);
    const [sections, setSections] = React.useState<Array<{name: string, startPage: number, endPage: number}>>([]);

    // Capture page elements with content synchronization
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const capturePages = () => {
            const pageNodes = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
            setPages(pageNodes);
            
            // Create section mapping after pages are captured
            const sectionMapping = [];
            let currentPageIndex = 0;

            // Cover page
            sectionMapping.push({ name: 'Cover', startPage: currentPageIndex, endPage: currentPageIndex });
            currentPageIndex++;

            // Report details
            sectionMapping.push({ name: 'Report Details', startPage: currentPageIndex, endPage: currentPageIndex });
            currentPageIndex++;

            // Summary (if exists)
            if (report?.sections?.some((s: any) => s.findings?.length > 0)) {
                sectionMapping.push({ name: 'Summary', startPage: currentPageIndex, endPage: currentPageIndex });
                currentPageIndex++;
            }

            // Report sections (using smart pagination)
            if (pageGroups && pageGroups.length > 0) {
                pageGroups.forEach((pageGroup) => {
                    if (pageGroup.sections.length === 1) {
                        // Single section per page
                        sectionMapping.push({ 
                            name: pageGroup.sections[0].title, 
                            startPage: currentPageIndex, 
                            endPage: currentPageIndex 
                        });
                    } else {
                        // Multiple sections per page
                        const sectionTitles = pageGroup.sections.map(s => s.title);
                        sectionMapping.push({ 
                            name: `${sectionTitles[0]} + ${sectionTitles.length - 1} more`, 
                            startPage: currentPageIndex, 
                            endPage: currentPageIndex 
                        });
                    }
                    currentPageIndex++;
                });
            } else if (report?.sections?.length > 0) {
                // Fallback to old pagination if pageGroups not available
                report.sections.forEach((section: any) => {
                    if (section.key !== 'report_details') {
                        sectionMapping.push({ 
                            name: section.title || section.name, 
                            startPage: currentPageIndex, 
                            endPage: currentPageIndex 
                        });
                        currentPageIndex++;
                    }
                });
            }

            // Inspector certification
            sectionMapping.push({ name: 'Inspector Certification', startPage: currentPageIndex, endPage: currentPageIndex });
            currentPageIndex++;

            // Standards of practice (only for home inspection reports)
            if (report?.reportType === 'home_inspection') {
                const standardsStartPage = currentPageIndex;
                const estimatedStandardsPages = 3; // Estimate based on content
                sectionMapping.push({ 
                    name: 'Standards of Practice', 
                    startPage: standardsStartPage, 
                    endPage: standardsStartPage + estimatedStandardsPages - 1
                });
                currentPageIndex += estimatedStandardsPages;
            }

            // Terms (if exists)
            if (pageNodes.length > currentPageIndex) {
                sectionMapping.push({ name: 'Terms & Conditions', startPage: pageNodes.length - 1, endPage: pageNodes.length - 1 });
            }

            setSections(sectionMapping);
        };

        // Initial capture
        capturePages();

        // Set up mutation observer to detect content changes
        const observer = new MutationObserver(() => {
            setTimeout(capturePages, 100); // Debounce updates
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });

        return () => observer.disconnect();
    }, [containerRef, report, pageGroups]);

    // Update active page from props
    React.useEffect(() => {
        if (typeof currentPage === 'number') {
            setActivePage(currentPage);
        }
    }, [currentPage]);

    React.useEffect(() => {
        if (pages.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = pages.indexOf(entry.target as HTMLElement);
                        if (index !== -1) {
                            setActivePage(index);
                            onPageChange?.(index);
                        }
                    }
                });
            },
            {threshold: 0.5, rootMargin: "-140px 0px 0px 0px"} // Account for topbar
        );

        pages.forEach((p) => observer.observe(p));
        return () => observer.disconnect();
    }, [pages, onPageChange]);

    const handleClick = (index: number) => {
        const page = pages[index];
        if (!page) return;
        
        // Calculate scroll position accounting for topbar (129px) and some padding
        const pageTop = page.offsetTop;
        const scrollOffset = pageTop - 140; // 129px topbar + 11px padding
        
        window.scrollTo({
            top: Math.max(0, scrollOffset),
            behavior: "smooth"
        });
        
        setActivePage(index);
        onPageChange?.(index);
    };

    const handleSectionChange = (sectionName: string) => {
        const section = sections.find(s => s.name === sectionName);
        if (section) {
            handleClick(section.startPage);
        }
    };

    return (
        <div className="w-80 ps-6 overflow-y-auto mt-[70px] h-screen fixed print:hidden border-r bg-background">
            <div className="flex flex-col gap-4 p-4">
                {/* Section Dropdown */}
                <div className="mb-2">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Jump to Section</label>
                    <Select onValueChange={handleSectionChange}>
                        <SelectTrigger className="w-full text-sm bg-background">
                            <SelectValue placeholder="Select section..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                            {sections.map((section) => (
                                <SelectItem key={section.name} value={section.name} className="text-sm">
                                    {section.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Pages Label */}
                <label className="text-sm font-medium text-muted-foreground">Page Thumbnails</label>
                
                 {/* Page Thumbnails */}
                <div className="flex flex-col gap-2">
                    {pages.map((page, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`border rounded w-full overflow-hidden transition-colors ${
                                activePage === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            }`}
                            aria-label={`Go to page ${i + 1}`}
                        >
                            {/* Enhanced thumbnail container with proper content fitting */}
                            <div className="w-full aspect-[85/110] relative overflow-hidden bg-white">
                                <div className="absolute inset-0">
                                    <ThumbnailContent page={page} />
                                </div>
                                {/* Page number overlay */}
                                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                                    {i + 1}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreviewThumbnailNav;