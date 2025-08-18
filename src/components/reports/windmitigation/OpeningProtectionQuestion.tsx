import React from "react";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WIND_MITIGATION_QUESTIONS } from "@/constants/windMitigationQuestions";

interface OpeningProtectionQuestionProps {
  control: Control<any>;
  watch: any;
}

export const OpeningProtectionQuestion: React.FC<OpeningProtectionQuestionProps> = ({ control, watch }) => {
  const question = WIND_MITIGATION_QUESTIONS.questions[6]; // Opening protection question
  const glazedOverall = watch("7_opening_protection.glazedOverall");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">7. Opening Protection</CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Opening Types Matrix */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Protection Level for Each Opening Type:</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-2 text-left text-xs font-medium">Opening Type</th>
                  <th className="border border-border p-2 text-left text-xs font-medium">Protection Level</th>
                </tr>
              </thead>
              <tbody>
                {question.opening_types.map((openingType) => (
                  <tr key={openingType.key}>
                    <td className="border border-border p-2 text-sm">{openingType.label}</td>
                    <td className="border border-border p-2">
                      <FormField
                        control={control}
                        name={`7_opening_protection.openingProtection.${openingType.key}`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {question.protection_levels.map((level) => (
                                  <SelectItem key={level.code} value={level.code} className="text-xs">
                                    {level.code} - {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Glazed Overall Classification */}
        <div className="pt-4 border-t">
          <FormField
            control={control}
            name="7_opening_protection.glazedOverall"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium">Glazed Overall Classification:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-3"
                  >
                    {question.glazed_overall_classification.options.map((option) => (
                      <FormItem key={option.code} className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={option.code} className="mt-1" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-normal leading-relaxed">
                            <span className="font-medium">{option.code}.</span> {option.label}
                          </FormLabel>
                          {option.standards && (
                            <div className="text-xs text-muted-foreground ml-4">
                              Standards: {option.standards.join(", ")}
                            </div>
                          )}
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Non-Glazed Subclass */}
        {glazedOverall && glazedOverall !== "X" && (
          <div className="pt-4 border-t">
            <FormField
              control={control}
              name="7_opening_protection.nonGlazedSubclass"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">Non-Glazed Subclass:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      {question.glazed_overall_classification.options
                        .find(opt => opt.code === glazedOverall)
                        ?.non_glazed_subclasses?.map((subclass) => (
                        <FormItem key={subclass.code} className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={subclass.code} className="mt-1" />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-relaxed">
                            <span className="font-medium">{subclass.code}.</span> {subclass.label}
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