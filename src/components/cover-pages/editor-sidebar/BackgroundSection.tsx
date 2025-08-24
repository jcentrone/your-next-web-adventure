import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";

export function BackgroundSection({
                                      bgColor,
                                      presetBgColors,
                                      updateBgColor,
                                  }: {
    bgColor: string;
    presetBgColors: string[];
    updateBgColor: (color: string) => void;
}) {
    return (
        <div>
            <Label htmlFor="bg-color">Background Color</Label>
            <Input id="bg-color" type="color" value={bgColor} onChange={(e) => updateBgColor(e.target.value)}/>
            <div className="flex flex-wrap gap-2 pt-2">
                {presetBgColors.map((c) => (
                    <button
                        key={c}
                        type="button"
                        className="h-6 w-6 rounded border"
                        style={{backgroundColor: c}}
                        onClick={() => updateBgColor(c)}
                    />
                ))}
            </div>
        </div>
    );
}
