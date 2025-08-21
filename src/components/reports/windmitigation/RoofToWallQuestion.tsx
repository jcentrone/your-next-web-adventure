import React from "react";
import { Control, UseFormWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WIND_MITIGATION_QUESTIONS } from "@/constants/windMitigationQuestions";
import { WindMitigationQuestionField } from "./WindMitigationQuestionField";
import { WindMitigationData } from "@/lib/reportSchemas";

interface RoofToWallQuestionProps {
  control: Control<WindMitigationData>;
  watch: UseFormWatch<WindMitigationData>;
}

export const RoofToWallQuestion: React.FC<RoofToWallQuestionProps> = ({ control, watch }) => {
  const question = WIND_MITIGATION_QUESTIONS.questions[3];
  const selectedOption = watch("4_roof_to_wall_attachment.selectedOption");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">4. Roof-to-Wall Attachment</CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-6">

        <FormField
          control={control}
          name="4_roof_to_wall_attachment.selectedOption"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-4"
                >
                  {question.options.map((option) => (
                    <div key={option.code} className="space-y-3">
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={option.code} className="mt-1" />
                        </FormControl>
                        <FormLabel className="text-sm font-normal leading-relaxed">
                          <span className="font-medium">{option.code}.</span> {option.label}
                        </FormLabel>
                      </FormItem>

                      {selectedOption === option.code && option.fields && (
                        <div className="ml-6 space-y-3">
                          {option.fields.map((optField: any) => (
                            <WindMitigationQuestionField
                              key={optField.name}
                              field={optField}
                              control={control}
                              questionId="4_roof_to_wall_attachment"
                              optionCode={option.code}
                              watch={watch}
                            />
                          ))}
                        </div>
                      )}

                      {selectedOption === option.code && option.code === "A" && (
                        <>
                          {question.minimal_conditions_for_B_C_D && (
                            <div className="ml-6 text-xs text-muted-foreground mt-2">
                              <strong>Minimal conditions for B, C, D:</strong> {question.minimal_conditions_for_B_C_D}
                            </div>
                          )}
                          {question.fields && (
                            <div className="ml-6 mt-2 space-y-3">
                              {question.fields.map((minField) => (
                                <WindMitigationQuestionField
                                  key={minField.name}
                                  field={minField}
                                  control={control}
                                  questionId="4_roof_to_wall_attachment"
                                  optionCode="minimal"
                                  watch={watch}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default RoofToWallQuestion;
