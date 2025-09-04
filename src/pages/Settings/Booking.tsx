import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingApi } from '@/integrations/supabase/bookingApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, X, Link, Code, Globe, Palette, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormValues {
  slug: string;
  template: string;
  theme_color: string;
}

const Booking: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your booking settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
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
  const widgetEmbedCode = slug ? `<iframe src="${shareUrl}?embed=1" style="width:100%;height:700px;border:0;" />` : '';

  const templateOptions = [
    { id: 'templateA', name: 'Professional', description: 'Clean and professional design' },
    { id: 'templateB', name: 'Modern', description: 'Modern with service highlights' },
    { id: 'templateC', name: 'Gradient', description: 'Elegant gradient design' },
  ];

  const colorPresets = [
    { name: 'Slate', color: '#1e293b' },
    { name: 'Rose', color: '#be123c' },
    { name: 'Green', color: '#15803d' },
    { name: 'Blue', color: '#1d4ed8' },
    { name: 'Purple', color: '#7c3aed' },
    { name: 'Orange', color: '#ea580c' },
  ];

  return (
    <div className="space-y-8">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Booking Page Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Slug Configuration */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-base font-medium">Booking Page URL</Label>
              <p className="text-sm text-muted-foreground">
                This will be the unique URL for your booking page
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {origin}/book/
                </span>
                <div className="relative flex-1 max-w-md">
                  <Input
                    id="slug"
                    placeholder="e.g. joe-inspections"
                    className={`pr-10 ${!isAvailable && debouncedSlug ? 'border-destructive' : isAvailable && debouncedSlug ? 'border-green-500' : ''}`}
                    {...register('slug')}
                    required
                  />
                  {debouncedSlug && !isChecking && (
                    isAvailable ? (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    ) : (
                      <X className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                    )
                  )}
                </div>
              </div>
              {debouncedSlug && !isChecking && !isAvailable && (
                <p className="text-sm text-destructive">This URL is already taken. Please choose a different one.</p>
              )}
            </div>

            <Separator />

            {/* Template Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Template Style
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templateOptions.map((option) => (
                  <div key={option.id} className="relative">
                    <input
                      type="radio"
                      id={option.id}
                      value={option.id}
                      {...register('template')}
                      className="sr-only"
                    />
                    <label
                      htmlFor={option.id}
                      className={`block cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50 ${
                        template === option.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{option.name}</h4>
                        {template === option.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Theme Color */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme Color
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="color"
                  {...register('theme_color')}
                  className="w-16 h-12 p-1 rounded-lg"
                />
                <div className="flex gap-2 flex-wrap">
                  {colorPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset.color}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        themeColor === preset.color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      onClick={() => setValue('theme_color', preset.color)}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={mutation.isPending || isChecking || !isAvailable}
                className="flex items-center gap-2"
              >
                {mutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
              {shareUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Share & Embed */}
      {shareUrl && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link className="h-5 w-5" />
                Share Your Booking Page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Booking Page URL</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <Card className="border-2 border-dashed border-muted-foreground/25">
                <CardContent className="p-4">
                  <iframe
                    src={shareUrl}
                    className="w-full h-64 rounded border-0"
                    title="Booking Page Preview"
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="h-5 w-5" />
                Embed Widget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Embed Code</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={widgetEmbedCode}
                    readOnly
                    className="flex-1 bg-muted font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(widgetEmbedCode)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <Card className="border-2 border-dashed border-muted-foreground/25">
                <CardContent className="p-4">
                  <iframe
                    src={`${shareUrl}?embed=1`}
                    className="w-full h-64 rounded border-0"
                    title="Widget Preview"
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Booking;