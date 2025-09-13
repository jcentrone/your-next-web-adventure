import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Palette
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

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

type ToolType = "select" | "arrow" | "text" | "rectangle" | "circle" | "line" | "draw";

interface AnnotationToolbarProps {
  activeTool: ToolType;
  activeColor: string;
  onToolClick: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

const TOOL_CONFIGS = [
  { tool: "select" as const, icon: MousePointer, label: "Select and move objects" },
  { tool: "draw" as const, icon: Pencil, label: "Free drawing tool" },
  { tool: "arrow" as const, icon: ArrowUpRight, label: "Add arrow" },
  { tool: "text" as const, icon: Type, label: "Add text (double-click to edit)" },
  { tool: "rectangle" as const, icon: Square, label: "Add rectangle" },
  { tool: "circle" as const, icon: Circle, label: "Add circle" },
  { tool: "line" as const, icon: Minus, label: "Add line" },
];

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeTool,
  activeColor,
  onToolClick,
  onColorChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  disabled = false
}) => {
  const isMobile = useIsMobile();

  const ToolButton = ({ config }: { config: typeof TOOL_CONFIGS[0] }) => {
    const Icon = config.icon;
    const isActive = activeTool === config.tool;
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "default" : "outline"}
            size={isMobile ? "sm" : "sm"}
            onClick={() => {
              console.log("🎯 Toolbar button clicked:", config.tool);
              onToolClick(config.tool);
            }}
            disabled={disabled}
            className={`
              ${isMobile ? "min-w-[2.5rem]" : ""}
              ${isActive ? "ring-2 ring-primary/50" : ""}
              transition-all duration-200
            `}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
          {disabled && <p className="text-xs text-muted-foreground">Canvas loading...</p>}
        </TooltipContent>
      </Tooltip>
    );
  };

  const ColorPicker = () => (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`${isMobile ? 'w-10 h-8' : 'w-12 h-8'} p-1`}
              disabled={disabled}
            >
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: activeColor }}
                />
                {!isMobile && <Palette className="h-3 w-3" />}
              </div>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Choose color</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-48 p-2">
        <div className="grid grid-cols-3 gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                activeColor === color ? "border-primary" : "border-border"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  const UndoRedoButtons = () => (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo || disabled}
          >
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo || disabled}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  if (isMobile) {
    return (
      <div className="border-b bg-muted/50">
        <TooltipProvider>
          <ScrollArea className="w-full">
            <div className="flex items-center gap-1 p-2 min-w-max">
              {/* Tools */}
              <div className="flex items-center gap-1">
                {TOOL_CONFIGS.map((config) => (
                  <ToolButton key={config.tool} config={config} />
                ))}
              </div>
              
              {/* Separator */}
              <div className="h-6 w-px bg-border mx-2" />
              
              {/* Color picker */}
              <ColorPicker />
              
              {/* Separator */}
              <div className="h-6 w-px bg-border mx-2" />
              
              {/* Undo/Redo */}
              <UndoRedoButtons />
            </div>
          </ScrollArea>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-4 border-b bg-muted/50">
      <TooltipProvider>
        {/* Tool selection */}
        <div className="flex items-center gap-1 mr-4">
          {TOOL_CONFIGS.map((config) => (
            <ToolButton key={config.tool} config={config} />
          ))}
        </div>

        {/* Color picker */}
        <ColorPicker />

        {/* Undo/Redo */}
        <div className="ml-4">
          <UndoRedoButtons />
        </div>
      </TooltipProvider>
    </div>
  );
};