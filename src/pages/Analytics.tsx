import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, DollarSign } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DateRangePicker } from "@/components/DateRangePicker";

interface AnalyticsData {
  totalReports: number;
  totalContacts: number;
  totalAppointments: number;
  completedReports: number;
  monthlyReports: Array<{ month: string; count: number; revenue?: number }>;
  reportsByType: Array<{ type: string; count: number; value: number }>;
  recentActivity: Array<{ date: string; type: string; count: number }>;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--secondary))",
  },
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date}>(() => ({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
    endDate: new Date(),
  }));
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, dateRange.startDate, dateRange.endDate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Use selected date range
      const startDate = dateRange.startDate;
      const endDate = dateRange.endDate;

      // Fetch all data in parallel
      const [reportsRes, contactsRes, appointmentsRes] = await Promise.all([
        supabase
          .from("reports")
          .select("*")
          .eq("user_id", user!.id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        supabase
          .from("contacts")
          .select("*")
          .eq("user_id", user!.id)
          .eq("is_active", true),
        supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user!.id)
          .gte("appointment_date", startDate.toISOString())
          .lte("appointment_date", endDate.toISOString()),
      ]);

      if (reportsRes.error) throw reportsRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (appointmentsRes.error) throw appointmentsRes.error;

      const reports = reportsRes.data;
      const contacts = contactsRes.data;
      const appointments = appointmentsRes.data;

      // Process data
      const monthlyData = [] as { month: string; count: number; revenue: number }[];
      const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      while (current <= end) {
        const monthStr = current.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        const monthReports = reports.filter((r) => {
          const reportDate = new Date(r.created_at);
          return (
            reportDate.getFullYear() === current.getFullYear() &&
            reportDate.getMonth() === current.getMonth()
          );
        });
        monthlyData.push({
          month: monthStr,
          count: monthReports.length,
          revenue: monthReports.length * 500, // Estimate $500 per report
        });
        current.setMonth(current.getMonth() + 1);
      }

      // Report types analysis
      const reportTypes = reports.reduce((acc: any, report) => {
        const type = report.report_type || 'home_inspection';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const reportsByType = Object.entries(reportTypes).map(([type, count]) => ({
        type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: count as number,
        value: (count as number) * 100 / reports.length
      }));

      // Recent activity
      const recentActivity = monthlyData.slice(-7).map((month) => ({
        date: month.month,
        type: "Reports",
        count: month.count,
      }));

      setAnalytics({
        totalReports: reports.length,
        totalContacts: contacts.length,
        totalAppointments: appointments.length,
        completedReports: reports.filter(r => r.status === 'Final').length,
        monthlyReports: monthlyData,
        reportsByType,
        recentActivity
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) return null;

  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];
  const rangeLabel = `${format(dateRange.startDate, 'LLL dd, y')} - ${format(dateRange.endDate, 'LLL dd, y')}`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Analytics</h1>
          <p className="text-muted-foreground">Track your inspection business performance and growth</p>
        </div>
        <DateRangePicker
          value={{ from: dateRange.startDate, to: dateRange.endDate }}
          onChange={(range) =>
            setDateRange({
              startDate: range?.from || dateRange.startDate,
              endDate: range?.to || dateRange.endDate,
            })
          }
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedReports} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analytics.totalReports * 500).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on completed reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Report Analysis</TabsTrigger>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Reports ({rangeLabel})</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyReports}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend ({rangeLabel})</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyReports}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Types Distribution ({rangeLabel})</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.reportsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, value }) => `${type}: ${value.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.reportsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline ({rangeLabel})</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.recentActivity}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}