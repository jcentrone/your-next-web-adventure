import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingApi, type BookingSettings } from '@/integrations/supabase/bookingApi';
import { supabase } from '@/integrations/supabase/client';
import Widget from '@/components/booking/Widget';
import { templates, type TemplateId, type TemplateProps } from '@/components/booking/templates';
import { getMyOrganization } from '@/integrations/supabase/organizationsApi';

const BookingPage: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const embed = searchParams.get('embed') === '1';

  const { data: settings, isLoading: settingsLoading } = useQuery<BookingSettings | null>({
    queryKey: ['booking-settings', slug],
    queryFn: () => bookingApi.getSettingsBySlug(slug!),
    enabled: !!slug,
  });

  const { data: organization, isLoading: orgLoading } = useQuery<TemplateProps['org'] | null>({
    queryKey: ['booking-organization', settings?.user_id],
    queryFn: async () => {
      const userId = settings!.user_id;
      const { data: auth } = await supabase.auth.getUser();
      let org: TemplateProps['org'] | null = null;
      if (auth.user?.id === userId) {
        org = await getMyOrganization();
      } else {
        const { data, error } = await supabase
          .from('organization_members')
          .select('organizations(logo_url,name,address,phone,email,website,primary_color,secondary_color)')
          .eq('user_id', userId)
          .single<{ organizations: TemplateProps['org'] }>();
        if (error && error.code !== 'PGRST116') throw error;
        org = data?.organizations ?? null;
      }
      if (org) return org;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone, email')
        .eq('user_id', userId)
        .single<{ full_name: string | null; avatar_url: string | null; phone: string | null; email: string | null }>();
      if (profileError) throw profileError;
      if (!profile) return null;
      return {
        logo_url: profile.avatar_url,
        name: profile.full_name,
        address: null,
        phone: profile.phone,
        email: profile.email,
        website: null,
        primary_color: null,
        secondary_color: null,
      };
    },
    enabled: !!settings?.user_id,
  });

  const { data: taken = [] } = useQuery({
    queryKey: ['booking-taken', settings?.user_id],
    queryFn: () => bookingApi.getTakenAppointments(settings!.user_id),
    enabled: !!settings?.user_id,
  });

  const reservedRanges = React.useMemo(
    () =>
      taken.map((a: { appointment_date: string; duration_minutes: number | null }) => {
        const start = new Date(a.appointment_date);
        const end = new Date(start.getTime() + (a.duration_minutes ?? 0) * 60000);
        return { startDate: start, endDate: end };
      }),
    [taken]
  );

  if (settingsLoading) return <div className="p-4">Loading...</div>;
  if (!settings) return <div className="p-4">Booking page not found.</div>;

  if (embed) {
    return <Widget settings={settings} reserved={reservedRanges} layout={settings.layout as 'vertical' | 'horizontal'} />;
  }

  if (orgLoading) return <div className="p-4">Loading...</div>;

  const templateKey = (settings.template || 'templateA') as TemplateId;
  const Template = templates[templateKey] ?? templates.templateA;

  return (
    <Template org={organization || null} layout={settings.layout as 'vertical' | 'horizontal'}>
      <Widget settings={settings} reserved={reservedRanges} layout={settings.layout as 'vertical' | 'horizontal'} />
    </Template>
  );
};

export default BookingPage;

