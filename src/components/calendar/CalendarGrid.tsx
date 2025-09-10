import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
  endOfDay,
  addWeeks,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Clock } from "lucide-react";
import type { Appointment } from "@/lib/crmSchemas";

const getWeekStart = startOfWeek;
const getWeekEnd = endOfWeek;

type ViewMode = "day" | "week" | "month";

interface CalendarGridProps {
  appointments: Appointment[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  appointments,
  selectedDate,
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate);
  const [viewMode, setViewMode] = React.useState<ViewMode>("month");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment =>
      isSameDay(new Date(appointment.appointment_date), date)
    );
  };

  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      return isSameDay(appointmentDate, date) && appointmentDate.getHours() === hour;
    });
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-1 max-h-[600px] overflow-y-auto">
          {timeSlots.map((hour) => {
            const slotAppointments = getAppointmentsForTimeSlot(selectedDate, hour);
            return (
              <div key={hour} className="flex border-b border-border">
                <div className="w-16 p-2 text-sm text-muted-foreground border-r border-border">
                  {format(new Date().setHours(hour), "ha")}
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {slotAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-primary/20 text-primary p-2 rounded mb-1 cursor-pointer hover:bg-primary/30"
                      onClick={() => onDateSelect(new Date(appointment.appointment_date))}
                    >
                      <div className="font-medium">{appointment.title}</div>
                      <div className="text-xs">{format(new Date(appointment.appointment_date), "h:mm a")}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-2">
        {/* Week header */}
        <div className="grid grid-cols-8 gap-0 border border-border">
          <div className="p-2 text-center font-medium bg-muted text-muted-foreground border-r">Time</div>
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className={cn(
                "p-2 text-center font-medium bg-muted text-muted-foreground border-r last:border-r-0 cursor-pointer hover:bg-muted/80",
                isSameDay(day, selectedDate) && "bg-primary/10 text-primary",
                isToday(day) && "bg-accent"
              )}
              onClick={() => onDateSelect(day)}
            >
              <div>{format(day, "EEE")}</div>
              <div className="text-lg">{format(day, "d")}</div>
            </div>
          ))}
        </div>

        {/* Week grid */}
        <div className="max-h-[500px] overflow-y-auto border border-border">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-0 border-b border-border last:border-b-0">
              <div className="p-2 text-sm text-muted-foreground border-r bg-muted/50">
                {format(new Date().setHours(hour), "ha")}
              </div>
              {weekDays.map((day) => {
                const slotAppointments = getAppointmentsForTimeSlot(day, hour);
                return (
                  <div key={`${day}-${hour}`} className="p-1 min-h-[40px] border-r last:border-r-0">
                    {slotAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-primary/20 text-primary p-1 rounded text-xs cursor-pointer hover:bg-primary/30 truncate"
                        onClick={() => onDateSelect(new Date(appointment.appointment_date))}
                        title={appointment.title}
                      >
                        {appointment.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayAppointments = getAppointmentsForDate(day);
        
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[100px] border border-border p-2 cursor-pointer transition-colors hover:bg-muted/50",
              !isSameMonth(day, monthStart) && "bg-muted/20 text-muted-foreground",
              isSameDay(day, selectedDate) && "bg-primary/10 border-primary",
              isToday(day) && "bg-accent/50"
            )}
            onClick={() => onDateSelect(cloneDay)}
          >
            <div className="flex flex-col h-full">
              <div className={cn(
                "text-sm font-medium mb-1",
                isToday(day) && "text-primary font-bold"
              )}>
                {format(day, "d")}
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayAppointments.slice(0, 3).map((appointment, index) => (
                  <div
                    key={appointment.id}
                    className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded truncate"
                    title={appointment.title}
                  >
                    {appointment.title}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="space-y-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-0 border border-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-3 text-center font-medium bg-muted text-muted-foreground border-r border-border last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="border border-border">
          {rows}
        </div>
      </div>
    );
  };

  const getNavigationLabel = () => {
    switch (viewMode) {
      case "day":
        return format(selectedDate, "EEEE, MMMM d, yyyy");
      case "week":
        const weekStart = getWeekStart(selectedDate);
        const weekEnd = getWeekEnd(selectedDate);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "month":
        return format(currentMonth, "MMMM yyyy");
      default:
        return format(currentMonth, "MMMM yyyy");
    }
  };

  const navigatePrevious = () => {
    switch (viewMode) {
      case "day":
        onDateSelect(addDays(selectedDate, -1));
        break;
      case "week":
        onDateSelect(addDays(selectedDate, -7));
        break;
      case "month":
        setCurrentMonth(addDays(startOfMonth(currentMonth), -1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case "day":
        onDateSelect(addDays(selectedDate, 1));
        break;
      case "week":
        onDateSelect(addDays(selectedDate, 7));
        break;
      case "month":
        setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header with View Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {getNavigationLabel()}
        </h2>
        <div className="flex gap-4">
          {/* View Mode Buttons */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
              className="px-3"
            >
              <Clock className="w-4 h-4 mr-1" />
              Day
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="px-3"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Week
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="px-3"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Month
            </Button>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar View Content */}
      {viewMode === "day" && renderDayView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "month" && renderMonthView()}
    </div>
  );
};