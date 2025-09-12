import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckSquare, Edit, Trash2, Calendar, User, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "@/lib/crmSchemas";

type SortField = "title" | "priority" | "status" | "due_date" | "created_at";

interface TasksListViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  sortField: SortField;
  sortOrder: "asc" | "desc";
  onSort: (field: SortField) => void;
}

export const TasksListView: React.FC<TasksListViewProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort
}) => {
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

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("title")}
            >
              <div className="flex items-center gap-2">
                Title
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("priority")}
            >
              <div className="flex items-center gap-2">
                Priority
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("status")}
            >
              <div className="flex items-center gap-2">
                Status
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("due_date")}
            >
              <div className="flex items-center gap-2">
                Due Date
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-muted/50">
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleComplete(task)}
                  className="p-1"
                >
                  {task.status === "completed" ? (
                    <CheckSquare className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-muted-foreground rounded" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {task.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                {task.due_date ? (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No due date</span>
                )}
              </TableCell>
              <TableCell>
                {(task as any).contacts ? (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {(task as any).contacts.first_name} {(task as any).contacts.last_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No contact</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};