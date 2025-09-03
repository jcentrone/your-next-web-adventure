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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/30 -z-10" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse -z-10"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-amber-300/30 rounded-full blur-xl animate-pulse -z-10" style={{animationDelay: '1s'}}></div>
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-lg"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-primary/20 px-6 py-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <span className="text-primary font-medium">Professional Inspection Platform</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Inspection Reports
            </span>
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-full opacity-30"></div>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for Modern Inspectors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional-grade tools that streamline your workflow and deliver exceptional results
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* PWA Card */}
          <Card className="relative p-0 overflow-hidden hover:shadow-xl transition-all duration-500 group border-0 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-2xl"></div>
            <div className="relative p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="relative">
                    <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                    <div className="absolute inset-1 bg-white/40 rounded-md"></div>
                    <div className="absolute inset-2 bg-white rounded-sm"></div>
                  </div>
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">Progressive Web App</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Install as native app on any device. Works offline with automatic sync when connected.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">One-click installation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Full offline functionality</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Cross-platform compatibility</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Wind Mitigation Card */}
          <Card className="relative p-0 overflow-hidden hover:shadow-xl transition-all duration-500 group border-0 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30">
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-200/40 to-transparent rounded-full blur-xl"></div>
            <div className="relative p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                  <div className="relative">
                    <div className="w-8 h-1 bg-white/80 rounded-full transform -rotate-12"></div>
                    <div className="w-6 h-1 bg-white/60 rounded-full transform rotate-12 mt-1"></div>
                    <div className="w-4 h-1 bg-white/40 rounded-full transform -rotate-6 mt-1"></div>
                  </div>
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Wind Mitigation Specialist</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Florida Form 1802 compliant inspections. Help clients save thousands on insurance premiums.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">OIR-B1-1802 form compliance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">All 7 inspection questions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Insurance discount calculations</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Image Annotation Card */}
          <Card className="relative p-0 overflow-hidden hover:shadow-xl transition-all duration-500 group border-0 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/30">
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-purple-200/30 to-transparent rounded-full blur-xl"></div>
            <div className="relative p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="relative">
                    <div className="w-8 h-6 bg-white/20 rounded border border-white/40"></div>
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full"></div>
                    <div className="absolute bottom-1 left-2 w-3 h-0.5 bg-white/80 rounded"></div>
                  </div>
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Advanced Image Annotation</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Professional canvas tools for image markup. Draw, highlight, and annotate photos directly in your reports.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Drawing and markup tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Shape and text annotations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Undo/redo capabilities</span>
                </div>
              </div>
            </div>
          </Card>

          {/* CRM Card */}
          <Card className="relative p-0 overflow-hidden hover:shadow-xl transition-all duration-500 group border-0 bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/30">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-full blur-lg"></div>
            <div className="relative p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="relative">
                    <div className="w-4 h-4 bg-white rounded-lg border border-white/40"></div>
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white/70 rounded-full"></div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-white/50 rounded-full"></div>
                    <div className="absolute bottom-1 left-1 w-2 h-0.5 bg-white/80 rounded"></div>
                  </div>
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">Simple CRM</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Straightforward contact management. Keep track of your clients and key contacts without the complexity.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Contact information storage</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Basic note taking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Easy search and filtering</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Templates Card */}
          <Card className="relative p-0 overflow-hidden hover:shadow-xl transition-all duration-500 group border-0 bg-gradient-to-br from-white via-green-50/50 to-lime-50/30">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-200/30 to-transparent rounded-full blur-2xl"></div>
            <div className="relative p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-lime-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                  <div className="text-white font-bold text-lg">92</div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-green-700 to-lime-700 bg-clip-text text-transparent">Professional Templates</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Attorney-vetted narrative templates for each SOP section with custom branding options.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-lime-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Pre-written defect narratives</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-lime-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Custom logos, colors, signatures</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-lime-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Professional PDF generation</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Integrations Card */}
          <Card className="relative p-0 overflow-hidden hover:shadow-xl transition-all duration-500 group border-0 bg-gradient-to-br from-white via-slate-50/50 to-gray-50/30">
            <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-slate-200/30 to-transparent rounded-full blur-xl"></div>
            <div className="relative p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-gray-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="relative">
                    <div className="w-3 h-3 bg-white rounded border border-white/40"></div>
                    <div className="w-2 h-2 bg-white/70 rounded absolute -right-2 top-0.5"></div>
                    <div className="w-2 h-2 bg-white/70 rounded absolute -left-2 top-0.5"></div>
                    <div className="w-4 h-0.5 bg-white/60 rounded absolute -bottom-1 -left-0.5"></div>
                    <div className="w-0.5 h-4 bg-white/60 rounded absolute -right-0.5 -bottom-1 transform rotate-90"></div>
                  </div>
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">Smart Integrations</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Essential integrations to streamline your workflow and enhance productivity.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Google Calendar sync</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Route optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Embeddable website widget</span>
                </div>
              </div>
            </div>
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
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
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
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl group-hover:scale-105 transition-all duration-300"></div>
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
