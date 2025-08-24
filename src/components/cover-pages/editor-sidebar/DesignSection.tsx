import {COLOR_PALETTES, type ColorPalette} from "@/constants/colorPalettes.ts";
import {Label} from "@/components/ui/label.tsx";

export function DesignSection({
                                  templateOptions,
                                  register,
                                  palette,
                                  onApplyPalette,
                              }: {
    templateOptions: string[];
    register: any;
    palette: ColorPalette;
    onApplyPalette: (p: ColorPalette) => void;
}) {
    return (
        <div>
            <Label htmlFor="template">Template</Label>
            <select id="template" className="w-full border rounded h-9 px-2" {...register("template")}>
                {templateOptions.map((key) => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                ))}
            </select>

            <div className="mt-4 space-y-2">
                {COLOR_PALETTES.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => onApplyPalette(p)}
                        className={`flex w-full items-center gap-2 rounded border p-1 ${
                            palette.id === p.id ? "border-black" : "border-transparent"
                        }`}
                    >
                        <div className="flex flex-1 overflow-hidden rounded">
                            {p.colors.map((c) => (
                                <div key={c} className="h-6 w-full" style={{backgroundColor: c}}/>
                            ))}
                        </div>
                        <span className="text-xs">{p.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
