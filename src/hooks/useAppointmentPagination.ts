import { useState, useMemo } from 'react';
import { type Appointment } from '@/lib/crmSchemas';

export const useAppointmentPagination = (
  appointments: Appointment[],
  itemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return appointments.slice(startIndex, endIndex);
  }, [appointments, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to page 1 when appointments change (e.g., after filtering)
  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    paginatedAppointments,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, appointments.length),
    totalItems: appointments.length,
  };
};