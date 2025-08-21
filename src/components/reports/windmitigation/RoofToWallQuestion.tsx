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
  const selectedOptionData = question.options.find((opt: any) => opt.code === selectedOption);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">4. Roof-to-Wall Attachment</CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
        {question.minimal_conditions_for_B_C_D && (
          <div className="text-xs text-muted-foreground mt-2 p-3 bg-muted/30 rounded-md">
            <strong>Minimal conditions for B, C, D:</strong> {question.minimal_conditions_for_B_C_D}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {question.fields && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            {question.fields.map((field) => (
              <WindMitigationQuestionField
                key={field.name}
                field={field}
                control={control}
                questionId="4_roof_to_wall_attachment"
                optionCode="minimal"
                watch={watch}
              />
            ))}
          </div>
        )}

        <FormField
          control={control}
          name="4_roof_to_wall_attachment.selectedOption"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  {question.options.map((option) => (
                    <FormItem
                      key={option.code}
                      className="flex items-start space-x-3 space-y-0"
                    >
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

        {selectedOptionData?.fields && (
          <div className="ml-6 space-y-3 p-4 bg-muted/50 rounded-lg">
            {selectedOptionData.fields.map((field: any) => (
              <WindMitigationQuestionField
                key={field.name}
                field={field}
                control={control}
                questionId="4_roof_to_wall_attachment"
                optionCode={selectedOption}
                watch={watch}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoofToWallQuestion;
