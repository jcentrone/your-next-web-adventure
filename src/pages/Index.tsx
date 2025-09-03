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
      <section id="hero" className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="text-center max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Professional Inspection Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            Inspection Reports
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            Create comprehensive, professional inspection reports with our modern platform. 
            Built for inspectors who demand quality and efficiency.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            {user ? (
              <Button size="lg" className="text-lg px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link to="/dashboard">
                  <ArrowRight className="mr-2 w-5 h-5" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                  <Link to="/auth">
                    <ArrowRight className="mr-2 w-5 h-5" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-2xl border-2 hover:bg-muted/50 transition-all duration-300">
                  <Globe className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 pb-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-muted/50 text-muted-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for Modern Inspectors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional-grade tools that streamline your workflow and deliver exceptional results
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl">Progressive Web App</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Install as native app on any device. Blazing fast performance with offline-first architecture and automatic updates.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                One-click installation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                Native app experience
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                Cross-platform compatibility
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                <Wind className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-xl">Wind Mitigation Specialist</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Florida Form 1802 compliant wind mitigation inspections. Help clients save thousands on insurance premiums.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
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

          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md bg-gradient-to-br from-purple-50 to-violet-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-2xl">
                <Palette className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl">Advanced Image Annotation</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Professional canvas tools for image markup. Draw, highlight, and annotate photos directly in your reports.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
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

          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl">Enhanced CRM</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Manage complex relationships between clients, realtors, vendors, and contractors with advanced tracking.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
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

          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-500/10 rounded-2xl">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl">Smart Scheduling</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Connect with Calendly, Acuity Scheduling, and more. Drag-drop calendar with external sync capabilities.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                Multiple booking platforms
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                Drag-drop scheduling
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                External calendar sync
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md bg-gradient-to-br from-red-50 to-pink-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <WifiOff className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-bold text-xl">Offline-First Architecture</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Complete functionality without internet. Automatic background sync ensures no data loss ever.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                Full offline capability
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                Intelligent background sync
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                Zero data loss guarantee
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* PWA Benefits Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Download className="w-4 h-4" />
              Progressive Web App
            </div>
            <h2 className="text-3xl font-bold mb-4">Why Install Home Report Pro?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the power of a native app without app store restrictions. Install directly from your browser.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Instant loading, smooth animations, and responsive interactions
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Works Offline</h3>
              <p className="text-sm text-muted-foreground">
                Complete functionality even in areas with poor connectivity
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Native Experience</h3>
              <p className="text-sm text-muted-foreground">
                Home screen icon, push notifications, and app-like navigation
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Always Updated</h3>
              <p className="text-sm text-muted-foreground">
                Automatic updates with no app store delays or approvals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wind Mitigation Showcase */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Wind className="w-4 h-4" />
              Wind Mitigation Specialist
            </div>
            <h2 className="text-3xl font-bold mb-4">Help Clients Save Thousands on Insurance</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Specialized wind mitigation inspections following Florida's OIR-B1-1802 form requirements. 
              Professional documentation that insurance companies trust.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>All 7 inspection questions covered</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Professional photo documentation standards</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Insurance discount calculations built-in</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Form 1802 compliance guaranteed</span>
              </div>
            </div>
            {user ? (
              <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                <Link to="/wind-mitigation/new">Create Wind Mitigation Report</Link>
              </Button>
            ) : (
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                View Sample Wind Mitigation Report
              </Button>
            )}
          </div>
          
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <h4 className="font-semibold mb-4 text-amber-800">Typical Insurance Savings</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-sm font-medium">Roof Shape (Hip)</span>
                <span className="text-green-600 font-semibold">5-15% discount</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-sm font-medium">Roof Covering</span>
                <span className="text-green-600 font-semibold">1-5% discount</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-sm font-medium">Roof Deck Attachment</span>
                <span className="text-green-600 font-semibold">1-3% discount</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-sm font-medium">Opening Protection</span>
                <span className="text-green-600 font-semibold">5-20% discount</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Potential Savings:</span>
                  <span className="text-green-600 text-lg">Up to 43%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Enhanced Workflow Section */}
      <section id="workflow" className="bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Modern Inspection Workflow</h2>
            <p className="text-muted-foreground text-lg">
              From mobile CRM to professional reports - streamlined for today's inspection professional
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Users className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">1. Capture & Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Mobile CRM with booking widget integration. Add contacts and schedule appointments seamlessly.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">2. Inspect & Document</h3>
              <p className="text-sm text-muted-foreground">
                Use PWA offline mode with advanced image annotation. Work anywhere without connectivity.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">3. Generate Reports</h3>
              <p className="text-sm text-muted-foreground">
                Create InterNACHI SOP compliant home inspections or specialized wind mitigation reports.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <CheckSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">4. Deliver & Follow-up</h3>
              <p className="text-sm text-muted-foreground">
                Automated email delivery with task tracking. Never miss important follow-ups.
              </p>
            </div>
          </div>

          {/* Workflow Benefits */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Save 2+ Hours Per Report</h4>
              <p className="text-sm text-muted-foreground">
                Pre-built templates and offline sync reduce administrative overhead
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <Star className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Professional Quality</h4>
              <p className="text-sm text-muted-foreground">
                Attorney-vetted narratives and professional branding every time
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <Layers className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Zero Learning Curve</h4>
              <p className="text-sm text-muted-foreground">
                Intuitive interface designed specifically for home inspectors
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Professional Templates & Branding</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Attorney-vetted narrative templates for each SOP section ensure consistent, professional language. 
              Custom branding makes every report uniquely yours.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm">500+ pre-written defect narratives</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm">Custom logos, colors, and signatures</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm">Professional PDF generation</span>
              </div>
            </div>
            {user ? (
              <Button asChild>
                <Link to="/defects-admin">Manage Templates</Link>
              </Button>
            ) : (
              <Button>View Sample Report</Button>
            )}
          </div>
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Sample Defect Templates</h4>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-muted/50 rounded">
                <div className="font-medium text-red-600 mb-1">Roof - Major</div>
                <p className="text-muted-foreground">
                  "Multiple shingles are missing or damaged on the south-facing slope. This condition allows water intrusion..."
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded">
                <div className="font-medium text-orange-600 mb-1">Electrical - Safety</div>
                <p className="text-muted-foreground">
                  "Open electrical junction box observed in basement. Recommend installing proper cover for safety..."
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded">
                <div className="font-medium text-blue-600 mb-1">Plumbing - Minor</div>
                <p className="text-muted-foreground">
                  "Minor leak observed at kitchen sink P-trap. Recommend tightening connections..."
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Enhanced Security & Compliance */}
      <section id="security" className="bg-gradient-to-br from-slate-50 to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Security</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-3xl mx-auto">
              Your business data and client information are protected with military-grade encryption 
              and industry-leading security practices. Full compliance with inspection standards.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Row-Level Security</h4>
              <p className="text-sm text-muted-foreground">
                Advanced database security ensures users only see their own data
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Globe className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">End-to-End Encryption</h4>
              <p className="text-sm text-muted-foreground">
                HTTPS everywhere with encrypted storage and secure API access
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Role-Based Access</h4>
              <p className="text-sm text-muted-foreground">
                Granular permissions for inspectors, staff, admins, and clients
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Compliance Ready</h4>
              <p className="text-sm text-muted-foreground">
                Built-in audit logs and compliance reporting features
              </p>
            </Card>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Standards & Compliance</h3>
              <p className="text-muted-foreground">
                Home Report Pro meets and exceeds industry standards for professional inspection reporting
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-blue-900">InterNACHI SOP Compliant</div>
                  <div className="text-sm text-blue-700">Follows all Standards of Practice requirements</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-900">Florida Form 1802</div>
                  <div className="text-sm text-green-700">Wind mitigation inspection compliance</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-purple-900">GDPR Ready</div>
                  <div className="text-sm text-purple-700">Data privacy and protection compliance</div>
                </div>
              </div>
            </div>
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
              Install as PWA for Best Experience
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Go Mobile-First?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Join the modern inspection revolution. Install Home Report Pro as a PWA and work 
              anywhere with confidence - online or offline.
            </p>
            
            {user ? (
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
                <Link to="/dashboard">
                  <Download className="mr-2 w-5 h-5" />
                  Open Your Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
                  <Link to="/auth">
                    <Download className="mr-2 w-5 h-5" />
                    Install App & Start Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Globe className="mr-2 w-5 h-5" />
                  View Live Demo
                </Button>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-white/80 text-sm">
                ✓ No app store required  ✓ Instant updates  ✓ Works on all devices  ✓ Full offline capability
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
