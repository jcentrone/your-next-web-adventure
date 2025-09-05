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
            {threshold: 0.5}
        );

        pages.forEach((p) => observer.observe(p));
        return () => observer.disconnect();
    }, [pages]);

    const handleClick = (index: number) => {
        pages[index]?.scrollIntoView({behavior: "smooth"});
    };

    return (
        <div className="w-64 overflow-y-auto mt-[70px] h-screen fixed print:hidden border-r bg-background">
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
                        {/* Make a predictable box; A-series portrait ≈ 1 : 1.414 */}
                        <div className="w-full aspect-[1/1.414] relative overflow-hidden">
                            <div 
                                className="absolute top-0 left-0 pointer-events-none will-change-transform"
                                style={{
                                    transform: 'scale(0.15)',
                                    transformOrigin: 'top left',
                                    width: `${100 / 0.15}%`,
                                    height: `${100 / 0.15}%`
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
