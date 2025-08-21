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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContactLookup from "@/components/contacts/ContactLookup";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dbCreateReport } from "@/integrations/supabase/reportsApi";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { supabase } from "@/integrations/supabase/client";
import useCoverPages from "@/hooks/useCoverPages";

const schema = z.object({
  title: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  address: z.string().min(1, "Address is required"),
  county: z.string().optional(),
  ofStories: z.string().optional(),
  inspectionDate: z.string().min(1, "Required"),
  contactId: z.string().optional(),
  phoneHome: z.string().optional(),
  phoneWork: z.string().optional(),
  phoneCell: z.string().optional(),
  insuranceCompany: z.string().optional(),
  policyNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  coverPageId: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const WindMitigationNew: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId");
  const { coverPages, assignments } = useCoverPages();

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
      contactId: contactId || "",
      phoneHome: "",
      phoneWork: "",
      phoneCell: "",
      insuranceCompany: "",
      policyNumber: "",
      email: "",
      coverPageId: "",
    },
  });

  // Update form when contact data loads
  useEffect(() => {
    if (contact) {
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
  }, [contact, form]);

  useEffect(() => {
    const assigned = assignments.find(a => a.report_type === "wind_mitigation");
    if (assigned) {
      form.setValue("coverPageId", assigned.cover_page_id);
    }
  }, [assignments, form]);

  const onSubmit = async (values: Values) => {
    try {
      if (user) {
        // Get user's organization if they have one
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        const report = await dbCreateReport(
          {
            title: values.title,
            clientName: values.clientName,
            address: values.address,
            inspectionDate: values.inspectionDate,
            contact_id: values.contactId,
            reportType: "wind_mitigation",
            county: values.county,
            ofStories: values.ofStories,
            phoneHome: values.phoneHome,
            phoneWork: values.phoneWork,
            phoneCell: values.phoneCell,
            insuranceCompany: values.insuranceCompany,
            policyNumber: values.policyNumber,
            email: values.email,
            coverPageId: values.coverPageId,
          },
          user.id,
          profile?.organization_id || undefined
        );
        toast({ title: "Wind mitigation report created" });
        nav(`/reports/${report.id}`);
      } else {
        // For now, wind mitigation reports require authentication
        toast({ 
          title: "Authentication required", 
          description: "Wind mitigation reports require you to be logged in." 
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
        title="New Wind Mitigation Report | Home Inspection"
        description="Create a new wind mitigation inspection report for Florida insurance discounts."
        canonical={window.location.origin + "/reports/new/wind-mitigation"}
        jsonLd={{ "@context": "https://schema.org", "@type": "CreateAction", name: "Create Wind Mitigation Report" }}
      />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">New Wind Mitigation Report</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St Wind Mitigation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Contact</FormLabel>
                  <FormControl>
                    <ContactLookup
                      value={field.value}
                      onChange={(contactId, selectedContact) => {
                        field.onChange(contactId);
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
                      placeholder="Enter the property address for wind mitigation inspection"
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
            <FormField
              control={form.control}
              name="coverPageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Page</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cover page" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {coverPages.map(cp => (
                        <SelectItem key={cp.id} value={cp.id}>{cp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
