import React, { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnnotationToolbar } from "@/components/annotation/AnnotationToolbar";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import Konva from "konva";
import useImage from "use-image";

interface KonvaAnnotatorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialAnnotations?: string;
  onSave: (annotations: string, imageBlob: Blob) => void;
}

const TOOL_TYPES = ["select", "arrow", "text", "rectangle", "circle", "line", "draw"] as const;
type ToolType = typeof TOOL_TYPES[number];

export const KonvaAnnotator: React.FC<KonvaAnnotatorProps> = ({
  isOpen,
  onClose,
  imageUrl,
  initialAnnotations,
  onSave,
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const [image] = useImage(imageUrl);
  const [stageSize, setStageSize] = useState({ width: 500, height: 300 });
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState("#ef4444");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawLine, setDrawLine] = useState<Konva.Line | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<(Konva.Group | Konva.Shape)[]>([]);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [editingTextNode, setEditingTextNode] = useState<Konva.Text | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  // Adjust stage size to image with smaller max size
  useEffect(() => {
    if (image) {
      const MAX_WIDTH = 500;
      const MAX_HEIGHT = 300;
      
      let { width, height } = image;
      
      // Scale down if image is too large
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, MAX_WIDTH);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, MAX_HEIGHT);
          width = height * aspectRatio;
        }
      }
      
      setStageSize({ width, height });
    }
  }, [image]);

  // Calculate image scale for display
  const imageScale = image ? {
    x: stageSize.width / image.width,
    y: stageSize.height / image.height
  } : { x: 1, y: 1 };

  // Load initial annotations
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.destroyChildren();
      if (initialAnnotations) {
        try {
          Konva.Node.create(initialAnnotations, layerRef.current);
        } catch (err) {
          console.warn("Failed to load annotations", err);
        }
      }
      layerRef.current.draw();
      saveHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAnnotations, isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Delete' && selectedObjects.length > 0) {
        selectedObjects.forEach(node => node.destroy());
        setSelectedObjects([]);
        transformerRef.current?.nodes([]);
        layerRef.current?.batchDraw();
        saveHistory();
      }
      
      if (e.key === 'Escape') {
        setSelectedObjects([]);
        transformerRef.current?.nodes([]);
        setActiveTool("select");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedObjects]);

  const saveHistory = useCallback(() => {
    if (!layerRef.current) return;
    const json = layerRef.current.toJSON();
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(json);
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex <= 0 || !layerRef.current) return;
    const prev = history[historyIndex - 1];
    layerRef.current.destroyChildren();
    Konva.Node.create(prev, layerRef.current);
    layerRef.current.draw();
    setSelectedObjects([]);
    transformerRef.current?.nodes([]);
    setHistoryIndex(historyIndex - 1);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !layerRef.current) return;
    const next = history[historyIndex + 1];
    layerRef.current.destroyChildren();
    Konva.Node.create(next, layerRef.current);
    layerRef.current.draw();
    setSelectedObjects([]);
    transformerRef.current?.nodes([]);
    setHistoryIndex(historyIndex + 1);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicking on stage background, deselect all
    if (e.target === e.target.getStage()) {
      setSelectedObjects([]);
      transformerRef.current?.nodes([]);
    }
  };

  const handleObjectClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === "select") {
      const node = e.target as Konva.Group | Konva.Shape;
      
      // Double click on text to edit
      if (node instanceof Konva.Text && e.evt.detail === 2) {
        setEditingTextNode(node);
        setEditingText(node.text());
        setIsTextEditing(true);
        return;
      }
      
      // Single click to select
      const isSelected = selectedObjects.includes(node);
      if (e.evt.ctrlKey || e.evt.metaKey) {
        // Multi-select
        if (isSelected) {
          const newSelection = selectedObjects.filter(obj => obj !== node);
          setSelectedObjects(newSelection);
          transformerRef.current?.nodes(newSelection);
        } else {
          const newSelection = [...selectedObjects, node];
          setSelectedObjects(newSelection);
          transformerRef.current?.nodes(newSelection);
        }
      } else {
        // Single select
        setSelectedObjects([node]);
        transformerRef.current?.nodes([node]);
      }
      e.cancelBubble = true;
    }
  };

  const createAnnotationShape = (type: ToolType, startPos: { x: number; y: number }, endPos: { x: number; y: number }) => {
    if (!layerRef.current) return null;

    let shape: Konva.Shape | null = null;

    switch (type) {
      case "arrow":
        shape = new Konva.Arrow({
          points: [startPos.x, startPos.y, endPos.x, endPos.y],
          stroke: activeColor,
          fill: activeColor,
          strokeWidth: 3,
          draggable: true,
        });
        break;
      case "line":
        shape = new Konva.Line({
          points: [startPos.x, startPos.y, endPos.x, endPos.y],
          stroke: activeColor,
          strokeWidth: 3,
          draggable: true,
        });
        break;
      case "rectangle":
        shape = new Konva.Rect({
          x: Math.min(startPos.x, endPos.x),
          y: Math.min(startPos.y, endPos.y),
          width: Math.abs(endPos.x - startPos.x),
          height: Math.abs(endPos.y - startPos.y),
          stroke: activeColor,
          strokeWidth: 3,
          draggable: true,
        });
        break;
      case "circle":
        shape = new Konva.Circle({
          x: startPos.x,
          y: startPos.y,
          radius: Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y),
          stroke: activeColor,
          strokeWidth: 3,
          draggable: true,
        });
        break;
      case "text":
        shape = new Konva.Text({
          x: endPos.x,
          y: endPos.y,
          text: "Double-click to edit",
          fill: activeColor,
          fontSize: 24,
          draggable: true,
        });
        break;
    }

    if (shape) {
      shape.on('click', handleObjectClick);
      layerRef.current.add(shape);
      return shape;
    }

    return null;
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === "select") return;
    
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos || !layerRef.current) return;
    startPoint.current = pos;

    if (activeTool === "draw") {
      setIsDrawing(true);
      const line = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: activeColor,
        strokeWidth: 3,
        lineCap: "round",
        lineJoin: "round",
        globalCompositeOperation: "source-over",
        draggable: true,
      });
      line.on('click', handleObjectClick);
      layerRef.current.add(line);
      setDrawLine(line);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || activeTool !== "draw" || !drawLine) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;
    const newPoints = drawLine.points().concat([point.x, point.y]);
    drawLine.points(newPoints);
    layerRef.current?.batchDraw();
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!startPoint.current || !layerRef.current) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (activeTool === "draw") {
      setIsDrawing(false);
      setDrawLine(null);
      saveHistory();
      startPoint.current = null;
      // Auto-switch back to select tool after drawing
      setActiveTool("select");
      return;
    }

    if (activeTool !== "select") {
      const shape = createAnnotationShape(activeTool, startPoint.current, pos);
      if (shape) {
        layerRef.current.draw();
        saveHistory();
        // Auto-switch back to select tool after placing annotation
        setActiveTool("select");
      }
    }

    startPoint.current = null;
  };

  const handleTextEdit = () => {
    if (editingTextNode && editingText.trim()) {
      editingTextNode.text(editingText);
      layerRef.current?.batchDraw();
      saveHistory();
    }
    setIsTextEditing(false);
    setEditingTextNode(null);
    setEditingText("");
  };

  const handleBringToFront = () => {
    selectedObjects.forEach(node => node.moveToTop());
    layerRef.current?.batchDraw();
    saveHistory();
  };

  const handleSendToBack = () => {
    selectedObjects.forEach(node => node.moveToBottom());
    layerRef.current?.batchDraw();
    saveHistory();
  };

  const getCursor = () => {
    switch (activeTool) {
      case "select":
        return "default";
      case "draw":
        return "crosshair";
      case "text":
        return "text";
      case "arrow":
      case "line":
      case "rectangle":
      case "circle":
        return "crosshair";
      default:
        return "default";
    }
  };

  const handleSave = async () => {
    if (!stageRef.current || !layerRef.current) return;
    const annotations = layerRef.current.toJSON();
    const dataUrl = stageRef.current.toDataURL({ mimeType: "image/png" });
    const blob = await (await fetch(dataUrl)).blob();
    onSave(annotations, blob);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>Annotate Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <AnnotationToolbar
            activeTool={activeTool}
            activeColor={activeColor}
            onToolClick={(tool) => setActiveTool(tool as ToolType)}
            onColorChange={setActiveColor}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
          
          {selectedObjects.length > 0 && (
            <div className="flex gap-2 p-2 bg-muted rounded">
              <Button size="sm" variant="outline" onClick={handleBringToFront}>
                Bring to Front
              </Button>
              <Button size="sm" variant="outline" onClick={handleSendToBack}>
                Send to Back
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                {selectedObjects.length} selected • Press Delete to remove
              </span>
            </div>
          )}

          <Stage
            width={stageSize.width}
            height={stageSize.height}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onClick={handleStageClick}
            style={{ cursor: getCursor() }}
          >
            <Layer listening={false}>
              {image && <KonvaImage image={image} scaleX={imageScale.x} scaleY={imageScale.y} />}
            </Layer>
            <Layer ref={layerRef} />
            <Layer>
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit resize to positive dimensions
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>

        {/* Text editing dialog */}
        {isTextEditing && (
          <Dialog open={isTextEditing} onOpenChange={setIsTextEditing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Text</DialogTitle>
              </DialogHeader>
              <Input
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextEdit();
                  }
                }}
                autoFocus
                placeholder="Enter text..."
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsTextEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTextEdit}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KonvaAnnotator;

