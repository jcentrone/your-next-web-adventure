import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WindMitigationReport, WindMitigationDataSchema } from "@/lib/reportSchemas";
import { Form } from "@/components/ui/form";
import { useAutosave } from "@/hooks/useAutosave";
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
    defaultValues: report.reportData || { answers: [], inspectorComments: "" },
  });

  const { watch, control } = form;
  
  const watchedValues = watch();
  
  // Auto-save functionality
  useAutosave({
    value: watchedValues,
    onSave: (data) => {
      console.log("Autosave triggered", data);
      const updatedReport = {
        ...report,
        reportData: data,
      };
      onUpdate(updatedReport);
    },
    delay: 1000,
  });

  const questions = WIND_MITIGATION_QUESTIONS.questions;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{WIND_MITIGATION_QUESTIONS.form_name}</h1>
        <p className="text-sm text-muted-foreground">Form {WIND_MITIGATION_QUESTIONS.version}</p>
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