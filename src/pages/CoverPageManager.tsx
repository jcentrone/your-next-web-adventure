import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
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

  const isAssigned = (rt: string, id: string) => assignments[rt] === id;

  const handleToggle = async (rt: string, id: string) => {
    if (isAssigned(rt, id)) {
      await removeAssignmentFromReportType(rt);
    } else {
      await assignCoverPageToReportType(rt, id);
    }
  };

  return (
    <>
      <Seo
        title="Cover Page Manager - Home Inspection Platform"
        description="Manage custom cover pages for your reports"
      />
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Cover Pages</h2>
            <Button asChild>
              <Link to="/cover-page-manager/new">Create New Cover Page</Link>
            </Button>
          </div>
          <ul className="space-y-2">
            {coverPages.map((cp) => (
              <li
                key={cp.id}
                className="border rounded p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span>{cp.name}</span>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/cover-page-manager/${cp.id}`}>Edit</Link>
                  </Button>
                </div>
                <div className="flex gap-2">
                  {REPORT_TYPES.map((rt) => (
                    <Button
                      key={rt.value}
                      variant={isAssigned(rt.value, cp.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggle(rt.value, cp.id)}
                    >
                      {rt.label}
                    </Button>
                  ))}
                </div>
              </li>
            ))}
            {coverPages.length === 0 && (
              <li className="text-sm text-muted-foreground">No cover pages yet.</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
