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
    Triangle as TriangleIcon
} from "lucide-react";
import {icons as lucideIcons} from "lucide";

export function GraphicsSection({}: {
    addRect: () => void;
    addCircle: () => void;
    addStar: () => void;
    addTriangle: () => void;
    addPolygonShape: () => void;
    addArrow: () => void;
    addBidirectionalArrow: () => void;
    addIcon: (name: string) => void;
    addClipart: (hex: string) => void;
}) {
    const [iconSearch, setIconSearch] = useState("");
    const [clipartSearch, setClipartSearch] = useState("");
    const [openmojis, setOpenmojis] = useState<any[]>([]);

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
                    onDragStart={(e) =>
                        e.dataTransfer.setData(
                            "application/x-cover-element",
                            JSON.stringify({type: "rectangle"})
                        )
                    }
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Rectangle"
                >
                    <Square className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) =>
                        e.dataTransfer.setData(
                            "application/x-cover-element",
                            JSON.stringify({type: "circle"})
                        )
                    }
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Circle"
                >
                    <CircleIcon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) =>
                        e.dataTransfer.setData(
                            "application/x-cover-element",
                            JSON.stringify({type: "star"})
                        )
                    }
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Star"
                >
                    <StarIcon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) =>
                        e.dataTransfer.setData(
                            "application/x-cover-element",
                            JSON.stringify({type: "triangle"})
                        )
                    }
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Triangle"
                >
                    <TriangleIcon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) =>
                        e.dataTransfer.setData(
                            "application/x-cover-element",
                            JSON.stringify({type: "polygon"})
                        )
                    }
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Pentagon"
                >
                    <Pentagon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) =>
                        e.dataTransfer.setData(
                            "application/x-cover-element",
                            JSON.stringify({type: "arrow"})
                        )
                    }
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Arrow Right"
                >
                    <ArrowRightIcon className="stroke-black"/>
                </Button>
                <Button
                    draggable
                    onDragStart={(e) =>
                        e.dataTransfer.setData(
                            "application/x-cover-element",
                            JSON.stringify({type: "bidirectionalArrow"})
                        )
                    }
                    className="bg-[#ededed] w-16 h-16 p-0 rounded-md hover:bg-gray-300 flex items-center justify-center [&>svg]:!size-10"
                    aria-label="Bidirectional Arrow"
                >
                    <ArrowLeftRight className="stroke-black"/>
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
                            const IconComp = (LucideIcons as any)[pascal] as ComponentType<{ className?: string }>;
                            if (!IconComp) return null;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    className="p-1 border rounded hover:bg-accent flex items-center justify-center"
                                    draggable
                                    onDragStart={(e) =>
                                        e.dataTransfer.setData(
                                            "application/x-cover-element",
                                            JSON.stringify({type: "icon", name})
                                        )
                                    }
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
                                onDragStart={(e) =>
                                    e.dataTransfer.setData(
                                        "application/x-cover-element",
                                        JSON.stringify({type: "clipart", hex: c.hexcode})
                                    )
                                }
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
