import React from "react";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { WIND_MITIGATION_QUESTIONS } from "@/constants/windMitigationQuestions";
import { WindMitigationQuestionField } from "./WindMitigationQuestionField";

interface RoofCoveringQuestionProps {
  control: Control<any>;
  watch: any;
}

export const RoofCoveringQuestion: React.FC<RoofCoveringQuestionProps> = ({ control, watch }) => {
  const question = WIND_MITIGATION_QUESTIONS.questions[1]; // Roof covering question
  const selectedCoverings = watch("2_roof_covering.coverings") || [];
  const overallCompliance = watch("2_roof_covering.overallCompliance");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">2. Roof Covering</CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Roof Covering Types */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Select all roof covering types in use:</h4>
          {question.coverings.map((covering) => (
            <FormField
              key={covering.type}
              control={control}
              name={`2_roof_covering.coverings.${covering.type}.selected`}
              render={({ field }) => (
                <div className="space-y-3">
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-relaxed">
                      {covering.label}
                    </FormLabel>
                  </FormItem>
                  
                  {field.value && (
                    <div className="ml-6 space-y-3 p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-3">
                        Provide one of the following compliance data points:
                      </p>
                      {covering.fields.map((coveringField) => (
                        <WindMitigationQuestionField
                          key={coveringField.name}
                          field={coveringField}
                          control={control}
                          questionId="2_roof_covering"
                          coveringType={covering.type}
                          watch={watch}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
          ))}
        </div>

        {/* Overall Compliance */}
        {selectedCoverings.length > 0 && (
          <div className="pt-4 border-t">
            <FormField
              control={control}
              name="2_roof_covering.overallCompliance"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">Overall Compliance Assessment:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      {question.overall_compliance.options.map((option) => (
                        <FormItem key={option.code} className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={option.code} className="mt-1" />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-relaxed">
                            <span className="font-medium">{option.code}.</span> {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};