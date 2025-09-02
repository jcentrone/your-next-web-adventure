import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas as FabricCanvas, FabricImage, Line, FabricText, Rect, Circle as FabricCircle, Group } from "fabric";
import { Button } from "@/components/ui/button";
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
  AlertTriangle,
  ArrowLeft,
  X
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/integrations/supabase/reportsApi";
import { uploadFindingFiles, getSignedUrlFromSupabaseUrl, isSupabaseUrl } from "@/integrations/supabase/storage";

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

export default function ImageAnnotation() {
  const { reportId, findingId, mediaId } = useParams<{ 
    reportId: string; 
    findingId: string; 
    mediaId: string; 
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "arrow" | "text" | "rectangle" | "circle" | "line" | "draw">("select");
  const [activeColor, setActiveColor] = useState("#ef4444");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // Fetch report data
  const { data: report } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => reportsApi.dbGetReport(reportId!),
    enabled: !!reportId,
  });

  // Find the specific media item
  const mediaItem = React.useMemo(() => {
    console.log("ImageAnnotation - Looking for media item:", { 
      reportId, 
      findingId, 
      mediaId, 
      reportType: report?.reportType,
      sectionsCount: report?.reportType === "home_inspection" ? (report as any).sections?.length || 0 : 0
    });
    
    if (!report || !findingId || !mediaId) {
      console.log("ImageAnnotation - Missing required parameters:", { report: !!report, findingId, mediaId });
      return null;
    }
    
    // Support both home_inspection and wind_mitigation reports
    if (report.reportType === "home_inspection") {
      const homeReport = report as any;
      for (const section of homeReport.sections || []) {
        console.log("ImageAnnotation - Checking section:", section.key, "with", section.findings?.length || 0, "findings");
        const finding = section.findings.find(f => f.id === findingId);
        if (finding) {
          console.log("ImageAnnotation - Found finding:", finding.id, "with", finding.media?.length || 0, "media items");
          const media = finding.media.find(m => m.id === mediaId);
          if (media) {
            console.log("ImageAnnotation - Found media item:", media.id, media.url);
            return media;
          }
        }
      }
    } else if (report.reportType === "wind_mitigation") {
      // Handle wind mitigation reports - they might have media in different structure
      console.log("ImageAnnotation - Wind mitigation report detected, checking media structure");
      // For now, return null but log that we need to handle this case
      console.log("ImageAnnotation - Wind mitigation media annotation not yet supported");
    }
    
    console.log("ImageAnnotation - Media item not found in any section");
    return null;
  }, [report, findingId, mediaId, reportId]);

  // Get signed URL for the image
  const [imageUrl, setImageUrl] = useState<string>("");
  
  useEffect(() => {
    if (!mediaItem?.url) return;
    
    const getImageUrl = async () => {
      try {
        if (isSupabaseUrl(mediaItem.url)) {
          const signedUrl = await getSignedUrlFromSupabaseUrl(mediaItem.url);
          setImageUrl(signedUrl);
        } else {
          setImageUrl(mediaItem.url);
        }
      } catch (error) {
        console.error("Error getting signed URL:", error);
        toast.error("Failed to load image");
      }
    };
    
    getImageUrl();
  }, [mediaItem?.url]);

  // Initialize canvas and load image
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    setIsLoading(true);
    setError(null);
    setCanvasReady(false);

    // Create canvas with responsive sizing
    const containerWidth = Math.min(window.innerWidth - 40, 1200);
    const containerHeight = Math.min(window.innerHeight - 200, 800);
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: "#ffffff",
      selection: true,
    });

    // Set up drawing brush - check if it exists first
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = 3;
    }

    const loadImage = async () => {
      try {
        let img: FabricImage | null = null;
        
        try {
          img = await FabricImage.fromURL(imageUrl, { 
            crossOrigin: 'anonymous'
          });
        } catch (fabricError) {
          // Fallback to Image element then Fabric
          const imgElement = new Image();
          imgElement.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            imgElement.onload = () => resolve(null);
            imgElement.onerror = reject;
            imgElement.src = imageUrl;
          });

          img = await FabricImage.fromElement(imgElement);
        }

        if (!img) {
          throw new Error("Failed to create Fabric image object");
        }

        // Calculate scaling to fit canvas while maintaining aspect ratio
        const imgWidth = img.width || 1;
        const imgHeight = img.height || 1;
        
        const maxWidth = containerWidth - 40;
        const maxHeight = containerHeight - 40;
        
        const scaleX = maxWidth / imgWidth;
        const scaleY = maxHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        const left = (containerWidth - scaledWidth) / 2;
        const top = (containerHeight - scaledHeight) / 2;

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
        canvas.renderAll();

        // Load existing annotations if available
        if (mediaItem?.annotations) {
          try {
            const annotationsData = JSON.parse(mediaItem.annotations);
            const backgroundImg = canvas.getObjects().find(obj => (obj as any).name === 'background-image');
            
            await canvas.loadFromJSON(annotationsData);
            
            if (backgroundImg) {
              canvas.add(backgroundImg);
              canvas.sendObjectToBack(backgroundImg);
            }
            
            canvas.renderAll();
          } catch (annotationError) {
            console.error("Failed to load annotations:", annotationError);
          }
        }

        // Initialize history
        const initialState = JSON.stringify(canvas.toJSON());
        setHistory([initialState]);
        setHistoryIndex(0);
        setCanvasReady(true);
        toast.success("Image loaded and ready for annotation!");

      } catch (imageError) {
        console.error("Failed to load image:", imageError);
        setError("Failed to load image");
        toast.error("Failed to load image");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
      setCanvasReady(false);
    };
  }, [imageUrl, mediaItem?.annotations]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  // Handle color changes for selected objects
  useEffect(() => {
    if (!fabricCanvas || !canvasReady) return;

    const selectedObjects = fabricCanvas.getActiveObjects();
    if (selectedObjects.length > 0) {
      selectedObjects.forEach(obj => {
        if (obj.type === 'textbox' || obj.type === 'i-text') {
          obj.set('fill', activeColor);
        } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'line' || obj.type === 'group') {
          obj.set('stroke', activeColor);
        }
      });
      fabricCanvas.renderAll();
    }
  }, [activeColor, fabricCanvas, canvasReady]);

  const saveToHistory = () => {
    if (!fabricCanvas || !canvasReady) return;
    
    try {
      const state = JSON.stringify(fabricCanvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(state);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.error("Failed to save to history:", error);
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
    } catch (error) {
      console.error("Failed to undo:", error);
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
    } catch (error) {
      console.error("Failed to redo:", error);
      toast.error("Failed to redo");
    }
  };

  const handleToolClick = (tool: typeof activeTool) => {
    if (!fabricCanvas || !canvasReady) {
      toast.error("Canvas not ready yet");
      return;
    }

    setActiveTool(tool);

    // Clear any existing event handlers
    fabricCanvas.off("mouse:down");

    if (tool === "arrow") {
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
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
        fabricCanvas.off("mouse:down", handler);
        setActiveTool("select");
        saveToHistory();
        toast.success("Text added - double click to edit");
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
    if (!fabricCanvas || !canvasReady || !report || !findingId || !mediaId) {
      toast.error("Cannot save: missing required data");
      return;
    }

    setIsSaving(true);
    try {
      // Remove background image from annotations
      const objects = fabricCanvas.getObjects().filter(obj => (obj as any).name !== 'background-image');
      const tempCanvas = new FabricCanvas();
      objects.forEach(obj => tempCanvas.add(obj));
      
      const annotations = JSON.stringify(tempCanvas.toJSON());
      
      // Create annotated image blob
      const blob = await new Promise<Blob>((resolve) => {
        fabricCanvas.toCanvasElement().toBlob((blob) => {
          resolve(blob!);
        }, 'image/png', 1.0);
      });

      // Update the media item
      const updatedReport = { ...report };
      if (updatedReport.reportType === "home_inspection") {
        const homeReport = updatedReport as any;
        for (const section of homeReport.sections || []) {
          const finding = section.findings.find(f => f.id === findingId);
          if (finding) {
            const media = finding.media.find(m => m.id === mediaId);
            if (media) {
              media.annotations = annotations;
              media.isAnnotated = true;
              break;
            }
          }
        }
      }

      // Save to database
      await reportsApi.dbUpdateReport(updatedReport);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      
      toast.success("Annotations saved successfully!");
      
      // Navigate back to report editor
      navigate(`/reports/${reportId}`);
      
    } catch (error) {
      console.error("Failed to save annotations:", error);
      toast.error("Failed to save annotations");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/reports/${reportId}`);
  };

  if (!reportId || !findingId || !mediaId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Invalid annotation parameters</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!mediaItem) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Media item not found</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Report ID: {reportId}</p>
                <p>Finding ID: {findingId}</p>
                <p>Media ID: {mediaId}</p>
                <p>Report Type: {report?.reportType || 'Unknown'}</p>
                <p>Sections: {report?.reportType === "home_inspection" ? (report as any).sections?.length || 0 : 0}</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Report
            </Button>
            <h1 className="text-lg font-semibold">Annotate Image</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canvasReady || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Annotations
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tool buttons */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={activeTool === "select" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTool("select")}
              disabled={!canvasReady}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "draw" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTool("draw")}
              disabled={!canvasReady}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "arrow" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolClick("arrow")}
              disabled={!canvasReady}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "text" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolClick("text")}
              disabled={!canvasReady}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "rectangle" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolClick("rectangle")}
              disabled={!canvasReady}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "circle" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolClick("circle")}
              disabled={!canvasReady}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolClick("line")}
              disabled={!canvasReady}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          {/* Color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" disabled={!canvasReady}>
                <Palette className="h-4 w-4" />
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: activeColor }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-3 gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded border-2 ${
                      activeColor === color ? "border-primary" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setActiveColor(color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canvasReady || historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canvasReady || historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="p-4">
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative flex justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading image...</p>
              </div>
            </div>
          )}
          
          <div className="border rounded-lg shadow-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}