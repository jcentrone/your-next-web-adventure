import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingApi, type BookingSettings } from '@/integrations/supabase/bookingApi';
import { supabase } from '@/integrations/supabase/client';
import Widget from '@/components/booking/Widget';

interface TemplateProps {
  organization: {
    logo_url: string | null;
    name: string | null;
    primary_color: string | null;
    secondary_color: string | null;
  } | null;
  children: React.ReactNode;
}

const TemplateA: React.FC<TemplateProps> = ({ organization, children }) => (
  <div
    className="min-h-screen p-4"
    style={{ backgroundColor: organization?.primary_color || undefined }}
  >
    <div className="max-w-2xl mx-auto space-y-4">
      {organization?.logo_url && (
        <img
          src={organization.logo_url}
          alt={organization.name || ''}
          className="h-16 mx-auto"
        />
      )}
      {organization?.name && (
        <h1
          className="text-2xl font-bold text-center"
          style={{ color: organization.secondary_color || undefined }}
        >
          {organization.name}
        </h1>
      )}
      {children}
    </div>
  </div>
);

const BOOKING_TEMPLATES = {
  templateA: TemplateA,
} as const;

type TemplateId = keyof typeof BOOKING_TEMPLATES;

const BookingPage: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const embed = searchParams.get('embed') === '1';

  const { data: settings, isLoading: settingsLoading } = useQuery<BookingSettings | null>({
    queryKey: ['booking-settings', slug],
    queryFn: () => bookingApi.getSettingsBySlug(slug!),
    enabled: !!slug,
  });

  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['booking-organization', settings?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('organizations(logo_url,name,primary_color,secondary_color)')
        .eq('user_id', settings!.user_id)
        .single<{ organizations: TemplateProps['organization'] }>();
      if (error) throw error;
      return data?.organizations ?? null;
    },
    enabled: !!settings?.user_id,
  });

  if (settingsLoading) return <div className="p-4">Loading...</div>;
  if (!settings) return <div className="p-4">Booking page not found.</div>;

  if (embed) {
    return <Widget settings={settings} />;
  }

  if (orgLoading) return <div className="p-4">Loading...</div>;

  const templateKey = (settings.template || 'templateA') as TemplateId;
  const Template = BOOKING_TEMPLATES[templateKey] || TemplateA;

  return (
    <Template organization={organization || null}>
      <Widget settings={settings} />
    </Template>
  );
};

export default BookingPage;

