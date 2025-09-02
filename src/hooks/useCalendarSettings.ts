import { useState, useEffect } from "react";
import { CalendarSettings, defaultCalendarSettings } from "@/components/calendar/CalendarSettingsDialog";

const CALENDAR_SETTINGS_KEY = "calendar-settings";

export const useCalendarSettings = () => {
  const [settings, setSettings] = useState<CalendarSettings>(defaultCalendarSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem(CALENDAR_SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultCalendarSettings, ...parsed });
      } catch (error) {
        console.error("Failed to parse calendar settings:", error);
      }
    }
  }, []);

  const updateSettings = (newSettings: CalendarSettings) => {
    setSettings(newSettings);
    localStorage.setItem(CALENDAR_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  return {
    settings,
    updateSettings,
  };
};