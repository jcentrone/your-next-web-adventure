import React from 'react';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Camera, 
  Shield, 
  Users, 
  Calendar, 
  BarChart3,
  CheckCircle,
  Smartphone,
  Cloud,
  Settings,
  Download,
  Zap
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Professional Reports",
      description: "Create comprehensive inspection reports with customizable templates that follow InterNACHI standards.",
      highlights: ["Multiple report types", "Custom templates", "Digital signatures"]
    },
    {
      icon: Camera,
      title: "Photo & Media Management",
      description: "Capture, annotate, and organize photos directly within your reports with advanced media tools.",
      highlights: ["Photo annotation", "Video recording", "Audio notes"]
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Work seamlessly across devices with our responsive web app and PWA capabilities.",
      highlights: ["Offline functionality", "Cross-platform", "Touch-optimized"]
    },
    {
      icon: Cloud,
      title: "Cloud Synchronization",
      description: "Your data is always backed up and synchronized across all your devices automatically.",
      highlights: ["Real-time sync", "Data backup", "Multi-device access"]
    },
    {
      icon: Users,
      title: "Contact & Account Management",
      description: "Organize your clients and business relationships with comprehensive CRM features.",
      highlights: ["Contact database", "Relationship tracking", "Communication history"]
    },
    {
      icon: Calendar,
      title: "Scheduling & Tasks",
      description: "Manage appointments, deadlines, and follow-ups with integrated calendar and task management.",
      highlights: ["Calendar integration", "Task reminders", "Appointment booking"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track your business performance with detailed analytics and reporting dashboards.",
      highlights: ["Revenue tracking", "Performance metrics", "Business insights"]
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with data encryption and compliance with industry standards.",
      highlights: ["Data encryption", "Secure sharing", "Compliance ready"]
    },
    {
      icon: Settings,
      title: "Customization Options",
      description: "Tailor the platform to your business needs with extensive customization capabilities.",
      highlights: ["Custom branding", "Report templates", "Workflow settings"]
    }
  ];

  return (
    <>
      <Seo 
        title="Features - Home Report Pro"
        description="Discover the powerful features of Home Report Pro - from professional report generation to mobile-first design and comprehensive business management tools."
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Powerful Features
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Everything you need to run a successful home inspection business, 
              from report generation to client management and business analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/auth?mode=signup">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/sample-reports">View Sample Reports</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Complete Business Solution</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our comprehensive platform includes everything you need to streamline your inspection workflow
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-muted/50 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of home inspectors who trust Home Report Pro to run their business efficiently.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link to="/auth?mode=signup">Start Your Free Trial</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8">
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default Features;