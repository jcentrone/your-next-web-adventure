import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Report } from "@/lib/reportSchemas";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { SAMPLE_REPORTS } from "@/constants/sampleData";

interface TemplateFilterProps {
  selectedType: Report["reportType"] | "all";
  onTypeChange: (type: Report["reportType"] | "all") => void;
  selectedTemplate: string | "all";
  onTemplateChange: (template: string | "all") => void;
  selectedStyle: string | "all";
  onStyleChange: (style: string | "all") => void;
}

export const TemplateFilter: React.FC<TemplateFilterProps> = ({
  selectedType,
  onTypeChange,
  selectedTemplate,
  onTemplateChange,
  selectedStyle,
  onStyleChange,
}) => {
  const reportTypes = Array.from(new Set(SAMPLE_REPORTS.map(r => r.reportType)));
  const coverTemplates = Array.from(new Set(SAMPLE_REPORTS.map(r => r.coverTemplate)));
  const previewStyles = Array.from(new Set(SAMPLE_REPORTS.map(r => r.previewTemplate)));

  const getReportCount = (type: Report["reportType"] | "all") => {
    if (type === "all") return SAMPLE_REPORTS.length;
    return SAMPLE_REPORTS.filter(r => r.reportType === type).length;
  };

  return (
    <div className="space-y-6">
      {/* Report Type Tabs */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Report Types</h3>
        <Tabs value={selectedType} onValueChange={onTypeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="all" className="flex items-center gap-2 py-2">
              All Templates
              <Badge variant="secondary" className="text-xs">
                {getReportCount("all")}
              </Badge>
            </TabsTrigger>
            {reportTypes.slice(0, 3).map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="flex items-center gap-2 py-2 text-xs"
              >
                {REPORT_TYPE_LABELS[type]}
                <Badge variant="secondary" className="text-xs">
                  {getReportCount(type)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Additional report types for smaller screens */}
        {reportTypes.length > 3 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {reportTypes.slice(3).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => onTypeChange(type)}
                className="text-xs"
              >
                {REPORT_TYPE_LABELS[type]}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getReportCount(type)}
                </Badge>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Additional Filters */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Cover Template</label>
          <Select value={selectedTemplate} onValueChange={onTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {coverTemplates.map((template) => (
                <SelectItem key={template} value={template}>
                  Template {template.replace('template', '').replace(/([A-Z])/g, ' $1').trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Preview Style</label>
          <Select value={selectedStyle} onValueChange={onStyleChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Styles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {previewStyles.map((style) => (
                <SelectItem key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};