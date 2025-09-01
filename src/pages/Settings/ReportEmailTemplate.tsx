import React from "react";
import Seo from "@/components/Seo";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  getMyOrganization,
  getMyProfile,
  getReportEmailTemplate,
  saveReportEmailTemplate,
} from "@/integrations/supabase/organizationsApi";
import { MERGE_FIELDS, replaceMergeFields } from "@/utils/replaceMergeFields";
import { Html, Head, Preview, Body } from "@react-email/components";
import { Markdown } from "@react-email/markdown";
import { renderAsync } from "@react-email/render";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const sampleReport = {
  clientName: "Sample Client",
  address: "123 Sample St",
  inspectionDate: new Date().toISOString(),
};

const ReportEmailTemplate: React.FC = () => {
  const { user } = useAuth();

  const { data: organization } = useQuery({
    queryKey: ["my-organization"],
    queryFn: getMyOrganization,
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled: !!user,
  });

  const { data: template } = useQuery({
    queryKey: ["report-email-template", organization?.id],
    queryFn: () => getReportEmailTemplate(organization!.id),
    enabled: !!organization?.id,
  });

  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [preview, setPreview] = React.useState("");

  React.useEffect(() => {
    if (template) {
      setSubject(template.report_email_subject || "");
      setBody(template.report_email_body || "");
    }
  }, [template]);

  React.useEffect(() => {
    const renderPreview = async () => {
      const mergeData = { organization, inspector: profile, report: sampleReport };
      const mergedSubject = replaceMergeFields(subject, mergeData);
      const mergedBody = replaceMergeFields(body, mergeData);
      const html = await renderAsync(
        <Html>
          <Head />
          <Preview>{mergedSubject}</Preview>
          <Body>
            <Markdown>{mergedBody}</Markdown>
          </Body>
        </Html>
      );
      setPreview(html);
    };
    renderPreview();
  }, [subject, body, organization, profile]);

  const saveMutation = useMutation({
    mutationFn: () => saveReportEmailTemplate(organization!.id, subject, body),
    onSuccess: () => toast({ title: "Template saved" }),
    onError: (e: any) => toast({ title: "Failed to save template", description: e.message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    saveMutation.mutate();
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Seo title="Report Email Template" />
      <h1 className="text-2xl font-bold">Report Email Template</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <Label className="mb-2 block">Body</Label>
          <ReactQuill theme="snow" value={body} onChange={setBody} />
        </div>
        <Button type="submit" disabled={saveMutation.isPending}>
          Save Template
        </Button>
      </form>
      <div>
        <h2 className="text-xl font-semibold mb-2">Preview</h2>
        <div className="border rounded-md p-4">
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Available Merge Fields</h2>
        <ul className="list-disc pl-4">
          {MERGE_FIELDS.map((token) => (
            <li key={token}>
              <code>{token}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportEmailTemplate;
