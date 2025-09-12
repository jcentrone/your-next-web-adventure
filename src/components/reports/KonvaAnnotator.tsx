import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnnotationToolbar } from "@/components/annotation/AnnotationToolbar";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import { Save } from "lucide-react";

interface KonvaAnnotatorProps {
  imageUrl: string;
  initialAnnotations?: string;
  onSave: (annotations: string, imageBlob: Blob) => void;
}

const TOOL_TYPES = ["select", "arrow", "text", "rectangle", "circle", "line", "draw"] as const;
type ToolType = typeof TOOL_TYPES[number];

export const KonvaAnnotator: React.FC<KonvaAnnotatorProps> = ({
  imageUrl,
  initialAnnotations,
  onSave,
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [image] = useImage(imageUrl);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState("#ff0000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<Konva.Node[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editingText, setEditingText] = useState<Konva.Text | null>(null);
  const [tempText, setTempText] = useState("");

  const saveHistory = useCallback(() => {
    if (!layerRef.current) return;
    const json = layerRef.current.toJSON();
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(json);
      setHistoryIndex(next.length - 1);
      return next;
    });
    console.log("Saved to history, index:", historyIndex + 1);
  }, [historyIndex]);

  // Attach event handlers to all objects
  const attachEventHandlers = useCallback(() => {
    if (!layerRef.current) return;
    
    console.log("Attaching event handlers to all objects");
    layerRef.current.children.forEach((child) => {
      if (child.getClassName() === "Text") {
        const textNode = child as Konva.Text;
        textNode.off('dblclick');
        textNode.on('dblclick', () => {
          console.log("Double-clicked text:", textNode.text());
          setEditingText(textNode);
          setTempText(textNode.text());
        });
      }
      
      // Add transform event handlers for all draggable objects
      if (child.draggable()) {
        child.off('transformend');
        child.off('dragend');
        child.off('click');
        
        child.on('transformend', () => {
          console.log("Transform ended for:", child.getClassName());
          saveHistory();
          // Keep the transformer after transform
          if (transformerRef.current) {
            transformerRef.current.forceUpdate();
          }
        });

        child.on('dragend', () => {
          console.log("Drag ended for:", child.getClassName());
          saveHistory();
          // Keep the transformer after drag
          if (transformerRef.current) {
            transformerRef.current.forceUpdate();
          }
        });

        // Add click handler for selection
        child.on('click', (e) => {
          e.cancelBubble = true;
          if (activeTool === 'select') {
            console.log("Object clicked:", child.getClassName());
            setSelectedObjects([child]);
            if (transformerRef.current) {
              transformerRef.current.nodes([child]);
              transformerRef.current.moveToTop();
              transformerRef.current.getLayer()?.batchDraw();
            }
          }
        });
      }
    });
  }, [saveHistory, activeTool]);


  useEffect(() => {
    if (image && layerRef.current && history.length === 0) {
      saveHistory();
    }
  }, [image, saveHistory, history.length]);

  useEffect(() => {
    if (initialAnnotations) {
      try {
        const parsed = JSON.parse(initialAnnotations);
        if (layerRef.current) {
          layerRef.current.destroyChildren();
          Konva.Node.create(parsed, layerRef.current);
          layerRef.current.batchDraw();
          saveHistory();
          // Reattach event handlers after loading from JSON
          attachEventHandlers();
        }
      } catch (error) {
        console.error("Failed to load annotations:", error);
      }
    }
  }, [initialAnnotations, saveHistory, attachEventHandlers]);

  // Update transformer when selected objects change
  useEffect(() => {
    console.log("Selected objects changed:", selectedObjects.length, selectedObjects.map(obj => obj.getClassName()));
    if (transformerRef.current && selectedObjects.length > 0) {
      // Filter out any transformer nodes to prevent circular references
      const validNodes = selectedObjects.filter(
        (node) =>
          node.getClassName() !== "Transformer" &&
          node.getParent() !== transformerRef.current
      );
      transformerRef.current.nodes(validNodes);
      // Ensure transformer stays above selected shapes so resize handles are visible
      transformerRef.current.moveToTop();
      transformerRef.current.getLayer()?.batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedObjects]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [selectedObjects, saveHistory]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const json = history[newIndex];
      if (layerRef.current) {
        layerRef.current.destroyChildren();
        Konva.Node.create(json, layerRef.current);
        layerRef.current.batchDraw();
        // Reattach event handlers after undo
        attachEventHandlers();
      }
      setSelectedObjects([]);
      transformerRef.current?.nodes([]);
      console.log("Undo to index:", newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const json = history[newIndex];
      if (layerRef.current) {
        layerRef.current.destroyChildren();
        Konva.Node.create(json, layerRef.current);
        layerRef.current.batchDraw();
        // Reattach event handlers after redo
        attachEventHandlers();
      }
      setSelectedObjects([]);
      transformerRef.current?.nodes([]);
      console.log("Redo to index:", newIndex);
    }
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Check if we're clicking on a transformer handle/anchor - let transformer handle it
    const target = e.target;
    if (target.getClassName() === 'Transformer' || target.hasName('_anchor')) {
      console.log("Clicked on transformer, skipping stage handling");
      return;
    }

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos || !layerRef.current) return;
    
    console.log("Mouse down - Tool:", activeTool, "Target:", target.getClassName(), "Position:", pos);

    if (activeTool === "select") {
      const clickedOnEmpty = e.target === e.target.getStage() || e.target.getClassName() === 'Image';
      if (clickedOnEmpty) {
        console.log("Clicked on empty area, clearing selection");
        setSelectedObjects([]);
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
        }
        return;
      }
      
      const clickedNode = e.target;
      
      // Don't handle if it's the transformer or stage or image
      if (clickedNode.getClassName() === 'Transformer' || 
          clickedNode === e.target.getStage() || 
          clickedNode.getClassName() === 'Image') {
        return;
      }
      
      console.log("Selecting object:", clickedNode.getClassName());
      setSelectedObjects([clickedNode]);
      return;
    }

    console.log("Starting drawing with tool:", activeTool);
    setIsDrawing(true);
    const stage = e.target.getStage();
    if (!stage) return;

    if (activeTool === "draw") {
      setCurrentPath([pos.x, pos.y]);
    } else if (activeTool === "text") {
      const text = new Konva.Text({
        x: pos.x,
        y: pos.y,
        text: "Double-click to edit",
        fontSize: 16,
        fill: activeColor,
        draggable: true,
      });
      
      // Attach event handlers immediately
      text.on('dblclick', () => {
        console.log("Double-clicked text:", text.text());
        setEditingText(text);
        setTempText(text.text());
      });
      
      text.on('transformend', () => {
        console.log("Transform ended for text");
        saveHistory();
      });
      
      layerRef.current.add(text);
      transformerRef.current?.moveToTop();
      layerRef.current.batchDraw();
      setIsDrawing(false);
      setActiveTool("select"); // Reset to select tool
      saveHistory();
      console.log("Created text object");
    } else if (activeTool === "rectangle") {
      const rect = new Konva.Rect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        draggable: true,
      });
      
      // Add transform event handler
      rect.on('transformend', () => {
        console.log("Transform ended for rectangle");
        saveHistory();
      });
      
      layerRef.current.add(rect);
      transformerRef.current?.moveToTop();
      setCurrentPath([pos.x, pos.y]);
      console.log("Created rectangle, isDrawing:", true);
    } else if (activeTool === "circle") {
      const circle = new Konva.Circle({
        x: pos.x,
        y: pos.y,
        radius: 0,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        draggable: true,
      });
      
      // Add transform event handler
      circle.on('transformend', () => {
        console.log("Transform ended for circle");
        saveHistory();
      });
      
      layerRef.current.add(circle);
      transformerRef.current?.moveToTop();
      setCurrentPath([pos.x, pos.y]);
      console.log("Created circle, isDrawing:", true);
    } else if (activeTool === "arrow") {
      const arrow = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x, pos.y],
        pointerLength: 10,
        pointerWidth: 10,
        fill: activeColor,
        stroke: activeColor,
        strokeWidth: 2,
        draggable: true,
      });
      
      // Add transform event handler
      arrow.on('transformend', () => {
        console.log("Transform ended for arrow");
        saveHistory();
      });
      
      layerRef.current.add(arrow);
      transformerRef.current?.moveToTop();
      setCurrentPath([pos.x, pos.y]);
      console.log("Created arrow, isDrawing:", true);
    } else if (activeTool === "line") {
      const line = new Konva.Line({
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: activeColor,
        strokeWidth: 2,
        draggable: true,
      });
      
      // Add transform event handler
      line.on('transformend', () => {
        console.log("Transform ended for line");
        saveHistory();
      });
      
      layerRef.current.add(line);
      transformerRef.current?.moveToTop();
      setCurrentPath([pos.x, pos.y]);
      console.log("Created line, isDrawing:", true);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !layerRef.current) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;
    
    console.log("Mouse move - Tool:", activeTool, "isDrawing:", isDrawing, "Point:", point);

    if (activeTool === "draw") {
      const newPath = [...currentPath, point.x, point.y];
      setCurrentPath(newPath);
      
      const children = layerRef.current.children;
      const lastLine = children[children.length - 1] as Konva.Line;
      if (lastLine && lastLine.getClassName() === 'Line') {
        lastLine.points(newPath);
        layerRef.current.batchDraw();
      } else {
        const line = new Konva.Line({
          points: newPath,
          stroke: activeColor,
          strokeWidth: 2,
          draggable: true,
        });
        
        // Add transform event handler
        line.on('transformend', () => {
          console.log("Transform ended for drawn line");
          saveHistory();
        });
        
        layerRef.current.add(line);
        transformerRef.current?.moveToTop();
      }
    } else if (activeTool === "rectangle") {
      const children = layerRef.current.children;
      const rect = children[children.length - 1] as Konva.Rect;
      if (rect && rect.getClassName() === 'Rect') {
        const width = point.x - currentPath[0];
        const height = point.y - currentPath[1];
        rect.width(Math.abs(width));
        rect.height(Math.abs(height));
        if (width < 0) rect.x(point.x);
        if (height < 0) rect.y(point.y);
        layerRef.current.batchDraw();
      }
    } else if (activeTool === "circle") {
      const children = layerRef.current.children;
      const circle = children[children.length - 1] as Konva.Circle;
      if (circle && circle.getClassName() === 'Circle') {
        const radius = Math.sqrt(
          Math.pow(point.x - currentPath[0], 2) + Math.pow(point.y - currentPath[1], 2)
        );
        circle.radius(radius);
        layerRef.current.batchDraw();
      }
    } else if (activeTool === "arrow" || activeTool === "line") {
      const children = layerRef.current.children;
      const shape = children[children.length - 1] as Konva.Arrow | Konva.Line;
      if (shape && (shape.getClassName() === 'Arrow' || shape.getClassName() === 'Line')) {
        shape.points([currentPath[0], currentPath[1], point.x, point.y]);
        layerRef.current.batchDraw();
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && layerRef.current) {
      setIsDrawing(false);
      setCurrentPath([]);
      // Reset to select tool after placing a shape (except for draw tool)
      if (activeTool !== "draw" && activeTool !== "select") {
        setActiveTool("select");
      }
      saveHistory();
      // Attach event handlers to newly created objects
      attachEventHandlers();
      transformerRef.current?.moveToTop();
      console.log("Finished drawing, saved to history");
    }
  };

  // Removed handleStageClick - it was redundant and interfering with drawing
  // Selection clearing is already handled in handleMouseDown

  const bringToFront = () => {
    selectedObjects.forEach(obj => obj.moveToTop());
    layerRef.current?.batchDraw();
    saveHistory();
  };

  const sendToBack = () => {
    selectedObjects.forEach(obj => obj.moveToBottom());
    layerRef.current?.batchDraw();
    saveHistory();
  };

  const saveTextEdit = () => {
    if (editingText) {
      editingText.text(tempText);
      layerRef.current?.batchDraw();
      saveHistory();
      setEditingText(null);
      setTempText("");
      console.log("Text edited and saved");
    }
  };

  const handleSave = async () => {
    if (!stageRef.current || !layerRef.current) return;

    try {
      const annotations = layerRef.current.toJSON();
      const dataURL = stageRef.current.toDataURL({ quality: 1 });
      
      const response = await fetch(dataURL);
      const blob = await response.blob();
      
      onSave(annotations, blob);
    console.log("Annotations saved successfully");
    } catch (error) {
      console.error("Failed to save annotations:", error);
    }
  };

  // Calculate image dimensions that fit within the available space while maintaining aspect ratio
  const getImageDimensions = () => {
    if (!image) return { width: 800, height: 600 };
    
    const maxWidth = Math.min(1200, window.innerWidth - 200); // Leave some margin
    const maxHeight = Math.min(800, window.innerHeight - 300); // Leave space for toolbar and buttons
    
    const aspectRatio = image.width / image.height;
    
    let width = maxWidth;
    let height = width / aspectRatio;
    
    // If height exceeds max, scale by height instead
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width, height };
  };

  const { width: imageWidth, height: imageHeight } = getImageDimensions();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b bg-card">
        <AnnotationToolbar
          activeTool={activeTool}
          onToolClick={setActiveTool}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-muted/20 p-4">
        <div 
          className="border rounded-lg bg-background shadow-lg overflow-hidden"
          style={{ 
            cursor: activeTool === "select" ? "default" : "crosshair",
            width: imageWidth,
            height: imageHeight
          }}
        >
          <Stage
            ref={stageRef}
            width={imageWidth}
            height={imageHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              {image && (
                <KonvaImage
                  image={image}
                  width={imageWidth}
                  height={imageHeight}
                  listening={false}
                />
              )}
            </Layer>
            <Layer ref={layerRef}>
              <Transformer 
                ref={transformerRef} 
                visible={selectedObjects.length > 0}
                boundBoxFunc={(oldBox, newBox) => {
                  // Allow more flexible bounds - just ensure minimum size
                  const minWidth = 10;
                  const minHeight = 10;
                  
                  if (newBox.width < minWidth) {
                    newBox.width = minWidth;
                  }
                  if (newBox.height < minHeight) {
                    newBox.height = minHeight;
                  }
                  
                  return newBox;
                }}
                enabledAnchors={[
                  'top-left', 'top-center', 'top-right',
                  'middle-left', 'middle-right',
                  'bottom-left', 'bottom-center', 'bottom-right'
                ]}
                rotateEnabled={false}
                borderEnabled={true}
                anchorFill="#ffffff"
                anchorStroke="#0066ff"
                anchorSize={12}
                anchorCornerRadius={2}
                borderStroke="#0066ff"
                borderStrokeWidth={2}
                keepRatio={false}
                centeredScaling={false}
                shouldOverdrawWholeArea={true}
                listening={true}
                onTransformEnd={() => {
                  console.log("Transform ended");
                  saveHistory();
                }}
              />
            </Layer>
          </Stage>
        </div>
      </div>
      
      <div className="flex-shrink-0 p-4 border-t bg-card">
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Annotations
          </Button>
        </div>
      </div>

      {editingText && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Text</h3>
            <div className="space-y-4">
              <Input
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                placeholder="Enter text..."
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingText(null)}>
                  Cancel
                </Button>
                <Button onClick={saveTextEdit}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KonvaAnnotator;