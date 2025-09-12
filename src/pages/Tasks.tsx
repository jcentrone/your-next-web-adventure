import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, contactsApi, appointmentsApi } from "@/integrations/supabase/crmApi";
import { reportsApi } from "@/integrations/supabase/reportsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TasksListView } from "@/components/tasks/TasksListView";
import { TasksCardView } from "@/components/tasks/TasksCardView";
import { TasksViewToggle } from "@/components/tasks/TasksViewToggle";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, Edit, Trash2, CheckSquare, Check, ArrowUpDown, Filter, Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema, type Task } from "@/lib/crmSchemas";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Seo from "@/components/Seo";

type SortField = "title" | "priority" | "status" | "due_date" | "created_at";
type SortOrder = "asc" | "desc";

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customTaskType, setCustomTaskType] = useState("");
  const [showCustomTaskType, setShowCustomTaskType] = useState(false);
  const [view, setView] = useState<"list" | "card">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const effectiveView = isMobile ? "card" : view;

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

  const { data: reports = [] } = useQuery({
    queryKey: ["reports", user?.id],
    queryFn: () => reportsApi.dbListReports(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
      setIsDialogOpen(false);
      setEditingTask(null);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
      setDeleteTask(null);
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => 
      tasksApi.update(id, { 
        status: completed ? "completed" : "pending",
        completed_at: completed ? new Date().toISOString() : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task status updated");
    },
    onError: () => {
      toast.error("Failed to update task status");
    },
  });

  const form = useForm({
    resolver: zodResolver(TaskSchema.omit({ 
      id: true, 
      user_id: true, 
      created_at: true, 
      updated_at: true,
      completed_at: true
    })),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      task_type: "",
      due_date: "",
      contact_id: "",
      appointment_id: "",
      report_id: "",
    },
  });

  const onSubmit = (data: any) => {
    const finalTaskType = data.task_type === "Other" ? customTaskType : data.task_type;
    const taskData = {
      ...data,
      user_id: user!.id,
      contact_id: data.contact_id || null,
      appointment_id: data.appointment_id || null,
      report_id: data.report_id || null,
      task_type: finalTaskType || null,
      due_date: data.due_date || null,
    };

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: taskData });
    } else {
      createMutation.mutate(taskData);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    const taskType = (task as any).task_type || "";
    const predefinedTypes = [
      "Scheduling & Access", "On-Site Inspection", "Report Drafting & QA",
      "Client/Agent Communication", "Billing & Payments", "Equipment/Vehicle Maintenance",
      "Marketing & Reviews"
    ];
    
    if (taskType && !predefinedTypes.includes(taskType)) {
      setShowCustomTaskType(true);
      setCustomTaskType(taskType);
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        task_type: "Other",
        due_date: task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : "",
        contact_id: task.contact_id || "",
        appointment_id: task.appointment_id || "",
        report_id: task.report_id || "",
      });
    } else {
      setShowCustomTaskType(false);
      setCustomTaskType("");
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        task_type: taskType,
        due_date: task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : "",
        contact_id: task.contact_id || "",
        appointment_id: task.appointment_id || "",
        report_id: task.report_id || "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (task: Task) => {
    setDeleteTask(task);
  };

  const handleToggleComplete = (task: Task) => {
    const isCompleted = task.status === "completed";
    toggleCompleteMutation.mutate({ 
      id: task.id, 
      completed: !isCompleted 
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter, sortField, sortOrder]);

  const filterTasksByStatus = (status: string) => {
    if (status === "all") return filteredAndSortedTasks;
    return filteredAndSortedTasks.filter(task => task.status === status);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

  // Reset pagination when tasks change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedTasks.length]);

  return (
    <>
      <Seo 
        title="Tasks - Home Report Pro"
        description="Manage your inspection tasks, track progress, and stay organized with your business activities."
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your tasks and stay organized
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && <TasksViewToggle view={view} onViewChange={setView} />}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTask(null);
                setShowCustomTaskType(false);
                setCustomTaskType("");
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Create Task"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
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
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                            <Select onValueChange={field.onChange} value={field.value}>
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
                        name="task_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Type</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setShowCustomTaskType(value === "Other");
                                if (value !== "Other") {
                                  setCustomTaskType("");
                                }
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select task type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Scheduling & Access">Scheduling & Access</SelectItem>
                                <SelectItem value="On-Site Inspection">On-Site Inspection</SelectItem>
                                <SelectItem value="Report Drafting & QA">Report Drafting & QA</SelectItem>
                                <SelectItem value="Client/Agent Communication">Client/Agent Communication</SelectItem>
                                <SelectItem value="Billing & Payments">Billing & Payments</SelectItem>
                                <SelectItem value="Equipment/Vehicle Maintenance">Equipment/Vehicle Maintenance</SelectItem>
                                <SelectItem value="Marketing & Reviews">Marketing & Reviews</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {showCustomTaskType && (
                        <FormItem>
                          <FormLabel>Custom Task Type</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter custom task type" 
                              value={customTaskType}
                              onChange={(e) => setCustomTaskType(e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                      )}

                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Task description" 
                                className="min-h-[100px]"
                                {...field} 
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
                            <FormLabel>Related Contact (Optional)</FormLabel>
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
                        name="appointment_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Related Appointment (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an appointment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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

                      <FormField
                        control={form.control}
                        name="report_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Related Report (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a report" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {reports.map((report: any) => (
                                  <SelectItem key={report.id} value={report.id}>
                                    {report.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
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
                      {editingTask ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Tasks ({filteredAndSortedTasks.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filterTasksByStatus("pending").length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({filterTasksByStatus("in_progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filterTasksByStatus("completed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8">Loading tasks...</div>
            ) : filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {tasks.length === 0 ? "Get started by creating a new task." : "Try adjusting your search or filters."}
                </p>
              </div>
            ) : (
              effectiveView === "list" ? (
                <TasksListView 
                  tasks={currentTasks}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              ) : (
                <TasksCardView
                  tasks={currentTasks}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )
            )}
            
            {/* Pagination */}
            {currentTasks.length > 0 && (
              <DataTablePagination
                currentPage={currentPage}
                totalItems={filteredAndSortedTasks.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </TabsContent>

          {["pending", "in_progress", "completed"].map((status) => {
            const statusTasks = filterTasksByStatus(status);
            return (
              <TabsContent key={status} value={status}>
                {statusTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No {status.replace("_", " ")} tasks
                    </h3>
                  </div>
                ) : effectiveView === "list" ? (
                  <TasksListView 
                    tasks={statusTasks}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                ) : (
                  <TasksCardView
                    tasks={statusTasks}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTask} onOpenChange={() => setDeleteTask(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteTask?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTask && deleteMutation.mutate(deleteTask.id)}
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

export default Tasks;