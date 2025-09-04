import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingApi } from '@/integrations/supabase/bookingApi';
import { Check, X } from 'lucide-react';

interface FormValues {
  slug: string;
  template: string;
  theme_color: string;
}

const Booking: React.FC = () => {
  const { user } = useAuth();
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: { template: 'templateA', theme_color: '#1e293b' },
  });

  const { data: bookingSettings } = useQuery({
    queryKey: ['my-booking-settings', user?.id],
    queryFn: () => bookingApi.getSettingsByUser(user!.id),
    enabled: !!user,
  });

  React.useEffect(() => {
    if (bookingSettings) {
      reset({
        slug: bookingSettings.slug,
        template: bookingSettings.template || 'templateA',
        theme_color: bookingSettings.theme_color || '#1e293b',
      });
    }
  }, [bookingSettings, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      bookingApi.upsertSettings(
        user!.id,
        values.slug,
        values.template,
        values.theme_color
      ),
  });

  const slug = watch('slug') || '';
  const template = watch('template');
  const themeColor = watch('theme_color');
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

  const onSubmit = handleSubmit((values) => mutation.mutate(values));
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = slug ? `${origin}/book/${slug}` : '';
  const widgetEmbedCode =
    slug
      ? `<iframe src="${shareUrl}?embed=1" style="width:100%;height:700px;border:0;" />`
      : '';

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

      <div>
        <p className="block text-sm font-medium mb-1">Template</p>
        <div className="flex gap-4">
          {['templateA', 'templateB', 'templateC'].map((t) => (
            <label key={t} className="flex flex-col items-center gap-1">
              <input
                type="radio"
                value={t}
                {...register('template')}
                className="sr-only"
              />
              <div
                className={`w-16 h-10 border flex items-center justify-center text-xs ${
                  template === t ? 'ring-2 ring-primary' : ''
                }`}
              >
                {t.replace('template', 'Template ')}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
      <label className="block text-sm font-medium mb-1">Theme color</label>
      <input type="color" {...register('theme_color')} className="h-10 w-10 p-0 border" />
      <div className="flex gap-2 mt-2">
        {['#1e293b', '#be123c', '#15803d', '#1d4ed8'].map((c) => (
          <button
            type="button"
            key={c}
            className={`w-8 h-8 rounded-full border ${
              themeColor === c ? 'ring-2 ring-offset-2 ring-primary' : ''
            }`}
            style={{ backgroundColor: c }}
            onClick={() => setValue('theme_color', c)}
            aria-label={`Select ${c} theme`}
          />
        ))}
      </div>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
        disabled={mutation.isPending || isChecking || !isAvailable}
      >
        Save
      </button>
      {shareUrl && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Share your booking page or embed the widget on your site. The previews
            below use your selected template and color.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Booking page URL</p>
            <code className="block p-2 bg-muted break-all">{shareUrl}</code>
            <iframe src={shareUrl} className="w-full h-64 border" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Widget embed code</p>
            <code className="block p-2 bg-muted break-all">{widgetEmbedCode}</code>
            <iframe src={`${shareUrl}?embed=1`} className="w-full h-64 border" />
          </div>
        </div>
      )}
    </form>
  );
};

export default Booking;
