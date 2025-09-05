import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AccountsFilterProps {
  selectedType: string | null;
  selectedIndustry: string | null;
  onTypeChange: (type: string | null) => void;
  onIndustryChange: (industry: string | null) => void;
  availableIndustries: string[];
}

export const AccountsFilter: React.FC<AccountsFilterProps> = ({ 
  selectedType, 
  selectedIndustry,
  onTypeChange, 
  onIndustryChange,
  availableIndustries
}) => {
  const accountTypes = [
    { value: "company", label: "Company" },
    { value: "client", label: "Client" },
    { value: "vendor", label: "Vendor" },
    { value: "partner", label: "Partner" }
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={selectedType || "all"} onValueChange={(value) => onTypeChange(value === "all" ? null : value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {accountTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedIndustry || "all"} onValueChange={(value) => onIndustryChange(value === "all" ? null : value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by industry" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Industries</SelectItem>
          {availableIndustries.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedType && (
        <Badge variant="secondary">
          {selectedType}
          <button
            onClick={() => onTypeChange(null)}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {selectedIndustry && (
        <Badge variant="secondary">
          {selectedIndustry}
          <button
            onClick={() => onIndustryChange(null)}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
};