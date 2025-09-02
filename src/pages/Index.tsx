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
      <section id="hero" className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Complete Inspection Business Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Smart Home Inspection Platform for{" "}
            <span className="text-primary">Modern Inspectors</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Complete business management with AI-powered defect detection, intelligent route optimization, 
            and seamless calendar integration. InterNACHI SOP compliant with wind mitigation specialization.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {user ? (
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground" asChild>
                  <Link to="/auth">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <Globe className="mr-2 w-4 h-4" />
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need in One Platform</h2>
          <p className="text-muted-foreground text-lg">
            Complete inspection business management with intelligent automation and modern integrations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* AI-Powered Defect Detection */}
          <Card className="p-8 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">AI Defect Detection</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Powered by OpenAI</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed">
              Upload photos and let AI automatically detect and write defect descriptions. Connect your OpenAI API key for intelligent report writing.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Automatic defect identification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Professional narrative generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Your OpenAI API key integration</span>
              </li>
            </ul>
          </Card>

          {/* Route Optimization */}
          <Card className="p-8 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 border-green-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Smart Route Optimization</h3>
                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">Google Maps</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed">
              Automatically optimize your daily inspection routes. Save time and fuel with intelligent scheduling based on location proximity.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Multi-stop route planning</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Real-time traffic optimization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Fuel and time savings</span>
              </li>
            </ul>
          </Card>

          {/* Google Calendar Integration */}
          <Card className="p-8 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 border-blue-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Calendar Sync</h3>
                <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">Google Calendar</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed">
              Seamless two-way sync with Google Calendar. Schedule inspections that automatically appear across all your devices.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Two-way calendar synchronization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Automatic conflict detection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Cross-device availability</span>
              </li>
            </ul>
          </Card>

          {/* Professional Reports */}
          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg">Professional Reports</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              InterNACHI SOP compliant reports with wind mitigation specialization. Custom branding and 500+ defect templates.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Home & wind mitigation inspections</li>
              <li>• Custom branding & signatures</li>
              <li>• Professional PDF generation</li>
            </ul>
          </Card>

          {/* CRM & Contacts */}
          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">Smart CRM</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Manage relationships between clients, realtors, vendors, and contractors with advanced tracking and communication history.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Relationship mapping</li>
              <li>• Communication tracking</li>
              <li>• Referral management</li>
            </ul>
          </Card>

          {/* Offline Capability */}
          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <WifiOff className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg">Works Offline</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Complete functionality without internet. PWA technology with automatic sync ensures no data loss anywhere.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Full offline capability</li>
              <li>• Automatic background sync</li>
              <li>• Zero data loss guarantee</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Streamlined Workflow */}
      <section className="bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple 4-Step Process</h2>
            <p className="text-muted-foreground text-lg">
              From scheduling to report delivery with intelligent automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">1. Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Book inspections with Google Calendar sync and route optimization
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">2. Inspect</h3>
              <p className="text-sm text-muted-foreground">
                Use offline mobile app with AI defect detection and photo capture
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">3. Generate</h3>
              <p className="text-sm text-muted-foreground">
                AI writes defects automatically with professional narratives
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">4. Deliver</h3>
              <p className="text-sm text-muted-foreground">
                Professional PDF reports delivered automatically to clients
              </p>
            </div>
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

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Streamline Your Inspections?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Join professional inspectors using AI-powered defect detection, smart routing, and seamless calendar sync.
            </p>
            
            {user ? (
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
                <Link to="/dashboard">
                  Open Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
                  <Link to="/auth">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Globe className="mr-2 w-5 h-5" />
                  View Demo
                </Button>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-white/80 text-sm">
                ✓ AI defect detection  ✓ Route optimization  ✓ Google Calendar sync  ✓ Works offline
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
