import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { listReports, deleteReport } from "@/hooks/useLocalDraft";
import { toast } from "@/components/ui/use-toast";

const ReportsList: React.FC = () => {
  const [items, setItems] = React.useState(listReports());

  const onDelete = (id: string) => {
    deleteReport(id);
    setItems(listReports());
    toast({ title: "Report deleted" });
  };

  return (
    <>
      <Seo
        title="Reports | Home Inspection Reports"
        description="Manage inspection reports. Create, edit, and preview professional home inspection reports."
        canonical={window.location.origin + "/reports"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Reports",
        }}
      />
      <section className="max-w-7xl mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Inspection Reports</h1>
          <Button asChild>
            <Link to="/reports/new">New Report</Link>
          </Button>
        </header>
        {items.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="mb-4 text-muted-foreground">No reports yet.</p>
            <Button asChild>
              <Link to="/reports/new">Create your first report</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <article key={r.id} className="rounded-lg border p-4">
                <h2 className="font-medium">{r.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {r.clientName} • {new Date(r.inspectionDate).toLocaleDateString()}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button asChild size="sm">
                    <Link to={`/reports/${r.id}`}>Open</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/reports/${r.id}/preview`}>Preview</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}>
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default ReportsList;
