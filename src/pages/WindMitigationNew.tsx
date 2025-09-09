import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ContactMultiSelect } from "@/components/contacts/ContactMultiSelect";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dbCreateReport } from "@/integrations/supabase/reportsApi";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { getMyOrganization } from "@/integrations/supabase/organizationsApi";

const schema = z.object({
  title: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  address: z.string().min(1, "Address is required"),
  county: z.string().optional(),
  ofStories: z.string().optional(),
  inspectionDate: z.string().min(1, "Required"),
  contactIds: z.array(z.string()).optional().default([]),
  phoneHome: z.string().optional(),
  phoneWork: z.string().optional(),
  phoneCell: z.string().optional(),
  insuranceCompany: z.string().optional(),
  policyNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

const WindMitigationNew: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId");
  const appointmentId = searchParams.get("appointmentId");

  // Get all contacts for lookup
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !!user,
  });

  // Get contact data if contactId is provided
  const { data: contact } = useQuery({
    queryKey: ["contact", contactId],
    queryFn: () => contactsApi.get(contactId!),
    enabled: !!contactId && !!user,
  });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      clientName: "",
      address: "",
      county: "",
      ofStories: "",
      inspectionDate: new Date().toISOString().slice(0, 10),
      contactIds: contactId ? [contactId] : [],
      phoneHome: "",
      phoneWork: "",
      phoneCell: "",
      insuranceCompany: "",
      policyNumber: "",
      email: "",
    },
  });

  // Update form when contact data loads
  useEffect(() => {
    if (contact && contactId) {
      form.setValue('contactIds', [contactId]);
      form.setValue('clientName', `${contact.first_name} ${contact.last_name}`);
      const contactAddress = contact.formatted_address || contact.address || "";
      if (contactAddress) {
        form.setValue('address', contactAddress);
      }
      if (contact.phone) {
        form.setValue('phoneHome', contact.phone);
        form.setValue('phoneWork', contact.phone);
        form.setValue('phoneCell', contact.phone);
      }
      if (contact.email) {
        form.setValue('email', contact.email);
      }
      if (contact.company) {
        form.setValue('insuranceCompany', contact.company);
      }
    }
  }, [contact, contactId, form]);


  const onSubmit = async (values: Values) => {
    try {
      if (user) {
        const organization = await getMyOrganization();
        const report = await dbCreateReport(
          {
            title: values.title,
            clientName: values.clientName,
            address: values.address,
            inspectionDate: values.inspectionDate,
            contactIds: values.contactIds || [],
            reportType: "wind_mitigation",
            county: values.county,
            ofStories: values.ofStories,
            phoneHome: values.phoneHome,
            phoneWork: values.phoneWork,
            phoneCell: values.phoneCell,
            insuranceCompany: values.insuranceCompany,
            policyNumber: values.policyNumber,
            email: values.email,
            appointment_id: appointmentId || undefined,
          },
          user.id,
          organization?.id
        );
        toast({ title: "Uniform mitigation report created" });
        nav(`/reports/${report.id}`);
      } else {
        // For now, uniform mitigation reports require authentication
        toast({ 
          title: "Authentication required", 
          description: "Uniform mitigation reports require you to be logged in."
        });
        nav('/auth');
      }
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Please try again.";
      toast({ title: "Failed to create report", description: message });
    }
  };

  return (
    <>
      <Seo
        title="New Uniform Mitigation Report | Home Inspection"
        description="Create a new uniform mitigation verification inspection report for Florida insurance discounts."
        canonical={window.location.origin + "/reports/new/wind-mitigation"}
        jsonLd={{ "@context": "https://schema.org", "@type": "CreateAction", name: "Create Uniform Mitigation Report" }}
      />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">New Uniform Mitigation Report</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St Uniform Mitigation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>In Attendance</FormLabel>
                  <FormControl>
                    <ContactMultiSelect
                      value={field.value || []}
                      onChange={(contactIds) => {
                        field.onChange(contactIds);
                        // Set client name from first selected contact
                        if (contactIds.length > 0) {
                          const selectedContact = contacts.find(c => c.id === contactIds[0]);
                          if (selectedContact) {
                            form.setValue('clientName', `${selectedContact.first_name} ${selectedContact.last_name}`);
                            const contactAddress = selectedContact.formatted_address || selectedContact.address || "";
                            if (contactAddress) {
                              form.setValue('address', contactAddress);
                            }
                            if (selectedContact.phone) {
                              form.setValue('phoneHome', selectedContact.phone);
                              form.setValue('phoneWork', selectedContact.phone);
                              form.setValue('phoneCell', selectedContact.phone);
                            }
                            if (selectedContact.email) {
                              form.setValue('email', selectedContact.email);
                            }
                            if (selectedContact.company) {
                              form.setValue('insuranceCompany', selectedContact.company);
                            }
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneHome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Home phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneWork"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Work phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneCell"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cell Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Cell phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insuranceCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Insurance company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="policyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Policy number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County</FormLabel>
                  <FormControl>
                    <Input placeholder="County" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ofStories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Stories</FormLabel>
                  <FormControl>
                    <Input placeholder="Number of stories" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the property address for uniform mitigation inspection"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inspectionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => nav('/reports/select-type')}>
                Back
              </Button>
              <Button type="submit">Create & Continue</Button>
            </div>
          </form>
        </Form>
      </section>
    </>
  );
};

export default WindMitigationNew;
