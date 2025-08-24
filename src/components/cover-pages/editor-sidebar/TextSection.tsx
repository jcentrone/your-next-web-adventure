import type React from "react";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {AlignCenter, AlignLeft, AlignRight, Bold, Italic, Plus} from "lucide-react";

export function TextSection({
                                selected,
                                updateSelected,
                                fonts,
                            }: {
    addText: () => void;
    selected: any | null;
    updateSelected: (prop: string, value: unknown) => void;
    fonts: string[];
}) {
    const isTextbox = selected?.type === "textbox";

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData(
            "application/x-cover-element",
            JSON.stringify({type: "text"})
        );
    };

    return (
        <div className="space-y-2">
            <Button
                draggable
                onDragStart={handleDragStart}
                className="w-full"
            >
                <Plus className="mr-2 h-4 w-4"/> Add Text Box
            </Button>

            {isTextbox && (
                <>
                    <div>
                        <Label htmlFor="text-color">Color</Label>
                        <Input
                            id="text-color"
                            type="color"
                            value={typeof selected.fill === "string" ? selected.fill : "#000000"}
                            onChange={(e) => updateSelected("fill", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="text-font-size">Font Size</Label>
                        <Input
                            id="text-font-size"
                            type="number"
                            value={selected.fontSize || 16}
                            onChange={(e) => updateSelected("fontSize", parseInt(e.target.value, 10))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <select
                            id="fontFamily"
                            className="w-full border rounded h-9 px-2"
                            value={selected.fontFamily || ""}
                            onChange={(e) => updateSelected("fontFamily", e.target.value)}
                        >
                            {fonts.map((f) => (
                                <option key={f} value={f}>
                                    {f}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            size="icon"
                            aria-label="Bold"
                            variant={selected.fontWeight === "bold" ? "default" : "outline"}
                            onClick={() => updateSelected("fontWeight", selected.fontWeight === "bold" ? "normal" : "bold")}
                        >
                            <Bold className="h-4 w-4"/>
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            aria-label="Italic"
                            variant={selected.fontStyle === "italic" ? "default" : "outline"}
                            onClick={() => updateSelected("fontStyle", selected.fontStyle === "italic" ? "normal" : "italic")}
                        >
                            <Italic className="h-4 w-4"/>
                        </Button>
                    </div>

                    <div>
                        <Label>Alignment</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="icon"
                                aria-label="Align Left"
                                variant={selected.textAlign === "left" ? "default" : "outline"}
                                onClick={() => updateSelected("textAlign", "left")}
                            >
                                <AlignLeft className="h-4 w-4"/>
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                aria-label="Align Center"
                                variant={selected.textAlign === "center" ? "default" : "outline"}
                                onClick={() => updateSelected("textAlign", "center")}
                            >
                                <AlignCenter className="h-4 w-4"/>
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                aria-label="Align Right"
                                variant={selected.textAlign === "right" ? "default" : "outline"}
                                onClick={() => updateSelected("textAlign", "right")}
                            >
                                <AlignRight className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
