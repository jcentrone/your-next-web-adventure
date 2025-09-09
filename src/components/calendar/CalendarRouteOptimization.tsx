import React from 'react';
import { format } from 'date-fns';
import { EnhancedRouteOptimizer } from '@/components/maps/EnhancedRouteOptimizer';

interface Appointment {
  id: string;
  title: string;
  location?: string;
  appointment_date: string;
}

interface CalendarRouteOptimizationProps {
  selectedDate: Date;
  appointments: Appointment[];
  onRouteOptimized?: (route: any) => void;
}

export function CalendarRouteOptimization({ 
  selectedDate, 
  appointments, 
  onRouteOptimized 
}: CalendarRouteOptimizationProps) {
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // Filter appointments for the selected date
  const dayAppointments = appointments.filter(apt => {
    const aptDate = format(new Date(apt.appointment_date), 'yyyy-MM-dd');
    return aptDate === formattedDate;
  });

  if (dayAppointments.length === 0) {
    return null;
  }

  return (
    <EnhancedRouteOptimizer
      appointments={dayAppointments}
      selectedDate={formattedDate}
      onRouteOptimized={onRouteOptimized}
    />
  );
}