import React, { useRef, useEffect } from "react";
import { Canvas as FabricCanvas } from "fabric";

interface CanvasWorkspaceProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: FabricCanvas | null;
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
}

export function CanvasWorkspace({
  canvasRef,
  canvas,
  zoom,
  showGrid,
  showRulers,
}: CanvasWorkspaceProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvas) return;
    
    // Apply zoom
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [canvas, zoom]);

  return (
    <div className="flex-1 relative bg-muted/50 overflow-auto">
      <div className="relative p-8">
        {/* Rulers */}
        {showRulers && (
          <>
            {/* Horizontal Ruler */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-200 border-b border-gray-300 z-20 pointer-events-none">
              <div className="relative h-full">
                {Array.from({ length: 41 }, (_, i) => i * 20).map((mark) => (
                  <div
                    key={mark}
                    className="absolute top-0 h-full border-l border-gray-300/50"
                    style={{ left: `${mark * zoom}px` }}
                  >
                    {mark % 100 === 0 && (
                      <span className="absolute top-1 left-1 text-xs text-gray-500">
                        {mark}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Ruler */}
            <div className="absolute top-0 left-0 bottom-0 w-8 bg-gray-200 border-r border-gray-300 z-20 pointer-events-none">
              <div className="relative w-full h-full">
                {Array.from({ length: 51 }, (_, i) => i * 20).map((mark) => (
                  <div
                    key={mark}
                    className="absolute left-0 w-full border-t border-gray-300/50"
                    style={{ top: `${mark * zoom}px` }}
                  >
                    {mark % 100 === 0 && (
                      <span className="absolute top-1 left-1 text-xs text-gray-500 transform -rotate-90 origin-top-left">
                        {mark}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Corner */}
            <div className="absolute top-0 left-0 w-8 h-8 bg-gray-200 border-r border-b border-gray-300 z-20 pointer-events-none" />
          </>
        )}

        {/* Canvas Container */}
        <div
          ref={workspaceRef}
          className="flex items-center justify-center min-h-full p-8"
        >
          <div className="relative">
            {/* Grid Background */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                  backgroundImage:
                    "linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)," +
                    "linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)",
                }}
              />
            )}

            {/* Canvas */}
            <div className="relative bg-white shadow-lg">
              <canvas ref={canvasRef} />
            </div>

            {/* Canvas Info */}
            <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
              800 × 1000px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}