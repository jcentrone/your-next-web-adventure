import type React from "react";
import {useState} from "react";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Trash2} from "lucide-react";

type ImageLibItem = { path: string; url: string; name: string };

export function ImagesSection({
                                  images,
                                  onImageUpload,
                                  onDeleteImage,
                                  onAddImageFromUrl,
                              }: {
    images: ImageLibItem[];
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteImage: (path: string) => void;
    onAddImageFromUrl: (url: string) => void;
}) {
    const [url, setUrl] = useState("");

    const handleAdd = () => {
        const trimmed = url.trim();
        if (!trimmed) return;
        onAddImageFromUrl(trimmed);
        setUrl("");
    };

    return (
        <div>
            <Label htmlFor="image-upload" className="mb-1 block">
                Image Upload
            </Label>
            <Input id="image-upload" type="file" onChange={onImageUpload}/>

            <div className="mt-2 flex gap-2">
                <Input
                    type="url"
                    placeholder="Image URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <Button type="button" onClick={handleAdd}>
                    Add
                </Button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                {images.map((img) => (
                    <div
                        key={img.path}
                        className="relative group"
                        draggable
                        data-drag-type="image"
                        data-drag-payload={JSON.stringify({url: img.url})}
                    >
                        <img
                            src={img.url}
                            alt={img.name}
                            className="h-20 w-full object-cover cursor-pointer"
                            data-drag-image
                        />
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
