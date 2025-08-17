import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ContactsFilterProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  getContactTypeColor: (type: string) => string;
}

export const ContactsFilter: React.FC<ContactsFilterProps> = ({ 
  selectedType, 
  onTypeChange, 
  getContactTypeColor 
}) => {
  const contactTypes = [
    { value: "client", label: "Client" },
    { value: "realtor", label: "Realtor" },
    { value: "vendor", label: "Vendor" },
    { value: "contractor", label: "Contractor" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedType || "all"} onValueChange={(value) => onTypeChange(value === "all" ? null : value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {contactTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedType && (
        <Badge className={getContactTypeColor(selectedType)}>
          {selectedType}
          <button
            onClick={() => onTypeChange(null)}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
};