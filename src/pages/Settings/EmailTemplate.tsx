import React from "react";
import Seo from "@/components/Seo";
import {useAuth} from "@/contexts/AuthContext";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {toast} from "@/components/ui/use-toast";
import {
  getMyOrganization,
  getMyProfile,
  getProfileByUserId,
  getReportEmailTemplate,
  saveReportEmailTemplate,
} from "@/integrations/supabase/organizationsApi";
import {MERGE_FIELD_MAP, replaceMergeFields} from "@/utils/replaceMergeFields";
import {Body, Head, Html, Preview} from "@react-email/components";
import {Markdown} from "@react-email/markdown";
import {renderAsync} from "@react-email/render";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {DEFAULT_REPORT_EMAIL_BODY, DEFAULT_REPORT_EMAIL_SUBJECT} from "@/constants/emailTemplates";

const sampleReport = {
    clientName: "Sample Client",
    address: "123 Sample St",
    inspectionDate: new Date().toISOString(),
};

const EmailTemplate: React.FC = () => {
    const {user} = useAuth();

    const {data: organization} = useQuery({
        queryKey: ["my-organization"],
        queryFn: getMyOrganization,
        enabled: !!user,
    });

    const {data: profile} = useQuery({
        queryKey: ["my-profile"],
        queryFn: getMyProfile,
        enabled: !!user,
    });

    const {data: template} = useQuery({
        queryKey: ["report-email-template", organization?.id],
        queryFn: () => getReportEmailTemplate(organization!.id),
        enabled: !!organization?.id,
    });

    const {data: updatedBy} = useQuery({
        queryKey: ["profile", template?.updated_by],
        queryFn: () => getProfileByUserId(template!.updated_by!),
        enabled: !!template?.updated_by,
    });

    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");
    const [preview, setPreview] = React.useState("");
    const queryClient = useQueryClient();

    const subjectRef = React.useRef<HTMLInputElement>(null);
    const subjectSelection = React.useRef({start: 0, end: 0});
    const quillRef = React.useRef<ReactQuill>(null);
    const [subjectSelectValue, setSubjectSelectValue] = React.useState("");
    const [bodySelectValue, setBodySelectValue] = React.useState("");

    const mergeFields = Object.keys(MERGE_FIELD_MAP);

    const updateSubjectSelection = () => {
        const input = subjectRef.current;
        if (input) {
            subjectSelection.current = {
                start: input.selectionStart ?? 0,
                end: input.selectionEnd ?? 0,
            };
        }
    };

    const handleInsertSubject = (token: string) => {
        const input = subjectRef.current;
        if (!input) return;
        const {start, end} = subjectSelection.current;
        const newValue = subject.slice(0, start) + token + subject.slice(end);
        setSubject(newValue);
        requestAnimationFrame(() => {
            const caret = start + token.length;
            input.focus();
            input.setSelectionRange(caret, caret);
            subjectSelection.current = {start: caret, end: caret};
        });
        setSubjectSelectValue("");
    };

    const handleInsertBody = (token: string) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        const selection = quill.getSelection(true);
        const index = selection ? selection.index : body.length;
        quill.insertText(index, token);
        quill.setSelection(index + token.length, 0);
        quill.focus();
        setBodySelectValue("");
    };

    React.useEffect(() => {
        if (template) {
            setSubject(template.report_email_subject || "");
            setBody(template.report_email_body || "");
        }
    }, [template]);

    React.useEffect(() => {
        const renderPreview = async () => {
            const mergeData = {organization, inspector: profile, report: sampleReport};
            const mergedSubject = replaceMergeFields(subject, mergeData);
            const mergedBody = replaceMergeFields(body, mergeData);
            const html = await renderAsync(
                <Html>
                    <Head/>
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
            toast({title: "Template saved"});
            queryClient.invalidateQueries({queryKey: ["report-email-template", organization!.id]});
        },
        onError: (e: unknown) => {
            const message = e instanceof Error ? e.message : String(e);
            toast({title: "Failed to save template", description: message});
        },
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
        <div className="container mx-auto p-6 max-w-7xl">
            <Seo title="Report Email Template"/>
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Report Email Template</h1>
                {template?.updated_at && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Last edited {new Date(template.updated_at).toLocaleString()} {updatedBy ? `by ${updatedBy.full_name || updatedBy.email}` : ""}
                    </p>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-card-foreground">Email Template Editor</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="subject" className="text-sm font-medium">Subject Line</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="subject"
                                        ref={subjectRef}
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        onSelect={updateSubjectSelection}
                                        onKeyUp={updateSubjectSelection}
                                        onClick={updateSubjectSelection}
                                        placeholder="Enter email subject..."
                                        className="flex-1"
                                    />
                                    <Select
                                        value={subjectSelectValue}
                                        onValueChange={handleInsertSubject}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Insert field"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mergeFields.map((token) => (
                                                <SelectItem key={token} value={token}>
                                                    {token}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Email Body</Label>
                                <Select value={bodySelectValue} onValueChange={handleInsertBody}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Insert field"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mergeFields.map((token) => (
                                            <SelectItem key={token} value={token}>
                                                {token}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="space-y-2">
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={body}
                                        onChange={setBody}
                                        className="h-64 [&_.ql-container]:border-input [&_.ql-container]:rounded-md [&_.ql-toolbar]:border-input [&_.ql-toolbar]:rounded-t-md [&_.ql-container_.ql-editor]:min-h-[200px]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-8">
                                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                                    {saveMutation.isPending ? "Saving..." : "Save Template"}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleReset} 
                                    disabled={saveMutation.isPending}
                                >
                                    Reset to Default
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-card-foreground">Email Preview</h2>
                        <div className="bg-background border rounded-lg p-4 min-h-[400px]">
                            <div className="space-y-4">
                                <div className="border-b border-border pb-3">
                                    <div className="text-sm text-muted-foreground mb-1">Subject:</div>
                                    <div className="font-medium text-foreground">
                                        {replaceMergeFields(subject, {organization, inspector: profile, report: sampleReport}) || "No subject"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-2">Message:</div>
                                    <div 
                                        className="prose prose-sm max-w-none text-foreground"
                                        dangerouslySetInnerHTML={{__html: preview}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/50 border rounded-lg p-4">
                        <h3 className="font-medium text-sm mb-2">Available Merge Fields</h3>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                            {mergeFields.slice(0, 6).map((field) => (
                                <code key={field} className="bg-background px-2 py-1 rounded text-muted-foreground">
                                    {field}
                                </code>
                            ))}
                            {mergeFields.length > 6 && (
                                <div className="text-muted-foreground italic">
                                    +{mergeFields.length - 6} more fields available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailTemplate;
