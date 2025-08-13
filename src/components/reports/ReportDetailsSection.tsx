import React from "react";
import { format } from "date-fns";
import { Calendar, User, MapPin, Thermometer, Home, Cloud, Users } from "lucide-react";

interface ReportDetailsSectionProps {
  report: {
    title?: string;
    clientName?: string;
    address?: string;
    inspectionDate?: string;
  };
  sectionInfo?: Record<string, any>;
  className?: string;
}

const InfoItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value?: string;
  className?: string;
}> = ({ icon: Icon, label, value, className = "" }) => {
  if (!value) return null;
  
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
};

const ReportDetailsSection: React.FC<ReportDetailsSectionProps> = ({
  report,
  sectionInfo = {},
  className = ""
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const getIcon = (fieldName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      title: Home,
      client_name: User,
      address: MapPin,
      inspection_date: Calendar,
      temperature: Thermometer,
      weather_conditions: Cloud,
      in_attendance: Users,
      occupancy: Home,
      style: Home,
      type_of_building: Home,
    };
    return iconMap[fieldName] || Home;
  };

  const getFieldLabel = (fieldName: string) => {
    const labelMap: Record<string, string> = {
      title: "Report Title",
      client_name: "Client Name",
      address: "Property Address",
      inspection_date: "Inspection Date",
      temperature: "Temperature",
      weather_conditions: "Weather Conditions",
      in_attendance: "In Attendance",
      occupancy: "Occupancy",
      style: "Style",
      type_of_building: "Type of Building",
    };
    return labelMap[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (fieldName: string, value: any) => {
    if (fieldName === "inspection_date") {
      return formatDate(value);
    }
    return String(value || "");
  };

  // Core report fields
  const coreFields = [
    { name: "title", value: report.title || "" },
    { name: "client_name", value: report.clientName || "" },
    { name: "address", value: report.address || "" },
    { name: "inspection_date", value: report.inspectionDate || "" },
  ];

  // Additional fields from section info
  const additionalFields = Object.entries(sectionInfo)
    .filter(([key]) => !["title", "client_name", "address", "inspection_date"].includes(key))
    .filter(([, value]) => value && String(value).trim() !== "")
    .map(([key, value]) => ({ name: key, value }));

  const allFields = [...coreFields, ...additionalFields].filter(field => field.value && String(field.value).trim() !== "");

  return (
    <section className={`space-y-6 pdf-report-details ${className}`}>
      <h2 className="text-xl font-semibold border-b pb-2">Report Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allFields.map(({ name, value }) => {
          const Icon = getIcon(name);
          const label = getFieldLabel(name);
          const formattedValue = formatValue(name, value);
          
          return (
            <InfoItem
              key={name}
              icon={Icon}
              label={label}
              value={formattedValue}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ReportDetailsSection;