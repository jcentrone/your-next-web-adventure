import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomReportTypes } from "@/hooks/useCustomReportTypes";
import { dbCreateReport } from "@/integrations/supabase/reportsApi";
import Seo from "@/components/Seo";

export default function CustomReportEditor() {
  const { customTypeId } = useParams<{ customTypeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { customTypes } = useCustomReportTypes();
  
  const [customType, setCustomType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    address: '',
    inspection_date: new Date().toISOString().split('T')[0],
    email: '',
    phone_home: '',
  });

  useEffect(() => {
    if (customTypeId && customTypes.length > 0) {
      const type = customTypes.find(ct => ct.id === customTypeId);
      setCustomType(type);
      if (type) {
        setFormData(prev => ({
          ...prev,
          title: `${type.name} Report`
        }));
      }
    }
  }, [customTypeId, customTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !customType) return;

    setIsLoading(true);
    try {
      const newReport = await dbCreateReport({
        title: formData.title,
        clientName: formData.client_name,
        address: formData.address,
        inspectionDate: formData.inspection_date,
        email: formData.email,
        phoneHome: formData.phone_home,
        reportType: customType.id, // Use custom type ID as report type
      }, user.id);

      toast({
        title: "Success",
        description: "Custom report created successfully",
      });

      navigate(`/reports/${newReport.id}/edit`);
    } catch (error) {
      console.error('Error creating custom report:', error);
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!customType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Custom Report Type Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested custom report type could not be found.</p>
          <Button onClick={() => navigate('/reports/select-type')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Report Types
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo 
        title={`Create ${customType.name} Report | Home Report Pro`}
        description={`Create a new ${customType.name} inspection report`}
      />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost" 
            onClick={() => navigate('/reports/select-type')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Report Types
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Create {customType.name} Report</h1>
          <p className="text-muted-foreground">
            {customType.description || `Create a new ${customType.name} inspection report with custom sections and fields.`}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter report title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Enter client name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Property Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter property address"
                  rows={2}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspection_date">Inspection Date *</Label>
                  <Input
                    id="inspection_date"
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, inspection_date: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_home">Phone</Label>
                <Input
                  id="phone_home"
                  value={formData.phone_home}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_home: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/reports/select-type')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Creating...' : 'Create Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}