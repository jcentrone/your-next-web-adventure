import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";
import { 
  Shield, 
  FileText, 
  Image as ImageIcon, 
  WifiOff, 
  Calendar,
  Users,
  CheckSquare,
  BarChart3,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Zap,
  Smartphone,
  Download,
  Palette,
  Wind,
  CheckCircle,
  Star,
  Globe,
  Layers
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FEATURE_FLAGS } from "@/constants/featureFlags";

const Index = () => {
  const { user } = useAuth();
  const title = "Home Report Pro | Professional PWA for Home Inspectors";
  const description = "Modern PWA platform for home inspectors specializing in wind mitigation and home inspections. Works offline, InterNACHI SOP compliant with advanced image annotation.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Home Report Pro - Professional PWA for Home Inspectors",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url: "/",
    features: [
      "Progressive Web App (PWA)",
      "Wind Mitigation Inspections", 
      "Advanced Image Annotation",
      "Offline Functionality",
      "InterNACHI SOP Compliant Reports",
      "CRM & Contact Management",
      "Smart Scheduling",
      "Task Management"
    ]
  };

  return (
    <div className="bg-background">
      <Seo title={title} description={description} canonical="/" jsonLd={jsonLd} />

      {/* Hero Section */}
      <section id="hero" className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8 text-foreground">
            Professional Home Inspection{" "}
            <span className="font-medium text-primary">Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-light leading-relaxed max-w-3xl mx-auto">
            Streamline your inspection business with intelligent tools, professional reporting, and seamless integrations
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {user ? (
              <Button size="lg" className="h-12 px-8 text-base font-medium" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="h-12 px-8 text-base font-medium" asChild>
                  <Link to="/auth">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-12 px-8 text-base font-medium text-muted-foreground hover:text-foreground">
                  View Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 pb-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light mb-6">Built for Modern Inspectors</h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Essential tools designed to streamline your inspection workflow from scheduling to reporting
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-16 lg:gap-8">
          {/* Route Optimization */}
          <div className="group">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-medium mb-4">Smart Route Planning</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Optimize daily routes with Google Maps and Waze integration. Reduce travel time and fuel costs with intelligent scheduling.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Multi-stop optimization</div>
              <div>Real-time traffic data</div>
              <div>Automatic rerouting</div>
            </div>
          </div>

          {/* Calendar Integration */}
          <div className="group">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-medium mb-4">Calendar Sync</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Seamless Google Calendar integration keeps your schedule synchronized across all devices with automatic conflict detection.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Two-way synchronization</div>
              <div>Cross-device availability</div>
              <div>Conflict detection</div>
            </div>
          </div>

          {/* Professional Reports */}
          <div className="group">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-medium mb-4">Professional Reports</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              InterNACHI SOP compliant reporting with 500+ attorney-vetted templates. Custom branding and digital signatures included.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Home & wind mitigation</div>
              <div>Custom branding</div>
              <div>PDF generation</div>
            </div>
          </div>

          {/* CRM & Contacts */}
          <div className="group">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-medium mb-4">Smart CRM</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Track relationships between clients, realtors, and contractors. Comprehensive contact management with communication history.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Relationship mapping</div>
              <div>Communication tracking</div>
              <div>Referral management</div>
            </div>
          </div>

          {/* Offline Capability */}
          <div className="group">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <WifiOff className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-medium mb-4">Works Offline</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Full functionality without internet connection. Progressive Web App with automatic synchronization when online.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Complete offline access</div>
              <div>Automatic sync</div>
              <div>Zero data loss</div>
            </div>
          </div>

          {/* Wind Mitigation */}
          <div className="group">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <Wind className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-medium mb-4">Wind Mitigation</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Specialized wind mitigation forms with OIR-B1-1802 compliance. Automated calculations for insurance discounts.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>OIR-B1-1802 forms</div>
              <div>Discount calculations</div>
              <div>Compliance reporting</div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-muted/20 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-6">Streamlined Workflow</h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              From inspection to delivery in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Schedule</h3>
              <p className="text-muted-foreground">
                Sync appointments with your calendar and optimize daily routes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Inspect</h3>
              <p className="text-muted-foreground">
                Complete inspections offline with professional templates
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Generate</h3>
              <p className="text-muted-foreground">
                Create professional reports with custom branding
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Deliver</h3>
              <p className="text-muted-foreground">
                Send reports directly to clients automatically
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-light mb-8">Professional Templates</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12 font-light">
              Over 500 attorney-vetted defect narratives ensure consistent, professional language in every report. 
              Complete branding customization makes each report uniquely yours.
            </p>
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div>
                  <div className="font-medium mb-1">500+ Defect Narratives</div>
                  <div className="text-muted-foreground">Attorney-reviewed templates for every inspection scenario</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div>
                  <div className="font-medium mb-1">Custom Branding</div>
                  <div className="text-muted-foreground">Your logo, colors, and digital signature on every report</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div>
                  <div className="font-medium mb-1">Professional Output</div>
                  <div className="text-muted-foreground">High-quality PDF generation with customizable layouts</div>
                </div>
              </div>
            </div>
            {user ? (
              <Button size="lg" className="h-12 px-8" asChild>
                <Link to="/defects-admin">Manage Templates</Link>
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="h-12 px-8">View Sample Report</Button>
            )}
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="bg-background rounded-xl p-6 border border-red-200">
                <div className="text-sm font-medium text-red-600 mb-3">Major Issue • Roof System</div>
                <p className="text-muted-foreground leading-relaxed">
                  Multiple shingles are missing or damaged on the south-facing slope. This condition may allow water intrusion 
                  and should be addressed promptly by a qualified roofing contractor.
                </p>
              </div>
              <div className="bg-background rounded-xl p-6 border border-orange-200">
                <div className="text-sm font-medium text-orange-600 mb-3">Safety Concern • Electrical</div>
                <p className="text-muted-foreground leading-relaxed">
                  Open electrical junction box observed in basement area. Recommend installing proper cover 
                  for safety compliance and code requirements.
                </p>
              </div>
              <div className="bg-background rounded-xl p-6 border border-blue-200">
                <div className="text-sm font-medium text-blue-600 mb-3">Minor Issue • Plumbing</div>
                <p className="text-muted-foreground leading-relaxed">
                  Minor leak observed at kitchen sink P-trap connection. Recommend tightening 
                  connections or replacement of worn gaskets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center bg-muted/30 rounded-3xl p-16 md:p-24">
          <h2 className="text-4xl md:text-6xl font-light mb-8">
            Ready to Streamline Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 font-light max-w-2xl mx-auto">
            Join professional inspectors who have transformed their workflow with our modern platform
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {user ? (
              <Button size="lg" className="h-12 px-8 text-base font-medium" asChild>
                <Link to="/dashboard">
                  Access Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="h-12 px-8 text-base font-medium" asChild>
                  <Link to="/auth">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium">
                  Schedule Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
