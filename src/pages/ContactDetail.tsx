import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { contactsApi, appointmentsApi, tasksApi, activitiesApi } from "@/integrations/supabase/crmApi";
import { reportsApi } from "@/integrations/supabase/reportsApi";
import { CreateContactSchema } from "@/lib/crmSchemas";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Mail, Phone, MapPin, Building2, Calendar, FileText, CheckSquare, Activity, Edit2, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateContactSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      contact_type: "client",
      formatted_address: "",
      place_id: "",
      latitude: undefined,
      longitude: undefined,
      address_components: undefined,
      city: "",
      state: "",
      zip_code: "",
      notes: "",
      is_active: true,
    },
  });

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

  const updateMutation = useMutation({
    mutationFn: (updates: any) => contactsApi.update(id!, updates),
    onSuccess: () => {
      toast({
        title: "Contact updated",
        description: "Contact information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (contact) {
      form.reset({
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        contact_type: contact.contact_type || "client",
        formatted_address: contact.formatted_address || "",
        place_id: contact.place_id || "",
        latitude: contact.latitude,
        longitude: contact.longitude,
        address_components: contact.address_components,
        city: contact.city || "",
        state: contact.state || "",
        zip_code: contact.zip_code || "",
        notes: contact.notes || "",
        is_active: contact.is_active,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  const onSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

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
                {!isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
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
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <>
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
                     {contact.account && (
                       <div className="flex items-center gap-2 text-muted-foreground">
                         <Building2 className="h-4 w-4" />
                         <div className="flex flex-col">
                           <span className="font-medium text-foreground">
                             <Link 
                               to={`/accounts/${contact.account.id}`}
                               className="hover:text-primary transition-colors"
                             >
                               {contact.account.name}
                             </Link>
                           </span>
                           <span className="text-xs">
                             {contact.account.type} • {contact.account.industry}
                           </span>
                         </div>
                       </div>
                     )}
                  </div>
                  <div className="space-y-2">
                    {contact.formatted_address && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <div>
                          <div>{contact.formatted_address}</div>
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
              </>
            ) : (
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="realtor">Realtor</SelectItem>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="contractor">Contractor</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="formatted_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <AddressAutocomplete
                            value={field.value}
                            onAddressChange={(addressData) => {
                              // Update the display field and all related fields when address selection is made
                              field.onChange(addressData.formatted_address);
                              form.setValue('place_id', addressData.place_id);
                              form.setValue('latitude', addressData.latitude);
                              form.setValue('longitude', addressData.longitude);
                              form.setValue('address_components', addressData.address_components);
                              
                              // Extract city, state, zip from address components if available
                              const components = addressData.address_components || [];
                              let city = '';
                              let state = '';
                              let zipCode = '';

                              components.forEach((component: any) => {
                                const types = component.types || [];
                                if (types.includes('locality')) {
                                  city = component.long_name;
                                } else if (types.includes('administrative_area_level_1')) {
                                  state = component.short_name;
                                } else if (types.includes('postal_code')) {
                                  zipCode = component.long_name;
                                }
                              });

                              if (city) form.setValue('city', city);
                              if (state) form.setValue('state', state);
                              if (zipCode) form.setValue('zip_code', zipCode);
                            }}
                            onInputChange={(value) => {
                              // Update form field only for typed input, preserving smooth typing
                              field.onChange(value);
                            }}
                            placeholder="Start typing address..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
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