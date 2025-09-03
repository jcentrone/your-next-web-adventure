import React from "react";
import { WindMitigationReport } from "@/lib/reportSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { dbUpdateReport } from "@/integrations/supabase/reportsApi";
import { toast } from "@/components/ui/use-toast";

interface WindMitigationMainEditorProps {
  report: WindMitigationReport;
  onUpdate: (report: WindMitigationReport) => void;
}

const WindMitigationMainEditor: React.FC<WindMitigationMainEditorProps> = ({ report, onUpdate }) => {
  const nav = useNavigate();

  const handleSave = async () => {
    try {
      await dbUpdateReport(report);
      onUpdate(report);
      toast({ title: "Report saved" });
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Uniform Mitigation Verification Inspection</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => nav("/reports")}>Back to Reports</Button>
          <Button variant="outline" onClick={() => nav(`/reports/${report.id}/preview`)}>Preview</Button>
          <Button onClick={handleSave}>Save Report</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Uniform Mitigation Verification Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Form OIR-B1-1802 (Rev. 01/12)
          </p>
          <p className="text-muted-foreground">
            This uniform mitigation inspection form will be fully implemented in the next update.
            It will include all 7 questions from the Florida Uniform Mitigation Verification Inspection:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Building Code Compliance</li>
            <li>• Roof Covering</li>
            <li>• Roof Deck Attachment</li>
            <li>• Roof-to-Wall Attachment</li>
            <li>• Roof Geometry</li>
            <li>• Secondary Water Resistance</li>
            <li>• Opening Protection</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WindMitigationMainEditor;