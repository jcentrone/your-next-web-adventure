import React from "react";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WIND_MITIGATION_QUESTIONS } from "@/constants/windMitigationQuestions";
import { WindMitigationQuestionField } from "./WindMitigationQuestionField";

interface BuildingCodeQuestionProps {
  control: Control<any>;
  watch: any;
}

export const BuildingCodeQuestion: React.FC<BuildingCodeQuestionProps> = ({ control, watch }) => {
  const question = WIND_MITIGATION_QUESTIONS.questions[0]; // Building code question
  const selectedOption = watch("1_building_code.selectedOption");
  const selectedOptionData = question.options.find(opt => opt.code === selectedOption);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">1. Building Code Compliance</CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="1_building_code.selectedOption"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  {question.options.map((option) => (
                    <FormItem key={option.code} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={option.code} />
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
            {selectedOptionData.fields.map((field) => (
              <WindMitigationQuestionField
                key={field.name}
                field={field}
                control={control}
                questionId="1_building_code"
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