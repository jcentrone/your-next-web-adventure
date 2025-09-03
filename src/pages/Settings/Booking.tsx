import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingApi } from '@/integrations/supabase/bookingApi';
import { Check, X } from 'lucide-react';

interface FormValues {
  slug: string;
}

const Booking: React.FC = () => {
  const { user } = useAuth();
  const { register, handleSubmit, reset, watch } = useForm<FormValues>();

  const { data: settings } = useQuery({
    queryKey: ['my-booking-settings', user?.id],
    queryFn: () => bookingApi.getSettingsByUser(user!.id),
    enabled: !!user,
    onSuccess: (data) => data && reset({ slug: data.slug }),
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => bookingApi.upsertSettings(user!.id, values.slug),
  });

  const slug = watch('slug') || '';
  const [debouncedSlug, setDebouncedSlug] = React.useState(slug);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSlug(slug), 300);
    return () => clearTimeout(handler);
  }, [slug]);

  const { data: slugMatch, isFetching: isChecking } = useQuery({
    queryKey: ['booking-slug', debouncedSlug],
    queryFn: () => bookingApi.getSettingsBySlug(debouncedSlug),
    enabled: !!debouncedSlug,
  });

  const isAvailable = !debouncedSlug || !slugMatch || slugMatch.user_id === user?.id;

  const onSubmit = handleSubmit(values => mutation.mutate(values));
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = settings?.slug ? `${origin}/book/${settings.slug}` : '';
  const embedCode = settings?.slug ? `<iframe src="${shareUrl}?embed=1" style="width:100%;height:700px;border:0;" />` : '';

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">
          This will be the last part of your booking link, e.g. https://app.com/book/joe-inspections
        </label>
        <div className="relative">
          <input
            className="border p-2 w-full pr-8"
            placeholder="e.g. joe-inspections"
            {...register('slug')}
            required
          />
          {debouncedSlug && !isChecking && (
            isAvailable ? (
              <Check className="absolute right-2 top-2 h-5 w-5 text-green-500" />
            ) : (
              <X className="absolute right-2 top-2 h-5 w-5 text-red-500" />
            )
          )}
        </div>
        {debouncedSlug && !isChecking && !isAvailable && (
          <p className="text-sm text-red-500 mt-1">This slug is unavailable. Another user may have taken it.</p>
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
        disabled={mutation.isPending || isChecking || !isAvailable}
      >
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
