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
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:scale-[1.02] h-full flex flex-col"
            onClick={() => navigate("/reports/new/home-inspection")}
          >
            <CardHeader className="text-center flex-shrink-0">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Home Inspection</CardTitle>
              <CardDescription className="min-h-[3rem] flex items-center justify-center">
                Comprehensive property inspection following InterNACHI Standards of Practice
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
                <li>• Complete structural assessment</li>
                <li>• HVAC, plumbing, and electrical systems</li>
                <li>• Roof, exterior, and interior evaluation</li>
                <li>• Safety and maintenance recommendations</li>
              </ul>
              <div className="mt-6 pt-4 border-t">
                <div className="w-full bg-primary/5 text-primary font-medium py-3 px-4 rounded-md text-center text-sm transition-colors hover:bg-primary/10">
                  Create Home Inspection Report
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:scale-[1.02] h-full flex flex-col"
            onClick={() => navigate("/reports/new/wind-mitigation")}
          >
            <CardHeader className="text-center flex-shrink-0">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wind className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Uniform Mitigation Verification Inspection</CardTitle>
              <CardDescription className="min-h-[3rem] flex items-center justify-center">
                Florida uniform mitigation verification inspection for insurance discounts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
                <li>• Building code compliance verification</li>
                <li>• Roof covering and attachment assessment</li>
                <li>• Opening protection evaluation</li>
                <li>• Secondary water resistance check</li>
              </ul>
              <div className="mt-6 pt-4 border-t">
                <div className="w-full bg-primary/5 text-primary font-medium py-3 px-4 rounded-md text-center text-sm transition-colors hover:bg-primary/10">
                  Create Uniform Mitigation Report
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:scale-[1.02] h-full flex flex-col"
            onClick={() => navigate("/reports/new/fl-four-point")}
          >
            <CardHeader className="text-center flex-shrink-0">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Florida 4-Point (Citizens)</CardTitle>
              <CardDescription className="min-h-[3rem] flex items-center justify-center">
                Florida 4-point inspection for underwriting older homes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
                <li>• Roof, electrical, plumbing, HVAC overview</li>
                <li>• Photos and signatures</li>
              </ul>
              <div className="mt-6 pt-4 border-t">
                <div className="w-full bg-primary/5 text-primary font-medium py-3 px-4 rounded-md text-center text-sm transition-colors hover:bg-primary/10">
                  Create FL 4-Point Report
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:scale-[1.02] h-full flex flex-col"
            onClick={() => navigate("/reports/new/ca-wildfire")}
          >
            <CardHeader className="text-center flex-shrink-0">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Flame className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Wildfire Assessment</CardTitle>
              <CardDescription className="min-h-[3rem] flex items-center justify-center">
                Wildfire defensible space assessment for underwriting
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
                <li>• Structure materials and vents</li>
                <li>• Defensible space zones 0-100 ft</li>
                <li>• Access and utility hazards</li>
              </ul>
              <div className="mt-6 pt-4 border-t">
                <div className="w-full bg-primary/5 text-primary font-medium py-3 px-4 rounded-md text-center text-sm transition-colors hover:bg-primary/10">
                  Create Wildfire Report
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:scale-[1.02] h-full flex flex-col"
            onClick={() => navigate("/reports/new/manufactured-home")}
          >
            <CardHeader className="text-center flex-shrink-0">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Factory className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Manufactured Home Inspection</CardTitle>
              <CardDescription className="min-h-[3rem] flex items-center justify-center">
                Pre-certification checklist for manufactured/mobile homes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
                <li>• Home identifiers and HUD labels</li>
                <li>• Foundation, tie-down, and skirting review</li>
                <li>• Utilities and additions evaluation</li>
              </ul>
              <div className="mt-6 pt-4 border-t">
                <div className="w-full bg-primary/5 text-primary font-medium py-3 px-4 rounded-md text-center text-sm transition-colors hover:bg-primary/10">
                  Create Manufactured Home Report
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:scale-[1.02] h-full flex flex-col"
            onClick={() => navigate("/reports/new/roof-certification")}
          >
            <CardHeader className="text-center flex-shrink-0">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Roof Certification</CardTitle>
              <CardDescription className="min-h-[3rem] flex items-center justify-center">
                General roof condition certification for underwriting
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
                <li>• Roof type and material details</li>
                <li>• Remaining life estimates</li>
                <li>• Photo documentation</li>
              </ul>
              <div className="mt-6 pt-4 border-t">
                <div className="w-full bg-primary/5 text-primary font-medium py-3 px-4 rounded-md text-center text-sm transition-colors hover:bg-primary/10">
                  Create Roof Certification Report
                </div>
              </div>
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