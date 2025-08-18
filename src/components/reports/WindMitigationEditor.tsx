import React from "react";
import { WindMitigationReport } from "@/lib/reportSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WindMitigationEditorProps {
  report: WindMitigationReport;
  onUpdate: (report: WindMitigationReport) => void;
}

const WindMitigationEditor: React.FC<WindMitigationEditorProps> = ({ report, onUpdate }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wind Mitigation Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Wind mitigation editor is coming soon. This will include all 7 questions from the 
            Florida Uniform Mitigation Verification Inspection form.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WindMitigationEditor;