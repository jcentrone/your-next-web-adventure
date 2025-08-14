import React, { useState, useRef, useEffect } from "react";
import { Canvas as FabricCanvas, FabricImage, Line, FabricText, Rect, Circle as FabricCircle, Group } from "fabric";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MousePointer, 
  ArrowUpRight, 
  Type, 
  Square, 
  Circle, 
  Minus, 
  Pencil, 
  Undo, 
  Redo, 
  Save,
  Palette
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ImageAnnotatorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialAnnotations?: string;
  onSave: (annotations: string, imageBlob: Blob) => void;
}

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#000000", // black
  "#ffffff", // white
];

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  isOpen,
  onClose,
  imageUrl,
  initialAnnotations,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "arrow" | "text" | "rectangle" | "circle" | "line" | "draw">("select");
  const [activeColor, setActiveColor] = useState("#ef4444");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Load image
    FabricImage.fromURL(imageUrl).then((img) => {
      const canvasAspect = canvas.width! / canvas.height!;
      const imageAspect = img.width! / img.height!;
      
      let scale;
      if (imageAspect > canvasAspect) {
        scale = canvas.width! / img.width!;
      } else {
        scale = canvas.height! / img.height!;
      }
      
      img.scale(scale);
      img.set({
        left: (canvas.width! - img.getScaledWidth()) / 2,
        top: (canvas.height! - img.getScaledHeight()) / 2,
        selectable: false,
        evented: false,
      });
      
      canvas.add(img);
      canvas.sendObjectToBack(img);
      canvas.renderAll();
    });

    // Load initial annotations if provided
    if (initialAnnotations) {
      try {
        canvas.loadFromJSON(initialAnnotations, () => {
          canvas.renderAll();
        });
      } catch (error) {
        console.error("Failed to load annotations:", error);
      }
    }

    // Set up drawing brush
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 3;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [isOpen, imageUrl, initialAnnotations]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const saveToHistory = () => {
    if (!fabricCanvas) return;
    
    const state = JSON.stringify(fabricCanvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (!fabricCanvas || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    fabricCanvas.loadFromJSON(history[newIndex], () => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const redo = () => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    fabricCanvas.loadFromJSON(history[newIndex], () => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "arrow") {
      // Create arrow on next click
      const handler = (e: any) => {
        const pointer = fabricCanvas.getPointer(e.e);
        const arrow = createArrow(pointer.x, pointer.y, pointer.x + 50, pointer.y - 50);
        fabricCanvas.add(arrow);
        fabricCanvas.off("mouse:down", handler);
        setActiveTool("select");
        saveToHistory();
      };
      fabricCanvas.on("mouse:down", handler);
    } else if (tool === "text") {
      const handler = (e: any) => {
        const pointer = fabricCanvas.getPointer(e.e);
        const text = new FabricText("Click to edit", {
          left: pointer.x,
          top: pointer.y,
          fill: activeColor,
          fontSize: 16,
          fontFamily: "Arial",
        });
        fabricCanvas.add(text);
        fabricCanvas.off("mouse:down", handler);
        setActiveTool("select");
        saveToHistory();
      };
      fabricCanvas.on("mouse:down", handler);
    } else if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 2,
        width: 100,
        height: 80,
      });
      fabricCanvas.add(rect);
      setActiveTool("select");
      saveToHistory();
    } else if (tool === "circle") {
      const circle = new FabricCircle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 2,
        radius: 50,
      });
      fabricCanvas.add(circle);
      setActiveTool("select");
      saveToHistory();
    } else if (tool === "line") {
      const line = new Line([100, 100, 200, 100], {
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(line);
      setActiveTool("select");
      saveToHistory();
    }
  };

  const createArrow = (x1: number, y1: number, x2: number, y2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 20;
    
    const line = new Line([x1, y1, x2, y2], {
      stroke: activeColor,
      strokeWidth: 2,
    });
    
    const arrowHead1 = new Line([
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6),
      x2,
      y2
    ], {
      stroke: activeColor,
      strokeWidth: 2,
    });
    
    const arrowHead2 = new Line([
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6),
      x2,
      y2
    ], {
      stroke: activeColor,
      strokeWidth: 2,
    });
    
    return new Group([line, arrowHead1, arrowHead2]);
  };

  const handleSave = () => {
    if (!fabricCanvas) return;

    const annotations = JSON.stringify(fabricCanvas.toJSON());
    
    fabricCanvas.toCanvasElement().toBlob((blob) => {
      if (blob) {
        onSave(annotations, blob);
        onClose();
      }
    }, "image/jpeg", 0.8);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full">
        <DialogHeader>
          <DialogTitle>Annotate Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
            <Button
              variant={activeTool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("select")}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "arrow" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("arrow")}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("text")}
            >
              <Type className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("rectangle")}
            >
              <Square className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("circle")}
            >
              <Circle className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("line")}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("draw")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-px bg-border mx-2" />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Palette className="h-4 w-4 mr-2" />
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: activeColor }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-3 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded border-2 ${
                        activeColor === color ? "border-foreground" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setActiveColor(color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="h-6 w-px bg-border mx-2" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            
            <div className="flex-1" />
            
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          
          {/* Canvas */}
          <div className="border rounded-lg overflow-hidden bg-muted/30">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};