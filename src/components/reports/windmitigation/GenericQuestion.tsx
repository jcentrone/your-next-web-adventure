import React from "react";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WindMitigationQuestionField } from "./WindMitigationQuestionField";
import { WindMitigationData } from "@/lib/reportSchemas";

interface QuestionOption {
  code: string;
  label: string;
  fields?: any[];
}

interface Question {
  id: string;
  prompt: string;
  options?: QuestionOption[];
  minimal_conditions_for_B_C_D?: string;
}

interface GenericQuestionProps {
  question: any; // Use any since the question structure varies between types
  questionNumber: number;
  control: Control<WindMitigationData>;
  watch: any;
}

export const GenericQuestion: React.FC<GenericQuestionProps> = ({ 
  question, 
  questionNumber, 
  control, 
  watch 
}) => {
  // Only render if the question has options (for generic radio questions)
  if (!question.options) {
    return null;
  }

  const selectedOption = watch(`${question.id}.selectedOption`);
  const selectedOptionData = question.options.find((opt: any) => opt.code === selectedOption);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {questionNumber}. {getQuestionTitle(question.id)}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
        {question.minimal_conditions_for_B_C_D && (
          <div className="text-xs text-muted-foreground mt-2 p-3 bg-muted/30 rounded-md">
            <strong>Minimal conditions for B, C, D:</strong> {question.minimal_conditions_for_B_C_D}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name={`${question.id}.selectedOption` as any}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  {question.options.map((option) => (
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

        {selectedOptionData?.fields && (
          <div className="ml-6 space-y-3 p-4 bg-muted/50 rounded-lg">
            {selectedOptionData.fields.map((field) => (
              <WindMitigationQuestionField
                key={field.name}
                field={field}
                control={control}
                questionId={question.id}
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

function getQuestionTitle(questionId: string): string {
  switch (questionId) {
    case "3_roof_deck_attachment":
      return "Roof Deck Attachment";
    case "4_roof_to_wall_attachment":
      return "Roof-to-Wall Attachment";
    case "5_roof_geometry":
      return "Roof Geometry";
    case "6_secondary_water_resistance":
      return "Secondary Water Resistance";
    default:
      return questionId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }
}