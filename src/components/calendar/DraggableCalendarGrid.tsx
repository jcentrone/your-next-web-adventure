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
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Clock } from "lucide-react";
import type { Appointment, Contact } from "@/lib/crmSchemas";
import type { CalendarSettings } from "./CalendarSettingsDialog";

const getWeekStart = startOfWeek;
const getWeekEnd = endOfWeek;

type ViewMode = "day" | "week" | "month";

interface DraggableCalendarGridProps {
  appointments: Appointment[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAppointmentDrop: (appointmentId: string, newDate: Date) => void;
  calendarSettings: CalendarSettings;
  contacts: Contact[];
  onViewModeChange?: (mode: ViewMode) => void;
}

export const DraggableCalendarGrid: React.FC<DraggableCalendarGridProps> = ({
  appointments,
  selectedDate,
  onDateSelect,
  onAppointmentDrop,
  calendarSettings,
  contacts,
  onViewModeChange,
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

  const getAppointmentBadgeContent = (appointment: Appointment) => {
    const parts = [];
    const contact = contacts.find(c => c.id === appointment.contact_id);
    
    if (calendarSettings.badgeContent.showTitle) {
      parts.push(appointment.title);
    }
    
    if (calendarSettings.badgeContent.showLocation && appointment.location) {
      parts.push(appointment.location);
    }
    
    if (calendarSettings.badgeContent.showTime) {
      parts.push(format(new Date(appointment.appointment_date), "h:mm a"));
    }
    
    if (calendarSettings.badgeContent.showContact && contact) {
      parts.push(`${contact.first_name} ${contact.last_name}`);
    }
    
    return parts.join(" • ");
  };

  const getAppointmentBadgeClass = (appointment: Appointment) => {
    return calendarSettings.statusColors[appointment.status as keyof typeof calendarSettings.statusColors] || 
           calendarSettings.statusColors.scheduled;
  };

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    
    if (!destination) return;
    
    const appointmentId = draggableId;
    const newDateString = destination.droppableId;
    const newDate = new Date(newDateString);
    
    if (isNaN(newDate.getTime())) return;
    
    onAppointmentDrop(appointmentId, newDate);
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-1">
          <div className="grid grid-cols-1 gap-0 max-h-[400px] overflow-y-auto border border-border rounded-lg">
            {timeSlots.map((hour) => {
              const slotAppointments = getAppointmentsForTimeSlot(selectedDate, hour);
              const slotDate = new Date(selectedDate);
              slotDate.setHours(hour, 0, 0, 0);
              
              return (
                <Droppable key={hour} droppableId={slotDate.toISOString()}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex border-b border-border last:border-b-0",
                        snapshot.isDraggingOver && "bg-primary/10"
                      )}
                    >
                      <div className="w-14 py-1 px-2 text-xs text-muted-foreground border-r border-border bg-muted/50">
                        {format(new Date().setHours(hour), "ha")}
                      </div>
                      <div className="flex-1 py-1 px-2 min-h-[32px]">
                        {slotAppointments.map((appointment, index) => (
                          <Draggable
                            key={appointment.id}
                            draggableId={appointment.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "py-1 px-2 rounded mb-1 cursor-pointer hover:opacity-80 transition-all text-xs border",
                                  getAppointmentBadgeClass(appointment),
                                  snapshot.isDragging && "rotate-3 shadow-lg scale-105"
                                )}
                                onClick={() => onDateSelect(new Date(appointment.appointment_date))}
                              >
                                <div className="font-medium truncate">
                                  {getAppointmentBadgeContent(appointment)}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-2">
          {/* Week header */}
          <div className="grid grid-cols-8 gap-0 border border-border">
            <div className="p-2 text-center font-medium bg-muted text-muted-foreground border-r">Time</div>
            {weekDays.map((day) => (
              <div
                key={day.toString()}
                className={cn(
                  "p-2 text-center font-medium bg-muted text-muted-foreground border-r last:border-r-0 cursor-pointer hover:bg-muted/80",
                  isSameDay(day, selectedDate) && "bg-primary/40 text-primary font-semibold",
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
                  const slotDate = new Date(day);
                  slotDate.setHours(hour, 0, 0, 0);
                  
                  return (
                    <Droppable key={`${day}-${hour}`} droppableId={slotDate.toISOString()}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "p-1 min-h-[40px] border-r last:border-r-0",
                            isSameDay(day, selectedDate) && "bg-primary/40",
                            snapshot.isDraggingOver && "bg-primary/10"
                          )}
                        >
                          {slotAppointments.map((appointment, index) => (
                            <Draggable
                              key={appointment.id}
                              draggableId={appointment.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "p-1 rounded text-xs cursor-pointer hover:opacity-80 truncate transition-all border",
                                    getAppointmentBadgeClass(appointment),
                                    snapshot.isDragging && "rotate-3 shadow-lg scale-105"
                                  )}
                                  onClick={() => onDateSelect(new Date(appointment.appointment_date))}
                                  title={getAppointmentBadgeContent(appointment)}
                                >
                                  {getAppointmentBadgeContent(appointment)}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
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
        const dayDateString = startOfDay(day).toISOString();
        
        days.push(
          <Droppable key={day.toString()} droppableId={dayDateString}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "min-h-[100px] border border-border p-2 cursor-pointer transition-colors hover:bg-muted/50",
                  !isSameMonth(day, monthStart) && "bg-muted/20 text-muted-foreground",
                  isSameDay(day, selectedDate) && "bg-primary/40 border-primary font-semibold",
                  isToday(day) && "bg-accent/50",
                  snapshot.isDraggingOver && "bg-primary/20"
                )}
                onClick={() => {
                  onDateSelect(cloneDay);
                  onViewModeChange?.("day");
                }}
              >
                <div className="flex flex-col h-full">
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday(cloneDay) && "text-primary font-bold"
                  )}>
                    {format(cloneDay, "d")}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayAppointments.slice(0, 3).map((appointment, index) => (
                      <Draggable
                        key={appointment.id}
                        draggableId={appointment.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate transition-transform cursor-grab active:cursor-grabbing border",
                              getAppointmentBadgeClass(appointment),
                              snapshot.isDragging && "rotate-3 shadow-lg scale-105"
                            )}
                            title={getAppointmentBadgeContent(appointment)}
                          >
                            {getAppointmentBadgeContent(appointment)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              </div>
            )}
          </Droppable>
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
      <DragDropContext onDragEnd={handleDragEnd}>
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
      </DragDropContext>
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