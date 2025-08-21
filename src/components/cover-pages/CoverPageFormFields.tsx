import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const TEMPLATES = [
  { value: "default", label: "Default" },
  { value: "modern", label: "Modern" },
];

const REPORT_TYPES = [
  { value: "home_inspection", label: "Home Inspection" },
  { value: "wind_mitigation", label: "Wind Mitigation" },
];

export interface CoverPageForm {
  name: string;
  template: string;
  color: string;
  text: string;
  imageUrl: string;
  reportTypes: string[];
}

interface CoverPageFormFieldsProps {
  form: UseFormReturn<CoverPageForm>;
}

export function CoverPageFormFields({ form }: CoverPageFormFieldsProps) {
  const { register, watch, setValue } = form;
  const template = watch("template");
  const reportTypes = watch("reportTypes");

  const toggleReportType = (rt: string) => {
    const current = watch("reportTypes");
    if (current.includes(rt)) {
      setValue(
        "reportTypes",
        current.filter((t) => t !== rt),
      );
    } else {
      setValue("reportTypes", [...current, rt]);
    }
  };

  return (
    <>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
      </div>
      <div>
        <Label>Template</Label>
        <Select value={template} onValueChange={(val) => setValue("template", val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="text">Text</Label>
        <Textarea id="text" {...register("text")} />
      </div>
      <div>
        <Label htmlFor="color">Color</Label>
        <Input id="color" type="color" {...register("color")} />
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" {...register("imageUrl")} placeholder="https://" />
      </div>
      <div className="space-y-2">
        <Label>Report Types</Label>
        {REPORT_TYPES.map((rt) => (
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
    </>
  );
}

export default CoverPageFormFields;

