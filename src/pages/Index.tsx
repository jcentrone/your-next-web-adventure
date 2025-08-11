import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Seo from "@/components/Seo";
import { Shield, FileText, Image as ImageIcon, WifiOff } from "lucide-react";

const Index = () => {
  const title = "Home Inspection Reporting Platform | InterNACHI Compliant";
  const description = "Create standards-compliant home inspection reports with templates, media attachments, branding, and offline sync.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Home Inspection Reporting Platform",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url: "/",
  };

  return (
    <div className="bg-background">
      <Seo title={title} description={description} canonical="/" jsonLd={jsonLd} />

      <section id="hero" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Home Inspection Reporting Platform
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Streamline InterNACHI-compliant reports with narrative templates, photos/videos, and offline sync. Branded PDFs your clients will love.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg">Start a Report</Button>
            <Button size="lg" variant="secondary">View Demo</Button>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 pb-8 md:pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-semibold">SOP-Structured Editor</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Roof, Exterior, Plumbing, Electrical, and more — organized by InterNACHI SOP with severity and summaries.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-semibold">Media Attachments</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Attach photos, videos, and captions to each finding. Optimized for fast, crisp reports.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-semibold">Branding & Signatures</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Custom logos, colors, headers/footers, and digital signatures for polished, professional PDFs.
            </p>
          </Card>
        </div>
      </section>

      <section id="templates" className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Narrative Template Library</h2>
            <p className="text-muted-foreground mb-4">
              Attorney-vetted, customizable defect narratives for each SOP section speed up reporting while keeping language consistent.
            </p>
            <Button>Browse Templates</Button>
          </div>
          <Card className="p-6">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Roof: Missing/ Damaged shingles, flashing, clogged gutters</li>
              <li>Plumbing: Active leaks, improper traps, water heater issues</li>
              <li>Electrical: Open junctions, double taps, GFCI/AFCI</li>
              <li>Interior: Window seal failures, stair safety, moisture</li>
            </ul>
          </Card>
        </div>
      </section>

      <section id="offline" className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <Card className="p-6 order-2 md:order-1">
            <div className="flex items-center gap-3 mb-3">
              <WifiOff className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-semibold">Offline First</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Work fully offline on-site. Notes and media cache locally and auto-sync when back online — no data loss.
            </p>
          </Card>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-semibold mb-2">Reliable Sync</h2>
            <p className="text-muted-foreground mb-4">
              Two-way sync merges updates seamlessly. Designed for single or multi-inspector workflows.
            </p>
            <Button variant="outline">Learn More</Button>
          </div>
        </div>
      </section>

      <section id="security" className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-2">Secure by Design</h2>
          <p className="text-muted-foreground">
            Role-based access for Inspectors, Office Staff, Admins, and Clients. HTTPS everywhere and media access controls.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
