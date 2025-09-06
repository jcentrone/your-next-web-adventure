import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ReportContactCards } from "@/components/reports/ReportContactCards";
import type { Report } from "@/lib/reportSchemas";

interface Props {
  report: Report;
  onUpdate: (r: Report) => void;
}

interface FieldConfig {
  name: keyof Report | string;
  label: string;
  type?: "text" | "textarea" | "date";
}

const COMMON_FIELDS: FieldConfig[] = [
  { name: "title", label: "Report Title" },
  { name: "clientName", label: "Client Name" },
  { name: "address", label: "Property Address", type: "textarea" },
  { name: "inspectionDate", label: "Inspection Date", type: "date" },
];

const WIND_FIELDS: FieldConfig[] = [
  { name: "county", label: "County" },
  { name: "ofStories", label: "# of Stories" },
  { name: "phoneHome", label: "Home Phone" },
  { name: "phoneWork", label: "Work Phone" },
  { name: "phoneCell", label: "Cell Phone" },
  { name: "insuranceCompany", label: "Insurance Company" },
  { name: "policyNumber", label: "Policy Number" },
  { name: "email", label: "Email" },
];

const ReportDetailsForm: React.FC<Props> = ({ report, onUpdate }) => {
  const fields = React.useMemo(() => {
    if (report.reportType === "wind_mitigation") {
      return [...COMMON_FIELDS, ...WIND_FIELDS];
    }
    return COMMON_FIELDS;
  }, [report.reportType]);

  const handleChange = (field: string, value: string) => {
    onUpdate({ ...report, [field]: value } as Report);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Report Details</h2>
      {fields.map((field) => {
        const value = (report as any)[field.name] || "";
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : (
              <Input
                type={field.type === "date" ? "date" : "text"}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        );
      })}
      
      {/* Standards of Practice toggle for home inspection reports */}
      {report.reportType === "home_inspection" && (
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Checkbox
            id="includeStandardsOfPractice"
            checked={(report as any).includeStandardsOfPractice ?? true}
            onCheckedChange={(checked) => 
              handleChange("includeStandardsOfPractice", String(checked))
            }
          />
          <Label 
            htmlFor="includeStandardsOfPractice"
            className="text-sm font-normal"
          >
            Include InterNACHI Standards of Practice in final report
          </Label>
        </div>
      )}
      
      {/* Contact Cards Section */}
      <div className="pt-6 border-t">
        <ReportContactCards
          contactIds={report.contactIds || []}
          onContactsChange={(contactIds) => onUpdate({ ...report, contactIds } as Report)}
        />
      </div>
    </section>
  );
};

export default ReportDetailsForm;

