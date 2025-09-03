import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { InfoFieldWidget } from "./InfoFieldWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { uploadFindingFiles, getSignedUrlFromSupabaseUrl, isSupabaseUrl } from "@/integrations/supabase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { dbUpdateReport } from "@/integrations/supabase/reportsApi";
import { toast } from "@/components/ui/use-toast";
import type { ManufacturedHomeInsurancePrepReport } from "@/lib/reportSchemas";
import { MANUFACTURED_HOME_QUESTIONS } from "@/constants/manufacturedHomeQuestions";

interface EditorProps {
  report: ManufacturedHomeInsurancePrepReport;
  onUpdate: (r: ManufacturedHomeInsurancePrepReport) => void;
}

const sectionSchema = MANUFACTURED_HOME_QUESTIONS.sections.reduce((acc, section) => {
  acc[section.name] = z.record(z.any()).optional();
  return acc;
}, {} as Record<string, any>);
const FormSchema = z.object(sectionSchema);

const ManufacturedHomeEditor: React.FC<EditorProps> = ({ report, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coverPreviewUrl, setCoverPreviewUrl] = React.useState<string>("");
  const [photoPreviews, setPhotoPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!report.coverImage) return;
    if (!user || !isSupabaseUrl(report.coverImage)) {
      setCoverPreviewUrl(report.coverImage);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const signed = await getSignedUrlFromSupabaseUrl(report.coverImage);
        if (!cancelled) setCoverPreviewUrl(signed);
      } catch (e) {
        console.error("Failed to sign cover image", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, report.coverImage]);

  const form = useForm<any>({
    resolver: zodResolver(FormSchema),
    defaultValues: report.reportData || {},
  });

  React.useEffect(() => {
    const photos: string[] = form.getValues("photos_notes.photos") || [];
    if (photos.length === 0) return;
    if (!user) {
      setPhotoPreviews(photos);
      return;
    }
    let cancelled = false;
    (async () => {
      const signed = await Promise.all(
        photos.map(async (p) => (isSupabaseUrl(p) ? await getSignedUrlFromSupabaseUrl(p) : p))
      );
      if (!cancelled) setPhotoPreviews(signed);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, form]);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (user) {
      try {
        const uploaded = await uploadFindingFiles({
          userId: user.id,
          reportId: report.id,
          findingId: "cover",
          files: [file],
        });
        if (uploaded[0]) {
          const updated = { ...report, coverImage: uploaded[0].url };
          onUpdate(updated);
          const signed = await getSignedUrlFromSupabaseUrl(uploaded[0].url);
          setCoverPreviewUrl(signed);
          await dbUpdateReport(updated);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const updated = { ...report, coverImage: url };
        onUpdate(updated);
        setCoverPreviewUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async (files: FileList) => {
    if (!files.length) return;
    if (user) {
      try {
        const uploaded = await uploadFindingFiles({
          userId: user.id,
          reportId: report.id,
          findingId: "photos",
          files: Array.from(files),
        });
        const urls = uploaded.map((u) => u.url);
        const current = form.getValues("photos_notes.photos") || [];
        const newVals = [...current, ...urls];
        form.setValue("photos_notes.photos", newVals);
        const updated = { ...report, reportData: form.getValues() };
        onUpdate(updated);
        await dbUpdateReport(updated);
        const signed = await Promise.all(urls.map((u) => getSignedUrlFromSupabaseUrl(u)));
        setPhotoPreviews((prev) => [...prev, ...signed]);
      } catch (e) {
        console.error(e);
      }
    } else {
      const readers = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );
      const urls = await Promise.all(readers);
      const current = form.getValues("photos_notes.photos") || [];
      const newVals = [...current, ...urls];
      form.setValue("photos_notes.photos", newVals);
      const updated = { ...report, reportData: form.getValues() };
      onUpdate(updated);
      setPhotoPreviews((prev) => [...prev, ...urls]);
    }
  };

  const handleSave = async () => {
    try {
      const current = form.getValues();
      const updated = { ...report, reportData: current } as ManufacturedHomeInsurancePrepReport;
      await dbUpdateReport(updated);
      onUpdate(updated);
      toast({ title: "Report saved" });
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{MANUFACTURED_HOME_QUESTIONS.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate("/reports")}>Back to Reports</Button>
          <Button variant="outline" onClick={() => navigate(`/reports/${report.id}/preview`)}>Preview</Button>
          <Button onClick={handleSave}>Save Report</Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Cover Image</Label>
        {coverPreviewUrl && (
          <img src={coverPreviewUrl} alt="Cover" className="h-40 w-auto rounded border" />
        )}
        <Input type="file" accept="image/*" onChange={handleCoverImageUpload} />
      </div>

      {MANUFACTURED_HOME_QUESTIONS.sections.find((s) => s.name === "photos_notes") && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Upload Photos</Label>
          <Input type="file" accept="image/*" multiple onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)} />
          {photoPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photoPreviews.map((url, idx) => (
                <img key={idx} src={url} alt="" className="h-24 w-auto rounded border" />
              ))}
            </div>
          )}
        </div>
      )}

      <Form {...form}>
        <div className="space-y-8">
          {MANUFACTURED_HOME_QUESTIONS.sections.filter((s) => s.name !== "photos_notes").map((section) => (
            <div key={section.name} className="space-y-4">
              <h2 className="text-xl font-semibold capitalize">{section.name.replace(/_/g, " ")}</h2>
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={`${section.name}.${field.name}`}
                  render={({ field: f }) => (
                    <InfoFieldWidget
                      field={{ ...field, widget: field.widget === "radio" ? "select" : field.widget }}
                      value={f.value || ""}
                      onChange={(val) => f.onChange(val)}
                    />
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </Form>
    </div>
  );
};

export default ManufacturedHomeEditor;
