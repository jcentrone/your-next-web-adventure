import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Calendar } from '@demark-pro/react-booking-calendar';
import '@demark-pro/react-booking-calendar/dist/react-booking-calendar.css';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingApi, AppointmentPayload } from '@/integrations/supabase/bookingApi';

const BookingPage: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const embed = searchParams.get('embed') === '1';

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['booking-settings', slug],
    queryFn: () => bookingApi.getSettingsBySlug(slug!),
    enabled: !!slug,
  });

  const { data: reserved = [], isLoading: appointmentsLoading } = useQuery<{ start_date: string; end_date: string | null }[]>({
    queryKey: ['booking-reserved', settings?.user_id],
    queryFn: () => bookingApi.getTakenAppointments(settings!.user_id),
    enabled: !!settings?.user_id,
  });

  const [selected, setSelected] = React.useState<Date[]>([]);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const mutation = useMutation({
    mutationFn: (payload: AppointmentPayload) => bookingApi.createAppointment(payload),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || selected.length === 0) return;

    mutation.mutate({
      user_id: settings.user_id,
      title: 'Online booking',
      status: 'scheduled',
      appointment_date: selected[0].toISOString(),
      contact_name: name,
      contact_email: email,
    });
  };

  if (settingsLoading) return <div className="p-4">Loading...</div>;
  if (!settings) return <div className="p-4">Booking page not found.</div>;

  const reservedRanges = reserved.map(r => ({
    startDate: new Date(r.start_date),
    endDate: new Date(r.end_date || r.start_date),
  }));

  return (
    <div className={embed ? '' : 'container mx-auto p-4 space-y-4'}>
      <Calendar selected={selected} reserved={reservedRanges} onChange={setSelected} />
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Your email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded" disabled={mutation.isPending}>
          Book
        </button>
        {mutation.isSuccess && <p className="text-green-600">Booked!</p>}
      </form>
    </div>
  );
};

export default BookingPage;
