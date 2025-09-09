import React, { useState } from "react";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookOpen, Smartphone, Camera, FileText, Users, Settings, Wind, Shield, Globe, CheckCircle, CheckSquare, ArrowRight, BarChart, Calendar, Clock, Download, Search, ChevronDown, ChevronRight, Star, AlertCircle, ExternalLink, PlayCircle, Eye, Home, Plus, Edit, Filter, Workflow, Zap, Link, MessageSquare, RefreshCw, Bell, Archive, Trash2, TrendingUp, Code, Database, Smartphone as Mobile, Monitor } from "lucide-react";
const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [openSections, setOpenSections] = useState<string[]>([]);
  const title = "Documentation | Home Report Pro - Complete User Guide";
  const description = "Comprehensive documentation for Home Report Pro. Learn how to use our platform for professional home inspections, wind mitigation reports, and more.";
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]);
  };
  const categories = [{
    id: "getting-started",
    label: "Getting Started",
    icon: Star
  }, {
    id: "contacts",
    label: "Contact Management",
    icon: Users
  }, {
    id: "reports",
    label: "Report Creation",
    icon: FileText
  }, {
    id: "calendar",
    label: "Calendar & Booking",
    icon: Calendar
  }, {
    id: "integrations",
    label: "Integrations",
    icon: Link
  }, {
    id: "settings",
    label: "Settings",
    icon: Settings
  }, {
    id: "analytics",
    label: "Analytics",
    icon: BarChart
  }, {
    id: "advanced",
    label: "Advanced Features",
    icon: Zap
  }, {
    id: "troubleshooting",
    label: "Troubleshooting",
    icon: AlertCircle
  }];
  return <div className="min-h-screen bg-background">
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
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mt-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input type="text" placeholder="Search documentation..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold mb-4">Documentation</h3>
              <nav className="space-y-2">
                {categories.map(category => {
                const Icon = category.icon;
                return <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeCategory === category.id ? "bg-primary text-white" : "hover:bg-muted"}`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{category.label}</span>
                    </button>;
              })}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              {/* Getting Started */}
              <TabsContent value="getting-started" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Star className="w-8 h-8 text-primary" />
                    Getting Started
                  </h2>
                  
                  {/* Quick Start Cards */}
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

                  {/* Detailed Setup Guide */}
                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Complete Setup Guide</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Account Registration & Profile Setup</span>
                        <Badge className="ml-auto">Essential</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Step 1: Sign Up</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Visit the registration page and enter your email address</li>
                            <li>Create a strong password (minimum 8 characters)</li>
                            <li>Verify your email address via the confirmation link</li>
                            <li>Complete the initial profile setup form</li>
                          </ul>
                          
                          <h4 className="font-semibold">Step 2: Inspector Profile</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Upload your professional headshot or company logo</li>
                            <li>Enter your certification numbers (InterNACHI, state licenses)</li>
                            <li>Add your business information (name, address, phone)</li>
                            <li>Set up your digital signature</li>
                            <li>Configure your email signature template</li>
                          </ul>
                          
                          <h4 className="font-semibold">Step 3: Branding & Customization</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Upload your company logo (PNG or SVG recommended)</li>
                            <li>Choose your brand colors for reports</li>
                            <li>Customize report header and footer text</li>
                            <li>Set up default disclaimers and terms</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">PWA Installation Guide</span>
                        <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Mobile className="w-4 h-4" />
                              Mobile Installation
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <strong>Android (Chrome):</strong>
                                <ol className="list-decimal pl-6 mt-2 text-muted-foreground">
                                  <li>Open Chrome and navigate to the app</li>
                                  <li>Tap the "Add to Home Screen" banner</li>
                                  <li>Or tap the menu (⋮) → "Add to Home screen"</li>
                                  <li>Confirm installation</li>
                                </ol>
                              </div>
                              
                              <div>
                                <strong>iOS (Safari):</strong>
                                <ol className="list-decimal pl-6 mt-2 text-muted-foreground">
                                  <li>Open Safari and navigate to the app</li>
                                  <li>Tap the Share button (□↗)</li>
                                  <li>Select "Add to Home Screen"</li>
                                  <li>Customize the name and tap "Add"</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Monitor className="w-4 h-4" />
                              Desktop Installation
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <strong>Chrome/Edge:</strong>
                                <ol className="list-decimal pl-6 mt-2 text-muted-foreground">
                                  <li>Look for the install icon in the address bar</li>
                                  <li>Click the install button</li>
                                  <li>Confirm installation in the dialog</li>
                                  <li>App will open in its own window</li>
                                </ol>
                              </div>
                              
                              <div>
                                <strong>Benefits of PWA:</strong>
                                <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                  <li>Offline functionality for field work</li>
                                  <li>Native app-like experience</li>
                                  <li>Automatic updates</li>
                                  <li>No app store required</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Creating Your First Report</span>
                        <Badge variant="outline" className="ml-auto">15 min tutorial</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Before You Start</h4>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>Ensure your profile is complete with signature</li>
                              <li>Have your client's contact information ready</li>
                              <li>Know the property address and inspection type needed</li>
                              <li>Consider downloading the mobile app for field use</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Step-by-Step Process</h4>
                            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                              <li><strong>Navigate to Reports:</strong> Click "Reports" in the main navigation</li>
                              <li><strong>Create New:</strong> Click "New Report" button</li>
                              <li><strong>Select Type:</strong> Choose from Home Inspection, Wind Mitigation, 4-Point, etc.</li>
                              <li><strong>Property Details:</strong> Enter address, client info, inspection date</li>
                              <li><strong>Report Sections:</strong> Work through each section systematically</li>
                              <li><strong>Add Observations:</strong> Use templates or custom text for findings</li>
                              <li><strong>Attach Photos:</strong> Take photos and annotate as needed</li>
                              <li><strong>Review:</strong> Check all sections for completeness</li>
                              <li><strong>Generate PDF:</strong> Create final report for delivery</li>
                            </ol>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Pro Tip
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Save your report as a draft frequently. The system auto-saves, but manual saves ensure 
                              your work is protected, especially when working offline in the field.
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </TabsContent>

              {/* Contact Management */}
              <TabsContent value="contacts" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    Contact Management
                  </h2>

                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Complete CRM Guide</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Adding New Contacts</span>
                        <Badge className="ml-auto">Essential</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Quick Add Method</h4>
                          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li>Navigate to <strong>Contacts</strong> in the main menu</li>
                            <li>Click the <strong>New Contact</strong> button</li>
                            <li>Fill in the contact form with essential information:
                              <ul className="list-disc pl-6 mt-2">
                                <li>Name (First and Last)</li>
                                <li>Email address (primary contact method)</li>
                                <li>Phone number</li>
                                <li>Contact type (Client, Agent, Contractor, etc.)</li>
                              </ul>
                            </li>
                            <li>Add additional details as needed (address, company, notes)</li>
                            <li>Click <strong>Save Contact</strong></li>
                          </ol>

                          
                          
                          
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Contact Organization & Filtering</span>
                        <Badge variant="secondary" className="ml-auto">Intermediate</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Contact Types & Categories</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Clients:</strong> Property buyers, sellers, homeowners</li>
                            <li><strong>Real Estate Agents:</strong> Listing agents, buyer's agents</li>
                            <li><strong>Contractors:</strong> Repair specialists, trades people</li>
                            <li><strong>Professionals:</strong> Appraisers, attorneys, lenders</li>
                            <li><strong>Vendors:</strong> Equipment suppliers, lab services</li>
                          </ul>

                          <h4 className="font-semibold">Search & Filter Features</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Search by name, email, phone, or company</li>
                            <li>Filter by contact type or category</li>
                            <li>Sort by last activity, name, or creation date</li>
                            <li>Use tags for custom organization</li>
                            <li>Create smart groups based on criteria</li>
                          </ul>

                          <h4 className="font-semibold">Contact Relationships</h4>
                          <p className="text-muted-foreground">Link related contacts:</p>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Agent-Client relationships</li>
                            <li>Vendor partnerships</li>
                            <li>Referral sources</li>
                            <li>Team member connections</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Contact History & Notes</span>
                        <Badge variant="outline" className="ml-auto">Best Practices</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Activity Tracking</h4>
                          <p className="text-muted-foreground">The system automatically tracks:</p>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Reports created for this contact</li>
                            <li>Appointments scheduled</li>
                            <li>Email communications sent</li>
                            <li>Last activity date</li>
                          </ul>

                          <h4 className="font-semibold">Manual Notes & Follow-ups</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Add detailed notes about preferences, special requirements</li>
                            <li>Set follow-up reminders for future contact</li>
                            <li>Track referral sources and conversion rates</li>
                            <li>Document communication preferences</li>
                          </ul>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Best Practice
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Always add notes after client interactions. Include preferred communication 
                              times, special property concerns, and any follow-up commitments you've made.
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </TabsContent>

              {/* Report Creation */}
              <TabsContent value="reports" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    Report Creation
                  </h2>

                  {/* Report Types Overview */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                      <Home className="w-8 h-8 text-blue-600 mb-4" />
                      <h3 className="font-semibold mb-2">Home Inspections</h3>
                      <p className="text-sm text-muted-foreground mb-3">InterNACHI SOP compliant standard home inspections</p>
                      <Badge>Most Popular</Badge>
                    </Card>
                    
                    <Card className="p-6">
                      <Wind className="w-8 h-8 text-green-600 mb-4" />
                      <h3 className="font-semibold mb-2">Wind Mitigation</h3>
                      <p className="text-sm text-muted-foreground mb-3">Florida OIR-B1-1802 wind mitigation inspections</p>
                      <Badge variant="secondary">Florida</Badge>
                    </Card>
                    
                    <Card className="p-6">
                      <Shield className="w-8 h-8 text-purple-600 mb-4" />
                      <h3 className="font-semibold mb-2">4-Point Inspection</h3>
                      <p className="text-sm text-muted-foreground mb-3">Florida insurance 4-point inspections</p>
                      <Badge variant="secondary">Insurance</Badge>
                    </Card>
                  </div>

                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Detailed Report Creation Guide</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Starting a New Report</span>
                        <Badge className="ml-auto">Essential</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Report Setup Process</h4>
                          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Choose Report Type:</strong> Select from available templates</li>
                            <li><strong>Property Information:</strong>
                              <ul className="list-disc pl-6 mt-2">
                                <li>Complete property address</li>
                                <li>Year built, square footage (if known)</li>
                                <li>Property type (single family, condo, etc.)</li>
                                <li>Special circumstances or limitations</li>
                              </ul>
                            </li>
                            <li><strong>Client Details:</strong>
                              <ul className="list-disc pl-6 mt-2">
                                <li>Primary client contact information</li>
                                <li>Real estate agent (if applicable)</li>
                                <li>Report delivery preferences</li>
                              </ul>
                            </li>
                            <li><strong>Inspection Schedule:</strong>
                              <ul className="list-disc pl-6 mt-2">
                                <li>Inspection date and time</li>
                                <li>Estimated duration</li>
                                <li>Access instructions</li>
                              </ul>
                            </li>
                          </ol>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Working with Report Sections</span>
                        <Badge variant="secondary" className="ml-auto">Core Process</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Standard Inspection Sections</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>Exterior</li>
                              <li>Roof</li>
                              <li>Structural Components</li>
                              <li>Electrical System</li>
                              <li>Heating System</li>
                            </ul>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>Cooling System</li>
                              <li>Plumbing System</li>
                              <li>Interior</li>
                              <li>Insulation & Ventilation</li>
                              <li>Fireplaces</li>
                            </ul>
                          </div>

                          <h4 className="font-semibold">Section Workflow</h4>
                          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Review Section Guidelines:</strong> Each section includes InterNACHI SOP requirements</li>
                            <li><strong>Conduct Inspection:</strong> Follow systematic approach through property</li>
                            <li><strong>Document Findings:</strong>
                              <ul className="list-disc pl-6 mt-2">
                                <li>Use pre-written defect templates</li>
                                <li>Add custom observations</li>
                                <li>Include recommendations</li>
                              </ul>
                            </li>
                            <li><strong>Attach Evidence:</strong> Photos, videos, or audio notes</li>
                            <li><strong>Mark Complete:</strong> Indicate section is finished</li>
                          </ol>

                          <h4 className="font-semibold">Using Defect Templates</h4>
                          <p className="text-muted-foreground">Speed up report writing with pre-written narratives:</p>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Search templates by keyword</li>
                            <li>Customize template text as needed</li>
                            <li>Add location-specific details</li>
                            <li>Combine multiple templates if necessary</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Photo Documentation & Annotation</span>
                        <Badge variant="outline" className="ml-auto">Advanced</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Photo Capture Best Practices</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Lighting:</strong> Use natural light when possible, avoid flash for reflective surfaces</li>
                            <li><strong>Composition:</strong> Include context around the defect, not just close-ups</li>
                            <li><strong>Multiple Angles:</strong> Take overview and detail shots of important issues</li>
                            <li><strong>Sequence:</strong> Organize photos logically by area or severity</li>
                          </ul>

                          <h4 className="font-semibold">Annotation Tools</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <strong>Drawing Tools:</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Arrows to point to defects</li>
                                <li>Circles to highlight areas</li>
                                <li>Lines for measurements</li>
                                <li>Freehand drawing</li>
                              </ul>
                            </div>
                            <div>
                              <strong>Text & Labels:</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Add descriptive labels</li>
                                <li>Include measurements</li>
                                <li>Note safety concerns</li>
                                <li>Reference code violations</li>
                              </ul>
                            </div>
                          </div>

                          <h4 className="font-semibold">Organization & Linking</h4>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Link photos to specific report observations</li>
                            <li>Use descriptive file names and captions</li>
                            <li>Group related photos together</li>
                            <li>Maintain consistent photo quality throughout</li>
                          </ul>

                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Camera className="w-4 h-4" />
                              Photography Tip
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Take more photos than you think you need. It's easier to delete extras later than 
                              to return to the property for missing documentation.
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </TabsContent>

              {/* Calendar & Booking */}
              <TabsContent value="calendar" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary" />
                    Calendar & Booking
                  </h2>

                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Complete Scheduling Guide</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Calendar Setup & Configuration</span>
                        <Badge className="ml-auto">Essential</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Initial Calendar Setup</h4>
                          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li>Navigate to <strong>Calendar</strong> in the main menu</li>
                            <li>Click <strong>Calendar Settings</strong> to configure:
                              <ul className="list-disc pl-6 mt-2">
                                <li>Working hours and days</li>
                                <li>Time zone settings</li>
                                <li>Default appointment duration</li>
                                <li>Buffer time between appointments</li>
                              </ul>
                            </li>
                            <li>Set up appointment types with different durations:
                              <ul className="list-disc pl-6 mt-2">
                                <li>Standard Home Inspection (3-4 hours)</li>
                                <li>Condo Inspection (2-3 hours)</li>
                                <li>Wind Mitigation (1-2 hours)</li>
                                <li>4-Point Inspection (1-2 hours)</li>
                              </ul>
                            </li>
                            <li>Configure travel time calculations</li>
                          </ol>

                          <h4 className="font-semibold">Booking Availability</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Set recurring availability patterns</li>
                            <li>Block out personal time and holidays</li>
                            <li>Define minimum advance booking time</li>
                            <li>Set maximum booking window</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Creating & Managing Appointments</span>
                        <Badge variant="secondary" className="ml-auto">Daily Use</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Manual Appointment Creation</h4>
                          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li>Click on desired date/time in calendar</li>
                            <li>Fill out appointment details:
                              <ul className="list-disc pl-6 mt-2">
                                <li>Appointment type and duration</li>
                                <li>Client information (or select existing contact)</li>
                                <li>Property address</li>
                                <li>Special instructions or access codes</li>
                              </ul>
                            </li>
                            <li>Set appointment status (Confirmed, Tentative, etc.)</li>
                            <li>Add internal notes for preparation</li>
                            <li>Save and optionally send confirmation</li>
                          </ol>

                          <h4 className="font-semibold">Drag & Drop Scheduling</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Drag existing appointments to new time slots</li>
                            <li>Extend or shorten appointment duration by dragging edges</li>
                            <li>Copy appointments to create recurring schedules</li>
                            <li>Batch move multiple appointments</li>
                          </ul>

                          <h4 className="font-semibold">Appointment Modifications</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Reschedule by dragging to new time</li>
                            <li>Update client contact information</li>
                            <li>Modify appointment notes and instructions</li>
                            <li>Change appointment type or duration</li>
                            <li>Cancel with automatic client notification</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Client Booking Widget</span>
                        <Badge variant="outline" className="ml-auto">Advanced</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Widget Setup</h4>
                          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li>Go to <strong>Settings → Booking</strong></li>
                            <li>Configure widget appearance:
                              <ul className="list-disc pl-6 mt-2">
                                <li>Choose color scheme to match your brand</li>
                                <li>Upload company logo</li>
                                <li>Customize welcome message</li>
                                <li>Select available languages</li>
                              </ul>
                            </li>
                            <li>Set booking rules:
                              <ul className="list-disc pl-6 mt-2">
                                <li>Which service types to offer</li>
                                <li>Minimum advance notice required</li>
                                <li>Maximum booking window</li>
                                <li>Required client information fields</li>
                              </ul>
                            </li>
                            <li>Generate embed code for your website</li>
                          </ol>

                          <h4 className="font-semibold">Website Integration</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Embed directly in website pages</li>
                            <li>Add as popup triggered by button click</li>
                            <li>Create standalone booking page</li>
                            <li>Include in email signatures with booking link</li>
                          </ul>

                          <h4 className="font-semibold">Client Booking Experience</h4>
                          <p className="text-muted-foreground">Clients can:</p>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>View real-time availability</li>
                            <li>Select inspection type and duration</li>
                            <li>Provide property and contact details</li>
                            <li>Receive immediate confirmation</li>
                            <li>Get calendar invite and reminder emails</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </TabsContent>

              {/* Integrations */}
              <TabsContent value="integrations" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Link className="w-8 h-8 text-primary" />
                    Integrations
                  </h2>

                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Complete Integration Setup</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Calendar Integrations</span>
                        <Badge className="ml-auto">Popular</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Available Calendar Connections</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <strong>Google Calendar</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Two-way sync of appointments</li>
                                <li>Automatic conflict detection</li>
                                <li>Mobile and web calendar access</li>
                                <li>Shared calendar support</li>
                              </ul>
                            </div>
                            <div>
                              <strong>Outlook Calendar</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Office 365 and Outlook.com support</li>
                                <li>Teams meeting integration</li>
                                <li>Exchange server compatibility</li>
                                <li>Corporate calendar policies</li>
                              </ul>
                            </div>
                          </div>

                          <h4 className="font-semibold">Setup Process</h4>
                          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li>Navigate to <strong>Settings → Integrations</strong></li>
                            <li>Click <strong>Connect</strong> next to your preferred calendar</li>
                            <li>Authorize Home Report Pro to access your calendar</li>
                            <li>Configure sync settings:
                              <ul className="list-disc pl-6 mt-2">
                                <li>Which calendars to sync</li>
                                <li>Sync direction (one-way or two-way)</li>
                                <li>Sync frequency</li>
                                <li>Event details to include</li>
                              </ul>
                            </li>
                            <li>Test sync with a sample appointment</li>
                          </ol>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4" />
                              Sync Troubleshooting
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              If sync stops working, try disconnecting and reconnecting the integration. 
                              Check that calendar permissions haven't changed in your Google or Microsoft account.
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Accounting Software Integration</span>
                        <Badge variant="secondary" className="ml-auto">Business</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Supported Accounting Platforms</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <strong>QuickBooks</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground text-sm">
                                <li>Online and Desktop versions</li>
                                <li>Automatic invoice creation</li>
                                <li>Customer sync</li>
                                <li>Payment tracking</li>
                              </ul>
                            </div>
                            <div>
                              <strong>Xero</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground text-sm">
                                <li>Cloud-based accounting</li>
                                <li>Invoice automation</li>
                                <li>Bank feed integration</li>
                                <li>Financial reporting</li>
                              </ul>
                            </div>
                            <div>
                              <strong>FreshBooks</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground text-sm">
                                <li>Service-based business focus</li>
                                <li>Time tracking integration</li>
                                <li>Project-based invoicing</li>
                                <li>Expense management</li>
                              </ul>
                            </div>
                          </div>

                          <h4 className="font-semibold">Integration Benefits</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Automatic Invoicing:</strong> Generate invoices when reports are completed</li>
                            <li><strong>Customer Sync:</strong> Keep contact information synchronized</li>
                            <li><strong>Payment Tracking:</strong> Monitor payment status and overdue accounts</li>
                            <li><strong>Financial Reporting:</strong> Better business insights and tax preparation</li>
                            <li><strong>Time Savings:</strong> Eliminate double data entry</li>
                          </ul>

                          <h4 className="font-semibold">Setup Requirements</h4>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Active subscription to supported accounting software</li>
                            <li>Admin access to accounting platform</li>
                            <li>Chart of accounts configured for inspection services</li>
                            <li>Tax settings and rates properly configured</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Email & Communication Tools</span>
                        <Badge variant="outline" className="ml-auto">Professional</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Email Platform Integration</h4>
                          <p className="text-muted-foreground">Connect your business email for seamless communication:</p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Gmail:</strong> Send reports and confirmations from your Gmail account</li>
                            <li><strong>Outlook:</strong> Microsoft 365 and Exchange integration</li>
                            <li><strong>Custom SMTP:</strong> Use any email provider with SMTP settings</li>
                          </ul>

                          <h4 className="font-semibold">Automated Email Features</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Appointment confirmations and reminders</li>
                            <li>Report delivery notifications</li>
                            <li>Follow-up email sequences</li>
                            <li>Custom email templates with merge fields</li>
                            <li>Branded email signatures</li>
                          </ul>

                          <h4 className="font-semibold">SMS & Text Messaging</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Appointment reminders via SMS</li>
                            <li>Report completion notifications</li>
                            <li>Emergency contact capabilities</li>
                            <li>Two-way messaging with clients</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings */}
              <TabsContent value="settings" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" />
                    Settings & Configuration
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card className="p-6">
                      <Edit className="w-8 h-8 text-blue-600 mb-4" />
                      <h3 className="font-semibold mb-2">Account Settings</h3>
                      <p className="text-sm text-muted-foreground">Profile, branding, and personal preferences</p>
                    </Card>
                    
                    <Card className="p-6">
                      <Users className="w-8 h-8 text-green-600 mb-4" />
                      <h3 className="font-semibold mb-2">Team Management</h3>
                      <p className="text-sm text-muted-foreground">Add team members and manage permissions</p>
                    </Card>
                  </div>

                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Complete Settings Guide</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Profile & Business Information</span>
                        <Badge className="ml-auto">Essential</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Personal Profile</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Name & Contact:</strong> Full name, email, phone number</li>
                            <li><strong>Professional Photo:</strong> Headshot for reports and marketing</li>
                            <li><strong>Certifications:</strong> InterNACHI, state licenses, other credentials</li>
                            <li><strong>Bio & Experience:</strong> Professional background and specialties</li>
                          </ul>

                          <h4 className="font-semibold">Business Information</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Company Details:</strong> Business name, address, phone</li>
                            <li><strong>License Numbers:</strong> Business license, insurance info</li>
                            <li><strong>Service Areas:</strong> Geographic coverage areas</li>
                            <li><strong>Specializations:</strong> Types of inspections offered</li>
                          </ul>

                          <h4 className="font-semibold">Legal & Compliance</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Terms of service and inspection agreements</li>
                            <li>State-specific disclaimer requirements</li>
                            <li>Insurance and bonding information</li>
                            <li>Professional association memberships</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Report Customization</span>
                        <Badge variant="secondary" className="ml-auto">Branding</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Visual Branding</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Company Logo:</strong> Upload high-resolution logo for reports</li>
                            <li><strong>Color Scheme:</strong> Primary and secondary brand colors</li>
                            <li><strong>Font Selection:</strong> Professional fonts for reports</li>
                            <li><strong>Cover Page Design:</strong> Multiple template options</li>
                          </ul>

                          <h4 className="font-semibold">Report Content</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Header/Footer:</strong> Custom text for every page</li>
                            <li><strong>Signature Block:</strong> Digital signature placement</li>
                            <li><strong>Disclaimers:</strong> Legal text and limitations</li>
                            <li><strong>Contact Information:</strong> How clients can reach you</li>
                          </ul>

                          <h4 className="font-semibold">Template Management</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Create custom defect narrative templates</li>
                            <li>Organize templates by inspection type</li>
                            <li>Import/export template libraries</li>
                            <li>Share templates with team members</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Notification & Communication Settings</span>
                        <Badge variant="outline" className="ml-auto">Workflow</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Email Notifications</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>New appointment bookings</li>
                            <li>Appointment changes or cancellations</li>
                            <li>Report completion confirmations</li>
                            <li>Payment and invoice notifications</li>
                            <li>System updates and maintenance alerts</li>
                          </ul>

                          <h4 className="font-semibold">Mobile Push Notifications</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Appointment reminders (30 min, 1 hour, etc.)</li>
                            <li>Client message notifications</li>
                            <li>Emergency system alerts</li>
                            <li>Sync completion confirmations</li>
                          </ul>

                          <h4 className="font-semibold">Client Communication Templates</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Appointment confirmation emails</li>
                            <li>Pre-inspection preparation instructions</li>
                            <li>Report delivery messages</li>
                            <li>Follow-up and feedback requests</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <BarChart className="w-8 h-8 text-primary" />
                    Analytics & Reporting
                  </h2>

                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Business Intelligence Dashboard</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Key Performance Metrics</span>
                        <Badge className="ml-auto">Overview</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Revenue Tracking</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Monthly and yearly revenue trends</li>
                            <li>Revenue by inspection type</li>
                            <li>Average inspection value</li>
                            <li>Payment collection rates</li>
                            <li>Outstanding invoice tracking</li>
                          </ul>

                          <h4 className="font-semibold">Productivity Metrics</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Inspections completed per month</li>
                            <li>Average inspection duration</li>
                            <li>Report turnaround time</li>
                            <li>Booking-to-completion ratio</li>
                            <li>Cancellation and no-show rates</li>
                          </ul>

                          <h4 className="font-semibold">Client Analytics</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>New vs. repeat client ratios</li>
                            <li>Client acquisition sources</li>
                            <li>Geographic distribution of clients</li>
                            <li>Client satisfaction trends</li>
                            <li>Referral tracking and effectiveness</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Financial Reports</span>
                        <Badge variant="secondary" className="ml-auto">Business</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Available Reports</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <strong>Income Reports</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Monthly income summaries</li>
                                <li>Year-over-year comparisons</li>
                                <li>Service type breakdowns</li>
                                <li>Seasonal trend analysis</li>
                              </ul>
                            </div>
                            <div>
                              <strong>Expense Tracking</strong>
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Business expense categories</li>
                                <li>Vehicle and travel costs</li>
                                <li>Equipment and tool expenses</li>
                                <li>Marketing and advertising costs</li>
                              </ul>
                            </div>
                          </div>

                          <h4 className="font-semibold">Tax Preparation</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Quarterly and annual tax summaries</li>
                            <li>Deductible expense reporting</li>
                            <li>1099 contractor payment tracking</li>
                            <li>Mileage and vehicle expense logs</li>
                          </ul>

                          <h4 className="font-semibold">Export Options</h4>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>PDF reports for printing or sharing</li>
                            <li>CSV data for spreadsheet analysis</li>
                            <li>QuickBooks and Xero integration</li>
                            <li>Custom date range selections</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Operational Insights</span>
                        <Badge variant="outline" className="ml-auto">Growth</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Scheduling Optimization</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Peak booking days and times</li>
                            <li>Travel time and route efficiency</li>
                            <li>Optimal scheduling patterns</li>
                            <li>Capacity utilization rates</li>
                          </ul>

                          <h4 className="font-semibold">Service Performance</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Most popular inspection types</li>
                            <li>Service pricing optimization</li>
                            <li>Seasonal demand patterns</li>
                            <li>Geographic service area analysis</li>
                          </ul>

                          <h4 className="font-semibold">Quality Metrics</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Average defects found per inspection</li>
                            <li>Report complexity scores</li>
                            <li>Photo documentation rates</li>
                            <li>Client feedback and ratings</li>
                          </ul>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Growth Insights
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Use these analytics to identify your most profitable services and optimal 
                              scheduling patterns to grow your business efficiently.
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Features */}
              <TabsContent value="advanced" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-primary" />
                    Advanced Features
                  </h2>

                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Power User Features</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">API & Integrations</span>
                        <Badge className="ml-auto">Developer</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">API Access</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>RESTful API for custom integrations</li>
                            <li>Webhook notifications for real-time updates</li>
                            <li>Authentication via API keys</li>
                            <li>Rate limiting and usage monitoring</li>
                          </ul>

                          <h4 className="font-semibold">Custom Development</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Custom report formats and layouts</li>
                            <li>Specialized inspection checklists</li>
                            <li>Third-party tool integrations</li>
                            <li>White-label customization options</li>
                          </ul>

                          <h4 className="font-semibold">Data Export</h4>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Complete data export for migrations</li>
                            <li>Scheduled automated backups</li>
                            <li>GDPR compliance tools</li>
                            <li>Data retention policy management</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Automation & Workflows</span>
                        <Badge variant="secondary" className="ml-auto">Efficiency</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Automated Workflows</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Trigger actions based on appointment status</li>
                            <li>Automated follow-up email sequences</li>
                            <li>Invoice generation upon report completion</li>
                            <li>Calendar sync and conflict resolution</li>
                          </ul>

                          <h4 className="font-semibold">Smart Templates</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>AI-powered defect suggestions</li>
                            <li>Context-aware template recommendations</li>
                            <li>Learning from your inspection patterns</li>
                            <li>Auto-completion of common findings</li>
                          </ul>

                          <h4 className="font-semibold">Batch Operations</h4>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Bulk email sending to clients</li>
                            <li>Mass invoice generation</li>
                            <li>Batch report processing</li>
                            <li>Group appointment scheduling</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Security & Compliance</span>
                        <Badge variant="outline" className="ml-auto">Enterprise</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Data Security</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>End-to-end encryption for all data</li>
                            <li>SOC 2 Type II compliance</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Multi-factor authentication support</li>
                          </ul>

                          <h4 className="font-semibold">Access Control</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Role-based permissions for team members</li>
                            <li>Client data access restrictions</li>
                            <li>Audit logs for all user actions</li>
                            <li>Session management and timeouts</li>
                          </ul>

                          <h4 className="font-semibold">Compliance Features</h4>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>GDPR and CCPA privacy compliance</li>
                            <li>HIPAA compliance for healthcare facilities</li>
                            <li>Industry-specific regulatory requirements</li>
                            <li>Data retention and deletion policies</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </TabsContent>

              {/* Troubleshooting */}
              <TabsContent value="troubleshooting" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-primary" />
                    Troubleshooting
                  </h2>

                  <Card className="p-8">
                    <h3 className="text-2xl font-semibold mb-6">Common Issues & Solutions</h3>
                    
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Sync & Connectivity Issues</span>
                        <Badge className="ml-auto" variant="destructive">Critical</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Offline Sync Problems</h4>
                          <div className="space-y-3">
                            <div>
                              <strong>Issue:</strong> Data not syncing when back online
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Check internet connection strength</li>
                                <li>Force close and reopen the app</li>
                                <li>Clear app cache (Android) or refresh page (Web)</li>
                                <li>Manually trigger sync from settings menu</li>
                              </ul>
                            </div>
                            
                            <div>
                              <strong>Issue:</strong> Photos not uploading
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Ensure sufficient storage space on device</li>
                                <li>Check file size limits (max 10MB per image)</li>
                                <li>Verify image format (JPG, PNG supported)</li>
                                <li>Try uploading one image at a time</li>
                              </ul>
                            </div>
                          </div>

                          <h4 className="font-semibold">Calendar Integration Issues</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Disconnect and reconnect calendar integration</li>
                            <li>Check calendar permissions in Google/Microsoft account</li>
                            <li>Verify time zone settings match in both systems</li>
                            <li>Clear calendar cache and force refresh</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Report Generation Problems</span>
                        <Badge variant="secondary" className="ml-auto">Common</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">PDF Generation Failures</h4>
                          <div className="space-y-3">
                            <div>
                              <strong>Issue:</strong> PDF not generating or corrupted
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Check that all required fields are completed</li>
                                <li>Ensure images are properly uploaded and not corrupted</li>
                                <li>Try generating smaller sections first</li>
                                <li>Clear browser cache and try again</li>
                              </ul>
                            </div>
                            
                            <div>
                              <strong>Issue:</strong> Images missing from PDF
                              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                                <li>Verify all images have finished uploading</li>
                                <li>Check image file sizes (reduce if over 5MB)</li>
                                <li>Ensure images are linked to observations</li>
                                <li>Wait for sync completion before generating PDF</li>
                              </ul>
                            </div>
                          </div>

                          <h4 className="font-semibold">Formatting Issues</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Check report template settings for layout problems</li>
                            <li>Verify company logo dimensions (recommended: 300x100px)</li>
                            <li>Review text length in observations (very long text may cause issues)</li>
                            <li>Test with a simple report first to isolate problems</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-4 hover:bg-muted rounded-lg">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold">Performance & Speed</span>
                        <Badge variant="outline" className="ml-auto">Optimization</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">App Running Slowly</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Close other apps to free up device memory</li>
                            <li>Clear app cache and temporary files</li>
                            <li>Ensure device has adequate storage space ({'>'}1GB free)</li>
                            <li>Update to latest app version</li>
                            <li>Restart device if problems persist</li>
                          </ul>

                          <h4 className="font-semibold">Large File Handling</h4>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Compress images before uploading (use built-in compression)</li>
                            <li>Upload files in smaller batches</li>
                            <li>Use Wi-Fi instead of cellular for large uploads</li>
                            <li>Schedule sync during off-peak hours</li>
                          </ul>

                          <h4 className="font-semibold">Browser Compatibility</h4>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Use supported browsers: Chrome, Firefox, Safari, Edge</li>
                            <li>Keep browser updated to latest version</li>
                            <li>Disable browser extensions that may interfere</li>
                            <li>Enable JavaScript and cookies</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Getting Help Section */}
                    <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Still Need Help?
                      </h4>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          If you can't find a solution here, our support team is ready to help:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                          <li><strong>Email Support:</strong> support@homereportpro.com</li>
                          <li><strong>Live Chat:</strong> Available during business hours</li>
                          <li><strong>Phone Support:</strong> 1-800-HRP-HELP (Pro plans)</li>
                          <li><strong>Help Center:</strong> Additional articles and video tutorials</li>
                        </ul>
                        <p className="text-sm text-muted-foreground">
                          When contacting support, please include your account email, 
                          the specific error message (if any), and steps you&apos;ve already tried.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>;
};
export default Documentation;