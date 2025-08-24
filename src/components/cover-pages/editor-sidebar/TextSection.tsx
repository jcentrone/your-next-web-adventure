import type React from "react";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";

export function TextSection({addText}: { addText: () => void }) {
    return (
        <div className="space-y-2">
            <Button
                type="button"
                className="w-full"
                draggable
                data-drag-type="text"
                data-drag-payload={JSON.stringify({})}
                onClick={addText}
                title="Drag onto the canvas or click to add"
            >
                <Plus className="mr-2 h-4 w-4"/> Add Text Box
            </Button>
        </div>
    );
}
