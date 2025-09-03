import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingApi } from '@/integrations/supabase/bookingApi';

interface FormValues {
  slug: string;
}

const Booking: React.FC = () => {
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm<FormValues>();

  const { data } = useQuery({
    queryKey: ['my-booking-settings', user?.id],
    queryFn: () => bookingApi.getSettingsByUser(user!.id),
    enabled: !!user,
    onSuccess: (data) => data && reset({ slug: data.slug }),
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => bookingApi.upsertSettings(user!.id, values.slug),
  });

  const onSubmit = handleSubmit(values => mutation.mutate(values));
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = data?.slug ? `${origin}/book/${data.slug}` : '';
  const embedCode = data?.slug ? `<iframe src="${shareUrl}?embed=1" style="width:100%;height:700px;border:0;" />` : '';

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Booking URL slug</label>
        <input className="border p-2 w-full" {...register('slug')} required />
      </div>
      <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded" disabled={mutation.isPending}>
        Save
      </button>
      {shareUrl && (
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Shareable link</p>
            <code className="block p-2 bg-muted break-all">{shareUrl}</code>
          </div>
          <div>
            <p className="text-sm font-medium">Embed code</p>
            <code className="block p-2 bg-muted break-all">{embedCode}</code>
          </div>
        </div>
      )}
    </form>
  );
};

export default Booking;
