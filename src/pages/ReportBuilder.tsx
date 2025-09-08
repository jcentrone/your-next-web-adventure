import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, FormInput, Sparkles, Plus } from "lucide-react";
import { DefectBasedBuilder } from "@/components/reports/DefectBasedBuilder";
import { FormBasedBuilder } from "@/components/reports/FormBasedBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { REPORT_CATEGORY_LABELS, REPORT_CATEGORY_DESCRIPTIONS, type ReportCategory } from "@/constants/reportCategories";
import Seo from "@/components/Seo";
import type { Report } from "@/lib/reportSchemas";

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [step, setStep] = useState<"category" | "builder">("category");
  const { createTemplate } = useReportTemplates();

  const handleCategorySelect = (category: ReportCategory) => {
    setSelectedCategory(category);
    setStep("builder");
  };

  const handleBackToCategory = () => {
    setSelectedCategory(null);
    setStep("category");
  };

  const handleSaveTemplate = async (templateData: {
    name: string;
    description?: string;
    report_type: Report["reportType"];
    sections_config: Array<{
      sectionKey: string;
      title: string;
      isCustom: boolean;
      isRequired: boolean;
      sortOrder: number;
    }>;
    fields_config: Record<string, Array<{
      fieldId: string;
      fieldName: string;
      fieldLabel: string;
      widgetType: string;
      options?: string[];
      required: boolean;
      sortOrder: number;
    }>>;
  }) => {
    await createTemplate(templateData);
    navigate("/settings/account/report-manager");
  };

  if (!user) {
    return <div>Please log in to access the report builder.</div>;
  }

  if (step === "category") {
    return (
      <div className="min-h-screen bg-background">
        <Seo
          title="Report Builder - Choose Category"
          description="Create a new report by selecting defect-based or form-based type"
        />
        
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Report Type</h1>
              <p className="text-muted-foreground">
                Choose the category that best fits your reporting needs
              </p>
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              onClick={() => handleCategorySelect("defect_based")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{REPORT_CATEGORY_LABELS.defect_based}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {REPORT_CATEGORY_DESCRIPTIONS.defect_based}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Section-based observations</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Defect tracking & categorization</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Photo & media attachments</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Narrative recommendations</span>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Defect-Based Report
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              onClick={() => handleCategorySelect("form_based")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full w-fit group-hover:bg-secondary/20 transition-colors">
                  <FormInput className="w-8 h-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">{REPORT_CATEGORY_LABELS.form_based}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {REPORT_CATEGORY_DESCRIPTIONS.form_based}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-secondary-foreground rounded-full" />
                    <span>Custom form fields</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-secondary-foreground rounded-full" />
                    <span>Dropdown & multi-select options</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-secondary-foreground rounded-full" />
                    <span>Number & date inputs</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-secondary-foreground rounded-full" />
                    <span>Structured data collection</span>
                  </div>
                </div>
                <Button variant="secondary" className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form-Based Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Builder interface
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`Report Builder - ${selectedCategory === "defect_based" ? "Defect-Based" : "Form-Based"}`}
        description="Design your custom report structure"
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBackToCategory}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {selectedCategory === "defect_based" ? "Defect-Based" : "Form-Based"} Report Builder
            </h1>
            <p className="text-muted-foreground">
              {selectedCategory === "defect_based" 
                ? "Design sections with observation and defect tracking"
                : "Create structured forms with custom fields"
              }
            </p>
          </div>
        </div>

        {/* Builder Interface */}
        {selectedCategory === "defect_based" ? (
          <DefectBasedBuilder 
            userId={user.id} 
            onSaveTemplate={handleSaveTemplate}
          />
        ) : (
          <FormBasedBuilder 
            userId={user.id} 
            onSaveTemplate={handleSaveTemplate}
          />
        )}
      </div>
    </div>
  );
}