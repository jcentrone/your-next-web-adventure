import React from "react";
import Seo from "@/components/Seo";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { SOP_SECTIONS } from "@/constants/sop";

const STORAGE_KEY = "defects:library";

const DefectsAdmin: React.FC = () => {
  const [json, setJson] = React.useState("");
  const [count, setCount] = React.useState(0);
  const [fileName, setFileName] = React.useState("defects-library.json");

  const current: any[] = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      setCount(Array.isArray(data) ? data.length : 0);
      return Array.isArray(data) ? data : [];
    } catch {
      setCount(0);
      return [];
    }
  }, []);

  const importJson = () => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) throw new Error("JSON must be an array of defects");
      // minimal shape validation
      const ok = data.every(
        (d) => typeof d.section === "string" && typeof d.title === "string" && typeof d.description === "string" && typeof d.severity === "string"
      );
      if (!ok) throw new Error("Each defect must include section, title, description, severity");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      toast({ title: "Defect library imported", description: `${data.length} items saved.` });
      setJson("");
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message || "Invalid JSON", variant: "destructive" });
    }
  };

  const exportJson = () => {
    const raw = localStorage.getItem(STORAGE_KEY) || "[]";
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Seo
        title="Defect Library Admin | Home Inspection"
        description="Import and manage the narrative defect library by section."
        canonical={window.location.origin + "/defects-admin"}
      />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-2">Defect Library Admin</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Paste your JSON array of defects (fields: section, title, description, severity, recommendation?, media_guidance?). Saved locally for now.
        </p>

        <div className="rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} aria-label="File name" />
            <Button variant="outline" onClick={exportJson}>Export current</Button>
          </div>
          <Textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="Paste defects JSON here..."
            className="min-h-40"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={importJson}>Import JSON</Button>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">Current Library Summary</h2>
          <p className="text-sm text-muted-foreground mb-3">Total items: {count}</p>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {SOP_SECTIONS.map((s) => (
              <li key={s.key} className="flex items-center justify-between border rounded p-2">
                <span>{s.name}</span>
                <span className="text-muted-foreground">
                  {current.filter((d) => d.section === s.name).length}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default DefectsAdmin;
