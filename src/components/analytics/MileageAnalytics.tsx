import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Route, DollarSign, Calendar, TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { routeOptimizationApi } from '@/integrations/supabase/routeOptimizationApi';
import { format } from 'date-fns';

interface MileageAnalyticsProps {
  dateRange: { from: Date; to: Date };
}

export function MileageAnalytics({ dateRange }: MileageAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await routeOptimizationApi.getMileageAnalytics(
        format(dateRange.from, 'yyyy-MM-dd'),
        format(dateRange.to, 'yyyy-MM-dd')
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading mileage analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportMileageReport = async () => {
    if (!analytics) return;

    // Generate CSV content
    const csvHeaders = ['Date Range', 'Total Miles', 'Total Cost', 'Total Trips', 'Avg Miles/Trip'];
    const csvData = [
      [
        `${format(dateRange.from, 'MM/dd/yyyy')} - ${format(dateRange.to, 'MM/dd/yyyy')}`,
        analytics.totalMiles.toFixed(1),
        `$${analytics.totalCost.toFixed(2)}`,
        analytics.totalTrips.toString(),
        analytics.avgMilesPerTrip.toFixed(1)
      ]
    ];

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mileage-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">No mileage data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={exportMileageReport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Miles</p>
                <p className="text-2xl font-bold">{analytics.totalMiles.toFixed(1)}</p>
              </div>
              <Route className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${analytics.totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold">{analytics.totalTrips}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Miles/Trip</p>
                <p className="text-2xl font-bold">{analytics.avgMilesPerTrip.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analytics.monthlyData && analytics.monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Mileage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="miles" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Miles" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cost']} />
                  <Bar 
                    dataKey="cost" 
                    fill="hsl(var(--chart-2))" 
                    name="Cost"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Deduction Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Business Mileage Deduction</p>
                <p className="text-sm text-muted-foreground">
                  {analytics.totalMiles.toFixed(1)} miles × $0.67/mile (2024 IRS rate)
                </p>
              </div>
              <Badge variant="secondary" className="text-lg">
                ${analytics.totalCost.toFixed(2)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              * Consult with a tax professional for specific deduction advice. 
              This calculation assumes business use of personal vehicle.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}