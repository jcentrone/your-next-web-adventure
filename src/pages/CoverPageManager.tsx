import { useState } from "react";
import Seo from "@/components/Seo";
import { CoverPageList } from "@/components/cover-pages/CoverPageList";
import { CoverPageEditor } from "@/components/cover-pages/CoverPageEditor";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCoverPages from "@/hooks/useCoverPages";
import type { CoverPage } from "@/integrations/supabase/coverPagesApi";

const REPORT_TYPES = [
  { value: "home_inspection", label: "Home Inspection" },
  { value: "wind_mitigation", label: "Wind Mitigation" },
];

export default function CoverPageManager() {
  const {
    coverPages,
    assignments,
    createCoverPage,
    updateCoverPage,
    assignCoverPageToReportType,
    removeAssignmentFromReportType,
  } = useCoverPages();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CoverPage | undefined>();
  const [initialReportTypes, setInitialReportTypes] = useState<string[]>([]);

  const handleCreate = () => {
    setEditing(undefined);
    setInitialReportTypes([]);
    setEditorOpen(true);
  };

  const handleEdit = (cp: CoverPage) => {
    setEditing(cp);
    const assigned = assignments
      .filter((a) => a.cover_page_id === cp.id)
      .map((a) => a.report_type);
    setInitialReportTypes(assigned);
    setEditorOpen(true);
  };

  const handleSave = async (data: {
    name: string;
    templateSlug?: string;
    colorPaletteKey?: string;
    textContent?: string;
    imageUrl?: string;
    reportTypes: string[];
  }) => {
    if (editing) {
      await updateCoverPage(editing.id, {
        name: data.name,
        template_slug: data.templateSlug,
        color_palette_key: data.colorPaletteKey,
        text_content: data.textContent,
        image_url: data.imageUrl,
      });
      const current = assignments
        .filter((a) => a.cover_page_id === editing.id)
        .map((a) => a.report_type);
      for (const rt of current) {
        if (!data.reportTypes.includes(rt)) {
          await removeAssignmentFromReportType(rt);
        }
      }
      for (const rt of data.reportTypes) {
        await assignCoverPageToReportType(rt, editing.id);
      }
    } else {
      const newCp = await createCoverPage({
        name: data.name,
        template_slug: data.templateSlug,
        color_palette_key: data.colorPaletteKey,
        text_content: data.textContent,
        image_url: data.imageUrl,
      });
      for (const rt of data.reportTypes) {
        await assignCoverPageToReportType(rt, newCp.id);
      }
    }
    setEditorOpen(false);
  };

  const currentAssignment = (rt: string) =>
    assignments.find((a) => a.report_type === rt)?.cover_page_id || "";

  const handleReportTypeChange = async (rt: string, coverPageId: string) => {
    if (!coverPageId) {
      await removeAssignmentFromReportType(rt);
    } else {
      await assignCoverPageToReportType(rt, coverPageId);
    }
  };

  return (
    <>
      <Seo
        title="Cover Page Manager - Home Inspection Platform"
        description="Manage custom cover pages for your reports"
      />
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <CoverPageList
          coverPages={coverPages}
          onEdit={handleEdit}
          onCreate={handleCreate}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Report Type Assignments</h2>
          {REPORT_TYPES.map((rt) => (
            <div key={rt.value} className="flex items-center gap-2">
              <Label className="w-40">{rt.label}</Label>
              <Select
                value={currentAssignment(rt.value)}
                onValueChange={(value) => handleReportTypeChange(rt.value, value)}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select cover page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {coverPages.map((cp) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <CoverPageEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          coverPage={editing}
          initialReportTypes={initialReportTypes}
          onSave={handleSave}
        />
      </div>
    </>
  );
}
