import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Wind, ClipboardList, Shield, Flame, ShieldCheck, Factory } from "lucide-react";

const ReportTypeSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="Select Report Type | Home Inspection"
        description="Choose between home inspection and uniform mitigation report types"
        canonical={window.location.origin + "/reports/select-type"}
      />
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Select Report Type</h1>
          <p className="text-muted-foreground">
            Choose the type of inspection report you'd like to create
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Home Inspection</CardTitle>
              <CardDescription>
                Comprehensive property inspection following InterNACHI Standards of Practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Complete structural assessment</li>
                <li>• HVAC, plumbing, and electrical systems</li>
                <li>• Roof, exterior, and interior evaluation</li>
                <li>• Safety and maintenance recommendations</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => navigate("/reports/new/home-inspection")}
              >
                Create Home Inspection Report
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wind className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Uniform Mitigation Verification Inspection</CardTitle>
              <CardDescription>
                Florida uniform mitigation verification inspection for insurance discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Building code compliance verification</li>
                <li>• Roof covering and attachment assessment</li>
                <li>• Opening protection evaluation</li>
                <li>• Secondary water resistance check</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => navigate("/reports/new/wind-mitigation")}
              >
                Create Uniform Mitigation Report
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Florida 4-Point (Citizens)</CardTitle>
              <CardDescription>
                Florida 4-point inspection for underwriting older homes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Roof, electrical, plumbing, HVAC overview</li>
                <li>• Photos and signatures</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => navigate("/reports/new/fl-four-point")}
              >
                Create FL 4-Point Report
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>TX Windstorm Mitigation</CardTitle>
              <CardDescription>
                Texas coastal windstorm mitigation (TWIA eligibility checklist)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• County and exposure information</li>
                <li>• Roof covering and connection details</li>
                <li>• Opening protection verification</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => navigate("/reports/new/tx-windstorm")}
              >
                Create TX Windstorm Report
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Flame className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>CA Wildfire Assessment</CardTitle>
              <CardDescription>
                California wildfire defensible space assessment for underwriting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Structure materials and vents</li>
                <li>• Defensible space zones 0-100 ft</li>
                <li>• Access and utility hazards</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => navigate("/reports/new/ca-wildfire")}
              >
                Create CA Wildfire Report
              </Button>
            </CardContent>
          </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Factory className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Manufactured Home Inspection</CardTitle>
                <CardDescription>
                  Pre-certification checklist for manufactured/mobile homes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Home identifiers and HUD labels</li>
                  <li>• Foundation, tie-down, and skirting review</li>
                  <li>• Utilities and additions evaluation</li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => navigate("/reports/new/manufactured-home")}
                >
                  Create Manufactured Home Report
                </Button>
              </CardContent>
            </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Roof Certification</CardTitle>
              <CardDescription>
                General roof condition certification for underwriting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Roof type and material details</li>
                <li>• Remaining life estimates</li>
                <li>• Photo documentation</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => navigate("/reports/new/roof-certification")}
              >
                Create Roof Certification Report
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </section>
    </>
  );
};

export default ReportTypeSelector;