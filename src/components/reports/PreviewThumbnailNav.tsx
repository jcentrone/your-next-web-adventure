import React from "react";
import html2canvas from "html2canvas";

interface PreviewThumbnailNavProps {
  containerRef: React.RefObject<HTMLElement>;
}

const PreviewThumbnailNav: React.FC<PreviewThumbnailNavProps> = ({ containerRef }) => {
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
        html2canvas(page, { scale: 0.25 }).then((canvas) => canvas.toDataURL("image/png"))
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
            if (index !== -1) {
              setActivePage(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    pages.forEach((p) => observer.observe(p));
    return () => observer.disconnect();
  }, [pages]);

  const handleClick = (index: number) => {
    pages[index]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-24 overflow-y-auto h-screen sticky top-0 print:hidden">
      <div className="flex flex-col gap-2 p-2 items-center">
        {thumbnails.map((src, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`border rounded w-full ${activePage === i ? "border-primary" : "border-transparent"}`}
          >
            <img src={src} alt={`Page ${i + 1}`} className="thumbnail-image" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PreviewThumbnailNav;

