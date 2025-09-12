import React from 'react';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { marketingFeatures } from '@/constants/marketingFeatures';
import {
  ArrowRight,
  Check,
  Star,
  Zap,
  FileText,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Headphones,
  Route,
  Car,
  FileSpreadsheet
} from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = React.useState(false);

  const features = marketingFeatures.map((f) => f.title);

  const websiteFeatures = [
    "Custom design tailored to your brand",
    "Responsive and SEO-friendly",
    "Content updates and support"
  ];

  const testimonials = [
    {
      name: "Mike Johnson",
      title: "Licensed Home Inspector",
      quote: "Home Report Pro has transformed my business. The mobile app lets me complete reports on-site, and clients love the professional presentation."
    },
    {
      name: "Sarah Chen",
      title: "Inspection Company Owner",
      quote: "The analytics feature helps me track my business growth, and the pricing is incredibly reasonable for all the features we get."
    },
    {
      name: "David Martinez",
      title: "Independent Inspector",
      quote: "Best investment I've made for my inspection business. The templates are professional and the support team is fantastic."
    }
  ];

  return (
    <>
      <Seo
        title="Pricing - Home Report Pro"
        description="Simple, affordable pricing for professional home inspection software. Get unlimited reports, mobile access, and premium features for $50/month or $45/month when billed annually."
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Simple Pricing
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              One affordable plan with everything you need to run a successful home inspection business, including
              route optimization, mileage logging, and expense reporting with CSV export. Start with 5 free reports,
              then unlimited access for $50/month or $45/month when billed annually.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                <Link to="/auth?mode=signup">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
            {/* Professional Plan */}
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-2 rounded-bl-lg">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl font-bold mb-2">Professional Plan</CardTitle>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className={!isAnnual ? 'font-medium text-primary' : 'text-muted-foreground'}>Monthly</span>
                  <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                  <span className={isAnnual ? 'font-medium text-primary' : 'text-muted-foreground'}>Annual</span>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-primary">{isAnnual ? '$45' : '$50'}</span>
                  <span className="text-muted-foreground text-xl">/month</span>
                </div>
                <p className="text-muted-foreground text-lg">
                  Start with 5 free reports, then unlimited access to route optimization, mileage logging, and
                  expense reporting
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAnnual ? 'Billed annually ($540/year)' : 'Billed monthly'}
                </p>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Features List */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      What's Included:
                    </h3>
                    <ul className="space-y-3">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Benefits */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Key Benefits:
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Unlimited Reports</p>
                          <p className="text-sm text-muted-foreground">Create as many inspection reports as you need</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Client Management</p>
                          <p className="text-sm text-muted-foreground">Organize contacts and track relationships</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Scheduling Tools</p>
                          <p className="text-sm text-muted-foreground">Manage appointments and deadlines</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Business Analytics</p>
                          <p className="text-sm text-muted-foreground">Track performance and growth metrics</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Route className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Route Optimization</p>
                          <p className="text-sm text-muted-foreground">Plan efficient routes between inspections</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Car className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Mileage Logging</p>
                          <p className="text-sm text-muted-foreground">Automatically record mileage for taxes and reimbursement</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Expense Reporting</p>
                          <p className="text-sm text-muted-foreground">Export expenses to CSV for easy accounting</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Secure & Reliable</p>
                          <p className="text-sm text-muted-foreground">Enterprise-grade security and data backup</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Headphones className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Priority Support</p>
                          <p className="text-sm text-muted-foreground">Get help when you need it most</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-8 pt-6 border-t border-muted text-center">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="text-lg px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      <Link to="/auth?mode=signup">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Start Free Trial
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-lg px-8">
                      <Link to="/features">View All Features</Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    No setup fees • Cancel anytime • 30-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Custom Website Option */}
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl font-bold mb-2">Custom Website</CardTitle>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-primary">$999</span>
                  <span className="text-muted-foreground text-xl"> build</span>
                </div>
                <p className="text-muted-foreground text-lg">
                  We'll build a professional website tailored to your brand
                </p>
              </CardHeader>

              <CardContent className="pt-6 flex flex-col items-center">
                <ul className="space-y-3 mb-6 self-stretch">
                  {websiteFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mb-4">$20/month hosting</p>
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/contact">Request a Website</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Inspectors Say</h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of satisfied home inspectors using Home Report Pro
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                  <p className="text-muted-foreground">
                    Yes! You get 5 free reports to try out all our features. After that, it's $50/month, or $45/month when billed annually, for unlimited access.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                  <p className="text-muted-foreground">
                    Absolutely. You can cancel your subscription at any time with no cancellation fees. Your data remains accessible for 3 months after the end of your subscription.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is there a limit on reports?</h3>
                  <p className="text-muted-foreground">
                    You start with 5 free reports, then get unlimited inspection reports, photos, and contacts for $50/month or $45/month when billed annually.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Do you offer customer support?</h3>
                  <p className="text-muted-foreground">
                    Yes, we provide priority email support and comprehensive documentation. Our team typically responds within 24 hours.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is there an AI assistant to help me?</h3>
                  <p className="text-muted-foreground">
                    Absolutely! We include a powerful AI chatbot that can answer any questions about using the platform, creating reports, or getting help with specific features. It's available 24/7 right within the app.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Business?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of home inspectors who have transformed their business with Home Report Pro's
                  route optimization, mileage logging, and expense reporting with CSV export. Get started with 5
                  free reports today!
                </p>
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  <Link to="/auth?mode=signup">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Start Free Trial - No Credit Card Required
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
