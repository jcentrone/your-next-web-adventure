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
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dbCreateReport } from "@/integrations/supabase/reportsApi";
import { appointmentsApi, contactsApi } from "@/integrations/supabase/crmApi";
import { getMyOrganization } from "@/integrations/supabase/organizationsApi";

const schema = z.object({
  title: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  address: z.string().min(1, "Address is required"),
  inspectionDate: z.string().min(1, "Required"),
  contactId: z.string().optional(),
  appointmentId: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const TxWindstormNew: React.FC = () => {
  const nav = useNavigate();
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
      contactId: contactId || "",
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
            contact_id: values.contactId || undefined,
          });
          apptId = appointment.id;
        }
        const report = await dbCreateReport(
          {
            title: values.title,
            clientName: values.clientName,
            address: values.address,
            inspectionDate: values.inspectionDate,
            contact_id: values.contactId,
            reportType: "tx_coastal_windstorm_mitigation",
            appointment_id: apptId,
          },
          user.id,
          organization?.id
        );
        await appointmentsApi.update(apptId, { report_id: report.id });
        toast({ title: "TX windstorm report created" });
        nav(`/reports/${report.id}`);
      } else {
        toast({ title: "Authentication required", description: "Please log in to create reports." });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to create report", description: e?.message || "Please try again." });
    }
  };

  return (
    <>
      <Seo
        title="New TX Windstorm Report"
        description="Create a new Texas windstorm mitigation report."
        canonical={window.location.origin + "/reports/new/tx-windstorm"}
      />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">New TX Windstorm Report</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St Windstorm" {...field} />
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
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const selected = contacts.find((c) => c.id === val);
                        if (selected) {
                          form.setValue("clientName", `${selected.first_name} ${selected.last_name}`);
                          const addr = selected.formatted_address || selected.address || "";
                          if (addr) form.setValue("address", addr);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.first_name} {c.last_name}
                            {c.email && <span className="text-muted-foreground ml-2">({c.email})</span>}
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => nav('/reports/select-type')}>
                Back
              </Button>
              <Button type="submit">Create Report</Button>
            </div>
          </form>
        </Form>
      </section>
    </>
  );
};

export default TxWindstormNew;
