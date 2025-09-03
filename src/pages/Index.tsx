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

const Index = () => {
  const { user } = useAuth();
  const title = "Home Report Pro | Professional PWA for Home Inspectors";
  const description = "Modern PWA platform for home inspectors specializing in uniform mitigation and home inspections. Works offline, InterNACHI SOP compliant with advanced image annotation.";

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
      "Uniform Mitigation Inspections",
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
      <section id="hero" className="relative max-w-7xl mx-auto px-4 py-32 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20 -z-10" />
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm font-medium mb-8 border">
            <Zap className="w-4 h-4" />
            Professional Inspection Platform
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground leading-tight">
            Inspection Reports
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            Create comprehensive, professional inspection reports with our modern platform. 
            Built for inspectors who demand quality and efficiency.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <Button size="lg" className="text-base px-8 py-3" asChild>
                <Link to="/dashboard">
                  <ArrowRight className="mr-2 w-4 h-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-base px-8 py-3" asChild>
                  <Link to="/auth">
                    <ArrowRight className="mr-2 w-4 h-4" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 py-3">
                  <Globe className="mr-2 w-4 h-4" />
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for Modern Inspectors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional-grade tools that streamline your workflow and deliver exceptional results
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Progressive Web App</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Install as native app on any device. Works offline with automatic sync when connected.
            </p>
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                One-click installation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                Full offline functionality
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                Cross-platform compatibility
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Wind className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg">Wind Mitigation Specialist</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Florida Form 1802 compliant inspections. Help clients save thousands on insurance premiums.
            </p>
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                OIR-B1-1802 form compliance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                All 7 inspection questions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                Insurance discount calculations
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg">Advanced Image Annotation</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Professional canvas tools for image markup. Draw, highlight, and annotate photos directly in your reports.
            </p>
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                Drawing and markup tools
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                Shape and text annotations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                Undo/redo capabilities
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">Enhanced CRM</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Manage complex relationships between clients, realtors, vendors, and contractors with advanced tracking.
            </p>
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                Relationship mapping
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                Communication history
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                Referral tracking
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">92 Professional Templates</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Attorney-vetted narrative templates for each SOP section with custom branding options.
            </p>
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                Pre-written defect narratives
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                Custom logos, colors, signatures
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                Professional PDF generation
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-500/10 rounded-lg">
                <MapPin className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-lg">Smart Integrations</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Essential integrations to streamline your workflow and enhance productivity.
            </p>
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-slate-600 flex-shrink-0" />
                Google Calendar sync
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-slate-600 flex-shrink-0" />
                Route optimization
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-slate-600 flex-shrink-0" />
                Embeddable website widget
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Enhanced Workflow Section */}
      <section id="workflow" className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Modern Inspection Workflow</h2>
            <p className="text-muted-foreground text-lg">
              From mobile CRM to professional reports - streamlined for today's inspection professional
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">1. Capture & Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Mobile CRM with booking widget integration. Add contacts and schedule appointments seamlessly.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">2. Inspect & Document</h3>
              <p className="text-sm text-muted-foreground">
                Use PWA offline mode with advanced image annotation. Work anywhere without connectivity.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">3. Generate Reports</h3>
              <p className="text-sm text-muted-foreground">
                Create InterNACHI SOP compliant home inspections or specialized wind mitigation reports.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                <CheckSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">4. Deliver & Follow-up</h3>
              <p className="text-sm text-muted-foreground">
                Automated email delivery with task tracking. Never miss important follow-ups.
              </p>
            </div>
          </div>

          {/* Workflow Benefits */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center border border-border/50">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Save 2+ Hours Per Report</h4>
              <p className="text-sm text-muted-foreground">
                Pre-built templates and offline sync reduce administrative overhead
              </p>
            </Card>
            
            <Card className="p-6 text-center border border-border/50">
              <Star className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Professional Quality</h4>
              <p className="text-sm text-muted-foreground">
                Attorney-vetted narratives and professional branding every time
              </p>
            </Card>
            
            <Card className="p-6 text-center border border-border/50">
              <Layers className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Zero Learning Curve</h4>
              <p className="text-sm text-muted-foreground">
                Intuitive interface designed specifically for home inspectors
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Smartphone className="w-4 h-4" />
              Ready to Start?
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join the Modern Inspection Revolution
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Create professional inspection reports with confidence. Works online or offline, anywhere you need it.
            </p>
            
            {user ? (
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
                <Link to="/dashboard">
                  <ArrowRight className="mr-2 w-4 h-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
                  <Link to="/auth">
                    <ArrowRight className="mr-2 w-4 h-4" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Globe className="mr-2 w-4 h-4" />
                  Watch Demo
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
