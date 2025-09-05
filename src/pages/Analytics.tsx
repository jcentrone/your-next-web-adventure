import { useState, useEffect, useCallback } from "react";
import { format, parse } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";

interface AnalyticsData {
  totalReports: number;
  totalContacts: number;
  totalAppointments: number;
  completedReports: number;
  totalRevenue: number;
  averageRevenue: number;
  monthlyReports: Array<{ month: string; count: number; revenue?: number }>;
  reportsByType: Array<{ type: string; count: number; value: number }>;
  recentActivity: Array<{ date: string; type: string; count: number }>;
}

type AnalyticsResponse = Omit<AnalyticsData, "totalRevenue" | "averageRevenue">;

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

const activityTypes = ["Report", "Contact", "Appointment"] as const;

const activityColors: Record<(typeof activityTypes)[number], string> = {
  Report: "hsl(var(--primary))",
  Contact: "hsl(var(--secondary))",
  Appointment: "hsl(var(--accent))",
};

const activityChartConfig = {
  Report: { label: "Reports", color: activityColors.Report },
  Contact: { label: "Contacts", color: activityColors.Contact },
  Appointment: { label: "Appointments", color: activityColors.Appointment },
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
  const [activeTypes, setActiveTypes] = useState<string[]>([...activityTypes]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use selected date range
      const startDate = dateRange.startDate;
      const endDate = dateRange.endDate;

      const { data, error } = await supabase.rpc("analytics_summary", {
        p_user_id: user!.id,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      if (error) throw error;

      const rawData = data as AnalyticsResponse;
      const monthlyReports = rawData.monthlyReports || [];
      const totalRevenue = monthlyReports.reduce(
        (sum: number, r: { revenue?: number }) => sum + (r.revenue || 0),
        0
      );
      const totalReportCount = monthlyReports.reduce(
        (sum: number, r: { count: number }) => sum + r.count,
        0
      );

      const activityMap: Record<string, Record<string, number>> = {};

      (rawData.recentActivity || []).forEach((entry) => {
        if (!activityMap[entry.date]) activityMap[entry.date] = {};
        activityMap[entry.date].Report = entry.count;
      });

      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("created_at")
        .eq("user_id", user!.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
      if (contactsError) throw contactsError;
      contactsData?.forEach((c: { created_at: string }) => {
        const date = format(new Date(c.created_at), "MMM yy");
        if (!activityMap[date]) activityMap[date] = {};
        activityMap[date].Contact = (activityMap[date].Contact || 0) + 1;
      });

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("appointment_date")
        .eq("user_id", user!.id)
        .gte("appointment_date", startDate.toISOString())
        .lte("appointment_date", endDate.toISOString());
      if (appointmentsError) throw appointmentsError;
      appointmentsData?.forEach((a: { appointment_date: string }) => {
        const date = format(new Date(a.appointment_date), "MMM yy");
        if (!activityMap[date]) activityMap[date] = {};
        activityMap[date].Appointment = (activityMap[date].Appointment || 0) + 1;
      });

      const recentActivity = Object.entries(activityMap)
        .flatMap(([date, counts]) =>
          Object.entries(counts).map(([type, count]) => ({ date, type, count }))
        )
        .sort(
          (a, b) =>
            parse(a.date, "MMM yy", new Date()).getTime() -
            parse(b.date, "MMM yy", new Date()).getTime()
        );

      setAnalytics({
        ...rawData,
        recentActivity,
        totalRevenue,
        averageRevenue: totalReportCount > 0 ? totalRevenue / totalReportCount : 0,
      } as AnalyticsData);

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
  }, [user, dateRange.startDate, dateRange.endDate, toast]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, loadAnalytics]);

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
  const activityData = Object.values(
    analytics.recentActivity.reduce(
      (acc, { date, type, count }) => {
        if (!acc[date]) {
          acc[date] = { date, Report: 0, Contact: 0, Appointment: 0 };
        }
        acc[date][type as keyof typeof activityColors] = count;
        return acc;
      },
      {} as Record<string, { date: string; Report: number; Contact: number; Appointment: number }>
    )
  ).sort(
    (a, b) =>
      parse(a.date, "MMM yy", new Date()).getTime() -
      parse(b.date, "MMM yy", new Date()).getTime()
  );

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
              ${analytics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average ${analytics.averageRevenue.toFixed(2)} per report
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
              <div className="flex gap-4 mb-4">
                {activityTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={activeTypes.includes(type)}
                      onCheckedChange={(checked) =>
                        setActiveTypes((prev) =>
                          checked ? [...prev, type] : prev.filter((t) => t !== type)
                        )
                      }
                    />
                    <span className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: activityColors[type] }}
                      />
                      {type}
                    </span>
                  </label>
                ))}
              </div>
              <ChartContainer config={activityChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {activeTypes.includes("Report") && (
                      <Line
                        type="monotone"
                        dataKey="Report"
                        stroke={activityColors.Report}
                        strokeWidth={2}
                      />
                    )}
                    {activeTypes.includes("Contact") && (
                      <Line
                        type="monotone"
                        dataKey="Contact"
                        stroke={activityColors.Contact}
                        strokeWidth={2}
                      />
                    )}
                    {activeTypes.includes("Appointment") && (
                      <Line
                        type="monotone"
                        dataKey="Appointment"
                        stroke={activityColors.Appointment}
                        strokeWidth={2}
                      />
                    )}
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