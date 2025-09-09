import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Seo from "@/components/Seo";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Globe,
  Smartphone,
  Wind,
  Image as ImageIcon,
  Users,
  FileText,
  Layers,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Feature = {
  title: string;
  description: string;
  bullets: string[];
  Icon: LucideIcon;
  color: string;
};

const features: Feature[] = [
  {
    title: "Progressive Web App",
    description:
      "Install as native app on any device. Works offline with automatic sync when connected.",
    bullets: [
      "One-click installation",
      "Full offline functionality",
      "Cross-platform compatibility"
    ],
    Icon: Smartphone,
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "Wind Mitigation Specialist",
    description:
      "Florida Form 1802 compliant inspections. Help clients save thousands on insurance premiums.",
    bullets: [
      "OIR-B1-1802 form compliance",
      "All 7 inspection questions",
      "Insurance discount calculations"
    ],
    Icon: Wind,
    color: "from-amber-500 to-orange-600"
  },
  {
    title: "Advanced Image Annotation",
    description:
      "Professional canvas tools for image markup. Draw, highlight, and annotate photos directly in your reports.",
    bullets: [
      "Drawing and markup tools",
      "Shape and text annotations",
      "Undo/redo capabilities"
    ],
    Icon: ImageIcon,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Simple CRM",
    description:
      "Straightforward contact management. Keep track of your clients and key contacts without the complexity.",
    bullets: [
      "Contact information storage",
      "Basic note taking",
      "Easy search and filtering"
    ],
    Icon: Users,
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "Professional Templates",
    description:
      "Attorney-vetted narrative templates for each SOP section with custom branding options.",
    bullets: [
      "Pre-written defect narratives",
      "Custom logos, colors, signatures",
      "Professional PDF generation"
    ],
    Icon: FileText,
    color: "from-purple-500 to-violet-500"
  },
  {
    title: "Seamless Integrations",
    description:
      "Works with your existing tools and services to keep data flowing effortlessly.",
    bullets: [
      "Supabase backend",
      "Email & SMS notifications",
      "Flexible API architecture"
    ],
    Icon: Layers,
    color: "from-slate-500 to-gray-600"
  }
];

const FeatureCard = ({ Icon, title, description, bullets, color }: Feature) => (
  <Card className="p-8 rounded-3xl border bg-card backdrop-blur-sm hover:shadow-lg transition">
    <div className="flex flex-col h-full">
      <div
        className={`w-14 h-14 mb-6 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-semibold text-xl mb-4 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-2 mt-auto">
        {bullets.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
            <span className="text-sm text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </Card>
);

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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse -z-10"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-accent/30 rounded-full blur-xl animate-pulse -z-10" style={{animationDelay: '1s'}}></div>
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-lg"></div>
            <div className="relative bg-background/60 backdrop-blur-sm border border-primary/30 px-6 py-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <span className="text-foreground font-medium">Professional Inspection Platform</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-700 via-blue-800 to-slate-900 dark:from-slate-200 dark:via-blue-200 dark:to-slate-100 bg-clip-text text-transparent">
              Inspection Reports
            </span>
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Made Simple
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 rounded-full opacity-30"></div>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            Create comprehensive, professional inspection reports with our modern platform. 
            Built for inspectors who demand quality and efficiency.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <Button size="lg" className="relative text-base px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" asChild>
                  <Link to="/dashboard">
                    <ArrowRight className="mr-2 w-4 h-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <Button size="lg" className="relative text-base px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" asChild>
                    <Link to="/auth">
                      <ArrowRight className="mr-2 w-4 h-4" />
                      Start Free Trial
                    </Link>
                  </Button>
                </div>
                <Button size="lg" variant="outline" className="text-base px-8 py-3 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5">
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for Modern Inspectors</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional-grade tools that streamline your workflow and deliver exceptional results
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
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
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-2xl group-hover:scale-105 transition-all duration-300"></div>
                <div className="absolute inset-2 bg-white/20 rounded-xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white/70 rounded-full absolute -right-1 -top-1"></div>
                    <div className="w-2 h-2 bg-white/70 rounded-full absolute -left-1 top-2"></div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-lg">Capture & Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Mobile CRM with booking widget integration. Add contacts and schedule appointments seamlessly.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl group-hover:scale-105 transition-all duration-300"></div>
                <div className="absolute inset-2 bg-white/20 rounded-xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-6 h-8 bg-white/30 rounded-sm border border-white/50"></div>
                    <div className="absolute inset-1 bg-white/60 rounded-sm"></div>
                    <div className="absolute top-2 left-1.5 w-3 h-0.5 bg-white rounded"></div>
                    <div className="absolute top-3 left-1.5 w-2 h-0.5 bg-white/80 rounded"></div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-lg">Inspect & Document</h3>
              <p className="text-sm text-muted-foreground">
                Use PWA offline mode with advanced image annotation. Work anywhere without connectivity.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl group-hover:scale-105 transition-all duration-300"></div>
                <div className="absolute inset-2 bg-white/20 rounded-xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-6 h-7 bg-white/30 rounded-sm border border-white/50"></div>
                    <div className="absolute top-1 left-1 w-4 h-1 bg-white rounded"></div>
                    <div className="absolute top-2.5 left-1 w-3 h-0.5 bg-white/80 rounded"></div>
                    <div className="absolute top-3.5 left-1 w-2 h-0.5 bg-white/60 rounded"></div>
                    <div className="absolute bottom-1 left-1 w-4 h-1 bg-white/40 rounded"></div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-lg">Generate Reports</h3>
              <p className="text-sm text-muted-foreground">
                Create InterNACHI SOP compliant home inspections or specialized wind mitigation reports.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl group-hover:scale-105 transition-all duration-300"></div>
                <div className="absolute inset-2 bg-white/20 rounded-xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-5 h-5 bg-white/30 rounded border border-white/50"></div>
                    <div className="absolute inset-1 bg-white/20 rounded"></div>
                    <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white rounded-sm"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-lg">Deliver & Follow-up</h3>
              <p className="text-sm text-muted-foreground">
                Automated email delivery with task tracking. Never miss important follow-ups.
              </p>
            </div>
          </div>

          {/* Workflow Benefits */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center border bg-card">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2 text-card-foreground">Save 2+ Hours Per Report</h4>
              <p className="text-sm text-muted-foreground">
                Pre-built templates and offline sync reduce administrative overhead
              </p>
            </Card>
            
            <Card className="p-6 text-center border bg-card">
              <Star className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2 text-card-foreground">Professional Quality</h4>
              <p className="text-sm text-muted-foreground">
                Attorney-vetted narratives and professional branding every time
              </p>
            </Card>
            
            <Card className="p-6 text-center border bg-card">
              <Layers className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2 text-card-foreground">Zero Learning Curve</h4>
              <p className="text-sm text-muted-foreground">
                Intuitive interface designed specifically for home inspectors
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Templates Showcase Section */}
      <section id="templates" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Professional Report Templates</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            See exactly how your reports will look with our collection of professional templates. 
            Custom branding, multiple layouts, and full InterNACHI compliance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">16 Cover Templates</h3>
            <p className="text-muted-foreground mb-4">
              Choose from professional cover designs that match your brand and inspection type
            </p>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Multiple Layouts</h3>
            <p className="text-muted-foreground mb-4">
              Classic, modern, and minimal styles to suit your professional preferences
            </p>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Custom Branding</h3>
            <p className="text-muted-foreground mb-4">
              Add your logo, colors, and company details to create a unique professional look
            </p>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" asChild className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
            <Link to="/sample-reports">
              <ArrowRight className="mr-2 w-4 h-4" />
              View All Templates
            </Link>
          </Button>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundColor: '#0A1122' }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-muted-foreground text-background px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Smartphone className="w-4 h-4" />
              Ready to Start?
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-muted-foreground mb-4">
              Join the Modern Inspection Revolution
            </h2>
            <p className="text-muted-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Create professional inspection reports with confidence. Works online or offline, anywhere you need it.
            </p>
            
            {user ? (
              <Button size="lg" className="bg-muted-foreground text-background hover:bg-muted-foreground/90 shadow-lg" asChild>
                <Link to="/dashboard">
                  <ArrowRight className="mr-2 w-4 h-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg" asChild>
                  <Link to="/auth">
                    <ArrowRight className="mr-2 w-4 h-4" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" >
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
