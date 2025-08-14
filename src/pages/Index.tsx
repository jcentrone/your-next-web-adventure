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
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const title = "InspectPro | Complete Home Inspection Business Management";
  const description = "All-in-one platform for home inspectors: CRM, scheduling, reporting, task management, and client portal. InterNACHI compliant with offline sync.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "InspectPro - Home Inspection Business Management",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url: "/",
    features: [
      "CRM & Contact Management",
      "Appointment Scheduling",
      "InterNACHI Compliant Reports",
      "Task Management",
      "Offline Sync",
      "Client Portal"
    ]
  };

  return (
    <div className="bg-background">
      <Seo title={title} description={description} canonical="/" jsonLd={jsonLd} />

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Complete Business Management Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Grow Your Inspection Business with{" "}
            <span className="text-primary">InspectPro</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            From lead to report delivery - manage clients, schedule appointments, create InterNACHI-compliant reports, 
            and track tasks all in one powerful platform designed for home inspectors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/auth">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Run Your Business</h2>
          <p className="text-muted-foreground text-lg">
            Stop juggling multiple tools. InspectPro brings all your business operations into one place.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">CRM & Contacts</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Manage clients, realtors, vendors, and contractors. Track communication history and build lasting relationships.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Contact management by type</li>
              <li>• Communication tracking</li>
              <li>• Quick search and filtering</li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Smart Scheduling</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Visual calendar with appointment management. Link appointments to contacts and convert to reports seamlessly.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Calendar view with drag-drop</li>
              <li>• Appointment status tracking</li>
              <li>• Contact integration</li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg">InterNACHI Reports</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Create professional, standards-compliant reports with narrative templates, media attachments, and custom branding.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• SOP-structured sections</li>
              <li>• Photo/video attachments</li>
              <li>• Custom branding & signatures</li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg">Task Management</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Never miss a follow-up. Track tasks with priorities, due dates, and link them to contacts and appointments.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Priority-based organization</li>
              <li>• Due date tracking</li>
              <li>• Context linking</li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <WifiOff className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg">Offline Ready</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Work anywhere, anytime. Full offline capability with automatic sync when you're back online.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Complete offline functionality</li>
              <li>• Automatic background sync</li>
              <li>• No data loss guarantee</li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-lg">Business Dashboard</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Get insights into your business with upcoming appointments, overdue tasks, and performance metrics.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Performance analytics</li>
              <li>• Activity timeline</li>
              <li>• Quick action buttons</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Streamlined Workflow</h2>
            <p className="text-muted-foreground text-lg">
              From initial contact to report delivery - manage your entire process efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Add Contact</h3>
              <p className="text-sm text-muted-foreground">
                Add clients, realtors, and referral sources to your CRM
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Schedule Appointment</h3>
              <p className="text-sm text-muted-foreground">
                Book inspections with calendar view and contact linking
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Create Report</h3>
              <p className="text-sm text-muted-foreground">
                Generate InterNACHI-compliant reports with photos and templates
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">4. Deliver & Follow Up</h3>
              <p className="text-sm text-muted-foreground">
                Send reports to clients and track follow-up tasks
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

      {/* Security & Compliance */}
      <section id="security" className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Secure & Compliant</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Built with security and compliance in mind. Your data and your clients' data are protected 
              with enterprise-grade security measures.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Role-Based Access</h4>
                <p className="text-sm text-muted-foreground">
                  Inspectors, Office Staff, Admins, and Clients each have appropriate access levels
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Data Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  HTTPS everywhere, encrypted data storage, and secure media access controls
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">InterNACHI Compliant</h4>
                <p className="text-sm text-muted-foreground">
                  Reports follow InterNACHI Standards of Practice with proper disclaimers and formatting
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Inspection Business?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of inspectors who've streamlined their workflow with InspectPro. 
            Start your free trial today and see the difference.
          </p>
          {user ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
