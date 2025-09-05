import React from "react";
import html2canvas from "html2canvas";

interface PreviewThumbnailNavProps {
    containerRef: React.RefObject<HTMLElement>;
}

const PreviewThumbnailNav: React.FC<PreviewThumbnailNavProps> = ({containerRef}) => {
    const [thumbnails, setThumbnails] = React.useState<string[]>([]);
    const [pages, setPages] = React.useState<HTMLElement[]>([]);
    const [activePage, setActivePage] = React.useState(0);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const pageNodes = Array.from(container.querySelectorAll<HTMLElement>(".preview-page"));
        setPages(pageNodes);

        Promise.all(
            pageNodes.map((page) =>
                // Use lower scale but better options for capturing images
                html2canvas(page, {
                    scale: 0.3,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    ignoreElements: (element) => {
                        return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
                    }
                }).then((canvas) => canvas.toDataURL("image/png"))
            )
        ).then(setThumbnails);
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
        <div className="w-64 overflow-y-auto mt-[70px] h-screen fixed print:hidden border-r">
            <div className="flex flex-col gap-2 p-2">
                {thumbnails.map((src, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        className={`border rounded w-full overflow-hidden ${activePage === i ? "border-primary" : "border-transparent"}`}
                        aria-label={`Go to page ${i + 1}`}
                    >
                        {/* Make a predictable box; A-series portrait ≈ 1 : 1.414 */}
                        <div className="w-full aspect-[1/1.414]">
                            <img
                                src={src}
                                alt={`Page ${i + 1}`}
                                className="block w-full h-full object-contain"
                                draggable={false}
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PreviewThumbnailNav;
