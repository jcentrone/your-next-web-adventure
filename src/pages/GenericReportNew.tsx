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
import { contactsApi } from "@/integrations/supabase/crmApi";
import { getMyOrganization } from "@/integrations/supabase/organizationsApi";
import type { Report } from "@/lib/reportSchemas";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";

const schema = z.object({
  title: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  address: z.string().min(1, "Address is required"),
  inspectionDate: z.string().min(1, "Required"),
  contactId: z.string().optional(),
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

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
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
      contactId: contactId || "",
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
        const report = await dbCreateReport(
          {
            title: values.title,
            clientName: values.clientName,
            address: values.address,
            inspectionDate: values.inspectionDate,
            contact_id: values.contactId,
            reportType: type,
          },
          user.id,
          organization?.id
        );
        toast({ title: `${label} report created` });
        nav(`/reports/${report.id}`);
      } else {
        const report = createReport({
          title: values.title,
          clientName: values.clientName,
          address: values.address,
          inspectionDate: new Date(values.inspectionDate).toISOString(),
          reportType: type,
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
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Contact</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Select
                        value={field.value}
                        onValueChange={(contactId) => {
                          field.onChange(contactId);
                          const selectedContact = contacts.find(c => c.id === contactId);
                          if (selectedContact) {
                            form.setValue('clientName', `${selectedContact.first_name} ${selectedContact.last_name}`);
                            const contactAddress = selectedContact.formatted_address || selectedContact.address || "";
                            if (contactAddress) {
                              form.setValue('address', contactAddress);
                            }
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contact or add new...">
                            {field.value && contacts.length > 0 ?
                              (() => {
                                const contact = contacts.find(c => c.id === field.value);
                                return contact ? `${contact.first_name} ${contact.last_name}` : field.value;
                              })() : "Select a contact..."
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add-new" className="font-medium text-primary">
                            + Add New Contact
                          </SelectItem>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.first_name} {contact.last_name}
                              {contact.email && <span className="text-muted-foreground ml-2">({contact.email})</span>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value === "add-new" && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => nav('/contacts/new')}
                        >
                          Go to Add New Contact
                        </Button>
                      )}
                    </div>
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
