import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { contactsApi, appointmentsApi, tasksApi, activitiesApi } from "@/integrations/supabase/crmApi";
import { reportsApi } from "@/integrations/supabase/reportsApi";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Plus, Mail, Phone, MapPin, Building2, Calendar, FileText, CheckSquare, Activity } from "lucide-react";
import { format } from "date-fns";

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: contact, isLoading: contactLoading } = useQuery({
    queryKey: ["contact", id],
    queryFn: () => contactsApi.get(id!),
    enabled: !!id && !!user,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["contact-reports", id],
    queryFn: () => reportsApi.getByContactId(id!),
    enabled: !!id && !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["contact-appointments", id],
    queryFn: () => appointmentsApi.getByContactId(id!),
    enabled: !!id && !!user,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["contact-tasks", id],
    queryFn: () => tasksApi.getByContactId(id!),
    enabled: !!id && !!user,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["contact-activities", id],
    queryFn: () => activitiesApi.getForContact(id!),
    enabled: !!id && !!user,
  });

  if (contactLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contact not found</h1>
          <Link to="/contacts">
            <Button>Back to Contacts</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case "client": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "vendor": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "partner": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "lead": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <Seo 
        title={`${contact.first_name} ${contact.last_name} - Contact Details`}
        description={`View contact details and related activities for ${contact.first_name} ${contact.last_name}`}
      />
      
      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/contacts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
          </Link>
        </div>

        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(contact.first_name, contact.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {contact.first_name} {contact.last_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getContactTypeColor(contact.contact_type)}>
                      {contact.contact_type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/reports/new?contactId=${contact.id}`}>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </Link>
                <Link to={`/calendar?contactId=${contact.id}`}>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{contact.company}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {contact.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <div>
                      <div>{contact.address}</div>
                      {(contact.city || contact.state || contact.zip_code) && (
                        <div>
                          {contact.city && `${contact.city}, `}
                          {contact.state && `${contact.state} `}
                          {contact.zip_code}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {contact.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{contact.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Data Tabs */}
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointments ({appointments.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activities ({activities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Reports</h3>
              <Link to={`/reports/new?contactId=${contact.id}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </Link>
            </div>
            {reports.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No reports found for this contact.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{report.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(report.inspection_date), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={report.status === "Final" ? "default" : "secondary"}>
                            {report.status}
                          </Badge>
                          <Link to={`/reports/${report.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Appointments</h3>
              <Link to={`/calendar?contactId=${contact.id}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </Link>
            </div>
            {appointments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No appointments found for this contact.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{appointment.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(appointment.appointment_date), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          {appointment.location && (
                            <p className="text-sm text-muted-foreground">
                              {appointment.location}
                            </p>
                          )}
                        </div>
                        <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Tasks</h3>
              <Link to="/tasks">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </Link>
            </div>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No tasks found for this contact.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          {task.due_date && (
                            <p className="text-sm text-muted-foreground">
                              Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                            {task.priority}
                          </Badge>
                          <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <h3 className="text-lg font-medium">Activity Timeline</h3>
            {activities.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No activities found for this contact.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {activity.activity_type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}