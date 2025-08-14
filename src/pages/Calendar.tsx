import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, contactsApi } from "@/integrations/supabase/crmApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppointmentSchema, type Appointment } from "@/lib/crmSchemas";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Seo from "@/components/Seo";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null);

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentsApi.list(user!.id),
    enabled: !!user,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment created successfully");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create appointment");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated successfully");
      setIsDialogOpen(false);
      setEditingAppointment(null);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to update appointment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: appointmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment deleted successfully");
      setDeleteAppointment(null);
    },
    onError: () => {
      toast.error("Failed to delete appointment");
    },
  });

  const form = useForm({
    resolver: zodResolver(AppointmentSchema.omit({ 
      id: true, 
      user_id: true, 
      created_at: true, 
      updated_at: true 
    })),
    defaultValues: {
      title: "",
      description: "",
      appointment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      duration_minutes: 120,
      location: "",
      contact_id: "",
      status: "scheduled",
    },
  });

  const onSubmit = (data: any) => {
    const appointmentData = {
      ...data,
      user_id: user!.id,
      contact_id: data.contact_id || null,
    };

    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, data: appointmentData });
    } else {
      createMutation.mutate(appointmentData);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    form.reset({
      title: appointment.title,
      description: appointment.description || "",
      appointment_date: format(new Date(appointment.appointment_date), "yyyy-MM-dd'T'HH:mm"),
      duration_minutes: appointment.duration_minutes || 120,
      location: appointment.location || "",
      contact_id: appointment.contact_id || "",
      status: appointment.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setDeleteAppointment(appointment);
  };

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

  // Filter appointments for selected date
  const selectedDateAppointments = appointments.filter(appointment => 
    format(new Date(appointment.appointment_date), "yyyy-MM-dd") === 
    format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <>
      <Seo 
        title="Calendar - InspectPro"
        description="Manage your inspection appointments and schedule with an integrated calendar system."
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your appointments and schedule
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingAppointment(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAppointment ? "Edit Appointment" : "Create Appointment"}
                </DialogTitle>
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
                          <Input placeholder="Appointment title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Appointment location" {...field} />
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
                          <Textarea placeholder="Additional details" {...field} />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAppointment ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarGrid 
                appointments={appointments} 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </CardContent>
          </Card>

          {/* Appointments for selected date */}
          <Card>
            <CardHeader>
              <CardTitle>
                {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No appointments for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{appointment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(appointment.appointment_date), "h:mm a")}
                          {appointment.location && ` • ${appointment.location}`}
                        </p>
                        {(appointment as any).contacts && (
                          <p className="text-sm text-muted-foreground">
                            {(appointment as any).contacts.first_name} {(appointment as any).contacts.last_name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(appointment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(appointment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No appointments yet. Create your first appointment to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{appointment.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.appointment_date), "MMM d, yyyy 'at' h:mm a")}
                        {appointment.location && ` • ${appointment.location}`}
                      </p>
                      {(appointment as any).contact && (
                        <p className="text-sm text-muted-foreground">
                          {(appointment as any).contact.first_name} {(appointment as any).contact.last_name}
                        </p>
                      )}
                      {appointment.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(appointment)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAppointment} onOpenChange={() => setDeleteAppointment(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteAppointment?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAppointment && deleteMutation.mutate(deleteAppointment.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default Calendar;