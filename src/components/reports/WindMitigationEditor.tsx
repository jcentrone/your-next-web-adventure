import React from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {WindMitigationData, WindMitigationDataSchema, WindMitigationReport} from "@/lib/reportSchemas";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {uploadFindingFiles, getSignedUrlFromSupabaseUrl, isSupabaseUrl} from "@/integrations/supabase/storage";
import {useAuth} from "@/contexts/AuthContext";
import {WIND_MITIGATION_QUESTIONS} from "@/constants/windMitigationQuestions";
import {BuildingCodeQuestion} from "./windmitigation/BuildingCodeQuestion";
import {RoofCoveringQuestion} from "./windmitigation/RoofCoveringQuestion";
import {OpeningProtectionQuestion} from "./windmitigation/OpeningProtectionQuestion";
import {GenericQuestion} from "./windmitigation/GenericQuestion";
import {RoofToWallQuestion} from "./windmitigation/RoofToWallQuestion";
import {dbUpdateReport} from "@/integrations/supabase/reportsApi.ts";
import ReportDetailsForm from "./ReportDetailsForm";

interface WindMitigationEditorProps {
    report: WindMitigationReport;
    onUpdate: (report: WindMitigationReport) => void;
}

const WindMitigationEditor: React.FC<WindMitigationEditorProps> = ({report, onUpdate}) => {
    console.log("WindMitigationEditor render", {reportId: report.id, reportData: report.reportData});

    const {user} = useAuth();
    const navigate = useNavigate();
    const [coverPreviewUrl, setCoverPreviewUrl] = React.useState<string>("");

    React.useEffect(() => {
        if (!report.coverImage) return;
        if (!user || !isSupabaseUrl(report.coverImage)) {
            setCoverPreviewUrl(report.coverImage);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const signed = await getSignedUrlFromSupabaseUrl(report.coverImage);
                if (!cancelled) setCoverPreviewUrl(signed);
            } catch (e) {
                console.error("Failed to sign cover image", e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user, report.coverImage]);

    const form = useForm<WindMitigationData>({
        resolver: zodResolver(WindMitigationDataSchema),
        defaultValues: report.reportData || {
            "1_building_code": {},
            "2_roof_covering": {},
            "3_roof_deck_attachment": {},
            "4_roof_to_wall_attachment": {},
            "5_roof_geometry": {},
            "6_secondary_water_resistance": {},
            "7_opening_protection": {},
        },
    });

    const {watch, control} = form;

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (user) {
            try {
                const uploaded = await uploadFindingFiles({
                    userId: user.id,
                    reportId: report.id,
                    findingId: "cover",
                    files: [file],
                });
                if (uploaded[0]) {
                    const updated = {...report, coverImage: uploaded[0].url};
                    onUpdate(updated);
                    const signed = await getSignedUrlFromSupabaseUrl(uploaded[0].url);
                    setCoverPreviewUrl(signed);
                    await dbUpdateReport(updated);
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                const url = reader.result as string;
                const updated = {...report, coverImage: url};
                onUpdate(updated);
                setCoverPreviewUrl(url);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSave = async () => {
        try {
            console.log("Save button clicked");
            const currentValues = form.getValues();
            console.log("Current form values:", currentValues);

            const updatedReport = {
                ...report,
                reportData: currentValues,
            };

            console.log("Updated report:", updatedReport);
            const savedReport = await dbUpdateReport(updatedReport);
            console.log("✅ Report saved to DB:", savedReport);
            onUpdate(updatedReport);

            toast({
                title: "Report saved",
                description: "Uniform mitigation report has been saved successfully.",
            });
        } catch (error) {
            console.error("Error saving uniform mitigation report:", error);
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "There was an error saving the report. Please try again.",
                variant: "destructive",
            });
        }
    };

    const questions = WIND_MITIGATION_QUESTIONS.questions;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{WIND_MITIGATION_QUESTIONS.form_name}</h1>
                    <p className="text-sm text-muted-foreground">Form {WIND_MITIGATION_QUESTIONS.version}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => navigate("/reports")}>Back to Reports</Button>
                    <Button variant="outline" onClick={() => navigate(`/reports/${report.id}/preview`)}>Preview</Button>
                    <Button onClick={handleSave} className="shrink-0">
                        Save Report
                    </Button>
                </div>
            </div>

            <ReportDetailsForm report={report as any} onUpdate={onUpdate as any} />

            <div className="space-y-2">
                <Label className="text-sm font-medium">Cover Image</Label>
                {coverPreviewUrl && (
                    <img src={coverPreviewUrl} alt="Cover" className="h-40 w-auto rounded border" />
                )}
                <Input type="file" accept="image/*" onChange={handleCoverImageUpload} />
            </div>

            <Form {...form}>
                <div className="space-y-6">
                    {/* Question 1: Building Code */}
                    <BuildingCodeQuestion control={control} watch={watch}/>

                    {/* Question 2: Roof Covering */}
                    <RoofCoveringQuestion control={control} watch={watch}/>

                    {/* Question 3: Roof Deck Attachment */}
                    <GenericQuestion
                        question={questions[2]}
                        questionNumber={3}
                        control={control}
                        watch={watch}
                    />

                    {/* Question 4: Roof-to-Wall Attachment */}
                    <RoofToWallQuestion control={control} watch={watch} />

                    {/* Question 5: Roof Geometry */}
                    <GenericQuestion
                        question={questions[4]}
                        questionNumber={5}
                        control={control}
                        watch={watch}
                    />

                    {/* Question 6: Secondary Water Resistance */}
                    <GenericQuestion
                        question={questions[5]}
                        questionNumber={6}
                        control={control}
                        watch={watch}
                    />

                    {/* Question 7: Opening Protection */}
                    <OpeningProtectionQuestion control={control} watch={watch}/>
                </div>
            </Form>
        </div>
    );
};

export default WindMitigationEditor;