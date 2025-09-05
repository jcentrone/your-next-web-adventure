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
import { Switch } from "@/components/ui/switch";
import { createReport } from "@/hooks/useLocalDraft";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dbCreateReport } from "@/integrations/supabase/reportsApi";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { getMyOrganization } from "@/integrations/supabase/organizationsApi";

const schema = z.object({
  title: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  address: z.string().min(1, "Address is required"),
  inspectionDate: z.string().min(1, "Required"),
  contactId: z.string().optional(),
  includeStandardsOfPractice: z.boolean().default(true),
});

type Values = z.infer<typeof schema>;

const HomeInspectionNew: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId");

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
      contactId: contactId || "",
      includeStandardsOfPractice: true,
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
            reportType: "home_inspection",
            includeStandardsOfPractice: values.includeStandardsOfPractice,
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
