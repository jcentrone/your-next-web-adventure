import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { createReport } from "@/hooks/useLocalDraft";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dbCreateReport } from "@/integrations/supabase/reportsApi";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { getMyOrganization } from "@/integrations/supabase/organizationsApi";
import { ContactMultiSelect } from "@/components/contacts/ContactMultiSelect";
import type { Contact } from "@/lib/crmSchemas";
import { useReportTemplates } from "@/hooks/useReportTemplates";

const schema = z.object({
  title: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  address: z.string().min(1, "Address is required"),
  inspectionDate: z.string().min(1, "Required"),
  contactIds: z.array(z.string()).optional().default([]),
  includeStandardsOfPractice: z.boolean().default(true),
  tags: z.array(z.string()).optional().default([]),
});

type Values = z.infer<typeof schema>;

const HomeInspectionNew: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const { templates } = useReportTemplates("home_inspection");
  const reportTemplate = templates.find(t => t.is_default) || templates[0] || null;

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
      inspectionDate: new Date().toISOString().slice(0, 10),
      contactIds: contactId ? [contactId] : [],
      includeStandardsOfPractice: true,
      tags: [],
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
    }
  }, [contact, contactId, form]);

  // Update client name and address when contacts change
  useEffect(() => {
    if (selectedContacts.length > 0) {
      const primaryContact = selectedContacts[0];
      form.setValue('clientName', `${primaryContact.first_name} ${primaryContact.last_name}`);
      
      const contactAddress = primaryContact.formatted_address || primaryContact.address || "";
      if (contactAddress) {
        form.setValue('address', contactAddress);
      }
    }
  }, [selectedContacts, form]);

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
            reportType: "home_inspection",
            includeStandardsOfPractice: values.includeStandardsOfPractice,
            tags: values.tags || [],
            template: reportTemplate,
          },
          user.id,
          organization?.id
        );
        toast({ title: "Home inspection report created" });
        nav(`/reports/${report.id}`);
      } else {
        const report = createReport({
          title: values.title,
          clientName: values.clientName,
          address: values.address,
          inspectionDate: new Date(values.inspectionDate).toISOString(),
          reportType: "home_inspection",
          includeStandardsOfPractice: values.includeStandardsOfPractice,
          contactIds: values.contactIds || [],
          tags: values.tags || [],
          template: reportTemplate,
        });
        toast({ title: "Home inspection report created (local draft)" });
        nav(`/reports/${report.id}`);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to create report", description: e?.message || "Please try again." });
    }
  };

  return (
    <>
      <Seo
        title="New Home Inspection Report | Home Inspection"
        description="Create a new home inspection report with preloaded SOP sections."
        canonical={window.location.origin + "/reports/new/home-inspection"}
        jsonLd={{ "@context": "https://schema.org", "@type": "CreateAction", name: "Create Home Inspection Report" }}
      />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">New Home Inspection Report</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St Home Inspection" {...field} />
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
                      contacts={contacts}
                      value={field.value || []}
                      onChange={field.onChange}
                      onSelectedContactsChange={setSelectedContacts}
                    />
                  </FormControl>
                  <FormDescription>
                    Search and select who will be attending the inspection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} />
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
                      placeholder="Enter the property address for inspection"
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
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Report Settings</h3>
              <FormField
                control={form.control}
                name="includeStandardsOfPractice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Include Standards of Practice
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Add InterNACHI Standards of Practice to the final report
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
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

export default HomeInspectionNew;