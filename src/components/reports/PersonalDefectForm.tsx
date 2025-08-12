
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { SectionKey } from "@/constants/sop";

export type PersonalDefectPayload = {
  title: string;
  description: string;
  severity: "Minor" | "Moderate" | "Major";
  recommendation?: string;
  media_guidance?: string;
};

type Props = {
  sectionKey: SectionKey;
  onSaved: (defect: {
    id: string;
    title: string;
    description: string;
    severity: "Minor" | "Moderate" | "Major";
    recommendation?: string;
    media_guidance?: string;
  }) => void;
  onCancel: () => void;
};

const PersonalDefectForm: React.FC<Props> = ({ sectionKey, onSaved, onCancel }) => {
  const { user } = useAuth();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [severity, setSeverity] = React.useState<"Minor" | "Moderate" | "Major">("Minor");
  const [recommendation, setRecommendation] = React.useState("");
  const [mediaGuidance, setMediaGuidance] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const canSave = title.trim() && description.trim();

  const save = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to save personal defects." });
      return;
    }
    setBusy(true);
    const payload = {
      user_id: user.id,
      section_key: sectionKey as any,
      title: title.trim(),
      description: description.trim(),
      recommendation: recommendation.trim() || null,
      media_guidance: mediaGuidance.trim() || null,
      tags: [],
      is_active: true,
      severity: severity, // use exact enum value expected by DB/types
    } as const;

    const { data, error } = await supabase
      .from("user_defects")
      .insert(payload)
      .select("id,title,description,recommendation,media_guidance,severity")
      .single();

    setBusy(false);

    if (error) {
      toast({ title: "Could not save", description: error.message });
      return;
    }

    toast({ title: "Saved to My Library" });
    onSaved({
      id: data.id,
      title: data.title,
      description: data.description,
      recommendation: data.recommendation ?? undefined,
      media_guidance: data.media_guidance ?? undefined,
      severity: severity,
    });
  };

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="text-sm font-medium">New personal defect</div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-sm block mb-1">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" />
        </div>
        <div>
          <label className="text-sm block mb-1">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Use placeholders like [location] if helpful" className="min-h-24" />
        </div>
        <div>
          <label className="text-sm block mb-1">Severity</label>
          <select
            className="border rounded-md h-10 px-2 text-sm w-full"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as any)}
          >
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Major">Major</option>
          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">Recommendation (optional)</label>
          <Textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="min-h-20" />
        </div>
        <div>
          <label className="text-sm block mb-1">Media guidance (optional)</label>
          <Input value={mediaGuidance} onChange={(e) => setMediaGuidance(e.target.value)} placeholder="e.g., Include close-up and context photo" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={save} disabled={busy || !canSave}>{busy ? "Saving..." : "Save"}</Button>
        <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
      </div>
    </div>
  );
};

export default PersonalDefectForm;
