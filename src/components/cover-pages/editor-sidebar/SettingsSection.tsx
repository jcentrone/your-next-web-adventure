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
    toggleReportType: (rt: string) => void;
}) {
    console.log("SettingsSection render - reportTypes:", reportTypes, "options:", reportTypeOptions);
    
    return (
        <form onSubmit={onSettingsSubmit} className="space-y-2">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
            </div>
            <div className="space-y-1">
                <Label>Report Types</Label>
                {reportTypeOptions.map((rt) => (
                    <div key={rt.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={`rt-${rt.value}`}
                            checked={reportTypes.includes(rt.value)}
                            onCheckedChange={() => toggleReportType(rt.value)}
                        />
                        <label htmlFor={`rt-${rt.value}`} className="text-sm">
                            {rt.label}
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
