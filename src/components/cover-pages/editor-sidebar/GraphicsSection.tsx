import {type ComponentType, useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import * as LucideIcons from "lucide-react";
import {
    ArrowLeftRight,
    ArrowRight as ArrowRightIcon,
    Circle as CircleIcon,
    Pentagon,
    Square,
    Star as StarIcon,
    Triangle as TriangleIcon,
    Pencil,
    PenTool,
    Spline,
} from "lucide-react";
import {icons as lucideIcons} from "lucide";

export function GraphicsSection({
                                    addRect,
                                    addCircle,
                                    addStar,
                                    addTriangle,
                                    addPolygonShape,
                                    addArrow,
                                    addBidirectionalArrow,
                                    addFreeformPath,
                                    addBezierCurve,
                                    addIcon,
                                    addClipart,
                                }: {
    addRect: () => void;
    addCircle: () => void;
    addStar: () => void;
    addTriangle: () => void;
    addPolygonShape: () => void;
    addArrow: () => void;
    addBidirectionalArrow: () => void;
    addFreeformPath: () => void;
    addBezierCurve: () => void;
    addIcon: (name: string) => void;
    addClipart: (hex: string) => void;
}) {
    const [iconSearch, setIconSearch] = useState("");
    const [clipartSearch, setClipartSearch] = useState("");
    type Openmoji = { annotation: string; hexcode: string };
    const [openmojis, setOpenmojis] = useState<Openmoji[]>([]);

    useEffect(() => {
        fetch("https://cdn.jsdelivr.net/npm/openmoji@16.0.0/data/openmoji.json")
            .then((r) => r.json())
            .then(setOpenmojis)
            .catch(() => setOpenmojis([]));
    }, []);

    return (
        <div className="space-y-2">
            {/* primitives */}
            <div className="flex flex-wrap gap-3">
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "rectangle"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addRect}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Rectangle"
                >
                    <Square className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "circle"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addCircle}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Circle"
                >
                    <CircleIcon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "star"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addStar}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Star"
                >
                    <StarIcon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "triangle"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addTriangle}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Triangle"
                >
                    <TriangleIcon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "polygon"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addPolygonShape}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Pentagon"
                >
                    <Pentagon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "arrow"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addArrow}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Arrow Right"
                >
                    <ArrowRightIcon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "bidirectionalArrow"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addBidirectionalArrow}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Bidirectional Arrow"
                >
                    <ArrowLeftRight className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "freeformPath"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addFreeformPath}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Freeform Path"
                >
                    <Pencil className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) => {
                        const payload = JSON.stringify({type: "bezierCurve"});
                        e.dataTransfer?.setData("application/x-cover-element", payload);
                        e.dataTransfer!.effectAllowed = "copy";
                    }}
                    onClick={addBezierCurve}
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Bezier Curve"
                >
                    <Spline className="stroke-black"/>
                </Button>
            </div>

            {/* Icons */}
            <div className="pt-2">
                <Label htmlFor="icon-search">Icons</Label>
                <Input
                    id="icon-search"
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                />
                <div className="mt-2 grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                    {Object.keys(lucideIcons)
                        .filter((name) => name.toLowerCase().includes(iconSearch.toLowerCase()))
                        .slice(0, 50)
                        .map((name) => {
                            const pascal = name
                                .split("-")
                                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                                .join("");
                            const iconRecord = LucideIcons as Record<string, ComponentType<{ className?: string }>>;
                            const IconComp = iconRecord[pascal];
                            if (!IconComp) return null;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                className="p-1 border rounded hover:bg-accent flex items-center justify-center"
                                draggable
                                onDragStart={(e) => {
                                        const payload = JSON.stringify({type: "icon", data: {name}});
                                        e.dataTransfer?.setData("application/x-cover-element", payload);
                                        e.dataTransfer!.effectAllowed = "copy";
                                    }}
                                    onClick={() => addIcon(name)}
                                    title={name}
                                >
                                    <IconComp className="h-4 w-4"/>
                                </button>
                            );
                        })}
                </div>
            </div>

            {/* Clipart */}
            <div className="pt-2">
                <Label htmlFor="clipart-search">Clipart</Label>
                <Input
                    id="clipart-search"
                    placeholder="Search clipart..."
                    value={clipartSearch}
                    onChange={(e) => setClipartSearch(e.target.value)}
                />
                <div className="mt-2 grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                    {openmojis
                        .filter((c) => c.annotation.toLowerCase().includes(clipartSearch.toLowerCase()))
                        .slice(0, 50)
                        .map((c) => (
                            <button
                                key={c.hexcode}
                                type="button"
                                className="p-1 border rounded hover:bg-accent flex items-center justify-center"
                                draggable
                                onDragStart={(e) => {
                                    const payload = JSON.stringify({type: "clipart", data: {hex: c.hexcode}});
                                    e.dataTransfer?.setData("application/x-cover-element", payload);
                                    e.dataTransfer!.effectAllowed = "copy";
                                }}
                                onClick={() => addClipart(c.hexcode)}
                                title={c.annotation}
                            >
                                <img
                                    src={`https://cdn.jsdelivr.net/npm/openmoji@16.0.0/color/svg/${c.hexcode}.svg`}
                                    alt={c.annotation}
                                    className="h-4 w-4"
                                />
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}
