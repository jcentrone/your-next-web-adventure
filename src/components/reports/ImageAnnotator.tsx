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

    console.log("🎨 ImageAnnotator: Dialog opened, initializing canvas", { 
      imageUrl, 
      canvasElement: !!canvasRef.current,
      urlType: imageUrl?.startsWith('blob:') ? 'blob' : imageUrl?.includes('supabase') ? 'supabase' : 'other'
    });

    // Enhanced URL validation and preprocessing
    if (!imageUrl) {
      setError("No image URL provided");
      setIsLoading(false);
      return;
    }

    // Convert supabase:// URLs to proper signed URLs if needed
    let processedImageUrl = imageUrl;
    if (imageUrl.startsWith('supabase://')) {
      console.log("🔗 Converting supabase:// URL to signed URL:", imageUrl);
      try {
        // Extract the file path from supabase:// URL
        const filePath = imageUrl.replace('supabase://', '');
        // This should have been converted already by the component calling this
        setError("Image URL needs to be converted to signed URL before annotation");
        setIsLoading(false);
        return;
      } catch (err) {
        console.error("Failed to convert supabase URL:", err);
        setError("Failed to process image URL");
        setIsLoading(false);
        return;
      }
    }

    if (!processedImageUrl.startsWith('http') && !processedImageUrl.startsWith('blob:') && !processedImageUrl.startsWith('data:')) {
      setError("Invalid image URL format");
      setIsLoading(false);
      return;
    }

    // Create canvas with responsive sizing
    const containerWidth = Math.min(window.innerWidth * 0.85, 1200);
    const containerHeight = Math.min(window.innerHeight * 0.7, 800);
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: "#ffffff",
      selection: true,
    });

    console.log("🎨 Canvas created", { width: containerWidth, height: containerHeight });

    // Set up drawing brush early
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 3;

    const loadImage = async () => {
      try {
        console.log("🖼️ Starting comprehensive image loading process", { imageUrl });
        
        // First, test URL accessibility with detailed logging
        try {
          console.log("🔍 Testing image URL accessibility...");
          const testResponse = await fetch(imageUrl, { 
            method: 'HEAD',
            mode: 'cors'
          });
          console.log("✅ URL accessibility test successful", { 
            status: testResponse.status, 
            ok: testResponse.ok,
            contentType: testResponse.headers.get('content-type'),
            contentLength: testResponse.headers.get('content-length')
          });
        } catch (fetchError) {
          console.warn("⚠️ URL accessibility test failed (continuing anyway):", fetchError);
        }

        // Method 1: Try direct Fabric.js loading
        let img: FabricImage | null = null;
        try {
          console.log("🖼️ Attempting Fabric.js direct load...");
          img = await FabricImage.fromURL(imageUrl, { 
            crossOrigin: 'anonymous'
          });
          console.log("✅ Fabric.js direct load successful", {
            width: img.width,
            height: img.height,
            src: img.getSrc()
          });
        } catch (fabricError) {
          console.warn("⚠️ Fabric.js direct load failed:", fabricError);
          
          // Method 2: Fallback to Image element then Fabric
          try {
            console.log("🔄 Trying fallback method with Image element...");
            const imgElement = new Image();
            imgElement.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              imgElement.onload = () => {
                console.log("✅ Image element loaded successfully", {
                  width: imgElement.width,
                  height: imgElement.height,
                  naturalWidth: imgElement.naturalWidth,
                  naturalHeight: imgElement.naturalHeight
                });
                resolve(null);
              };
              imgElement.onerror = (e) => {
                console.error("❌ Image element failed to load:", e);
                reject(new Error("Image element failed to load"));
              };
              imgElement.src = imageUrl;
            });

            // Create Fabric image from loaded element
            img = await FabricImage.fromElement(imgElement);
            console.log("✅ Fabric image created from element", {
              width: img.width,
              height: img.height
            });
          } catch (elementError) {
            console.error("❌ Image element fallback also failed:", elementError);
            throw new Error(`All image loading methods failed. Original: ${fabricError.message}, Fallback: ${elementError.message}`);
          }
        }

        if (!img) {
          throw new Error("Failed to create Fabric image object");
        }

        console.log("🎯 Image loaded successfully, calculating dimensions", {
          originalWidth: img.width,
          originalHeight: img.height,
          canvasWidth: containerWidth,
          canvasHeight: containerHeight
        });

        // Calculate scaling to fit canvas while maintaining aspect ratio
        const imgWidth = img.width || 1;
        const imgHeight = img.height || 1;
        
        // Leave margin around the image
        const maxWidth = containerWidth - 40;
        const maxHeight = containerHeight - 40;
        
        const scaleX = maxWidth / imgWidth;
        const scaleY = maxHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        // Center the image
        const left = (containerWidth - scaledWidth) / 2;
        const top = (containerHeight - scaledHeight) / 2;

        console.log("📐 Image positioning calculated", {
          scale,
          scaledWidth,
          scaledHeight,
          left,
          top
        });

        img.set({
          left,
          top,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
          name: 'background-image'
        });

        canvas.add(img);
        canvas.sendObjectToBack(img);
        
        console.log("🎨 Image added to canvas, rendering...");
        canvas.renderAll();

        // Verify image is visible on canvas
        setTimeout(() => {
          const objects = canvas.getObjects();
          console.log("🔍 Canvas verification after render:", {
            totalObjects: objects.length,
            backgroundImage: objects.find(obj => (obj as any).name === 'background-image'),
            canvasSize: { width: canvas.width, height: canvas.height }
          });
          
          if (objects.length === 0) {
            console.error("❌ No objects found on canvas after image load");
            setError("Image was not properly added to canvas");
            return;
          }

          const bgImg = objects.find(obj => (obj as any).name === 'background-image');
          if (!bgImg) {
            console.error("❌ Background image not found on canvas");
            setError("Background image not found on canvas");
            return;
          }

          console.log("✅ Background image confirmed on canvas", {
            left: bgImg.left,
            top: bgImg.top,
            width: bgImg.getScaledWidth(),
            height: bgImg.getScaledHeight(),
            visible: bgImg.visible
          });
        }, 100);

        // Load initial annotations if provided
        if (initialAnnotations) {
          try {
            console.log("📝 Loading initial annotations...");
            const annotationsData = typeof initialAnnotations === 'string' 
              ? JSON.parse(initialAnnotations) 
              : initialAnnotations;
            
            // Save the background image reference
            const backgroundImg = canvas.getObjects().find(obj => (obj as any).name === 'background-image');
            
            // Load annotations
            await canvas.loadFromJSON(annotationsData);
            
            // Ensure background image is still there and at the back
            if (backgroundImg) {
              canvas.add(backgroundImg);
              canvas.sendObjectToBack(backgroundImg);
            }
            
            canvas.renderAll();
            console.log("✅ Initial annotations loaded successfully");
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
        console.log("🎉 Image annotation setup complete!");
        toast.success("Image loaded and ready for annotation!");

      } catch (imageError) {
        console.error("❌ Comprehensive image loading failed:", imageError);
        const errorMessage = imageError instanceof Error ? imageError.message : "Unknown error occurred";
        setError(`Failed to load image: ${errorMessage}`);
        toast.error(`Failed to load image: ${errorMessage}`);
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