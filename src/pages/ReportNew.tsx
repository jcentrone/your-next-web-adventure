import React from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createReport } from "@/hooks/useLocalDraft";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dbCreateReport } from "@/integrations/supabase/reportsApi";

const schema = z.object({
  title: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  inspectionDate: z.string().min(1, "Required"),
});

type Values = z.infer<typeof schema>;

const ReportNew: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      clientName: "",
      address: "",
      inspectionDate: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (values: Values) => {
    try {
      if (user) {
        const report = await dbCreateReport(
          {
            title: values.title,
            clientName: values.clientName,
            address: values.address,
            inspectionDate: values.inspectionDate,
          },
          user.id
        );
        toast({ title: "Report created" });
        nav(`/reports/${report.id}`);
      } else {
        const report = createReport({
          title: values.title,
          clientName: values.clientName,
          address: values.address,
          inspectionDate: new Date(values.inspectionDate).toISOString(),
        });
        toast({ title: "Report created (local draft)" });
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
        title="New Report | Home Inspection"
        description="Create a new home inspection report with preloaded SOP sections."
        canonical={window.location.origin + "/reports/new"}
        jsonLd={{ "@context": "https://schema.org", "@type": "CreateAction", name: "Create Report" }}
      />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">New Inspection Report</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St Inspection" {...field} />
                  </FormControl>
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
                    <Input placeholder="Client full name" {...field} />
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
                    <Textarea placeholder="Street, City, State" {...field} />
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
              <Button type="submit">Create & Continue</Button>
            </div>
          </form>
        </Form>
      </section>
    </>
  );
};

export default ReportNew;
