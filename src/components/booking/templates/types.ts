import { BookingSettings } from '@/integrations/supabase/bookingApi';

export interface TemplateProps {
  org: {
    logo_url: string | null;
    name: string | null;
    primary_color: string | null;
    secondary_color: string | null;
  } | null;
  settings: BookingSettings;
}
