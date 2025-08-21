import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CoverPagePreview } from "./CoverPagePreview";
import type { CoverPage } from "@/integrations/supabase/coverPagesApi";

const TEMPLATES = [
  { value: "default", label: "Default" },
  { value: "modern", label: "Modern" },
];

const REPORT_TYPES = [
  { value: "home_inspection", label: "Home Inspection" },
  { value: "wind_mitigation", label: "Wind Mitigation" },
];

interface CoverPageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    templateSlug?: string;
    colorPaletteKey?: string;
    textContent?: string;
    imageUrl?: string;
    reportTypes: string[];
  }) => Promise<void>;
  coverPage?: CoverPage;
  initialReportTypes?: string[];
}

export function CoverPageEditor({
  open,
  onOpenChange,
  onSave,
  coverPage,
  initialReportTypes = [],
}: CoverPageEditorProps) {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("default");
  const [color, setColor] = useState("#000000");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [reportTypes, setReportTypes] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(coverPage?.name || "");
      setTemplate(coverPage?.template_slug || "default");
      setColor(coverPage?.color_palette_key || "#000000");
      setText((coverPage?.text_content as string) || "");
      setImageUrl(coverPage?.image_url || "");
      setReportTypes(initialReportTypes);
    }
  }, [open, coverPage, initialReportTypes]);

  const toggleReportType = (rt: string) => {
    setReportTypes((prev) =>
      prev.includes(rt) ? prev.filter((t) => t !== rt) : [...prev, rt]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name,
      templateSlug: template,
      colorPaletteKey: color,
      textContent: text,
      imageUrl,
      reportTypes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{coverPage ? "Edit Cover Page" : "New Cover Page"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Template</Label>
              <Select value={template} onValueChange={setTemplate}>
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
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://"
              />
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{coverPage ? "Save" : "Create"}</Button>
            </div>
          </div>
          <div className="flex items-start justify-center">
            <CoverPagePreview
              title={name}
              text={text}
              color={color}
              imageUrl={imageUrl}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CoverPageEditor;
