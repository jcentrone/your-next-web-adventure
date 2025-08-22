import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
} from "lucide-react";

interface PropertiesPanelProps {
  selectedObject: any;
  onUpdateProperty: (property: string, value: any) => void;
  onDeleteObject: () => void;
  onDuplicateObject: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onToggleLock: () => void;
  onToggleVisible: () => void;
  layers: any[];
  onSelectLayer: (object: any) => void;
}

const FONTS = [
  "Arial",
  "Times New Roman", 
  "Courier New",
  "Georgia",
  "Verdana",
  "Helvetica",
  "Impact",
  "Comic Sans MS"
];

export function PropertiesPanel({
  selectedObject,
  onUpdateProperty,
  onDeleteObject,
  onDuplicateObject,
  onBringForward,
  onSendBackward,
  onToggleLock,
  onToggleVisible,
  layers,
  onSelectLayer,
}: PropertiesPanelProps) {
  const isTextObject = selectedObject?.type === "textbox";
  const hasPosition = selectedObject && ('left' in selectedObject || 'top' in selectedObject);
  const hasSize = selectedObject && ('width' in selectedObject || 'height' in selectedObject);
  const hasFill = selectedObject && 'fill' in selectedObject;
  const hasStroke = selectedObject && 'stroke' in selectedObject;

  return (
    <div className="w-80 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {/* Object Actions */}
          {selectedObject && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Object Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDuplicateObject}
                  className="justify-start"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDeleteObject}
                  className="justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleLock}
                  className="justify-start"
                >
                  {selectedObject.lockMovementX ? (
                    <Unlock className="h-4 w-4 mr-2" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  {selectedObject.lockMovementX ? "Unlock" : "Lock"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleVisible}
                  className="justify-start"
                >
                  {selectedObject.visible ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {selectedObject.visible ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          )}

          {/* Position & Size */}
          {hasPosition && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Position & Size</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="left" className="text-xs">X</Label>
                  <Input
                    id="left"
                    type="number"
                    value={Math.round(selectedObject.left || 0)}
                    onChange={(e) => onUpdateProperty("left", Number(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="top" className="text-xs">Y</Label>
                  <Input
                    id="top"
                    type="number"
                    value={Math.round(selectedObject.top || 0)}
                    onChange={(e) => onUpdateProperty("top", Number(e.target.value))}
                    className="h-8"
                  />
                </div>
              </div>
              {hasSize && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="width" className="text-xs">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1))}
                      onChange={(e) => onUpdateProperty("scaleX", Number(e.target.value) / (selectedObject.width || 1))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1))}
                      onChange={(e) => onUpdateProperty("scaleY", Number(e.target.value) / (selectedObject.height || 1))}
                      className="h-8"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="angle" className="text-xs">Rotation</Label>
                <Input
                  id="angle"
                  type="number"
                  value={Math.round(selectedObject.angle || 0)}
                  onChange={(e) => onUpdateProperty("angle", Number(e.target.value))}
                  className="h-8"
                />
              </div>
            </div>
          )}

          {/* Text Properties */}
          {isTextObject && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Text</h3>
              <div>
                <Label htmlFor="text" className="text-xs">Content</Label>
                <Input
                  id="text"
                  value={selectedObject.text || ""}
                  onChange={(e) => onUpdateProperty("text", e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fontFamily" className="text-xs">Font</Label>
                  <Select
                    value={selectedObject.fontFamily || "Arial"}
                    onValueChange={(value) => onUpdateProperty("fontFamily", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fontSize" className="text-xs">Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={selectedObject.fontSize || 16}
                    onChange={(e) => onUpdateProperty("fontSize", Number(e.target.value))}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fill & Stroke */}
          {(hasFill || hasStroke) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Appearance</h3>
              {hasFill && (
                <div>
                  <Label htmlFor="fill" className="text-xs">Fill Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fill"
                      type="color"
                      value={selectedObject.fill || "#000000"}
                      onChange={(e) => onUpdateProperty("fill", e.target.value)}
                      className="h-8 w-16 p-1"
                    />
                    <Input
                      value={selectedObject.fill || "#000000"}
                      onChange={(e) => onUpdateProperty("fill", e.target.value)}
                      className="h-8 flex-1"
                    />
                  </div>
                </div>
              )}
              {hasStroke && (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="stroke" className="text-xs">Stroke Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="stroke"
                        type="color"
                        value={selectedObject.stroke || "#000000"}
                        onChange={(e) => onUpdateProperty("stroke", e.target.value)}
                        className="h-8 w-16 p-1"
                      />
                      <Input
                        value={selectedObject.stroke || "#000000"}
                        onChange={(e) => onUpdateProperty("stroke", e.target.value)}
                        className="h-8 flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="strokeWidth" className="text-xs">Stroke Width</Label>
                    <Input
                      id="strokeWidth"
                      type="number"
                      value={selectedObject.strokeWidth || 0}
                      onChange={(e) => onUpdateProperty("strokeWidth", Number(e.target.value))}
                      className="h-8"
                      min="0"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label className="text-xs">Opacity</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[selectedObject.opacity * 100 || 100]}
                    onValueChange={([value]) => onUpdateProperty("opacity", value / 100)}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">
                    {Math.round(selectedObject.opacity * 100 || 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Layer Controls */}
          {selectedObject && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Layer Order</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBringForward}
                  className="flex-1"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Forward
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSendBackward}
                  className="flex-1"
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Backward
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Layers List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Layers</h3>
            <div className="space-y-1">
              {layers.map((layer, index) => (
                <Button
                  key={index}
                  variant={layer === selectedObject ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSelectLayer(layer)}
                  className="w-full justify-start text-xs"
                >
                  {layer.type === "textbox" ? "Text" : layer.type || "Object"} {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}