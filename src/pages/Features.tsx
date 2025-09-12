import React from 'react';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { marketingFeatures, type MarketingFeature } from '@/constants/marketingFeatures';
import featureColorMap from '@/constants/featureColors';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';

type Feature = MarketingFeature & { color: string };

const Features = () => {
  const features: Feature[] = marketingFeatures
    .filter((feature) =>
      [
        'Professional Reports',
        'Photo & Media Management',
        'Mobile-First Design',
        'Cloud Synchronization',
        'Contact & Account Management',
        'Scheduling & Tasks',
        'Analytics & Insights',
        'Security & Compliance',
        'Customization Options',
        'Route Optimization',
        'Mileage Tracking',
        'Expense Reporting'
      ].includes(feature.title)
    )
    .map((feature) => ({ ...feature, color: featureColorMap[feature.title] }));

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
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
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
                <Link to="/pricing">View Pricing</Link>
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
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="p-8 rounded-3xl border bg-card backdrop-blur-sm hover:shadow-lg transition"
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`w-14 h-14 mb-6 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white`}
                    >
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-xl mb-4 text-card-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2 mt-auto">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                          <span className="text-sm text-muted-foreground">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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