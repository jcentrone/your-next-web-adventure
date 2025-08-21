import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CoverPagePreview } from "@/components/cover-pages/CoverPagePreview";
import useCoverPages from "@/hooks/useCoverPages";

const TEMPLATES = [
  { value: "default", label: "Default" },
  { value: "modern", label: "Modern" },
];

const REPORT_TYPES = [
  { value: "home_inspection", label: "Home Inspection" },
  { value: "wind_mitigation", label: "Wind Mitigation" },
];

export default function CoverPageEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    coverPages,
    assignments,
    createCoverPage,
    updateCoverPage,
    assignCoverPageToReportType,
    removeAssignmentFromReportType,
  } = useCoverPages();

  const editing = !!id;
  const coverPage = editing ? coverPages.find((cp) => cp.id === id) : undefined;

  interface CoverPageForm {
    name: string;
    template: string;
    color: string;
    text: string;
    imageUrl: string;
    reportTypes: string[];
  }

  const { register, handleSubmit, watch, setValue, reset } = useForm<CoverPageForm>({
    defaultValues: {
      name: "",
      template: "default",
      color: "#000000",
      text: "",
      imageUrl: "",
      reportTypes: [],
    },
  });

  const name = watch("name");
  const template = watch("template");
  const color = watch("color");
  const text = watch("text");
  const imageUrl = watch("imageUrl");
  const reportTypes = watch("reportTypes");

  useEffect(() => {
    if (coverPage) {
      const assigned = assignments
        .filter((a) => a.cover_page_id === coverPage.id)
        .map((a) => a.report_type);
      reset({
        name: coverPage.name || "",
        template: coverPage.template_slug || "default",
        color: coverPage.color_palette_key || "#000000",
        text: (coverPage.text_content as string) || "",
        imageUrl: coverPage.image_url || "",
        reportTypes: assigned,
      });
    }
  }, [coverPage, assignments, reset]);

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

  const handleSave = handleSubmit(async (data) => {
    if (editing && coverPage) {
      await updateCoverPage(coverPage.id, {
        name: data.name,
        template_slug: data.template,
        color_palette_key: data.color,
        text_content: data.text,
        image_url: data.imageUrl,
      });
      const current = assignments
        .filter((a) => a.cover_page_id === coverPage.id)
        .map((a) => a.report_type);
      for (const rt of current) {
        if (!data.reportTypes.includes(rt)) {
          await removeAssignmentFromReportType(rt);
        }
      }
      for (const rt of data.reportTypes) {
        await assignCoverPageToReportType(rt, coverPage.id);
      }
    } else {
      const newCp = await createCoverPage({
        name: data.name,
        template_slug: data.template,
        color_palette_key: data.color,
        text_content: data.text,
        image_url: data.imageUrl,
      });
      for (const rt of data.reportTypes) {
        await assignCoverPageToReportType(rt, newCp.id);
      }
    }
    navigate("/cover-page-manager");
  });

  return (
    <>
      <Seo
        title={editing ? "Edit Cover Page" : "New Cover Page"}
        description="Create and customize report cover pages"
      />
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/cover-page-manager")}
          className="mb-4"
        >
          Back
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")}/>
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cover-page-manager")}
              >
                Back
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
          <div className="flex justify-center">
            <CoverPagePreview
              title={name}
              text={text}
              color={color}
              imageUrl={imageUrl}
            />
          </div>
        </div>
      </div>
    </>
  );
}

