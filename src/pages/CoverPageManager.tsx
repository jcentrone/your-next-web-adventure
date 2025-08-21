import Seo from "@/components/Seo";
import { CoverPageList } from "@/components/cover-pages/CoverPageList";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCoverPages from "@/hooks/useCoverPages";

const REPORT_TYPES = [
  { value: "home_inspection", label: "Home Inspection" },
  { value: "wind_mitigation", label: "Wind Mitigation" },
];

export default function CoverPageManager() {
  const {
    coverPages,
    assignments,
    assignCoverPageToReportType,
    removeAssignmentFromReportType,
  } = useCoverPages();

  const currentAssignment = (rt: string) =>
    assignments.find((a) => a.report_type === rt)?.cover_page_id || "none";

  const handleReportTypeChange = async (rt: string, coverPageId: string) => {
    if (coverPageId === "none") {
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
        <CoverPageList coverPages={coverPages} />

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
                  <SelectItem value="none">None</SelectItem>
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

      </div>
    </>
  );
}
