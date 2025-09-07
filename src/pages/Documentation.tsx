import React from "react";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Smartphone,
  Camera,
  FileText,
  Users,
  Settings,
  Wind,
  Shield,
  Globe,
  CheckCircle,
  CheckSquare,
  ArrowRight,
  BarChart,
  Calendar,
  Clock,
  Download
} from "lucide-react";

const Documentation = () => {
  const title = "Documentation | Home Report Pro - Complete User Guide";
  const description = "Comprehensive documentation for Home Report Pro. Learn how to use our platform for professional home inspections, wind mitigation reports, and more.";

  return (
    <div className="min-h-screen bg-background">
      <Seo title={title} description={description} canonical="/documentation" />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Complete guide to using Home Report Pro for professional inspection reporting
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <ArrowRight className="w-8 h-8 text-primary" />
            Quick Start Guide
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create Account</h3>
              <p className="text-muted-foreground mb-4">Sign up and set up your inspector profile with credentials and branding.</p>
              <Badge variant="secondary">2 minutes</Badge>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Install PWA</h3>
              <p className="text-muted-foreground mb-4">Install the app on your mobile device for offline inspections.</p>
              <Badge variant="secondary">30 seconds</Badge>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. First Report</h3>
              <p className="text-muted-foreground mb-4">Create your first inspection report using our guided interface.</p>
              <Badge variant="secondary">15 minutes</Badge>
            </Card>
          </div>
        </section>

        <Separator className="mb-16" />

        {/* Core Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Core Features</h2>

          {/* PWA Installation */}
          <Card className="p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Progressive Web App (PWA)</h3>
                <p className="text-muted-foreground mb-6">Install Home Report Pro as a native app on any device for the best experience.</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Installation Steps
                    </h4>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li><strong>Chrome/Edge (Mobile):</strong> Tap the "Add to Home Screen" notification or menu option</li>
                      <li><strong>Safari (iOS):</strong> Tap Share → Add to Home Screen</li>
                      <li><strong>Desktop:</strong> Click the install icon in the address bar</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      Offline Capabilities
                    </h4>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Complete inspections without internet connection</li>
                      <li>Automatic synchronization when back online</li>
                      <li>Cached templates and forms for instant access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Report Creation */}
          <Card className="p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Creating Inspection Reports</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Report Types Available:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Standard Home Inspections (InterNACHI SOP)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Wind Mitigation (FL Form 1802)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>4-Point Inspections (Florida)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>California Wildfire Inspections</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Texas Windstorm Inspections</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Manufactured Home Inspections</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Report Creation Workflow:</h4>
                    <ol className="space-y-2 text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="bg-primary text-white w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                        Choose report type and enter property details
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                        Complete each section using templates or custom notes
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                        Add photos and annotations as needed
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                        Review and generate professional PDF
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Image Annotation */}
          <Card className="p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Advanced Image Annotation</h3>
                <p className="text-muted-foreground mb-6">Professional canvas tools for marking up photos directly in your reports.</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Available Tools:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Drawing and freehand sketching</li>
                      <li>• Arrows and lines</li>
                      <li>• Rectangles and circles</li>
                      <li>• Text annotations</li>
                      <li>• Highlighter effects</li>
                      <li>• Undo/redo functionality</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Best Practices:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Use arrows to point to specific defects</li>
                      <li>• Add text labels for clarity</li>
                      <li>• Use consistent colors for different issue types</li>
                      <li>• Save annotated images with descriptive names</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Wind Mitigation */}
          <Card className="p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Wind className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Wind Mitigation Inspections</h3>
                <p className="text-muted-foreground mb-6">Complete OIR-B1-1802 form compliance for Florida wind mitigation inspections.</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Covered Inspection Points:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="space-y-1 text-muted-foreground">
                        <li>1. Building Code Compliance</li>
                        <li>2. Roof Covering</li>
                        <li>3. Roof Deck Attachment</li>
                        <li>4. Roof to Wall Attachment</li>
                      </ul>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>5. Roof Geometry</li>
                        <li>6. Secondary Water Resistance</li>
                        <li>7. Opening Protection</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Insurance Savings Potential:</h4>
                    <p className="text-muted-foreground">
                      Wind mitigation reports can help homeowners save up to 45% on their wind/hurricane 
                      insurance premiums. Our platform automatically calculates potential savings based 
                      on inspection findings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <Separator className="mb-16" />

        {/* Account Management */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Account Management</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Settings & Customization</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Upload company logo and branding</li>
                <li>• Set up digital signatures</li>
                <li>• Customize report templates</li>
                <li>• Configure email templates</li>
                <li>• Manage team members (Pro plans)</li>
                <li>• Integration settings</li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">CRM & Contacts</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Add and manage client contacts</li>
                <li>• Track inspection history per contact</li>
                <li>• Set up contact relationships</li>
                <li>• Import/export contact data</li>
                <li>• Basic note taking and follow-ups</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Scheduling & Calendar */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Scheduling & Calendar</h2>
          
          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Calendar Management</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Calendar Features:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Drag-and-drop appointment scheduling</li>
                      <li>• Color-coded appointment types</li>
                      <li>• Time blocking for travel and prep</li>
                      <li>• Recurring appointment support</li>
                      <li>• Mobile-responsive calendar view</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Booking Widget:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Embeddable booking widget for your website</li>
                      <li>• Customizable availability windows</li>
                      <li>• Automatic confirmation emails</li>
                      <li>• Service type selection</li>
                      <li>• Buffer time configuration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Task Management */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Task Management</h2>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                <CheckSquare className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Stay Organized</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Task Features:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Create tasks with due dates and priorities</li>
                      <li>• Link tasks to contacts, appointments, or reports</li>
                      <li>• Track status: pending, in progress, completed</li>
                      <li>• Filter and sort by priority or due date</li>
                      <li>• Quick completion with checkboxes</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Best Practices:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Use tasks for follow-ups and reminders</li>
                      <li>• Assign priorities to manage workload</li>
                      <li>• Convert inspection findings into action items</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Analytics & Reporting */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Analytics & Reporting</h2>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-sky-500/10 rounded-lg flex items-center justify-center shrink-0">
                <BarChart className="w-6 h-6 text-sky-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Business Insights</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Dashboard Metrics:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Total reports, contacts, and appointments</li>
                      <li>• Revenue and average fee calculations</li>
                      <li>• Recent activity timeline</li>
                      <li>• Report distribution by type</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Interactive Charts:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Monthly report and revenue trends</li>
                      <li>• Pie charts for report types</li>
                      <li>• Toggle activity types on timeline</li>
                      <li>• Date range filtering</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <Separator className="mb-16" />

        {/* Security & Compliance */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Security & Compliance</h2>
          
          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Data Security</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Security Measures:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• End-to-end encryption for all data</li>
                      <li>• Secure authentication with 2FA support</li>
                      <li>• Regular automated backups</li>
                      <li>• GDPR and CCPA compliance</li>
                      <li>• Role-based access controls</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Industry Compliance:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• InterNACHI Standards of Practice</li>
                      <li>• Florida OIR wind mitigation requirements</li>
                      <li>• State-specific inspection standards</li>
                      <li>• Insurance industry report formats</li>
                      <li>• Digital signature legal compliance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Support */}
        <section className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our support team is here to help you get the most out of Home Report Pro. 
                Whether you need technical assistance or training, we've got you covered.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Card className="p-4 bg-white">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Response Time</h4>
                  <p className="text-sm text-muted-foreground">Within 24 hours</p>
                </Card>
                
                <Card className="p-4 bg-white">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Training Available</h4>
                  <p className="text-sm text-muted-foreground">1-on-1 sessions</p>
                </Card>
                
                <Card className="p-4 bg-white">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Knowledge Base</h4>
                  <p className="text-sm text-muted-foreground">Constantly updated</p>
                </Card>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Documentation;