import React from 'react';
import { Calendar } from '@demark-pro/react-booking-calendar';
import '@demark-pro/react-booking-calendar/dist/react-booking-calendar.css';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingApi, type BookingSettings, type AppointmentPayload } from '@/integrations/supabase/bookingApi';
import { servicesApi, type Service } from '@/integrations/supabase/servicesApi';
import { contactsApi } from '@/integrations/supabase/crmApi';
import { REPORT_TYPE_LABELS } from '@/constants/reportTypes';
import { Checkbox } from '@/components/ui/checkbox';

interface WidgetProps {
  settings: BookingSettings;
}

const Widget: React.FC<WidgetProps> = ({ settings }) => {
  const { data: reserved = [] } = useQuery<{ start_date: string; end_date: string }[]>({
    queryKey: ['booking-reserved', settings.user_id],
    queryFn: () => bookingApi.getTakenAppointments(settings.user_id),
    enabled: !!settings.user_id,
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['booking-services', settings.user_id],
    queryFn: () => servicesApi.list(settings.user_id),
    enabled: !!settings.user_id,
  });

  const [selected, setSelected] = React.useState<Date[]>([]);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [serviceIds, setServiceIds] = React.useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (payload: AppointmentPayload) => bookingApi.createAppointment(payload),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) return;

    const [first_name, ...rest] = name.trim().split(/\s+/);
    const last_name = rest.join(' ');

    try {
      const contact = await contactsApi.create({
        user_id: settings.user_id,
        first_name,
        last_name,
        email,
        contact_type: 'client',
      });

      mutation.mutate({
        user_id: settings.user_id,
        title: 'Online booking',
        status: 'scheduled',
        appointment_date: selected[0].toISOString(),
        contact_id: contact.id,
        service_ids: serviceIds,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const reservedRanges = reserved.map(r => ({
    startDate: new Date(r.start_date),
    endDate: new Date(r.end_date),
  }));

  return (
    <div className="space-y-4">
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
        {services.length > 0 && (
          <div className="space-y-1">
            <p className="font-medium">Select Services</p>
            {services.map((s) => {
              const isChecked = serviceIds.includes(s.id!);
              return (
                <label key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setServiceIds([...serviceIds, s.id!]);
                      } else {
                        setServiceIds(serviceIds.filter((id) => id !== s.id));
                      }
                    }}
                  />
                  <span>
                    {REPORT_TYPE_LABELS[s.name]} (${s.price})
                  </span>
                </label>
              );
            })}
          </div>
        )}
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded" disabled={mutation.isPending}>
          Book
        </button>
        {mutation.isSuccess && <p className="text-green-600">Booked!</p>}
      </form>
    </div>
  );
};

export default Widget;

