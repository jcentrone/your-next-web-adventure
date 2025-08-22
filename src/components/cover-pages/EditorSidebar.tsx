import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Type,
  Image as ImageIcon,
  Shapes,
  Square,
  Circle as CircleIcon,
  Star,
  Triangle,
  Palette,
  Search,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

interface EditorSidebarProps {
  onAddText: () => void;
  onAddShape: (shape: string) => void;
  onAddIcon: (iconName: string) => void;
  images: any[];
  onAddImage: (imageUrl: string) => void;
  onUploadImage: (file: File) => void;
  colorPalettes: any[];
  onSelectPalette: (palette: any) => void;
  selectedPalette: any;
}

export function EditorSidebar({
  onAddText,
  onAddShape,
  onAddIcon,
  images,
  onAddImage,
  onUploadImage,
  colorPalettes,
  onSelectPalette,
  selectedPalette,
}: EditorSidebarProps) {
  const [iconSearch, setIconSearch] = useState("");
  const [imageSearch, setImageSearch] = useState("");

  // Get available icons for display
  const availableIcons = Object.keys(LucideIcons as any).filter((key) =>
    key.toLowerCase().includes(iconSearch.toLowerCase())
  ).slice(0, 100);

  const shapes = [
    { name: "Rectangle", icon: Square, action: () => onAddShape("rectangle") },
    { name: "Circle", icon: CircleIcon, action: () => onAddShape("circle") },
    { name: "Star", icon: Star, action: () => onAddShape("star") },
    { name: "Triangle", icon: Triangle, action: () => onAddShape("triangle") },
  ];

  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Tabs defaultValue="text" className="h-full">
        <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
          <TabsTrigger value="text" className="flex flex-col gap-1 py-3">
            <Type className="h-5 w-5" />
            <span className="text-xs">Text</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex flex-col gap-1 py-3">
            <ImageIcon className="h-5 w-5" />
            <span className="text-xs">Images</span>
          </TabsTrigger>
          <TabsTrigger value="shapes" className="flex flex-col gap-1 py-3">
            <Shapes className="h-5 w-5" />
            <span className="text-xs">Shapes</span>
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex flex-col gap-1 py-3">
            <Star className="h-5 w-5" />
            <span className="text-xs">Icons</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex flex-col gap-1 py-3">
            <Palette className="h-5 w-5" />
            <span className="text-xs">Colors</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="h-full p-4 mt-0">
          <div className="space-y-4">
            <Button
              onClick={onAddText}
              className="w-full justify-start"
              variant="outline"
            >
              <Type className="h-4 w-4 mr-2" />
              Add Text
            </Button>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Text Styles</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={onAddText}>
                  Heading
                </Button>
                <Button variant="outline" size="sm" onClick={onAddText}>
                  Body
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="h-full p-4 mt-0">
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadImage(file);
                }}
                className="mb-2"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="h-96">
              <div className="grid grid-cols-2 gap-2">
                {images
                  .filter((img) =>
                    img.name.toLowerCase().includes(imageSearch.toLowerCase())
                  )
                  .map((image) => (
                    <Button
                      key={image.id}
                      variant="outline"
                      className="h-20 p-1"
                      onClick={() => onAddImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="shapes" className="h-full p-4 mt-0">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Basic Shapes</h4>
            <div className="grid grid-cols-2 gap-2">
              {shapes.map((shape) => (
                <Button
                  key={shape.name}
                  variant="outline"
                  className="h-16 flex flex-col gap-1"
                  onClick={shape.action}
                >
                  <shape.icon className="h-6 w-6" />
                  <span className="text-xs">{shape.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="icons" className="h-full p-4 mt-0">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-96">
              <div className="grid grid-cols-4 gap-1">
                {availableIcons.map((iconName) => {
                  const IconComponent = (LucideIcons as any)[iconName];
                  if (!IconComponent) return null;
                  return (
                    <Button
                      key={iconName}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-2"
                      onClick={() => onAddIcon(iconName)}
                      title={iconName}
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="h-full p-4 mt-0">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Color Palettes</h4>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {colorPalettes.map((palette, index) => (
                  <div key={index} className="space-y-2">
                    <Button
                      variant={selectedPalette?.name === palette.name ? "default" : "outline"}
                      className="w-full justify-start text-xs"
                      onClick={() => onSelectPalette(palette)}
                    >
                      {palette.name}
                    </Button>
                    <div className="flex gap-1">
                      {palette.colors.slice(0, 6).map((color: string, colorIndex: number) => (
                        <div
                          key={colorIndex}
                          className="w-6 h-6 rounded border border-border cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => onSelectPalette(palette)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}