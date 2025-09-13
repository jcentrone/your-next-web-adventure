import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Undo, Redo, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { AnnotationToolbar } from './AnnotationToolbar';

interface Point {
  x: number;
  y: number;
}

interface AnnotationObject {
  id: string;
  type: 'draw' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text';
  points: Point[];
  color: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  selected?: boolean;
}

interface CustomAnnotatorProps {
  imageUrl: string;
  initialAnnotations?: string;
  onSave: (annotations: string, imageBlob: Blob) => void;
}

type ToolType = "select" | "arrow" | "text" | "rectangle" | "circle" | "line" | "draw";

export const CustomAnnotator: React.FC<CustomAnnotatorProps> = ({
  imageUrl,
  initialAnnotations,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  
  const [objects, setObjects] = useState<AnnotationObject[]>([]);
  const [history, setHistory] = useState<AnnotationObject[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeColor, setActiveColor] = useState('#ff0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentObject, setCurrentObject] = useState<AnnotationObject | null>(null);
  const [selectedObject, setSelectedObject] = useState<AnnotationObject | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState<Point>({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState<AnnotationObject | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Load image and set canvas size
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const aspectRatio = img.width / img.height;
        
        let canvasWidth = containerWidth;
        let canvasHeight = containerWidth / aspectRatio;
        
        if (canvasHeight > containerHeight) {
          canvasHeight = containerHeight;
          canvasWidth = containerHeight * aspectRatio;
        }
        
        setCanvasSize({ width: canvasWidth, height: canvasHeight });
      }
    };
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  }, [imageUrl]);

  // Load initial annotations
  useEffect(() => {
    if (initialAnnotations) {
      try {
        const parsed = JSON.parse(initialAnnotations);
        setObjects(parsed);
        saveToHistory(parsed);
      } catch (error) {
        console.error('Failed to parse initial annotations:', error);
      }
    }
  }, [initialAnnotations]);

  const saveToHistory = useCallback((currentObjects: AnnotationObject[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...currentObjects]);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const getCanvasCoordinates = useCallback((event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const isPointInObject = (point: Point, obj: AnnotationObject): boolean => {
    switch (obj.type) {
      case 'rectangle':
        return point.x >= obj.x! && point.x <= obj.x! + obj.width! &&
               point.y >= obj.y! && point.y <= obj.y! + obj.height!;
      case 'circle':
        const centerX = obj.x! + obj.width! / 2;
        const centerY = obj.y! + obj.height! / 2;
        const radius = Math.min(obj.width!, obj.height!) / 2;
        const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
        return distance <= radius;
      case 'text':
        return point.x >= obj.x! && point.x <= obj.x! + (obj.text!.length * (obj.fontSize! * 0.6)) &&
               point.y >= obj.y! - obj.fontSize! && point.y <= obj.y!;
      case 'draw':
      case 'line':
      case 'arrow':
        // Simple bounding box check for lines
        if (obj.points.length < 2) return false;
        const minX = Math.min(...obj.points.map(p => p.x));
        const maxX = Math.max(...obj.points.map(p => p.x));
        const minY = Math.min(...obj.points.map(p => p.y));
        const maxY = Math.max(...obj.points.map(p => p.y));
        return point.x >= minX - 5 && point.x <= maxX + 5 &&
               point.y >= minY - 5 && point.y <= maxY + 5;
      default:
        return false;
    }
  };

  const getResizeHandle = (point: Point, obj: AnnotationObject): string | null => {
    if (!obj.x || !obj.y || !obj.width || !obj.height) return null;
    
    const handles = [
      { name: 'nw', x: obj.x, y: obj.y },
      { name: 'ne', x: obj.x + obj.width, y: obj.y },
      { name: 'sw', x: obj.x, y: obj.y + obj.height },
      { name: 'se', x: obj.x + obj.width, y: obj.y + obj.height },
      { name: 'n', x: obj.x + obj.width / 2, y: obj.y },
      { name: 's', x: obj.x + obj.width / 2, y: obj.y + obj.height },
      { name: 'w', x: obj.x, y: obj.y + obj.height / 2 },
      { name: 'e', x: obj.x + obj.width, y: obj.y + obj.height / 2 }
    ];
    
    for (const handle of handles) {
      if (Math.abs(point.x - handle.x) <= 8 && Math.abs(point.y - handle.y) <= 8) {
        return handle.name;
      }
    }
    
    return null;
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(event);
    
    if (activeTool === 'select') {
      // Check for resize handles first
      if (selectedObject) {
        const handle = getResizeHandle(point, selectedObject);
        if (handle) {
          setResizeHandle(handle);
          setIsDrawing(true);
          return;
        }
      }
      
      // Check for object selection
      const clickedObject = objects.slice().reverse().find(obj => isPointInObject(point, obj));
      
      if (clickedObject) {
        setSelectedObject(clickedObject);
        setActiveColor(clickedObject.color); // Update active color to match selected object
        setDragOffset({
          x: point.x - (clickedObject.x || clickedObject.points[0]?.x || 0),
          y: point.y - (clickedObject.y || clickedObject.points[0]?.y || 0)
        });
        setIsDrawing(true);
      } else {
        setSelectedObject(null);
      }
    } else if (activeTool === 'text') {
      setEditingText(null);
      setTextInputPos(point);
      setShowTextInput(true);
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.value = '';
          textInputRef.current.focus();
        }
      }, 0);
    } else {
      // Start drawing
      setIsDrawing(true);
      setStartPoint(point);
      
      const newObject: AnnotationObject = {
        id: generateId(),
        type: activeTool === 'draw' ? 'draw' : activeTool,
        points: activeTool === 'draw' ? [point] : [point, point],
        color: activeColor,
        strokeWidth: 2,
        x: activeTool === 'rectangle' || activeTool === 'circle' ? point.x : undefined,
        y: activeTool === 'rectangle' || activeTool === 'circle' ? point.y : undefined,
        width: 0,
        height: 0
      };
      
      setCurrentObject(newObject);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const point = getCanvasCoordinates(event);
    
    if (activeTool === 'select') {
      if (resizeHandle && selectedObject) {
        // Handle resizing
        const updatedObjects = objects.map(obj => {
          if (obj.id === selectedObject.id) {
            const newObj = { ...obj };
            
            switch (resizeHandle) {
              case 'se':
                newObj.width = point.x - obj.x!;
                newObj.height = point.y - obj.y!;
                break;
              case 'nw':
                const newWidth = obj.x! + obj.width! - point.x;
                const newHeight = obj.y! + obj.height! - point.y;
                newObj.x = point.x;
                newObj.y = point.y;
                newObj.width = newWidth;
                newObj.height = newHeight;
                break;
              // Add other resize handles as needed
            }
            
            return newObj;
          }
          return obj;
        });
        
        setObjects(updatedObjects);
        setSelectedObject(updatedObjects.find(obj => obj.id === selectedObject.id) || null);
      } else if (selectedObject) {
        // Handle dragging
        const updatedObjects = objects.map(obj => {
          if (obj.id === selectedObject.id) {
            const newObj = { ...obj };
            
            if (obj.x !== undefined && obj.y !== undefined) {
              newObj.x = point.x - dragOffset.x;
              newObj.y = point.y - dragOffset.y;
            } else if (obj.points.length > 0) {
              const offsetX = point.x - dragOffset.x - obj.points[0].x;
              const offsetY = point.y - dragOffset.y - obj.points[0].y;
              newObj.points = obj.points.map(p => ({
                x: p.x + offsetX,
                y: p.y + offsetY
              }));
            }
            
            return newObj;
          }
          return obj;
        });
        
        setObjects(updatedObjects);
        setSelectedObject(updatedObjects.find(obj => obj.id === selectedObject.id) || null);
      }
    } else if (currentObject) {
      // Handle drawing
      const updatedObject = { ...currentObject };
      
      if (activeTool === 'draw') {
        updatedObject.points = [...currentObject.points, point];
      } else if (activeTool === 'line' || activeTool === 'arrow') {
        updatedObject.points = [startPoint!, point];
      } else if (activeTool === 'rectangle' || activeTool === 'circle') {
        updatedObject.width = Math.abs(point.x - startPoint!.x);
        updatedObject.height = Math.abs(point.y - startPoint!.y);
        updatedObject.x = Math.min(startPoint!.x, point.x);
        updatedObject.y = Math.min(startPoint!.y, point.y);
      }
      
      setCurrentObject(updatedObject);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentObject) {
      const newObjects = [...objects, currentObject];
      setObjects(newObjects);
      saveToHistory(newObjects);
      setCurrentObject(null);
    }
    
    setIsDrawing(false);
    setResizeHandle(null);
  };

  const handleTextSubmit = (text: string) => {
    if (text.trim()) {
      if (editingText) {
        // Update existing text object
        const updatedObjects = objects.map(obj => 
          obj.id === editingText.id ? { ...obj, text: text.trim() } : obj
        );
        setObjects(updatedObjects);
        saveToHistory(updatedObjects);
        setSelectedObject(updatedObjects.find(obj => obj.id === editingText.id) || null);
      } else {
        // Create new text object
        const newObject: AnnotationObject = {
          id: generateId(),
          type: 'text',
          points: [],
          color: activeColor,
          strokeWidth: 2,
          text: text.trim(),
          fontSize: 16,
          x: textInputPos.x,
          y: textInputPos.y
        };
        
        const newObjects = [...objects, newObject];
        setObjects(newObjects);
        saveToHistory(newObjects);
      }
    }
    
    setShowTextInput(false);
    setEditingText(null);
    setActiveTool('select');
  };

  const drawObject = (ctx: CanvasRenderingContext2D, obj: AnnotationObject) => {
    ctx.strokeStyle = obj.color;
    ctx.fillStyle = obj.color;
    ctx.lineWidth = obj.strokeWidth;
    
    switch (obj.type) {
      case 'draw':
        if (obj.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          for (let i = 1; i < obj.points.length; i++) {
            ctx.lineTo(obj.points[i].x, obj.points[i].y);
          }
          ctx.stroke();
        }
        break;
        
      case 'line':
        if (obj.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          ctx.lineTo(obj.points[1].x, obj.points[1].y);
          ctx.stroke();
        }
        break;
        
      case 'arrow':
        if (obj.points.length >= 2) {
          const [start, end] = obj.points;
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const arrowLength = 15;
          
          // Draw line
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          
          // Draw arrowhead
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - arrowLength * Math.cos(angle - Math.PI / 6),
            end.y - arrowLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - arrowLength * Math.cos(angle + Math.PI / 6),
            end.y - arrowLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
        break;
        
      case 'rectangle':
        if (obj.width && obj.height) {
          ctx.strokeRect(obj.x!, obj.y!, obj.width, obj.height);
        }
        break;
        
      case 'circle':
        if (obj.width && obj.height) {
          const centerX = obj.x! + obj.width / 2;
          const centerY = obj.y! + obj.height / 2;
          const radius = Math.min(obj.width, obj.height) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
        
      case 'text':
        if (obj.text) {
          ctx.font = `${obj.fontSize}px Arial`;
          ctx.fillText(obj.text, obj.x!, obj.y!);
        }
        break;
    }
  };

  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, obj: AnnotationObject) => {
    if (!obj.x || !obj.y || !obj.width || !obj.height) return;
    
    const handles = [
      { x: obj.x, y: obj.y },
      { x: obj.x + obj.width, y: obj.y },
      { x: obj.x, y: obj.y + obj.height },
      { x: obj.x + obj.width, y: obj.y + obj.height },
      { x: obj.x + obj.width / 2, y: obj.y },
      { x: obj.x + obj.width / 2, y: obj.y + obj.height },
      { x: obj.x, y: obj.y + obj.height / 2 },
      { x: obj.x + obj.width, y: obj.y + obj.height / 2 }
    ];
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
      ctx.strokeRect(handle.x - 4, handle.y - 4, 8, 8);
    });
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    if (image) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw all objects
    [...objects, ...(currentObject ? [currentObject] : [])].forEach(obj => {
      drawObject(ctx, obj);
    });
    
    // Draw selection handles
    if (selectedObject) {
      drawSelectionHandles(ctx, selectedObject);
    }
  }, [objects, currentObject, selectedObject, image]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setObjects(history[historyIndex - 1]);
      setSelectedObject(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setObjects(history[historyIndex + 1]);
      setSelectedObject(null);
    }
  };

  const handleDelete = () => {
    if (selectedObject) {
      const newObjects = objects.filter(obj => obj.id !== selectedObject.id);
      setObjects(newObjects);
      saveToHistory(newObjects);
      setSelectedObject(null);
    }
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (blob) {
        const annotations = JSON.stringify(objects);
        onSave(annotations, blob);
      }
    }, 'image/png');
  };

  return (
    <div className="flex flex-col h-full">
      <AnnotationToolbar
        activeTool={activeTool}
        activeColor={activeColor}
        onToolClick={setActiveTool}
        onColorChange={(color) => {
          setActiveColor(color);
          // Update selected object color if one is selected
          if (selectedObject) {
            const updatedObjects = objects.map(obj => 
              obj.id === selectedObject.id ? { ...obj, color } : obj
            );
            setObjects(updatedObjects);
            setSelectedObject({ ...selectedObject, color });
            saveToHistory(updatedObjects);
          }
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      
      <div className="flex-1 flex items-center justify-center p-4" ref={containerRef}>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={`border border-border ${activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={(event) => {
              if (activeTool === 'select') {
                const point = getCanvasCoordinates(event);
                const clickedObject = objects.slice().reverse().find(obj => isPointInObject(point, obj));
                if (clickedObject && clickedObject.type === 'text') {
                  setEditingText(clickedObject);
                  setTextInputPos({ x: clickedObject.x!, y: clickedObject.y! });
                  setShowTextInput(true);
                  setTimeout(() => {
                    if (textInputRef.current) {
                      textInputRef.current.value = clickedObject.text || '';
                      textInputRef.current.focus();
                    }
                  }, 0);
                }
              }
            }}
          />
          
          {showTextInput && (
            <input
              ref={textInputRef}
              type="text"
              placeholder="Add text..."
              className="absolute bg-white border border-gray-300 px-2 py-1 text-sm"
              style={{
                left: textInputPos.x,
                top: textInputPos.y - 20,
                zIndex: 10
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSubmit(e.currentTarget.value);
                } else if (e.key === 'Escape') {
                  setShowTextInput(false);
                  setActiveTool('select');
                }
              }}
              onBlur={(e) => {
                handleTextSubmit(e.currentTarget.value);
              }}
            />
          )}
        </div>
      </div>
      
      <div className="border-t bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={!selectedObject}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Annotations
          </Button>
        </div>
      </div>
    </div>
  );
};