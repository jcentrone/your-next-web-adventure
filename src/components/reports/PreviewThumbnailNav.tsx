import React from "react";

interface PreviewThumbnailNavProps {
    containerRef: React.RefObject<HTMLElement>;
}

const PreviewThumbnailNav: React.FC<PreviewThumbnailNavProps> = ({containerRef}) => {
    const [pages, setPages] = React.useState<HTMLElement[]>([]);
    const [activePage, setActivePage] = React.useState(0);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const pageNodes = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
        setPages(pageNodes);
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
                        {/* Letter size aspect ratio (8.5:11 = 0.773:1) with fixed scaling */}
                        <div className="w-full aspect-[85/110] relative overflow-hidden bg-white">
                            <div 
                                className="absolute top-0 left-0 pointer-events-none will-change-transform"
                                style={{
                                    transform: 'scale(0.39)',
                                    transformOrigin: 'top left',
                                    width: '256.41%', // 100 / 0.39
                                    height: '256.41%'  // 100 / 0.39
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
