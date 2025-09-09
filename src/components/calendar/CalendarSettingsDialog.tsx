import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Settings, Clock, Globe, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { bookingApi, type BookingSettings } from "@/integrations/supabase/bookingApi";
import { toast } from "sonner";

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

const commonTimeZones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookingSettings } = useQuery({
    queryKey: ['my-booking-settings', user?.id],
    queryFn: () => bookingApi.getSettingsByUser(user!.id),
    enabled: !!user && open,
  });

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<BookingSettings>) =>
      bookingApi.upsertSettings(
        user!.id,
        bookingSettings?.slug || '',
        bookingSettings?.template || 'templateA',
        bookingSettings?.theme_color || '#1e293b',
        bookingSettings?.advance_notice || 24,
        newSettings.default_duration !== undefined ? newSettings.default_duration : bookingSettings?.default_duration || 60,
        bookingSettings?.layout || 'vertical',
        newSettings.working_hours !== undefined ? newSettings.working_hours : bookingSettings?.working_hours,
        newSettings.time_zone !== undefined ? newSettings.time_zone : bookingSettings?.time_zone,
        newSettings.buffer_time !== undefined ? newSettings.buffer_time : bookingSettings?.buffer_time,
        newSettings.working_days !== undefined ? newSettings.working_days : bookingSettings?.working_days
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-booking-settings'] });
      toast.success("Calendar settings saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  const handleBookingSettingChange = (field: keyof BookingSettings, value: any) => {
    mutation.mutate({ [field]: value });
  };

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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
          <DialogDescription>
            Configure your calendar, working hours, and appointment settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Working Hours Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Working Hours & Days
            </h3>
            
            {/* Working Days */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Working Days</Label>
              <div className="flex flex-wrap gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={bookingSettings?.working_days?.includes(day) || false}
                      onCheckedChange={(checked) => {
                        const currentDays = bookingSettings?.working_days || [];
                        const newDays = checked
                          ? [...currentDays, day]
                          : currentDays.filter(d => d !== day);
                        handleBookingSettingChange('working_days', newDays);
                      }}
                    />
                    <Label htmlFor={day} className="capitalize text-sm">
                      {day.slice(0, 3)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Time</Label>
                <Input
                  type="time"
                  value={bookingSettings?.working_hours?.start || '09:00'}
                  onChange={(e) => handleBookingSettingChange('working_hours', {
                    ...bookingSettings?.working_hours,
                    start: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">End Time</Label>
                <Input
                  type="time"
                  value={bookingSettings?.working_hours?.end || '17:00'}
                  onChange={(e) => handleBookingSettingChange('working_hours', {
                    ...bookingSettings?.working_hours,
                    end: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          {/* Time Zone Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Time Zone
            </h3>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select your time zone</Label>
              <Select
                value={bookingSettings?.time_zone || 'America/New_York'}
                onValueChange={(value) => handleBookingSettingChange('time_zone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {commonTimeZones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Default Duration (minutes)</Label>
                <Input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={bookingSettings?.default_duration || 60}
                  onChange={(e) => handleBookingSettingChange('default_duration', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Buffer Time (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  step="5"
                  value={bookingSettings?.buffer_time || 0}
                  onChange={(e) => handleBookingSettingChange('buffer_time', parseInt(e.target.value))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Buffer time is added between appointments to allow for travel or preparation.
            </p>
          </div>

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