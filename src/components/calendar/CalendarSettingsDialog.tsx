import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";

export interface CalendarSettings {
  statusColors: {
    scheduled: string;
    confirmed: string;
    completed: string;
    cancelled: string;
  };
  badgeContent: {
    showTitle: boolean;
    showLocation: boolean;
    showTime: boolean;
    showContact: boolean;
  };
}

export const defaultCalendarSettings: CalendarSettings = {
  statusColors: {
    scheduled: "bg-blue-500/20 text-blue-700 border-blue-300",
    confirmed: "bg-green-500/20 text-green-700 border-green-300", 
    completed: "bg-gray-500/20 text-gray-700 border-gray-300",
    cancelled: "bg-red-500/20 text-red-700 border-red-300",
  },
  badgeContent: {
    showTitle: true,
    showLocation: false,
    showTime: false,
    showContact: false,
  },
};

const colorOptions = [
  { value: "bg-blue-500/20 text-blue-700 border-blue-300", label: "Blue", preview: "bg-blue-500" },
  { value: "bg-green-500/20 text-green-700 border-green-300", label: "Green", preview: "bg-green-500" },
  { value: "bg-red-500/20 text-red-700 border-red-300", label: "Red", preview: "bg-red-500" },
  { value: "bg-yellow-500/20 text-yellow-700 border-yellow-300", label: "Yellow", preview: "bg-yellow-500" },
  { value: "bg-purple-500/20 text-purple-700 border-purple-300", label: "Purple", preview: "bg-purple-500" },
  { value: "bg-orange-500/20 text-orange-700 border-orange-300", label: "Orange", preview: "bg-orange-500" },
  { value: "bg-gray-500/20 text-gray-700 border-gray-300", label: "Gray", preview: "bg-gray-500" },
];

interface CalendarSettingsDialogProps {
  settings: CalendarSettings;
  onSettingsChange: (settings: CalendarSettings) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CalendarSettingsDialog: React.FC<CalendarSettingsDialogProps> = ({
  settings,
  onSettingsChange,
  open,
  onOpenChange,
}) => {
  const handleStatusColorChange = (status: keyof CalendarSettings['statusColors'], color: string) => {
    onSettingsChange({
      ...settings,
      statusColors: {
        ...settings.statusColors,
        [status]: color,
      },
    });
  };

  const handleBadgeContentChange = (field: keyof CalendarSettings['badgeContent'], checked: boolean) => {
    onSettingsChange({
      ...settings,
      badgeContent: {
        ...settings.badgeContent,
        [field]: checked,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
          <DialogDescription>
            Configure how appointments appear in your calendar view.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Colors Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status Badge Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.statusColors).map(([status, color]) => (
                <div key={status} className="space-y-2">
                  <Label className="capitalize">{status}</Label>
                  <Select
                    value={color}
                    onValueChange={(value) => handleStatusColorChange(status as keyof CalendarSettings['statusColors'], value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${colorOptions.find(opt => opt.value === color)?.preview}`} />
                          {colorOptions.find(opt => opt.value === color)?.label}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${option.preview}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Badge Content Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Badge Content</h3>
            <p className="text-sm text-muted-foreground">
              Choose what information to display on appointment badges.
            </p>
            <div className="space-y-3">
              {Object.entries(settings.badgeContent).map(([field, checked]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={checked}
                    onCheckedChange={(checked) => 
                      handleBadgeContentChange(field as keyof CalendarSettings['badgeContent'], checked as boolean)
                    }
                  />
                  <Label htmlFor={field} className="capitalize text-sm">
                    {field.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preview</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(settings.statusColors).map(([status, colorClass]) => (
                <div
                  key={status}
                  className={`px-2 py-1 rounded text-xs border ${colorClass}`}
                >
                  Sample {status}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};