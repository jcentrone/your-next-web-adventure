import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/Seo";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Palette,
  Star,
  CheckCircle,
  Users,
  Building2
} from "lucide-react";
import type { Report } from "@/lib/reportSchemas";
import { SAMPLE_REPORTS, type SampleReport } from "@/constants/sampleData";
import { TemplateCard } from "@/components/samples/TemplateCard";
import { SampleReportModal } from "@/components/samples/SampleReportModal";
import { TemplateFilter } from "@/components/samples/TemplateFilter";
import { useAuth } from "@/contexts/AuthContext";

const SampleReports = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<SampleReport | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<Report["reportType"] | "all">("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | "all">("all");
  const [selectedStyle, setSelectedStyle] = useState<string | "all">("all");

  const filteredReports = useMemo(() => {
    return SAMPLE_REPORTS.filter(report => {
      if (selectedType !== "all" && report.reportType !== selectedType) return false;
      if (selectedTemplate !== "all" && report.coverTemplate !== selectedTemplate) return false;
      if (selectedStyle !== "all" && report.previewTemplate !== selectedStyle) return false;
      return true;
    });
  }, [selectedType, selectedTemplate, selectedStyle]);

  const handlePreview = (report: SampleReport) => {
    setSelectedReport(report);
    setModalOpen(true);
  };


  const title = "Professional Report Templates | Home Report Pro";
  const description = "Browse our collection of professional inspection report templates. See how your reports will look with custom branding, multiple layouts, and InterNACHI compliance.";

  return (
    <div className="min-h-screen bg-background">
      <Seo title={title} description={description} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            Professional Templates
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-700 via-blue-800 to-slate-900 dark:from-slate-200 dark:via-blue-200 dark:to-slate-100 bg-clip-text text-transparent">
              Professional Report
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Templates
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            See exactly how your inspection reports will look. Browse our collection of 
            professionally designed templates with custom branding and InterNACHI compliance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-blue-600">
                <Link to="/dashboard">
                  <ArrowRight className="mr-2 w-4 h-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-blue-600">
                <Link to="/auth">
                  <ArrowRight className="mr-2 w-4 h-4" />
                  Start Free Trial
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Templates?</h2>
            <p className="text-lg text-muted-foreground">
              Professional, compliant, and fully customizable for your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Professional Quality</h3>
              <p className="text-sm text-muted-foreground">
                Attorney-vetted narratives and professional layouts that build trust with clients
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Custom Branding</h3>
              <p className="text-sm text-muted-foreground">
                Add your logo, colors, and company information to match your brand identity
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">InterNACHI Compliant</h3>
              <p className="text-sm text-muted-foreground">
                All templates follow InterNACHI Standards of Practice and industry best practices
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Templates Gallery */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse Template Gallery</h2>
            <p className="text-lg text-muted-foreground">
              Explore {SAMPLE_REPORTS.length} professional templates across multiple report types
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <TemplateFilter
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />
          </div>

          {/* Results */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredReports.length} of {SAMPLE_REPORTS.length} templates
            </p>
            {filteredReports.length !== SAMPLE_REPORTS.length && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType("all");
                  setSelectedTemplate("all");
                  setSelectedStyle("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Template Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.map((report) => (
              <TemplateCard
                key={report.id}
                report={report}
                onPreview={handlePreview}
              />
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more templates
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedType("all");
                  setSelectedTemplate("all");
                  setSelectedStyle("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-20" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Professional Reports?</h2>
              <p className="text-lg text-primary-foreground/90 mb-8">
                Join thousands of inspectors who trust Home Report Pro for their reporting needs
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/reports/new">
                      <FileText className="mr-2 w-4 h-4" />
                      Create New Report
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" variant="secondary" asChild>
                      <Link to="/auth">
                        <Users className="mr-2 w-4 h-4" />
                        Start Free Trial
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                      <Link to="/auth?mode=signin">
                        <Building2 className="mr-2 w-4 h-4" />
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Report Modal */}
      <SampleReportModal
        report={selectedReport}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default SampleReports;