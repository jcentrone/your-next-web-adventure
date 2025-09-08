import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings2 } from "lucide-react";

export default function SectionManager() {
  const navigate = useNavigate();

  // Redirect to the new Report Manager after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/settings/report-manager', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleRedirectNow = () => {
    navigate('/settings/report-manager', { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Section Manager has moved!</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Section Manager has been upgraded to the new <strong>Report Manager</strong>, 
            which allows you to manage sections, fields, and templates for all report types, 
            not just home inspections.
          </p>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">New Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Manage sections for all report types</li>
              <li>• Create and manage custom report templates</li>
              <li>• Universal section and field management</li>
              <li>• Build reports from scratch</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRedirectNow} className="flex-1">
              Go to Report Manager
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You will be redirected automatically in a few seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}