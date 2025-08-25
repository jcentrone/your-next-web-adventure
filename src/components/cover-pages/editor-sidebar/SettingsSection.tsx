import {useEffect, useMemo, useRef} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

export function SettingsSection({
                                    onSettingsSubmit,
                                    register,
                                    reportTypes,
                                    reportTypeOptions,
                                    toggleReportType,
                                }: {
    onSettingsSubmit: React.FormEventHandler<HTMLFormElement>;
    register: any;
    reportTypes: string[];
    reportTypeOptions: { value: string; label: string }[];
    toggleReportType: (rt: string, checked: boolean) => void;
}) {
    // Always normalize to strings to avoid "123" vs 123 issues
    const selected = Array.isArray(reportTypes) ? reportTypes.map(String) : [];

    // Keep prior selection to diff changes across renders
    const prevSelectedRef = useRef<string[] | null>(null);

    // Precompute rows for logging + render
    const rows = useMemo(
        () =>
            reportTypeOptions.map((rt) => {
                const value = String(rt.value);
                const isChecked = selected.includes(value);
                return {value, label: rt.label, isChecked};
            }),
        [reportTypeOptions, selected]
    );

    // Log on every render
    useEffect(() => {
        console.groupCollapsed("[SettingsSection] render");
        console.log("reportTypes prop (raw):", reportTypes);
        console.log("selected (normalized):", selected);
        console.log("reportTypeOptions:", reportTypeOptions);
        console.table(rows);
        console.groupEnd();
    });

    // Log diffs when selection changes
    useEffect(() => {
        const prev = prevSelectedRef.current ?? [];
        const curr = selected;

        const added = curr.filter((v) => !prev.includes(v));
        const removed = prev.filter((v) => !curr.includes(v));

        if (added.length || removed.length) {
            console.group("[SettingsSection] selection diff");
            console.log("prev:", prev);
            console.log("curr:", curr);
            if (added.length) console.log("added:", added);
            if (removed.length) console.log("removed:", removed);
            console.groupEnd();
        }

        prevSelectedRef.current = curr;
    }, [selected]);

    return (
        <form onSubmit={onSettingsSubmit} className="space-y-2">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
            </div>

            <div className="space-y-1">
                <Label>Report Types</Label>

                {rows.map(({value, label, isChecked}) => (
                    <div
                        key={`${value}:${isChecked ? 1 : 0}`} // forces re-render if checked state flips
                        className="flex items-center space-x-2"
                        data-debug-row={value}
                        data-debug-checked={isChecked}
                    >
                        <Checkbox
                            id={`rt-${value}`}
                            value={value}
                            checked={Boolean(isChecked)} // ensure strictly boolean
                            onCheckedChange={(checked) => {
                                const next = Boolean(checked);
                                console.group("[SettingsSection] onCheckedChange");
                                console.log("value:", value);
                                console.log("label:", label);
                                console.log("wasChecked:", isChecked);
                                console.log("nextChecked (event):", next);
                                console.log("selected BEFORE:", selected);
                                console.groupEnd();
                                toggleReportType(value, next);
                            }}
                        />
                        <label htmlFor={`rt-${value}`} className="text-sm">
                            {label}
                        </label>
                    </div>
                ))}
            </div>

            <Button type="submit" className="w-full">
                Save
            </Button>
        </form>
    );
}
