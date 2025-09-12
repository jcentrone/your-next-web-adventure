import { useState, useMemo } from 'react';
import { type Appointment, type Contact } from '@/lib/crmSchemas';
import { format, isWithinInterval, parseISO } from 'date-fns';

export interface SearchFilters {
  query: string;
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export const useAppointmentSearch = (
  appointments: Appointment[],
  contacts: Contact[]
) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    dateFrom: null,
    dateTo: null,
  });

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const contact = contacts.find(c => c.id === appointment.contact_id);
        const contactName = contact ? `${contact.first_name} ${contact.last_name}`.trim() : '';
        
        const searchableText = [
          appointment.title,
          appointment.description,
          appointment.location,
          contactName,
          contact?.company,
          contact?.email,
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && appointment.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const appointmentDate = parseISO(appointment.appointment_date);
        
        if (filters.dateFrom && filters.dateTo) {
          if (!isWithinInterval(appointmentDate, {
            start: filters.dateFrom,
            end: filters.dateTo
          })) {
            return false;
          }
        } else if (filters.dateFrom) {
          if (appointmentDate < filters.dateFrom) {
            return false;
          }
        } else if (filters.dateTo) {
          if (appointmentDate > filters.dateTo) {
            return false;
          }
        }
      }

      return true;
    });
  }, [appointments, contacts, filters]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      status: 'all',
      dateFrom: null,
      dateTo: null,
    });
  };

    return {
        filters,
        filteredAppointments,
        updateFilters,
        clearFilters,
        hasActiveFilters: Boolean(filters.query || filters.status !== 'all' || filters.dateFrom || filters.dateTo),
    };
};