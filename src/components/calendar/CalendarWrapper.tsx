import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const CalendarWrapper: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the calendar.</p>
        </div>
      </div>
    );
  }

  // Dynamically import the Calendar component only when we have a user
  const Calendar = React.lazy(() => import('@/pages/Calendar'));

  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    }>
      <Calendar />
    </React.Suspense>
  );
};

export default CalendarWrapper;