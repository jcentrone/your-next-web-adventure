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
  Palette,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // Initialize canvas and load image
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    setIsLoading(true);
    setError(null);
    setCanvasReady(false);

    console.log("🎨 Initializing canvas with image:", imageUrl);

    // Validate image URL first
    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:'))) {
      setError("Invalid image URL format");
      setIsLoading(false);
      return;
    }

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Set up drawing brush early
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 3;

    const loadImage = async () => {
      try {
        console.log("📸 Loading image from URL:", imageUrl);
        
        // Create image element for better error handling
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          imgElement.onload = resolve;
          imgElement.onerror = (e) => {
            console.error("Image load error:", e);
            reject(new Error("Failed to load image"));
          };
          imgElement.src = imageUrl;
        });

        console.log("✅ Image loaded successfully, creating Fabric image...");
        
        const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
        
        console.log("✅ Fabric image created:", { width: img.width, height: img.height });
        
        // Calculate scaling to fit canvas
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
          name: 'background-image'
        });
        
        canvas.add(img);
        canvas.sendObjectToBack(img);
        canvas.renderAll();

        console.log("✅ Image added to canvas");

        // Load initial annotations if provided
        if (initialAnnotations) {
          try {
            console.log("📝 Loading initial annotations...");
            const annotationsData = typeof initialAnnotations === 'string' 
              ? JSON.parse(initialAnnotations) 
              : initialAnnotations;
            
            await canvas.loadFromJSON(annotationsData);
            canvas.renderAll();
            console.log("✅ Annotations loaded successfully");
          } catch (annotationError) {
            console.error("❌ Failed to load annotations:", annotationError);
            toast.error("Failed to load existing annotations");
          }
        }

        // Initialize history with current state
        const initialState = JSON.stringify(canvas.toJSON());
        setHistory([initialState]);
        setHistoryIndex(0);
        setCanvasReady(true);
        toast.success("Image loaded and ready for annotation!");

      } catch (imageError) {
        console.error("❌ Failed to load image:", imageError);
        setError(`Failed to load image: ${imageError.message}`);
        toast.error("Failed to load image for annotation");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
    setFabricCanvas(canvas);

    return () => {
      console.log("🧹 Disposing canvas");
      canvas.dispose();
      setCanvasReady(false);
    };
  }, [isOpen, imageUrl]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const saveToHistory = () => {
    if (!fabricCanvas || !canvasReady) return;
    
    try {
      const state = JSON.stringify(fabricCanvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(state);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      console.log("💾 State saved to history, index:", newHistory.length - 1);
    } catch (error) {
      console.error("❌ Failed to save to history:", error);
    }
  };

  const undo = async () => {
    if (!fabricCanvas || !canvasReady || historyIndex <= 0) return;
    
    try {
      const newIndex = historyIndex - 1;
      const historyState = JSON.parse(history[newIndex]);
      await fabricCanvas.loadFromJSON(historyState);
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
      console.log("↩️ Undo to index:", newIndex);
    } catch (error) {
      console.error("❌ Failed to undo:", error);
      toast.error("Failed to undo");
    }
  };

  const redo = async () => {
    if (!fabricCanvas || !canvasReady || historyIndex >= history.length - 1) return;
    
    try {
      const newIndex = historyIndex + 1;
      const historyState = JSON.parse(history[newIndex]);
      await fabricCanvas.loadFromJSON(historyState);
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
      console.log("↪️ Redo to index:", newIndex);
    } catch (error) {
      console.error("❌ Failed to redo:", error);
      toast.error("Failed to redo");
    }
  };

  const handleToolClick = (tool: typeof activeTool) => {
    if (!fabricCanvas || !canvasReady) {
      toast.error("Canvas not ready yet");
      return;
    }

    setActiveTool(tool);
    console.log("🔧 Tool selected:", tool);

    // Clear any existing event handlers
    fabricCanvas.off("mouse:down");

    if (tool === "arrow") {
      // Create arrow on next click
      const handler = (e: any) => {
        const pointer = fabricCanvas.getPointer(e.e);
        const arrow = createArrow(pointer.x, pointer.y, pointer.x + 50, pointer.y - 50);
        fabricCanvas.add(arrow);
        fabricCanvas.off("mouse:down", handler);
        setActiveTool("select");
        saveToHistory();
        toast.success("Arrow added");
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
        toast.success("Text added");
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
      toast.success("Rectangle added");
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
      toast.success("Circle added");
    } else if (tool === "line") {
      const line = new Line([100, 100, 200, 100], {
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(line);
      setActiveTool("select");
      saveToHistory();
      toast.success("Line added");
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

  const handleSave = async () => {
    if (!fabricCanvas || !canvasReady) {
      toast.error("Canvas not ready for saving");
      return;
    }

    try {
      setIsLoading(true);
      console.log("💾 Saving annotations...");
      
      const annotations = JSON.stringify(fabricCanvas.toJSON());
      console.log("📝 Annotations data:", annotations);
      
      // Convert canvas to blob
      const canvas = fabricCanvas.toCanvasElement();
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("Failed to create image blob");
      }

      console.log("✅ Image blob created, size:", blob.size);
      toast.success("Annotations saved successfully!");
      onSave(annotations, blob);
      onClose();
    } catch (error) {
      console.error("❌ Failed to save annotations:", error);
      toast.error("Failed to save annotations");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full">
        <DialogHeader>
          <DialogTitle>Annotate Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* Loading/Error States */}
          {isLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Loading image for annotation...
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
            {!canvasReady && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Preparing canvas...</span>
              </div>
            )}
            <Button
              variant={activeTool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("select")}
              disabled={!canvasReady}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "arrow" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("arrow")}
              disabled={!canvasReady}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("text")}
              disabled={!canvasReady}
            >
              <Type className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("rectangle")}
              disabled={!canvasReady}
            >
              <Square className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("circle")}
              disabled={!canvasReady}
            >
              <Circle className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("line")}
              disabled={!canvasReady}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Button
              variant={activeTool === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("draw")}
              disabled={!canvasReady}
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
              disabled={!canvasReady || historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canvasReady || historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            
            <div className="flex-1" />
            
            <Button 
              onClick={handleSave}
              disabled={!canvasReady || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
          
          {/* Canvas */}
          <div className="border rounded-lg overflow-hidden bg-muted/30 relative">
            <canvas ref={canvasRef} className="max-w-full" />
            {!canvasReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading image...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};