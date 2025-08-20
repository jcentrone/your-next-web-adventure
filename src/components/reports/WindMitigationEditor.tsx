import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WindMitigationReport, WindMitigationDataSchema } from "@/lib/reportSchemas";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { WIND_MITIGATION_QUESTIONS } from "@/constants/windMitigationQuestions";
import { BuildingCodeQuestion } from "./windmitigation/BuildingCodeQuestion";
import { RoofCoveringQuestion } from "./windmitigation/RoofCoveringQuestion";
import { OpeningProtectionQuestion } from "./windmitigation/OpeningProtectionQuestion";
import { GenericQuestion } from "./windmitigation/GenericQuestion";

interface WindMitigationEditorProps {
  report: WindMitigationReport;
  onUpdate: (report: WindMitigationReport) => void;
}

const WindMitigationEditor: React.FC<WindMitigationEditorProps> = ({ report, onUpdate }) => {
  console.log("WindMitigationEditor render", { reportId: report.id, reportData: report.reportData });
  
  const form = useForm({
    resolver: zodResolver(WindMitigationDataSchema),
    defaultValues: report.reportData || {
      "1_building_code": {},
      "2_roof_covering": {},
      "3_roof_deck_attachment": {},
      "4_roof_to_wall_attachment": {},
      "5_roof_geometry": {},
      "6_secondary_water_resistance": {},
      "7_opening_protection": {},
      inspectorComments: ""
    },
  });

  const { watch, control, handleSubmit } = form;
  
  const handleSave = handleSubmit((data) => {
    try {
      console.log("Manual save triggered", data);
      const updatedReport = {
        ...report,
        reportData: data,
      };
      onUpdate(updatedReport);
      toast({
        title: "Report saved",
        description: "Wind mitigation report has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving wind mitigation report:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving the report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const questions = WIND_MITIGATION_QUESTIONS.questions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{WIND_MITIGATION_QUESTIONS.form_name}</h1>
          <p className="text-sm text-muted-foreground">Form {WIND_MITIGATION_QUESTIONS.version}</p>
        </div>
        <Button onClick={handleSave} className="shrink-0">
          Save Report
        </Button>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Question 1: Building Code */}
          <BuildingCodeQuestion control={control} watch={watch} />

          {/* Question 2: Roof Covering */}
          <RoofCoveringQuestion control={control} watch={watch} />

          {/* Questions 3-6: Generic questions */}
          {questions.slice(2, 6).map((question, index) => (
            <GenericQuestion
              key={question.id}
              question={question}
              questionNumber={index + 3}
              control={control}
              watch={watch}
            />
          ))}

          {/* Question 7: Opening Protection */}
          <OpeningProtectionQuestion control={control} watch={watch} />
        </div>
      </Form>
    </div>
  );
};

export default WindMitigationEditor;