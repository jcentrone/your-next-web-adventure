import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/Seo";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import {
  FileText,
  ArrowRight,
  Home,
  Wind,
  Zap,
  TreePine,
  Building,
  Factory,
  Shield,
  CheckCircle,
} from "lucide-react";
import type { Report } from "@/lib/reportSchemas";

const REPORT_TYPE_ICONS: Record<Report["reportType"], React.ComponentType<any>> = {
  home_inspection: Home,
  wind_mitigation: Wind,
  fl_wind_mitigation_oir_b1_1802: Wind,
  fl_four_point_citizens: Zap,
  tx_coastal_windstorm_mitigation: Shield,
  ca_wildfire_defensible_space: TreePine,
  roof_certification_nationwide: Building,
  manufactured_home_insurance_prep: Factory,
};

const REPORT_TYPE_DESCRIPTIONS: Record<Report["reportType"], string> = {
  home_inspection: "Complete inspection of residential property following InterNACHI standards",
  wind_mitigation: "Uniform wind mitigation inspection for insurance discounts",
  fl_wind_mitigation_oir_b1_1802: "Florida OIR-B1-1802 wind mitigation form inspection",
  fl_four_point_citizens: "Four-point inspection for Florida insurance requirements",
  tx_coastal_windstorm_mitigation: "Texas windstorm mitigation inspection certification",
  ca_wildfire_defensible_space: "California wildfire defensible space assessment",
  roof_certification_nationwide: "Professional roof condition certification",
  manufactured_home_insurance_prep: "Specialized inspection for manufactured homes",
};

const ROUTE_MAP: Record<Report["reportType"], string> = {
  home_inspection: "/reports/new/home-inspection",
  wind_mitigation: "/reports/new/wind-mitigation",
  fl_wind_mitigation_oir_b1_1802: "/reports/new/wind-mitigation",
  fl_four_point_citizens: "/reports/new/fl-four-point",
  tx_coastal_windstorm_mitigation: "/reports/new/tx-windstorm",
  ca_wildfire_defensible_space: "/reports/new/ca-wildfire",
  roof_certification_nationwide: "/reports/new/roof-certification",
  manufactured_home_insurance_prep: "/reports/new/manufactured-home",
};

const ReportTypeSelection = () => {
  const title = "Select Report Type | Home Report Pro";
  const description = "Choose the type of inspection report you want to create. All templates are InterNACHI compliant and professionally designed.";

  const reportTypes = Object.entries(REPORT_TYPE_LABELS);

  return (
    <div className="min-h-screen bg-background">
      <Seo title={title} description={description} />

      {/* Header Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Create New Report
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-slate-700 via-blue-800 to-slate-900 dark:from-slate-200 dark:via-blue-200 dark:to-slate-100 bg-clip-text text-transparent">
                Select Report Type
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the type of inspection report you want to create. All templates follow 
              industry standards and best practices for professional reporting.
            </p>
          </div>
        </div>
      </section>

      {/* Report Types Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map(([key, label]) => {
              const Icon = REPORT_TYPE_ICONS[key as Report["reportType"]];
              const description = REPORT_TYPE_DESCRIPTIONS[key as Report["reportType"]];
              const route = ROUTE_MAP[key as Report["reportType"]];

              return (
                <Card key={key} className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Standard
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {description}
                    </p>
                    <Button 
                      asChild 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant="outline"
                    >
                      <Link to={route}>
                        Create Report
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Back to Reports Link */}
          <div className="mt-12 text-center">
            <Button variant="ghost" asChild>
              <Link to="/reports">
                ← Back to Reports
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportTypeSelection;