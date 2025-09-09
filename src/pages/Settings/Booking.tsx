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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Link, Code, Globe, Palette, Eye, Monitor, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormValues {
  slug: string;
  template: string;
  theme_color: string;
  layout: string;
  welcome_message: string;
}

const Booking: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: { 
      template: 'templateA', 
      theme_color: '#1e293b', 
      layout: 'vertical',
      welcome_message: 'Schedule Your Appointment'
    },
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
        layout: bookingSettings.layout || 'vertical',
        welcome_message: bookingSettings.welcome_message || 'Schedule Your Appointment',
      });
    }
  }, [bookingSettings, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      bookingApi.upsertSettings(
        user!.id,
        values.slug,
        values.template,
        values.theme_color,
        undefined, // advance_notice
        undefined, // default_duration
        values.layout,
        undefined, // working_hours
        undefined, // time_zone
        undefined, // buffer_time
        undefined, // working_days
        values.welcome_message
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

  // Auto-save on form changes
  const formValues = watch();
  const [lastSavedValues, setLastSavedValues] = React.useState<FormValues | null>(null);
  
  React.useEffect(() => {
    if (!bookingSettings || !isAvailable || mutation.isPending) return;
    
    const hasChanges = 
      formValues.slug !== bookingSettings.slug ||
      formValues.template !== bookingSettings.template ||
      formValues.theme_color !== bookingSettings.theme_color ||
      formValues.layout !== bookingSettings.layout;

    // Check if these are different from what we last saved to avoid loops
    const isDifferentFromLastSaved = !lastSavedValues || 
      formValues.slug !== lastSavedValues.slug ||
      formValues.template !== lastSavedValues.template ||
      formValues.theme_color !== lastSavedValues.theme_color ||
      formValues.layout !== lastSavedValues.layout;

    if (hasChanges && formValues.slug && isDifferentFromLastSaved) {
      const timeoutId = setTimeout(() => {
        setLastSavedValues(formValues);
        mutation.mutate(formValues);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formValues.slug, formValues.template, formValues.theme_color, formValues.layout, bookingSettings?.slug, bookingSettings?.template, bookingSettings?.theme_color, bookingSettings?.layout, isAvailable, mutation.isPending]);
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
    <div className="space-y-6">
      {/* Header with Preview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Booking Configuration</h2>
          <p className="text-muted-foreground mt-1">
            Customize your booking page appearance and settings
          </p>
        </div>
        {shareUrl && (
          <Button
            type="button"
            onClick={() => window.open(shareUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview Page
          </Button>
        )}
      </div>

      <Separator />

      {/* Configuration */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Settings */}
        <div className="space-y-6">
          {/* Slug Configuration */}
          <div className="space-y-3">
            <Label htmlFor="slug" className="text-base font-medium">Booking Page URL</Label>
            <p className="text-sm text-muted-foreground">
              This will be the unique URL for your booking page
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {origin}/book/
              </span>
              <div className="relative flex-1">
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

          {/* Welcome Message */}
          <div className="space-y-3">
            <Label htmlFor="welcome_message" className="text-base font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Welcome Message
            </Label>
            <p className="text-sm text-muted-foreground">
              Customize the welcome message that appears on your booking page
            </p>
            <Input
              id="welcome_message"
              placeholder="e.g. Schedule Your Appointment"
              {...register('welcome_message')}
            />
          </div>

          {/* Theme Color */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme Color
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="color"
                {...register('theme_color')}
                className="w-12 h-10 p-1 rounded-lg"
              />
              <div className="flex gap-2 flex-wrap">
                {colorPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.color}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
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
        </div>

        {/* Right Column - Style & Layout */}
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Template Style
            </Label>
            <div className="space-y-3">
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
                    className={`block cursor-pointer rounded-lg border p-3 transition-colors hover:border-primary/50 ${
                      template === option.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {template === option.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Booking Layout
            </Label>
            <div className="space-y-3">
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  watch('layout') === 'vertical' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setValue('layout', 'vertical')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <Monitor className="h-4 w-4" />
                      <span>Vertical (Stacked)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Services, calendar, and form stacked vertically
                    </p>
                  </div>
                  {watch('layout') === 'vertical' && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  watch('layout') === 'horizontal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setValue('layout', 'horizontal')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <LayoutGrid className="h-4 w-4" />
                      <span>Horizontal (Two Column)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Calendar on left, services and form on right
                    </p>
                  </div>
                  {watch('layout') === 'horizontal' && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {mutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          Saving changes...
        </div>
      )}

      <Separator />

      {/* Share & Embed Tabs */}
      {shareUrl && (
        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Share Page
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Embed Widget
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4 mt-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Share Your Booking Page</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Copy this URL to share your booking page directly with clients
              </p>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Booking Page URL</Label>
                  <div className="mt-2 flex items-center gap-2">
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
                <div className="border border-dashed border-border rounded-lg p-4">
                  <iframe
                    src={shareUrl}
                    className="w-full h-64 rounded border-0"
                    title="Booking Page Preview"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="embed" className="space-y-4 mt-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Embed Widget</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add this code to your website to embed the booking widget
              </p>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Embed Code</Label>
                  <div className="mt-2 flex items-center gap-2">
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
                <div className="border border-dashed border-border rounded-lg p-4">
                  <iframe
                    src={`${shareUrl}?embed=1`}
                    className="w-full h-64 rounded border-0"
                    title="Widget Preview"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Booking;