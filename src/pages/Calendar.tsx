import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, contactsApi } from "@/integrations/supabase/crmApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppointmentSchema, type Appointment } from "@/lib/crmSchemas";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay, isSameDay } from "date-fns";
import Seo from "@/components/Seo";

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentsApi.list(user!.id),
    enabled: !!user,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !!user,
  });

  const form = useForm<Appointment>({
    resolver: zodResolver(AppointmentSchema.omit({ id: true, user_id: true, created_at: true, updated_at: true })),
    defaultValues: {
      title: "",
      description: "",
      appointment_date: new Date().toISOString(),
      duration_minutes: 120,
      location: "",
      status: "scheduled",
      contact_id: null,
      report_id: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Appointment created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error creating appointment", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      appointmentsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Appointment updated successfully" });
      setIsDialogOpen(false);
      setEditingAppointment(null);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error updating appointment", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: appointmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Appointment deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting appointment", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: any) => {
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, updates: data });
    } else {
      createMutation.mutate({ ...data, user_id: user!.id });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    form.reset({
      ...appointment,
      appointment_date: new Date(appointment.appointment_date).toISOString().slice(0, 16),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (appointment: Appointment) => {
    if (confirm(`Are you sure you want to delete "${appointment.title}"?`)) {
      deleteMutation.mutate(appointment.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rescheduled":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedDateAppointments = appointments.filter(appointment =>
    isSameDay(new Date(appointment.appointment_date), selectedDate)
  );

  const appointmentDates = appointments.map(apt => new Date(apt.appointment_date));

  return (
    <>
      <Seo 
        title="Calendar - InspectPro"
        description="View and manage your inspection appointments in a calendar view."
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage your inspection appointments.
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingAppointment(null);
                form.reset({
                  title: "",
                  description: "",
                  appointment_date: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
                  duration_minutes: 120,
                  location: "",
                  status: "scheduled",
                  contact_id: null,
                  report_id: null,
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAppointment ? "Edit Appointment" : "New Appointment"}
                </DialogTitle>
                <DialogDescription>
                  {editingAppointment ? "Update appointment details" : "Schedule a new inspection appointment"}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Home Inspection" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="appointment_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a contact" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No contact</SelectItem>
                              {contacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.first_name} {contact.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="rescheduled">Rescheduled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Property address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingAppointment ? "Update" : "Create"} Appointment
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {format(selectedDate, "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  hasAppointment: appointmentDates,
                }}
                modifiersStyles={{
                  hasAppointment: {
                    backgroundColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    fontWeight: "bold",
                  },
                }}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>

          {/* Appointments for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>
                {format(selectedDate, "EEEE, MMMM d")}
              </CardTitle>
              <CardDescription>
                {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No appointments scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateAppointments
                    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                    .map((appointment: any) => (
                    <div key={appointment.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{appointment.title}</h4>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {format(new Date(appointment.appointment_date), "h:mm a")} 
                          ({appointment.duration_minutes}min)
                        </div>
                        
                        {appointment.contact && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            {appointment.contact.first_name} {appointment.contact.last_name}
                          </div>
                        )}
                        
                        {appointment.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {appointment.location}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-1 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(appointment)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(appointment)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Calendar;