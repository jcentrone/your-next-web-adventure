import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/integrations/supabase/reportsApi";
import { getSignedUrlFromSupabaseUrl, isSupabaseUrl } from "@/integrations/supabase/storage";
import { useAnnotationCanvas } from "@/hooks/useAnnotationCanvas";
import { ResponsiveAnnotationHeader } from "@/components/annotation/ResponsiveAnnotationHeader";
import { AnnotationToolbar } from "@/components/annotation/AnnotationToolbar";

export default function ImageAnnotation() {
  const { reportId, findingId, mediaId } = useParams<{ 
    reportId: string; 
    findingId: string; 
    mediaId: string; 
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch report data
  const { data: report } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => reportsApi.dbGetReport(reportId!),
    enabled: !!reportId,
  });

  // Find the specific media item with improved error handling
  const mediaItem = useMemo(() => {
    if (!report || !findingId || !mediaId) return null;
    
    if (report.reportType === "home_inspection") {
      const homeReport = report as any;
      for (const section of homeReport.sections || []) {
        const finding = section.findings?.find((f: any) => f.id === findingId);
        if (finding) {
          const media = finding.media?.find((m: any) => m.id === mediaId);
          if (media) return media;
        }
      }
    }
    return null;
  }, [report, findingId, mediaId]);

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

  // Use the custom canvas hook
  const canvas = useAnnotationCanvas({
    imageUrl,
    existingAnnotations: mediaItem?.annotations,
  });

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

    // Set up drawing brush properly for Fabric.js v6
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 3;

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
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 3;
    }

    // Enable text editing on double click
    fabricCanvas.on('mouse:dblclick', (e) => {
      const target = e.target;
      if (target && target.type === 'i-text') {
        const textObject = target as IText;
        textObject.enterEditing();
        textObject.selectAll();
      }
    });

    return () => {
      fabricCanvas.off('mouse:dblclick');
    };
  }, [activeTool, activeColor, fabricCanvas]);

  // Handle color changes for selected objects
  useEffect(() => {
    if (!fabricCanvas || !canvasReady) return;

    const selectedObjects = fabricCanvas.getActiveObjects();
    if (selectedObjects.length > 0) {
    selectedObjects.forEach(obj => {
        if (obj.type === 'i-text') {
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
        const text = new IText("Double click to edit", {
          left: pointer.x,
          top: pointer.y,
          fill: activeColor,
          fontSize: 16,
          fontFamily: "Arial",
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        
        // Enter editing mode immediately
        setTimeout(() => {
          text.enterEditing();
          text.selectAll();
        }, 100);
        
        fabricCanvas.renderAll();
        fabricCanvas.off("mouse:down", handler);
        setActiveTool("select");
        saveToHistory();
        toast.success("Text added - currently editing");
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
    if (!canvas.canvasReady || !report || !findingId || !mediaId) {
      toast.error("Cannot save: missing required data");
      return;
    }

    setIsSaving(true);
    try {
      const annotationData = canvas.getAnnotationsJson();
      if (!annotationData) {
        toast.error("Failed to get annotation data");
        return;
      }

      // Update the media item
      const updatedReport = { ...report };
      if (updatedReport.reportType === "home_inspection") {
        const homeReport = updatedReport as any;
        for (const section of homeReport.sections || []) {
          const finding = section.findings.find((f: any) => f.id === findingId);
          if (finding) {
            const media = finding.media.find((m: any) => m.id === mediaId);
            if (media) {
              media.annotations = annotationData.json;
              media.isAnnotated = annotationData.hasAnnotations;
              break;
            }
          }
        }
      }

      await reportsApi.dbUpdateReport(updatedReport);
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      
      canvas.resetUnsavedChanges();
      toast.success("Annotations saved successfully!");
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

  const hasAnnotations = mediaItem?.annotations && mediaItem.annotations !== '{}';

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveAnnotationHeader
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        canSave={canvas.canvasReady}
        hasAnnotations={hasAnnotations}
        isModified={canvas.hasUnsavedChanges}
      />

      <AnnotationToolbar
        activeTool={canvas.activeTool}
        activeColor={canvas.activeColor}
        onToolClick={canvas.handleToolClick}
        onColorChange={canvas.setActiveColor}
        onUndo={canvas.undo}
        onRedo={canvas.redo}
        canUndo={canvas.canUndo}
        canRedo={canvas.canRedo}
        disabled={!canvas.canvasReady}
      />

      <div className="p-4">
        {canvas.error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{canvas.error}</AlertDescription>
          </Alert>
        )}

        <div className="relative flex justify-center">
          {canvas.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading image...</p>
              </div>
            </div>
          )}
          
          <div className="border rounded-lg shadow-lg overflow-hidden bg-white">
            <canvas ref={canvas.canvasRef} className="max-w-full touch-none" />
          </div>
        </div>
      </div>
    </div>
  );
}