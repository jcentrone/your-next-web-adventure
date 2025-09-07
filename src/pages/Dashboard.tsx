import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { appointmentsApi, tasksApi, activitiesApi } from "@/integrations/supabase/crmApi";
import { dbListReports } from "@/integrations/supabase/reportsApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, FileText, CheckSquare, Users, Plus, Clock, AlertTriangle, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import Seo from "@/components/Seo";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showTour, loading: onboardingLoading, completeTour } = useOnboarding();

  const { data: upcomingAppointments = [] } = useQuery({
    queryKey: ["appointments", "upcoming", user?.id],
    queryFn: () => appointmentsApi.getUpcoming(user!.id, 5),
    enabled: !!user,
  });

  const { data: overdueTasks = [] } = useQuery({
    queryKey: ["tasks", "overdue", user?.id],
    queryFn: () => tasksApi.getOverdue(user!.id),
    enabled: !!user,
  });

  const { data: recentReports = [] } = useQuery({
    queryKey: ["reports", user?.id],
    queryFn: () => dbListReports(user!.id),
    enabled: !!user,
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ["activities", user?.id],
    queryFn: () => activitiesApi.list(user!.id),
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user || onboardingLoading) {
    return null;
  }

  return (
    <>
      <Seo 
        title="Dashboard - Home Report Pro"
        description="Your inspection business dashboard with upcoming appointments, tasks, and reports overview."
      />
      
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your inspection business.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/reports/new" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  New Report
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/calendar" className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  New Appointment
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/tasks" className="flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  New Task
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentReports.filter(report => 
                  new Date(report.inspectionDate).getMonth() === new Date().getMonth()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">Reports completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Appointments scheduled</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overdueTasks.length > 0 ? 'text-red-600' : 'text-foreground'}`}>{overdueTasks.length}</div>
              <p className="text-xs text-muted-foreground">Tasks need attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentActivities.filter(activity => 
                  new Date(activity.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">Activities this week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Your next scheduled inspections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming appointments
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{appointment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(appointment.appointment_date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {appointment.contact && (
                          <p className="text-sm text-muted-foreground">
                            {appointment.contact.first_name} {appointment.contact.last_name}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/calendar">View All Appointments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Overdue Tasks
              </CardTitle>
              <CardDescription>
                Tasks that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No overdue tasks
                </p>
              ) : (
                <div className="space-y-3">
                  {overdueTasks.map((task: any) => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Due: {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "No due date"}
                        </p>
                        {task.contact && (
                          <p className="text-sm text-muted-foreground">
                            {task.contact.first_name} {task.contact.last_name}
                          </p>
                        )}
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/tasks">View All Tasks</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Reports
              </CardTitle>
              <CardDescription>
                Your latest inspection reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No reports yet
                </p>
              ) : (
                <div className="space-y-3">
                  {recentReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.clientName} • {format(new Date(report.inspectionDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant={report.status === "Final" ? "default" : "secondary"}>
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/reports">View All Reports</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to="/reports/new">
                    <Plus className="w-4 h-4 mr-2" />
                    New Report
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest business activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.created_at), "MMM d 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {showTour && <OnboardingTour onComplete={completeTour} />}
      </div>
    </>
  );
};

export default Dashboard;