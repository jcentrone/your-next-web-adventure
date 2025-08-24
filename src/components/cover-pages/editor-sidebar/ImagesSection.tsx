import type React from "react";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Trash2} from "lucide-react";

type ImageLibItem = { path: string; url: string; name: string };

export function ImagesSection({
                                  images,
                                  onImageUpload,
                                  onDeleteImage,
                              }: {
    images: ImageLibItem[];
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteImage: (path: string) => void;
    onAddImageFromUrl: (url: string) => void;
}) {
    const handleDragStart = (e: React.DragEvent, url: string) => {
        e.dataTransfer.setData(
            "application/x-cover-element",
            JSON.stringify({type: "image", url})
        );
    };

    return (
        <div>
            <Label htmlFor="image-upload" className="mb-1 block">
                Image Upload
            </Label>
            <Input id="image-upload" type="file" onChange={onImageUpload}/>
            <div className="mt-4 grid grid-cols-3 gap-2">
                {images.map((img) => (
                    <div
                        key={img.path}
                        className="relative group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, img.url)}
                    >
                        <img src={img.url} alt={img.name} className="h-20 w-full object-cover cursor-pointer"/>
                        <button
                            type="button"
                            className="absolute top-1 right-1 rounded-full bg-white p-1 text-red-500 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteImage(img.path);
                            }}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
