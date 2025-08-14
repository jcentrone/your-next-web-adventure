import React from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment } from "@/lib/crmSchemas";

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment =>
      isSameDay(new Date(appointment.appointment_date), date)
    );
  };

  const renderDateCells = () => {
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

    return rows;
  };

  const prevMonth = () => {
    setCurrentMonth(addDays(startOfMonth(currentMonth), -1));
  };

  const nextMonth = () => {
    setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
        {renderDateCells()}
      </div>
    </div>
  );
};