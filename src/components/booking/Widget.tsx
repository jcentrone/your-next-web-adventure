import React from 'react';
import { Calendar } from '@demark-pro/react-booking-calendar';
import '@demark-pro/react-booking-calendar/dist/react-booking-calendar.css';
import { useQuery, useMutation } from '@tanstack/react-query';
import SignatureCanvas from 'react-signature-canvas';
import {
  bookingApi,
  type BookingSettings,
  type AppointmentPayload,
} from '@/integrations/supabase/bookingApi';
import { contactsApi } from '@/integrations/supabase/crmApi';
import { agreementsApi } from '@/integrations/supabase/agreementsApi';
import { uploadSignatureFromDataUrl } from '@/integrations/supabase/organizationsApi';
import { supabase } from '@/integrations/supabase/client';
import { REPORT_TYPE_LABELS } from '@/constants/reportTypes';

interface WidgetProps {
  settings: BookingSettings;
  reserved: { startDate: Date; endDate: Date }[];
  layout?: 'vertical' | 'horizontal';
}

const getInternachiAgreement = (address: string, fee: number) => `
  <h3 class="text-lg font-semibold mb-2">Inspection Agreement</h3>
  <p>This inspection of the property located at ${address} will be performed in accordance with the InterNACHI Standards of Practice.</p>
  <p>The fee for this inspection is $${fee}.</p>
  <p>By signing below, you acknowledge that you have read and agree to this agreement.</p>
`;

const Widget: React.FC<WidgetProps> = ({ settings, reserved, layout = 'vertical' }) => {

  const { data: services = [] } = useQuery({
    queryKey: ['booking-services', settings.user_id],
    queryFn: async () => {
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [propertyAddress, setPropertyAddress] = React.useState('');
  const [agreed, setAgreed] = React.useState(false);
  const sigCanvasRef = React.useRef<SignatureCanvas | null>(null);
  const [isSigned, setIsSigned] = React.useState(false);

  const homeInspectionService = services.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => serviceIds.includes(s.id) && s.name === 'home_inspection'
  );
  const isHomeInspectionSelected = !!homeInspectionService;
  const agreementHtml = React.useMemo(
    () =>
      getInternachiAgreement(
        propertyAddress || '[Property Address]',
        homeInspectionService?.price || 0,
      ),
    [propertyAddress, homeInspectionService],
  );

  const mutation = useMutation({
    mutationFn: (payload: AppointmentPayload) => bookingApi.createAppointment(payload),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) return;
    if (isHomeInspectionSelected && (!isSigned || !agreed)) return;

    const [first_name, ...rest] = name.trim().split(/\s+/);
    const last_name = rest.join(' ');

    try {
      const contact = await contactsApi.create({
        user_id: settings.user_id,
        first_name,
        last_name,
        email,
        contact_type: 'client',
        formatted_address: propertyAddress || null,
      });

      let agreementId: string | undefined;
      if (isHomeInspectionSelected && sigCanvasRef.current) {
        const dataUrl = sigCanvasRef.current.toDataURL();
        const signatureUrl = await uploadSignatureFromDataUrl(dataUrl, 'agreement');
        const signedAgreementHtml = `${agreementHtml}\n        <p>Client Name: ${name}</p>\n        <p>Date: ${new Date().toLocaleDateString()}</p>\n        <img src="${signatureUrl}" alt="Signature" />`;
        const agreement = await agreementsApi.create({
          service_id: homeInspectionService?.id,
          client_name: name,
          signed_at: new Date().toISOString(),
          signature_url: signatureUrl,
          agreement_html: signedAgreementHtml,
        });
        agreementId = agreement.id;
      }

      const appointment = await mutation.mutateAsync({
        user_id: settings.user_id,
        title: 'Online booking',
        status: 'scheduled' as const,
        appointment_date: selected[0].toISOString(),
        contact_id: contact.id,
        service_ids: serviceIds,
        agreement_id: agreementId,
      });

      if (agreementId) {
        await agreementsApi.linkToAppointment(agreementId, appointment.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateChange = (dates: any) => {
    if (Array.isArray(dates)) {
      setSelected(dates.map(d => typeof d === 'string' ? new Date(d) : d));
    } else if (dates) {
      setSelected([typeof dates === 'string' ? new Date(dates) : dates]);
    } else {
      setSelected([]);
    }
  };

  const servicesSection = services.length > 0 && (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Select Service</h3>
      <div className="grid gap-3">
        {services.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (service: any) => {
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
  );

  const calendarSection = (
    <div>
      <h3 className="text-lg font-semibold mb-3">Select Date & Time</h3>
      <Calendar selected={selected} reserved={reserved} onChange={handleDateChange} />
    </div>
  );

  const contactSection = (
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
        <input
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Property address"
          value={propertyAddress}
          onChange={e => setPropertyAddress(e.target.value)}
          required={isHomeInspectionSelected}
        />
        {isHomeInspectionSelected && (
          <div className="space-y-3">
            <div
              className="h-40 overflow-y-scroll border border-border rounded-lg p-3 bg-background"
              dangerouslySetInnerHTML={{ __html: agreementHtml }}
            />
            <div>
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                onEnd={() => setIsSigned(!sigCanvasRef.current?.isEmpty())}
                canvasProps={{ className: 'border border-border rounded-lg w-full h-32 bg-white' }}
              />
              <button
                type="button"
                onClick={() => {
                  sigCanvasRef.current?.clear();
                  setIsSigned(false);
                }}
                className="mt-2 text-sm text-muted-foreground"
              >
                Clear
              </button>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <span>I agree to the terms</span>
            </label>
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={
            mutation.isPending ||
            selected.length === 0 ||
            !name.trim() ||
            (isHomeInspectionSelected && (!propertyAddress.trim() || !isSigned || !agreed))
          }
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
  );

  if (layout === 'horizontal') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {calendarSection}
        </div>
        <div className="space-y-6">
          {servicesSection}
          {contactSection}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {servicesSection}
      {calendarSection}
      {contactSection}
    </div>
  );
};

export default Widget;

