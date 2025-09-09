import React, { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { createReport } from "@/hooks/useLocalDraft";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dbCreateReport } from "@/integrations/supabase/reportsApi";
import { appointmentsApi, contactsApi } from "@/integrations/supabase/crmApi";
import { getMyOrganization } from "@/integrations/supabase/organizationsApi";
import type { Report } from "@/lib/reportSchemas";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { ContactMultiSelect } from "@/components/contacts/ContactMultiSelect";

const schema = z.object({
  title: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  address: z.string().min(1, "Address is required"),
  inspectionDate: z.string().min(1, "Required"),
  contactIds: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  appointmentId: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const GenericReportNew: React.FC = () => {
  const nav = useNavigate();
  const { reportType } = useParams<{ reportType: Report["reportType"] }>();
  const type = (reportType as Report["reportType"]) || "home_inspection";
  const label = REPORT_TYPE_LABELS[type] || "Report";
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId");
  const appointmentId = searchParams.get("appointmentId");

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentsApi.getUpcoming(user!.id, 50),
    enabled: !!user,
  });

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
      tags: [],
      appointmentId: appointmentId || "",
    },
  });

  useEffect(() => {
    if (contact) {
      form.setValue("clientName", `${contact.first_name} ${contact.last_name}`);
      const contactAddress = contact.formatted_address || contact.address || "";
      if (contactAddress) {
        form.setValue("address", contactAddress);
      }
    }
  }, [contact, form]);

  const onSubmit = async (values: Values) => {
    try {
      if (user) {
        const organization = await getMyOrganization();
        let apptId = values.appointmentId;
        if (!apptId) {
          const appointment = await appointmentsApi.create({
            user_id: user.id,
            title: values.title,
            appointment_date: new Date(values.inspectionDate).toISOString(),
            address: values.address,
            contact_id: values.contactIds[0] || undefined,
          });
          apptId = appointment.id;
        }
        const report = await dbCreateReport(
          {
            title: values.title,
            clientName: values.clientName,
            address: values.address,
            inspectionDate: values.inspectionDate,
            contactIds: values.contactIds || [],
            reportType: type,
            tags: values.tags || [],
            appointment_id: apptId,
          },
          user.id,
          organization?.id
        );
        await appointmentsApi.update(apptId, { report_id: report.id });
        toast({ title: `${label} report created` });
        nav(`/reports/${report.id}`);
      } else {
        const report = createReport({
          title: values.title,
          clientName: values.clientName,
          address: values.address,
          inspectionDate: new Date(values.inspectionDate).toISOString(),
          reportType: type,
          contactIds: values.contactIds || [],
          tags: values.tags || [],
        });
        toast({ title: `${label} report created (local draft)` });
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
        title={`New ${label} Report | Home Inspection`}
        description={`Create a new ${label.toLowerCase()} report.`}
        canonical={window.location.origin + `/reports/new/${type}`}
        jsonLd={{ "@context": "https://schema.org", "@type": "CreateAction", name: `Create ${label} Report` }}
      />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">New {label} Report</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder={`e.g., 123 Main St ${label}`} {...field} />
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
                      onChange={(contactIds) => {
                        field.onChange(contactIds);
                        // Set client name from first selected contact
                        if (contactIds.length > 0) {
                          const primaryContact = contacts.find(c => c.id === contactIds[0]);
                          if (primaryContact) {
                            form.setValue('clientName', `${primaryContact.first_name} ${primaryContact.last_name}`);
                            const contactAddress = primaryContact.formatted_address || primaryContact.address || "";
                            if (contactAddress) {
                              form.setValue('address', contactAddress);
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
              name="appointmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an appointment..." />
                      </SelectTrigger>
                      <SelectContent>
                        {appointments.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.title} - {new Date(a.appointment_date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Textarea placeholder="123 Main St, Springfield" {...field} />
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
            <div className="flex justify-end">
              <Button type="submit">Create Report</Button>
            </div>
          </form>
        </Form>
      </section>
    </>
  );
};

export default GenericReportNew;
