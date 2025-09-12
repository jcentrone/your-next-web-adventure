import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas as FabricCanvas, FabricImage, Line, IText, Rect, Circle as FabricCircle, Group, PencilBrush } from "fabric";
import { useCanvasHistory } from "./useCanvasHistory";
import { toast } from "sonner";
import { useIsMobile } from "./use-mobile";

type ToolType = "select" | "arrow" | "text" | "rectangle" | "circle" | "line" | "draw";

interface UseAnnotationCanvasProps {
  imageUrl: string;
  existingAnnotations?: string;
  onCanvasReady?: (canvas: FabricCanvas) => void;
}

export const useAnnotationCanvas = ({ 
  imageUrl, 
  existingAnnotations,
  onCanvasReady 
}: UseAnnotationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState("#ef4444");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isMobile = useIsMobile();

  // Canvas history management
  const canvasHistory = useCanvasHistory({
    canvas: fabricCanvas,
    onBgFromJSON: () => {}, // We don't need background color changes
  });

  // Track changes
  useEffect(() => {
    if (!fabricCanvas || !canvasReady) return;

    const handleModified = () => {
      setHasUnsavedChanges(true);
      // Save to history after a short delay to avoid too many snapshots
      const timeoutId = setTimeout(() => {
        canvasHistory.snapshot();
      }, 500);

      return () => clearTimeout(timeoutId);
    };

    fabricCanvas.on('object:added', handleModified);
    fabricCanvas.on('object:modified', handleModified);
    fabricCanvas.on('object:removed', handleModified);
    fabricCanvas.on('path:created', handleModified);

    return () => {
      fabricCanvas.off('object:added', handleModified);
      fabricCanvas.off('object:modified', handleModified);
      fabricCanvas.off('object:removed', handleModified);
      fabricCanvas.off('path:created', handleModified);
    };
  }, [fabricCanvas, canvasReady, canvasHistory]);

  // Calculate responsive canvas dimensions
  const getCanvasDimensions = useCallback(() => {
    if (!isMobile) {
      return {
        width: Math.min(window.innerWidth - 80, 1200),
        height: Math.min(window.innerHeight - 300, 800)
      };
    }

    // Mobile dimensions - account for header, toolbar, and padding
    const headerHeight = 60; // Mobile header
    const toolbarHeight = 80; // Mobile toolbar with scroll
    const padding = 32; // Total padding
    const availableHeight = window.innerHeight - headerHeight - toolbarHeight - padding;
    const availableWidth = window.innerWidth - padding;

    return {
      width: Math.max(availableWidth, 300),
      height: Math.max(availableHeight, 200)
    };
  }, [isMobile]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    setIsLoading(true);
    setError(null);
    setCanvasReady(false);
    setHasUnsavedChanges(false);

    const dimensions = getCanvasDimensions();
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: "#ffffff",
      selection: true,
    });

    // Set up drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = isMobile ? 4 : 3; // Thicker for mobile

    const loadImage = async () => {
      try {
        let img: FabricImage | null = null;
        
        try {
          img = await FabricImage.fromURL(imageUrl, { 
            crossOrigin: 'anonymous'
          });
        } catch (fabricError) {
          // Fallback for CORS issues
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
        
        const maxWidth = dimensions.width - 40;
        const maxHeight = dimensions.height - 40;
        
        const scaleX = maxWidth / imgWidth;
        const scaleY = maxHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        const left = (dimensions.width - scaledWidth) / 2;
        const top = (dimensions.height - scaledHeight) / 2;

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

        // Load existing annotations
        if (existingAnnotations) {
          try {
            const annotationsData = JSON.parse(existingAnnotations);
            const backgroundImg = canvas.getObjects().find(obj => (obj as any).name === 'background-image');
            
            await canvas.loadFromJSON(annotationsData);
            
            if (backgroundImg) {
              canvas.add(backgroundImg);
              canvas.sendObjectToBack(backgroundImg);
            }
            
            canvas.renderAll();
          } catch (annotationError) {
            console.error("Failed to load annotations:", annotationError);
            toast.error("Failed to load existing annotations");
          }
        }

        canvas.renderAll();

        // Initialize history
        canvasHistory.snapshot();
        setCanvasReady(true);
        onCanvasReady?.(canvas);
        toast.success("Canvas ready!");

      } catch (imageError) {
        console.error("Failed to load image:", imageError);
        setError("Failed to load image. Please try again.");
        toast.error("Failed to load image");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
    setFabricCanvas(canvas);

    // Handle window resize
    const handleResize = () => {
      const newDimensions = getCanvasDimensions();
      canvas.setDimensions(newDimensions);
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      setCanvasReady(false);
    };
  }, [imageUrl, existingAnnotations, activeColor, isMobile, getCanvasDimensions, canvasHistory, onCanvasReady]);

  // Handle tool and color changes
  useEffect(() => {
    if (!fabricCanvas || !canvasReady) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = isMobile ? 4 : 3;
    }

    // Enable text editing on double click
    const handleDoubleClick = (e: any) => {
      const target = e.target;
      if (target && target.type === 'i-text') {
        const textObject = target as IText;
        textObject.enterEditing();
        textObject.selectAll();
      }
    };

    fabricCanvas.on('mouse:dblclick', handleDoubleClick);

    return () => {
      fabricCanvas.off('mouse:dblclick', handleDoubleClick);
    };
  }, [activeTool, activeColor, fabricCanvas, canvasReady, isMobile]);

  // Color change for selected objects
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

  const createArrow = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = isMobile ? 25 : 20;
    
    const line = new Line([x1, y1, x2, y2], {
      stroke: activeColor,
      strokeWidth: isMobile ? 3 : 2,
    });
    
    const arrowHead1 = new Line([
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6),
      x2,
      y2
    ], {
      stroke: activeColor,
      strokeWidth: isMobile ? 3 : 2,
    });
    
    const arrowHead2 = new Line([
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6),
      x2,
      y2
    ], {
      stroke: activeColor,
      strokeWidth: isMobile ? 3 : 2,
    });

    return new Group([line, arrowHead1, arrowHead2]);
  }, [activeColor, isMobile]);

  const handleToolClick = useCallback((tool: ToolType) => {
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
          fontSize: isMobile ? 18 : 16,
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
        toast.success("Text added");
      };
      fabricCanvas.on("mouse:down", handler);
    } else if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: isMobile ? 3 : 2,
        width: 100,
        height: 80,
      });
      fabricCanvas.add(rect);
      setActiveTool("select");
      toast.success("Rectangle added");
    } else if (tool === "circle") {
      const circle = new FabricCircle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: isMobile ? 3 : 2,
        radius: 50,
      });
      fabricCanvas.add(circle);
      setActiveTool("select");
      toast.success("Circle added");
    } else if (tool === "line") {
      const line = new Line([100, 100, 200, 100], {
        stroke: activeColor,
        strokeWidth: isMobile ? 3 : 2,
      });
      fabricCanvas.add(line);
      setActiveTool("select");
      toast.success("Line added");
    }
  }, [fabricCanvas, canvasReady, activeColor, createArrow, isMobile]);

  const getAnnotationsJson = useCallback(() => {
    if (!fabricCanvas || !canvasReady) return null;
    
    try {
      // Remove background image from annotations
      const objects = fabricCanvas.getObjects().filter(obj => (obj as any).name !== 'background-image');
      const tempCanvas = new FabricCanvas();
      objects.forEach(obj => tempCanvas.add(obj));
      
      return {
        json: JSON.stringify(tempCanvas.toJSON()),
        hasAnnotations: objects.length > 0
      };
    } catch (error) {
      console.error("Failed to get annotations:", error);
      return null;
    }
  }, [fabricCanvas, canvasReady]);

  const getCanvasBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!fabricCanvas || !canvasReady) {
        resolve(null);
        return;
      }

      fabricCanvas.toCanvasElement().toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });
  }, [fabricCanvas, canvasReady]);

  const resetUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  return {
    canvasRef,
    fabricCanvas,
    activeTool,
    activeColor,
    isLoading,
    error,
    canvasReady,
    hasUnsavedChanges,
    setActiveColor,
    handleToolClick,
    getAnnotationsJson,
    getCanvasBlob,
    resetUnsavedChanges,
    ...canvasHistory
  };
};