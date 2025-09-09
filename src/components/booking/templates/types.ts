import type { ReactNode } from 'react';
import type { BookingSettings } from '@/integrations/supabase/bookingApi';

export interface TemplateProps {
  org: {
    logo_url: string | null;
    name: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    primary_color: string | null;
    secondary_color: string | null;
  } | null;
  children?: ReactNode;
  layout?: 'vertical' | 'horizontal';
  settings?: BookingSettings | null;
}
