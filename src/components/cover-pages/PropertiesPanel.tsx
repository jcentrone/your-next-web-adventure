import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { FabricObject } from "fabric";
import {
  Eye,
  EyeOff,
  AlignLeft,
  AlignHorizontalJustifyCenter,
  AlignRight,
  ArrowUp,
  AlignVerticalJustifyCenter,
  ArrowDown,
  Trash2,
} from "lucide-react";

interface PropertiesPanelProps {
  selectedObject: any;
  selectedObjects: FabricObject[];
  onAlign: (type: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") => void;
  onUpdateProperty: (property: string, value: any) => void;
  onToggleLayerVisibility: (layer: FabricObject) => void;
  onDeleteLayer: (layer: FabricObject) => void;
  layers: FabricObject[];
  onSelectLayer: (object: FabricObject) => void;
  onUpdateLayer: (layer: FabricObject, property: string, value: any) => void;
  onReorderLayer: (fromIndex: number, toIndex: number) => void;
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
  selectedObjects,
  onAlign,
  onUpdateProperty,
  onToggleLayerVisibility,
  onDeleteLayer,
  layers,
  onSelectLayer,
  onUpdateLayer,
  onReorderLayer,
}: PropertiesPanelProps) {
  const multipleSelection = selectedObjects.length > 1;
  const isTextObject = !multipleSelection && selectedObject?.type === "textbox";
  const hasPosition =
    !multipleSelection &&
    selectedObject &&
    ("left" in selectedObject ||
      "top" in selectedObject ||
      "skewX" in selectedObject ||
      "skewY" in selectedObject);
  const hasSize = !multipleSelection && selectedObject && ("width" in selectedObject || "height" in selectedObject);
  const hasFill = !multipleSelection && selectedObject && "fill" in selectedObject;
  const hasStroke = !multipleSelection && selectedObject && "stroke" in selectedObject;
  const hasSkewX = !multipleSelection && selectedObject && "skewX" in selectedObject;
  const hasSkewY = !multipleSelection && selectedObject && "skewY" in selectedObject;

  const [value, setValue] = React.useState<string>("layers");
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  return (
    <div className="w-80 h-full border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ScrollArea className="h-full">
        <div className="p-4">
          {multipleSelection && (
            <div className="mb-4">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onAlign("left")}>
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAlign("centerH")}>
                  <AlignHorizontalJustifyCenter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAlign("right")}>
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAlign("top")}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAlign("centerV")}>
                  <AlignVerticalJustifyCenter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAlign("bottom")}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Align selected objects</p>
            </div>
          )}
          <Accordion
            type="single"
            collapsible
            value={value}
            onValueChange={setValue}
          >
            {!multipleSelection && hasPosition && (
              <AccordionItem value="position">
                <AccordionTrigger className="text-sm font-medium">
                  Position &amp; Size
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="left" className="text-xs">
                        X
                      </Label>
                      <Input
                        id="left"
                        type="number"
                        value={Math.round(selectedObject.left || 0)}
                        onChange={(e) =>
                          onUpdateProperty("left", Number(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="top" className="text-xs">
                        Y
                      </Label>
                      <Input
                        id="top"
                        type="number"
                        value={Math.round(selectedObject.top || 0)}
                        onChange={(e) =>
                          onUpdateProperty("top", Number(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                  {hasSize && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="width" className="text-xs">
                          Width
                        </Label>
                        <Input
                          id="width"
                          type="number"
                          value={Math.round(
                            (selectedObject.width || 0) *
                              (selectedObject.scaleX || 1)
                          )}
                          onChange={(e) => {
                            const newScale =
                              Number(e.target.value) /
                              (selectedObject.width || 1);
                            if (selectedObject.lockAspectRatio) {
                              selectedObject.set("scaleY", newScale);
                            }
                            onUpdateProperty("scaleX", newScale);
                          }}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-xs">
                          Height
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          value={Math.round(
                            (selectedObject.height || 0) *
                              (selectedObject.scaleY || 1)
                          )}
                          onChange={(e) => {
                            const newScale =
                              Number(e.target.value) /
                              (selectedObject.height || 1);
                            if (selectedObject.lockAspectRatio) {
                              selectedObject.set("scaleX", newScale);
                            }
                            onUpdateProperty("scaleY", newScale);
                          }}
                          className="h-8"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Switch
                          id="lockAspectRatio"
                          checked={selectedObject.lockAspectRatio || false}
                          onCheckedChange={(checked) => {
                            selectedObject.set("lockUniScaling", checked);
                            onUpdateProperty("lockAspectRatio", checked);
                          }}
                        />
                        <Label htmlFor="lockAspectRatio" className="text-xs">
                          Lock aspect ratio
                        </Label>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="angle" className="text-xs">
                      Rotation
                    </Label>
                    <Input
                      id="angle"
                      type="number"
                      value={Math.round(selectedObject.angle || 0)}
                      onChange={(e) =>
                        onUpdateProperty("angle", Number(e.target.value))
                      }
                      className="h-8"
                    />
                  </div>
                  {(hasSkewX || hasSkewY) && (
                    <div className="grid grid-cols-2 gap-3">
                      {hasSkewX && (
                        <div>
                          <Label htmlFor="skewX" className="text-xs">
                            Skew X
                          </Label>
                          <Input
                            id="skewX"
                            type="number"
                            value={Math.round(selectedObject.skewX || 0)}
                            onChange={(e) =>
                              onUpdateProperty(
                                "skewX",
                                Number(e.target.value)
                              )
                            }
                            className="h-8"
                          />
                        </div>
                      )}
                      {hasSkewY && (
                        <div>
                          <Label htmlFor="skewY" className="text-xs">
                            Skew Y
                          </Label>
                          <Input
                            id="skewY"
                            type="number"
                            value={Math.round(selectedObject.skewY || 0)}
                            onChange={(e) =>
                              onUpdateProperty(
                                "skewY",
                                Number(e.target.value)
                              )
                            }
                            className="h-8"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {!multipleSelection && isTextObject && (
              <AccordionItem value="text">
                <AccordionTrigger className="text-sm font-medium">
                  Text
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label htmlFor="text" className="text-xs">
                      Content
                    </Label>
                    <Input
                      id="text"
                      value={selectedObject.text || ""}
                      onChange={(e) => onUpdateProperty("text", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fontFamily" className="text-xs">
                        Font
                      </Label>
                      <Select
                        value={selectedObject.fontFamily || "Arial"}
                        onValueChange={(value) =>
                          onUpdateProperty("fontFamily", value)
                        }
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
                      <Label htmlFor="fontSize" className="text-xs">
                        Size
                      </Label>
                      <Input
                        id="fontSize"
                        type="number"
                        value={selectedObject.fontSize || 16}
                        onChange={(e) =>
                          onUpdateProperty("fontSize", Number(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {!multipleSelection && (hasFill || hasStroke) && (
              <AccordionItem value="appearance">
                <AccordionTrigger className="text-sm font-medium">
                  Fill &amp; Stroke
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  {hasFill && (
                    <div>
                      <Label htmlFor="fill" className="text-xs">
                        Fill Color
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="fill"
                          type="color"
                          value={selectedObject.fill || "#000000"}
                          onChange={(e) =>
                            onUpdateProperty("fill", e.target.value)
                          }
                          className="h-8 w-16 p-1"
                        />
                        <Input
                          value={selectedObject.fill || "#000000"}
                          onChange={(e) =>
                            onUpdateProperty("fill", e.target.value)
                          }
                          className="h-8 flex-1"
                        />
                      </div>
                    </div>
                  )}
                  {hasStroke && (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="stroke" className="text-xs">
                          Stroke Color
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="stroke"
                            type="color"
                            value={selectedObject.stroke || "#000000"}
                            onChange={(e) =>
                              onUpdateProperty("stroke", e.target.value)
                            }
                            className="h-8 w-16 p-1"
                          />
                          <Input
                            value={selectedObject.stroke || "#000000"}
                            onChange={(e) =>
                              onUpdateProperty("stroke", e.target.value)
                            }
                            className="h-8 flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="strokeWidth" className="text-xs">
                          Stroke Width
                        </Label>
                        <Input
                          id="strokeWidth"
                          type="number"
                          value={selectedObject.strokeWidth || 0}
                          onChange={(e) =>
                            onUpdateProperty(
                              "strokeWidth",
                              Number(e.target.value)
                            )
                          }
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
                        onValueChange={([value]) =>
                          onUpdateProperty("opacity", value / 100)
                        }
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        {Math.round(selectedObject.opacity * 100 || 100)}%
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="layers">
              <AccordionTrigger className="text-sm font-medium">
                Layers
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="space-y-1">
                  {layers.map((layer, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedIndex !== null && draggedIndex !== index) {
                          onReorderLayer(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                      onClick={() => onSelectLayer(layer)}
                      className={`flex items-center gap-2 p-2 rounded cursor-move ${
                        layer === selectedObject
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLayerVisibility(layer);
                        }}
                        className="shrink-0"
                      >
                        {layer.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </span>
                      <Input
                        value={
                          layer.name ||
                          `${
                            layer.type === "textbox"
                              ? "Text"
                              : layer.type || "Object"
                          } ${index + 1}`
                        }
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onUpdateLayer(layer, "name", e.target.value)
                        }
                        className={`h-7 text-xs flex-1 ${
                          layer === selectedObject
                            ? "bg-primary text-primary-foreground placeholder:text-primary-foreground border-primary-foreground"
                            : ""
                        }`}
                      />
                      <div
                        className="flex items-center gap-2 w-32"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Slider
                          value={[Math.round((layer.opacity ?? 1) * 100)]}
                          onValueChange={([value]) =>
                            onUpdateLayer(layer, "opacity", value / 100)
                          }
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">
                          {Math.round((layer.opacity ?? 1) * 100)}%
                        </span>
                      </div>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLayer(layer);
                        }}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
