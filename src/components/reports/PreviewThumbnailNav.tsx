import React from "react";

interface PreviewThumbnailNavProps {
    containerRef: React.RefObject<HTMLElement>;
}

const PreviewThumbnailNav: React.FC<PreviewThumbnailNavProps> = ({containerRef}) => {
    const [pages, setPages] = React.useState<HTMLElement[]>([]);
    const [activePage, setActivePage] = React.useState(0);
    const [pageScales, setPageScales] = React.useState<number[]>([]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const pageNodes = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
        setPages(pageNodes);

        // Calculate scale factors for each page
        const scales = pageNodes.map(page => {
            const rect = page.getBoundingClientRect();
            const containerWidth = 240; // Thumbnail container width
            const containerHeight = containerWidth * 1.414; // A4 aspect ratio
            
            if (rect.width === 0 || rect.height === 0) return 0.15; // fallback
            
            const scaleX = containerWidth / rect.width;
            const scaleY = containerHeight / rect.height;
            
            // Use the smaller scale to ensure content fits within bounds
            return Math.min(scaleX, scaleY, 0.2); // Cap at 0.2 for readability
        });
        
        setPageScales(scales);
    }, [containerRef]);

    React.useEffect(() => {
        if (pages.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = pages.indexOf(entry.target as HTMLElement);
                        if (index !== -1) setActivePage(index);
                    }
                });
            },
            {threshold: 0.5, rootMargin: "-64px 0px 0px 0px"} // Account for topbar
        );

        pages.forEach((p) => observer.observe(p));
        return () => observer.disconnect();
    }, [pages]);

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
    };

    return (
        <div className="w-80 ps-6 overflow-y-auto mt-[70px] h-screen fixed print:hidden border-r bg-background">
            <div className="flex flex-col gap-2 p-2">
                {pages.map((page, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        className={`border rounded w-full overflow-hidden transition-colors ${
                            activePage === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                        aria-label={`Go to page ${i + 1}`}
                    >
                        {/* Dynamic scaling based on content dimensions */}
                        <div className="w-full aspect-[1/1.414] relative overflow-hidden bg-white">
                            <div 
                                className="absolute top-0 left-0 pointer-events-none will-change-transform"
                                style={{
                                    transform: `scale(${pageScales[i] || 0.15})`,
                                    transformOrigin: 'top left',
                                    width: `${100 / (pageScales[i] || 0.15)}%`,
                                    height: `${100 / (pageScales[i] || 0.15)}%`
                                }}
                            >
                                <div 
                                    dangerouslySetInnerHTML={{ __html: page.innerHTML }}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PreviewThumbnailNav;
