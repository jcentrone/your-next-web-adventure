import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, contactsApi, appointmentsApi } from "@/integrations/supabase/crmApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckSquare, Clock, AlertTriangle, Calendar, User, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema, type Task } from "@/lib/crmSchemas";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Seo from "@/components/Seo";

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => tasksApi.list(user!.id),
    enabled: !!user,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentsApi.list(user!.id),
    enabled: !!user,
  });

  const form = useForm<Task>({
    resolver: zodResolver(TaskSchema.omit({ id: true, user_id: true, created_at: true, updated_at: true })),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      due_date: null,
      contact_id: null,
      appointment_id: null,
      report_id: null,
      assigned_to: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error creating task", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      tasksApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task updated successfully" });
      setIsDialogOpen(false);
      setEditingTask(null);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error updating task", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting task", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: any) => {
    const taskData = {
      ...data,
      due_date: data.due_date || null,
      contact_id: data.contact_id || null,
      appointment_id: data.appointment_id || null,
      report_id: data.report_id || null,
      assigned_to: data.assigned_to || null,
    };

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, updates: taskData });
    } else {
      createMutation.mutate({ ...taskData, user_id: user!.id });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.reset({
      ...task,
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteMutation.mutate(task.id);
    }
  };

  const handleToggleComplete = (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const updates: Partial<Task> = { 
      status: newStatus,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null 
    };
    updateMutation.mutate({ id: task.id, updates });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const TaskCard = ({ task }: { task: any }) => (
    <Card key={task.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={task.status === "completed"}
              onCheckedChange={() => handleToggleComplete(task)}
              className="mt-1"
            />
            <div className="flex-1">
              <h4 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
          </div>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Due: {format(new Date(task.due_date), "MMM d, yyyy")}
              {new Date(task.due_date) < new Date() && task.status !== "completed" && (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              )}
            </div>
          )}
          
          {task.contact && (
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              {task.contact.first_name} {task.contact.last_name}
            </div>
          )}
          
          {task.appointment && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {task.appointment.title}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-1 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(task)}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(task)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Seo 
        title="Tasks - InspectPro"
        description="Manage your inspection business tasks and stay organized."
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your inspection business tasks and stay organized.
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTask(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "New Task"}
                </DialogTitle>
                <DialogDescription>
                  {editingTask ? "Update task details" : "Create a new task for your business"}
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
                          <Input placeholder="Task title" {...field} />
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
                          <Textarea placeholder="Task description" {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
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
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} value={field.value || ""} />
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
                          <FormLabel>Related Contact</FormLabel>
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
                      name="appointment_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Appointment</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an appointment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No appointment</SelectItem>
                              {appointments.map((appointment) => (
                                <SelectItem key={appointment.id} value={appointment.id}>
                                  {appointment.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingTask ? "Update" : "Create"} Task
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterTasksByStatus("pending").length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({filterTasksByStatus("in_progress").length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filterTasksByStatus("completed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No tasks yet</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterTasksByStatus("pending").map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </TabsContent>

          <TabsContent value="in_progress">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterTasksByStatus("in_progress").map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterTasksByStatus("completed").map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Tasks;