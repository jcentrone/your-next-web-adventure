import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingApi, type BookingSettings } from '@/integrations/supabase/bookingApi';
import { supabase } from '@/integrations/supabase/client';
import Widget from '@/components/booking/Widget';
import { templates, type TemplateId, type TemplateProps } from '@/components/booking/templates';

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
        .single<{ organizations: TemplateProps['org'] }>();
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
  const Template = templates[templateKey] ?? templates.templateA;

  return <Template org={organization || null} settings={settings} />;
};

export default BookingPage;

