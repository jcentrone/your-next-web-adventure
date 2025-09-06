import { useEffect, useState, RefObject } from 'react';

interface UseDynamicSidebarHeightProps {
  containerRef: RefObject<HTMLElement>;
  baseHeight: string;
  topOffset: number;
}

export const useDynamicSidebarHeight = ({
  containerRef,
  baseHeight,
  topOffset
}: UseDynamicSidebarHeightProps) => {
  const [sidebarHeight, setSidebarHeight] = useState(baseHeight);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Create an intersection observer to watch the bottom of the container
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const { intersectionRatio, boundingClientRect } = entry;
          
          // Calculate how much of the container's bottom is visible
          const viewportHeight = window.innerHeight;
          const containerBottom = boundingClientRect.bottom;
          
          // If the container bottom is approaching the viewport bottom
          if (containerBottom < viewportHeight) {
            // Calculate the overlap amount
            const availableSpace = viewportHeight - topOffset;
            const containerHeight = boundingClientRect.height;
            const visibleBottom = Math.max(0, viewportHeight - containerBottom);
            
            // Calculate proportional height reduction
            const reductionRatio = Math.min(visibleBottom / 200, 1); // 200px threshold for smooth transition
            const heightReduction = reductionRatio * 105; // Max 105px reduction
            
            setSidebarHeight(`calc(${baseHeight} - ${heightReduction}px)`);
          } else {
            // Reset to full height when container bottom is out of view
            setSidebarHeight(baseHeight);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
      }
    );

    // Observe the container
    observer.observe(container);

    // Also listen to scroll events for more responsive updates
    const handleScroll = () => {
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerBottom = rect.bottom;
      
      if (containerBottom < viewportHeight) {
        const visibleBottom = Math.max(0, viewportHeight - containerBottom);
        const reductionRatio = Math.min(visibleBottom / 200, 1);
        const heightReduction = reductionRatio * 105;
        
        setSidebarHeight(`calc(${baseHeight} - ${heightReduction}px)`);
      } else {
        setSidebarHeight(baseHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerRef, baseHeight, topOffset]);

  return sidebarHeight;
};