import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GooglePlacesAutocomplete } from '@/components/maps/GooglePlacesAutocomplete';
import { useToast } from '@/hooks/use-toast';
import { crmApi } from '@/integrations/supabase/crmApi';
import { Contact } from '@/lib/crmSchemas';


const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  contact_type: z.enum(["client", "realtor", "vendor", "contractor", "other"]),
  notes: z.string().optional(),
  formatted_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactEditDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactEditDialog({ contact, open, onOpenChange }: ContactEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      contact_type: contact.contact_type,
      notes: contact.notes || "",
      formatted_address: contact.formatted_address || "",
      city: contact.city || "",
      state: contact.state || "",
      zip_code: contact.zip_code || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Contact>) => {
      console.log('Update mutation called with:', data);
      console.log('Contact ID:', contact.id);
      return crmApi.contacts.update(contact.id, data);
    },
    onSuccess: (updatedContact) => {
      console.log('Update successful:', updatedContact);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['contact', contact.id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Update contact error:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Submitting contact update:', data);
    updateMutation.mutate({
      ...data,
      email: data.email || null,
    });
  };

  const handleAddressChange = useCallback((addressData: any) => {
    form.setValue('formatted_address', addressData.formatted_address, { shouldDirty: true, shouldTouch: true });
  
    // Extract city, state, zip
    const components = addressData.address_components || [];
    let city = '', state = '', zipCode = '';
    for (const c of components) {
      if (c.types.includes('locality')) city = c.long_name;
      else if (c.types.includes('administrative_area_level_1')) state = c.short_name;
      else if (c.types.includes('postal_code')) zipCode = c.long_name;
    }
    if (city) form.setValue('city', city, { shouldDirty: true });
    if (state) form.setValue('state', state, { shouldDirty: true });
    if (zipCode) form.setValue('zip_code', zipCode, { shouldDirty: true });
  }, [form]);

  const handleAddressInput = useCallback((val: string) => {
    form.setValue('formatted_address', val, { shouldDirty: true, shouldTouch: true });
  }, [form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md max-h-[80vh] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Prevent closing when interacting with Google Places dropdown
          const target = e.target as Element;
          if (target?.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // allow clicks on PAC dropdown outside content without closing or stealing focus
          const el = e.target as HTMLElement;
          if (el.closest('.pac-container')) e.preventDefault();
        }}
        onFocusOutside={(e) => {
          // Prevent closing when focusing on Google Places dropdown
          const target = e.target as Element;
          if (target?.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
        >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contact_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="realtor">Realtor</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Company</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="formatted_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Address</FormLabel>
                    <FormControl>
                      <GooglePlacesAutocomplete
                        value={field.value ?? ''}           // still display RHF value
                        onChange={handleAddressChange}      // memoized
                        onInputChange={handleAddressInput}  // memoized
                        placeholder="Start typing address..."
                        className="h-8"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">City</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">State</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">ZIP</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes..."
                        rows={2}
                        className="resize-none text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-8 px-3"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} className="h-8 px-3">
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}