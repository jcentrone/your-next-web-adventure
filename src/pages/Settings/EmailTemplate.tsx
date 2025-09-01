import React from "react";
import Seo from "@/components/Seo";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  getMyOrganization,
  getMyProfile,
  getReportEmailTemplate,
  getProfileByUserId,
  saveReportEmailTemplate,
} from "@/integrations/supabase/organizationsApi";
import { MERGE_FIELDS, replaceMergeFields } from "@/utils/replaceMergeFields";
import { Html, Head, Preview, Body } from "@react-email/components";
import { Markdown } from "@react-email/markdown";
import { renderAsync } from "@react-email/render";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DEFAULT_REPORT_EMAIL_BODY, DEFAULT_REPORT_EMAIL_SUBJECT } from "@/constants/emailTemplates";

const sampleReport = {
  clientName: "Sample Client",
  address: "123 Sample St",
  inspectionDate: new Date().toISOString(),
};

const EmailTemplate: React.FC = () => {
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

  const { data: updatedBy } = useQuery({
    queryKey: ["profile", template?.updated_by],
    queryFn: () => getProfileByUserId(template!.updated_by!),
    enabled: !!template?.updated_by,
  });

  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [preview, setPreview] = React.useState("");
  const queryClient = useQueryClient();

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
    mutationFn: () => saveReportEmailTemplate(organization!.id, subject, body, user!.id),
    onSuccess: () => {
      toast({ title: "Template saved" });
      queryClient.invalidateQueries({ queryKey: ["report-email-template", organization!.id] });
    },
    onError: (e: any) => toast({ title: "Failed to save template", description: e.message }),
  });

  const handleReset = () => {
    setSubject(DEFAULT_REPORT_EMAIL_SUBJECT);
    setBody(DEFAULT_REPORT_EMAIL_BODY);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    saveMutation.mutate();
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Seo title="Report Email Template" />
      <h1 className="text-2xl font-bold">Report Email Template</h1>
      {template?.updated_at && (
        <p className="text-sm text-muted-foreground">
          Last edited {new Date(template.updated_at).toLocaleString()} {updatedBy ? `by ${updatedBy.full_name || updatedBy.email}` : ""}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <Label className="mb-2 block">Body</Label>
          <ReactQuill theme="snow" value={body} onChange={setBody} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            Save Template
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={saveMutation.isPending}>
            Reset to default
          </Button>
        </div>
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

export default EmailTemplate;
