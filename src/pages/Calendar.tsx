import React, {useEffect, useState} from "react";
import {useAuth} from "@/contexts/AuthContext";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {appointmentsApi, contactsApi} from "@/integrations/supabase/crmApi";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {Calendar as CalendarIcon, Edit, Plus, Trash2, Settings} from "lucide-react";
import {format} from "date-fns";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {type Appointment, AppointmentSchema, ContactSchema, type Contact} from "@/lib/crmSchemas";
import {toast} from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import Seo from "@/components/Seo";
import {DraggableCalendarGrid} from "@/components/calendar/DraggableCalendarGrid";
import {TimeChangeConfirmDialog} from "@/components/calendar/TimeChangeConfirmDialog";
import {CalendarSettingsDialog} from "@/components/calendar/CalendarSettingsDialog";
import {useCalendarSettings} from "@/hooks/useCalendarSettings";
import AppointmentPreviewDialog from "@/components/calendar/AppointmentPreviewDialog";
import * as googleCalendar from "@/integrations/googleCalendar";
import * as outlookCalendar from "@/integrations/outlookCalendar";
import * as appleCalendar from "@/integrations/appleCalendar";
import {syncExternalEvents} from "@/integrations/syncExternalEvents";
import { getOptimizedRoute } from "@/components/maps/routeOptimizer";
import RouteChoiceDialog from "@/components/maps/RouteChoiceDialog";
import { useNavigate } from "react-router-dom";

const Calendar: React.FC = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
    const [previewAppointment, setPreviewAppointment] = useState<Appointment | null>(null);
    const [optimizeEnabled] = useState(() => localStorage.getItem("optimizeRoute") === "true");
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
    const [routeUrls, setRouteUrls] = useState<{ googleMapsUrl: string; wazeUrl: string } | null>(null);
    const [pendingDrop, setPendingDrop] = useState<{appointment: Appointment, newDate: Date} | null>(null);
    const [isTimeChangeDialogOpen, setIsTimeChangeDialogOpen] = useState(false);
    const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
    const { settings: calendarSettings, updateSettings: updateCalendarSettings } = useCalendarSettings();
    const [appointmentsView, setAppointmentsView] = useState<'day' | 'all'>("day");

    const handleSync = async () => {
        if (!user) return;
        await syncExternalEvents(user.id);
        queryClient.invalidateQueries({queryKey: ["appointments", user!.id]});
    };

    useEffect(() => {
        handleSync();
    }, [user]);

    const {
        data: appointments = [] as Appointment[],
        error: appointmentsError,
    } = useQuery({
        queryKey: ["appointments", user?.id],
        queryFn: () => appointmentsApi.list(user!.id),
        enabled: !!user,
    });

    // Handle appointments error
    useEffect(() => {
        if (appointmentsError) {
            console.error("Error fetching appointments", appointmentsError);
            toast.error("Failed to load appointments");
        }
    }, [appointmentsError]);

    const {data: contacts = [] as Contact[]} = useQuery({
        queryKey: ["contacts", user?.id],
        queryFn: () => contactsApi.list(user!.id),
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: appointmentsApi.create,
        onSuccess: async (appointment) => {
            if (!user) return;
            queryClient.invalidateQueries({queryKey: ["appointments", user!.id]});
            toast.success("Appointment created successfully");
            setIsDialogOpen(false);
            form.reset();
            await Promise.all([
                googleCalendar.createEvent(user!.id, appointment),
                outlookCalendar.createEvent(user!.id, appointment),
                appleCalendar.createEvent(user!.id, appointment),
            ]);
        },
        onError: () => {
            toast.error("Failed to create appointment");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}: { id: string; data: any }) =>
            appointmentsApi.update(id, data),
        onSuccess: async (appointment) => {
            if (!user) return;
            queryClient.invalidateQueries({queryKey: ["appointments", user!.id]});
            toast.success("Appointment updated successfully");
            setIsDialogOpen(false);
            setEditingAppointment(null);
            form.reset();
            await Promise.all([
                googleCalendar.updateEvent(user!.id, appointment),
                outlookCalendar.updateEvent(user!.id, appointment),
                appleCalendar.updateEvent(user!.id, appointment),
            ]);
        },
        onError: () => {
            toast.error("Failed to update appointment");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: appointmentsApi.delete,
        onSuccess: async (_, id) => {
            if (!user) return;
            queryClient.invalidateQueries({queryKey: ["appointments", user!.id]});
            toast.success("Appointment deleted successfully");
            setDeleteAppointment(null);
            await Promise.all([
                googleCalendar.deleteEvent(user!.id, id as string),
                outlookCalendar.deleteEvent(user!.id, id as string),
                appleCalendar.deleteEvent(user!.id, id as string),
            ]);
        },
        onError: () => {
            toast.error("Failed to delete appointment");
        },
    });

    const createContactMutation = useMutation({
        mutationFn: contactsApi.create,
        onSuccess: (newContact) => {
            if (!user) return;
            queryClient.invalidateQueries({queryKey: ["contacts", user!.id]});
            toast.success("Contact created successfully");
            setIsContactDialogOpen(false);
            contactForm.reset();
            // Auto-select the newly created contact
            form.setValue("contact_id", newContact.id);
            const fullAddress = [
                newContact.address,
                newContact.city,
                newContact.state,
                newContact.zip_code,
            ]
                .filter(Boolean)
                .join(", ");
            form.setValue("location", fullAddress);
        },
        onError: () => {
            toast.error("Failed to create contact");
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

    const contactForm = useForm({
        resolver: zodResolver(ContactSchema.omit({
            id: true,
            user_id: true,
            created_at: true,
            updated_at: true
        })),
        defaultValues: {
            contact_type: "client",
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            company: "",
            address: "",
            city: "",
            state: "",
            zip_code: "",
            notes: "",
        },
    });

    const onSubmit = (data: any) => {
        const appointmentData = {
            ...data,
            appointment_date: new Date(data.appointment_date).toISOString(),
            user_id: user!.id,
            contact_id: data.contact_id || null,
        };

        if (editingAppointment) {
            updateMutation.mutate({id: editingAppointment.id, data: appointmentData});
        } else {
            createMutation.mutate(appointmentData);
        }
    };

    const onContactSubmit = (data: any) => {
        const contactData = {
            ...data,
            user_id: user!.id,
        };
        createContactMutation.mutate(contactData);
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

    const handleOptimizeRoute = async () => {
        // Compute an optimized route using the Google Maps JS API
        const addresses = selectedDateAppointments
            .map(app => {
                if (app.location) return app.location;
                const contact = contacts.find(c => c.id === app.contact_id);
                if (!contact) return null;
                const parts = [contact.address, contact.city, contact.state, contact.zip_code].filter(Boolean);
                return parts.join(", ");
            })
            .filter((a): a is string => !!a);
        if (addresses.length < 2) {
            toast.error("Need at least two appointments with addresses");
            return;
        }
        try {
            const { googleMapsUrl, wazeUrl } = await getOptimizedRoute(addresses);
            setRouteUrls({ googleMapsUrl, wazeUrl });
            setIsRouteDialogOpen(true);
        } catch (e) {
            toast.error("Failed to optimize route");
        }
    };

    const handleAppointmentDrop = (appointmentId: string, newDate: Date) => {
        const appointment = appointments.find(app => app.id === appointmentId);
        if (!appointment) return;
        
        setPendingDrop({ appointment, newDate });
        setIsTimeChangeDialogOpen(true);
    };

    const handleTimeChangeConfirm = (changeTime: boolean) => {
        if (!pendingDrop) return;
        
        const { appointment, newDate } = pendingDrop;
        const originalDate = new Date(appointment.appointment_date);
        
        let finalDate = newDate;
        if (!changeTime) {
            // Keep original time, just change the date
            finalDate = new Date(newDate);
            finalDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
        }
        
        const appointmentData = {
            title: appointment.title,
            description: appointment.description,
            appointment_date: new Date(finalDate).toISOString(),
            duration_minutes: appointment.duration_minutes,
            location: appointment.location,
            contact_id: appointment.contact_id,
            status: appointment.status,
        };
        
        updateMutation.mutate({ 
            id: appointment.id, 
            data: appointmentData 
        });
        
        setPendingDrop(null);
        setIsTimeChangeDialogOpen(false);
        
        if (changeTime) {
            // Open edit dialog with new date pre-filled
            setEditingAppointment(appointment);
            form.reset({
                title: appointment.title,
                description: appointment.description || "",
                appointment_date: format(finalDate, "yyyy-MM-dd'T'HH:mm"),
                duration_minutes: appointment.duration_minutes || 120,
                location: appointment.location || "",
                contact_id: appointment.contact_id || "",
                status: appointment.status,
            });
            setIsDialogOpen(true);
        }
    };

    return (
        <>
            <Seo
                title="Calendar - Home Report Pro"
                description="Manage your inspection appointments and schedule with an integrated calendar system."
            />
            {routeUrls && (
                <RouteChoiceDialog
                    open={isRouteDialogOpen}
                    onOpenChange={setIsRouteDialogOpen}
                    googleMapsUrl={routeUrls.googleMapsUrl}
                    wazeUrl={routeUrls.wazeUrl}
                />
            )}

            <div className="container mx-auto p-6 space-y-6">
                <div className="flex flex-col w-full items-center justify-center">
                    <div className="flex w-full items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                            <p className="text-muted-foreground">
                                Manage your appointments and schedule
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleSync}>
                                Refresh
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setIsCalendarSettingsOpen(true)}
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                            {optimizeEnabled && (
                                <Button variant="outline" onClick={handleOptimizeRoute}>
                                    Optimize Route
                                </Button>
                            )}
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => {
                                            setEditingAppointment(null);
                                            form.reset();
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2"/>
                                        New Appointment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent
                                    aria-describedby="appointment-dialog-desc"
                                    className="sm:max-w-[700px]"
                                >
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingAppointment ? "Edit Appointment" : "Create Appointment"}
                                        </DialogTitle>
                                        <DialogDescription id="appointment-dialog-desc">
                                            Provide details for the appointment.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Left Column */}
                                                <div className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="title"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel>Title</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Appointment title" {...field} />
                                                                </FormControl>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="appointment_date"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel>Date & Time</FormLabel>
                                                                <FormControl>
                                                                    <Input type="datetime-local" {...field} />
                                                                </FormControl>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="duration_minutes"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel>Duration (minutes)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="status"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel>Status</FormLabel>
                                                                <Select onValueChange={field.onChange}
                                                                        value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue/>
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent
                                                                        className="bg-background border shadow-lg z-50">
                                                                        <SelectItem
                                                                            value="scheduled">Scheduled</SelectItem>
                                                                        <SelectItem
                                                                            value="confirmed">Confirmed</SelectItem>
                                                                        <SelectItem value="in_progress">In
                                                                            Progress</SelectItem>
                                                                        <SelectItem
                                                                            value="completed">Completed</SelectItem>
                                                                        <SelectItem
                                                                            value="cancelled">Cancelled</SelectItem>
                                                                        <SelectItem
                                                                            value="rescheduled">Rescheduled</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Right Column */}
                                                <div className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="contact_id"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel>Contact</FormLabel>
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        if (value === "add_new_contact") {
                                                                            setIsContactDialogOpen(true);
                                                                            return;
                                                                        }

                                                                        const selectedContact = contacts.find(
                                                                            (c) => c.id === value
                                                                        );
                                                                        const fullAddress = selectedContact
                                                                            ? [
                                                                                selectedContact.address,
                                                                                selectedContact.city,
                                                                                selectedContact.state,
                                                                                selectedContact.zip_code,
                                                                            ]
                                                                                  .filter(Boolean)
                                                                                  .join(", ")
                                                                            : "";

                                                                        field.onChange(value);
                                                                        form.setValue("location", fullAddress);
                                                                    }}
                                                                    value={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue
                                                                                placeholder="Select a contact"/>
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent
                                                                        className="bg-background border shadow-lg z-50">
                                                                        <SelectItem value="add_new_contact"
                                                                                    className="text-primary font-medium">
                                                                            <div className="flex items-center gap-2">
                                                                                <Plus className="w-4 h-4"/>
                                                                                Add New Contact
                                                                            </div>
                                                                        </SelectItem>
                                                                        {contacts.map((contact) => (
                                                                            <SelectItem key={contact.id}
                                                                                        value={contact.id}>
                                                                                {contact.first_name} {contact.last_name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="location"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel>Location</FormLabel>
                                                                <FormControl>
                                                                     <AddressAutocomplete
                                                                         value={form.watch('location')}
                                                                         onAddressChange={(address) => field.onChange(address.formatted_address)}
                                                                         onInputChange={field.onChange}
                                                                         placeholder="Appointment location"
                                                                     />
                                                                </FormControl>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="description"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel>Description</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Additional details"
                                                                        className="min-h-[100px]"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

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
                    </div>

                    {/* Contact Creation Dialog */}
                    <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Contact</DialogTitle>
                            </DialogHeader>
                            <Form {...contactForm}>
                                <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={contactForm.control}
                                            name="first_name"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="First name" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={contactForm.control}
                                            name="last_name"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Last name" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={contactForm.control}
                                            name="email"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="Email address" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={contactForm.control}
                                            name="phone"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Phone number" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={contactForm.control}
                                        name="company"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Company</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Company name" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={contactForm.control}
                                        name="contact_type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Contact Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-background border shadow-lg z-50">
                                                        <SelectItem value="client">Client</SelectItem>
                                                        <SelectItem value="realtor">Realtor</SelectItem>
                                                        <SelectItem value="vendor">Vendor</SelectItem>
                                                        <SelectItem value="contractor">Contractor</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsContactDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={createContactMutation.isPending}>
                                            {createContactMutation.isPending ? "Creating..." : "Create Contact"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <div className="flex w-full gap-6">
                        {/* Calendar View */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5"/>
                                    Calendar View
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {appointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <p className="text-muted-foreground mb-4">
                                            Your calendar is intentionally empty. Click refresh to sync the latest appointments.
                                        </p>
                                        <Button onClick={handleSync}>Refresh</Button>
                                    </div>
                                ) : (
                                    <DraggableCalendarGrid
                                        appointments={appointments}
                                        selectedDate={selectedDate}
                                        onDateSelect={setSelectedDate}
                                        onAppointmentDrop={handleAppointmentDrop}
                                        calendarSettings={calendarSettings}
                                        contacts={contacts}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Appointments */}
        <Card className="min-w-[400px]">
            {appointmentsError ? (
                <CardContent>
                    <p className="text-destructive text-center py-4">Failed to load appointments.</p>
                </CardContent>
            ) : (
                <Tabs value={appointmentsView} onValueChange={(value) => setAppointmentsView(value as 'day' | 'all')} className="w-full">
                                <CardHeader className="p-0">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="day">{format(selectedDate, "MMMM d, yyyy")}</TabsTrigger>
                                        <TabsTrigger value="all">All Appointments</TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent>
                                    <TabsContent value="day">
                                        {selectedDateAppointments.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-4">
                                                No appointments for this date
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedDateAppointments.map((appointment) => (
                                                    <div
                                                        key={appointment.id}
                                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                                                        onClick={() => setPreviewAppointment(appointment)}
                                                    >
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEdit(appointment);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(appointment);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="all">
                                        {appointments.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-8">
                                                No appointments yet. Create your first appointment to get started.
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {appointments.map((appointment) => (
                                                    <div
                                                        key={appointment.id}
                                                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                                                        onClick={() => setPreviewAppointment(appointment)}
                                                    >
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">{appointment.title}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(new Date(appointment.appointment_date), "MMM d, yyyy 'at' h:mm a")}
                                                                {appointment.location && ` • ${appointment.location}`}
                                                            </p>
                                                            {(appointment as any).contacts && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {(appointment as any).contacts.first_name} {(appointment as any).contacts.last_name}
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEdit(appointment);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(appointment);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        )}
                        </Card>
                    </div>

                    {/* Time Change Confirmation Dialog */}
            <TimeChangeConfirmDialog
                open={isTimeChangeDialogOpen}
                onOpenChange={setIsTimeChangeDialogOpen}
                appointment={pendingDrop?.appointment || null}
                newDate={pendingDrop?.newDate || null}
                onConfirm={handleTimeChangeConfirm}
            />

            <CalendarSettingsDialog
                open={isCalendarSettingsOpen}
                onOpenChange={setIsCalendarSettingsOpen}
                settings={calendarSettings}
                onSettingsChange={updateCalendarSettings}
            />

                    {/* Appointment Preview Dialog */}
                    <AppointmentPreviewDialog
                        appointment={previewAppointment}
                        isOpen={!!previewAppointment}
                        onOpenChange={(open) => !open && setPreviewAppointment(null)}
                        contact={(previewAppointment as any)?.contacts}
                        onNavigate={navigate}
                    />

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={!!deleteAppointment} onOpenChange={() => setDeleteAppointment(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{deleteAppointment?.title}"? This action cannot be
                                    undone.
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
            </div>
        </>
    );
};

export default Calendar;
