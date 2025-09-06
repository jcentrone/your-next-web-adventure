import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageGroup } from "@/utils/paginationUtils";

// Enhanced thumbnail content component with dynamic scaling and content awareness
const ThumbnailContent: React.FC<{ page: HTMLElement; refreshKey?: string }> = ({ page, refreshKey }) => {
    const [content, setContent] = React.useState('');
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });

    // Measure actual container dimensions
    React.useEffect(() => {
        const updateContainerSize = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            // Only update if we have valid dimensions
            if (rect.width > 0 && rect.height > 0) {
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };

        // Use a slight delay to ensure the container is fully rendered
        const timer = setTimeout(updateContainerSize, 100);
        
        // Also update on resize
        const resizeObserver = new ResizeObserver(updateContainerSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        
        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
        };
    }, []);

    React.useEffect(() => {
        if (!page) return;
        
        // Get actual rendered dimensions of the page
        const rect = page.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });

        // Clone and prepare content with smart cropping
        const clonedPage = page.cloneNode(true) as HTMLElement;
        
        // Apply styling overrides with better content preservation
        const applyStyleOverrides = (element: HTMLElement) => {
            // Preserve original computed styles more comprehensively
            const computedStyle = window.getComputedStyle(element);
            
            // Enhanced background preservation
            const background = computedStyle.background;
            const backgroundColor = computedStyle.backgroundColor;
            const backgroundImage = computedStyle.backgroundImage;
            const backgroundGradient = computedStyle.background;
            
            if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
                element.style.background = background;
            }
            if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                element.style.backgroundColor = backgroundColor;
            }
            if (backgroundImage && backgroundImage !== 'none') {
                element.style.backgroundImage = backgroundImage;
            }
            
            // Conservative text alignment - only center if explicitly set
            const textAlign = computedStyle.textAlign;
            if (textAlign === 'center' || element.classList.contains('text-center')) {
                element.style.textAlign = 'center';
            } else if (textAlign === 'right' || element.classList.contains('text-right')) {
                element.style.textAlign = 'right';
            } else {
                element.style.textAlign = 'left';
            }
            
            // Color preservation
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
            
            // Preserve padding and margins for proper spacing
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

    // Calculate optimal scale based on actual container dimensions
    const getOptimalScale = () => {
        if (!dimensions.width || !dimensions.height) {
            return 0.3; // Fallback scale
        }
        
        // Use measured container dimensions, with fallback to aspect ratio calculation
        let containerWidth = containerSize.width;
        let containerHeight = containerSize.height;
        
        // If container size isn't measured yet, calculate from aspect ratio
        if (!containerWidth || !containerHeight) {
            // The container uses aspect-[85/110], so width:height = 85:110
            // Assume a reasonable width based on sidebar (around 240px)
            containerWidth = 240;
            containerHeight = (240 * 110) / 85; // ~310
        }
        
        const scaleX = containerWidth / dimensions.width;
        const scaleY = containerHeight / dimensions.height;
        
        // Use the smaller scale to ensure content fits without overflow
        return Math.min(scaleX, scaleY, 0.4); // Cap for readability
    };

    const scale = getOptimalScale();

    return (
        <div 
            ref={containerRef}
            className="bg-white w-full h-full overflow-hidden relative"
        >
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
    
    // Create composite refresh key for template changes
    const refreshKey = React.useMemo(() => {
        return `${report?.previewTemplate || ''}-${report?.coverTemplate || ''}-${report?.colorScheme || ''}-${JSON.stringify(report?.customColors || {})}`;
    }, [report?.previewTemplate, report?.coverTemplate, report?.colorScheme, report?.customColors]);

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
    }, [containerRef, report, pageGroups, refreshKey]);

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
        <div className="w-80 ps-6 overflow-hidden top-[129px] h-[calc(100vh-129px-80px)] fixed left-0 print:hidden border-r bg-background flex flex-col">
            {/* Fixed header with section dropdown and label */}
            <div className="sticky top-0 bg-background z-10 p-4 border-b border-border">
                {/* Section Dropdown */}
                <div className="mb-4">
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
            </div>

            {/* Scrollable thumbnails area */}
            <div className="flex-1 overflow-y-auto p-4 pt-2">
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
                                    <ThumbnailContent key={`${i}-${refreshKey}`} page={page} refreshKey={refreshKey} />
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