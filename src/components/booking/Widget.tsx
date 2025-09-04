import React from 'react';
import { Calendar } from '@demark-pro/react-booking-calendar';
import '@demark-pro/react-booking-calendar/dist/react-booking-calendar.css';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingApi, type BookingSettings, type AppointmentPayload } from '@/integrations/supabase/bookingApi';
import { contactsApi } from '@/integrations/supabase/crmApi';
import { supabase } from '@/integrations/supabase/client';
import { REPORT_TYPE_LABELS } from '@/constants/reportTypes';

interface WidgetProps {
  settings: BookingSettings;
  reserved: { startDate: Date; endDate: Date }[];
}

const Widget: React.FC<WidgetProps> = ({ settings, reserved }) => {

  const { data: services = [] } = useQuery({
    queryKey: ['booking-services', settings.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services' as any)
        .select('*')
        .eq('user_id', settings.user_id);
      if (error) throw error;
      return data || [];
    },
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
        status: 'scheduled' as const,
        appointment_date: selected[0].toISOString(),
        contact_id: contact.id,
        service_ids: serviceIds,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (dates: any) => {
    if (Array.isArray(dates)) {
      setSelected(dates.map(d => typeof d === 'string' ? new Date(d) : d));
    } else if (dates) {
      setSelected([typeof dates === 'string' ? new Date(dates) : dates]);
    } else {
      setSelected([]);
    }
  };

  return (
    <div className="space-y-6">
      {services.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Select Service</h3>
          <div className="grid gap-3">
            {services.map((service: any) => {
              const isSelected = serviceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => {
                    if (isSelected) {
                      setServiceIds(serviceIds.filter(id => id !== service.id));
                    } else {
                      setServiceIds([...serviceIds, service.id]);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{REPORT_TYPE_LABELS[service.name] || service.name}</h4>
                      <p className="text-sm text-muted-foreground">{service.duration || 60} minutes</p>
                    </div>
                    <div className="text-lg font-semibold">${service.price}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Date & Time</h3>
        <Calendar selected={selected} reserved={reserved} onChange={handleDateChange} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Add your details</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="First and last name *"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Email (optional)"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50" 
            disabled={mutation.isPending || selected.length === 0 || !name.trim()}
          >
            {mutation.isPending ? 'Booking...' : 'Book'}
          </button>
          {mutation.isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Booking confirmed!</p>
              <p className="text-green-600 text-sm">You will receive a confirmation email shortly.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Widget;

