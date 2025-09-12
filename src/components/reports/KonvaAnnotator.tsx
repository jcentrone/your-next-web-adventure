import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnnotationToolbar } from "@/components/annotation/AnnotationToolbar";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
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
  const [image] = useImage(imageUrl);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState("#ef4444");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawLine, setDrawLine] = useState<Konva.Line | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  // adjust stage size to image
  useEffect(() => {
    if (image) {
      setStageSize({ width: image.width, height: image.height });
    }
  }, [image]);

  // load initial annotations
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

  const saveHistory = () => {
    if (!layerRef.current) return;
    const json = layerRef.current.toJSON();
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(json);
      setHistoryIndex(next.length - 1);
      return next;
    });
  };

  const handleUndo = () => {
    if (historyIndex <= 0 || !layerRef.current) return;
    const prev = history[historyIndex - 1];
    layerRef.current.destroyChildren();
    Konva.Node.create(prev, layerRef.current);
    layerRef.current.draw();
    setHistoryIndex(historyIndex - 1);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !layerRef.current) return;
    const next = history[historyIndex + 1];
    layerRef.current.destroyChildren();
    Konva.Node.create(next, layerRef.current);
    layerRef.current.draw();
    setHistoryIndex(historyIndex + 1);
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
      });
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
      return;
    }

    const { x, y } = startPoint.current;
    switch (activeTool) {
      case "arrow":
        layerRef.current.add(
          new Konva.Arrow({
            points: [x, y, pos.x, pos.y],
            stroke: activeColor,
            fill: activeColor,
            strokeWidth: 3,
          })
        );
        break;
      case "line":
        layerRef.current.add(
          new Konva.Line({
            points: [x, y, pos.x, pos.y],
            stroke: activeColor,
            strokeWidth: 3,
          })
        );
        break;
      case "rectangle":
        layerRef.current.add(
          new Konva.Rect({
            x: Math.min(x, pos.x),
            y: Math.min(y, pos.y),
            width: Math.abs(pos.x - x),
            height: Math.abs(pos.y - y),
            stroke: activeColor,
            strokeWidth: 3,
          })
        );
        break;
      case "circle":
        layerRef.current.add(
          new Konva.Circle({
            x,
            y,
            radius: Math.hypot(pos.x - x, pos.y - y),
            stroke: activeColor,
            strokeWidth: 3,
          })
        );
        break;
      case "text":
        layerRef.current.add(
          new Konva.Text({
            x: pos.x,
            y: pos.y,
            text: "Text",
            fill: activeColor,
            fontSize: 24,
            draggable: true,
          })
        );
        break;
    }
    layerRef.current.draw();
    saveHistory();
    startPoint.current = null;
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
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
          >
            <Layer listening={false}>
              {image && <KonvaImage image={image} />}
            </Layer>
            <Layer ref={layerRef} />
          </Stage>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KonvaAnnotator;

