import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateContactSchema } from "@/lib/crmSchemas";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import { useToast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";

const ContactNew: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(CreateContactSchema),
    defaultValues: {
      contact_type: "client",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      formatted_address: "",
      place_id: "",
      latitude: undefined,
      longitude: undefined,
      address_components: undefined,
      city: "",
      state: "",
      zip_code: "",
      notes: "",
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Contact created successfully" });
      navigate("/contacts");
    },
    onError: (error) => {
      toast({ 
        title: "Error creating contact", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: any) => {
    const contactData = { 
      ...data, 
      user_id: user!.id,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      formatted_address: data.formatted_address || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      notes: data.notes || null,
    };
    createMutation.mutate(contactData);
  };

  return (
    <>
      <Seo 
        title="New Contact - Home Report Pro"
        description="Add a new contact to your business network."
      />
      
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/contacts")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contacts
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">Add New Contact</h1>
          <p className="text-muted-foreground">
            Create a new contact for your business network.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
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
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="formatted_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                         <AddressAutocomplete
                           value={field.value}
                           onAddressChange={(addressData) => {
                             field.onChange(addressData.formatted_address);
                             form.setValue('place_id', addressData.place_id);
                             form.setValue('latitude', addressData.latitude);
                             form.setValue('longitude', addressData.longitude);
                             form.setValue('address_components', addressData.address_components);
                             
                             // Extract city, state, zip from address components if available
                             const components = addressData.address_components || [];
                             let city = '';
                             let state = '';
                             let zipCode = '';

                             components.forEach((component: any) => {
                               const types = component.types || [];
                               if (types.includes('locality')) {
                                 city = component.long_name;
                               } else if (types.includes('administrative_area_level_1')) {
                                 state = component.short_name;
                               } else if (types.includes('postal_code')) {
                                 zipCode = component.long_name;
                               }
                             });

                             form.setValue('city', city);
                             form.setValue('state', state);
                             form.setValue('zip_code', zipCode);
                           }}
                           placeholder="Search for an address..."
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Additional notes about this contact..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/contacts")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Contact"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContactNew;