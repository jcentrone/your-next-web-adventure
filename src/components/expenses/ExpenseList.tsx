import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "@/integrations/supabase/expenseApi";
import type { Expense } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import ExpenseItem from "./ExpenseItem";

interface ExpenseListProps {
  userId: string;
  organizationId: string;
}

const categories = [
  { label: "All", value: "" },
  { label: "Travel", value: "travel" },
  { label: "Supplies", value: "supplies" },
  { label: "Meals", value: "meals" },
  { label: "Other", value: "other" },
];

export const ExpenseList: React.FC<ExpenseListProps> = ({ userId, organizationId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [sort, setSort] = React.useState<{ field: "expense_date" | "amount"; direction: "asc" | "desc" }>(
    { field: "expense_date", direction: "desc" }
  );

  React.useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const queryParams = React.useMemo(
    () => ({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      sortBy: sort.field,
      sortDir: sort.direction,
    }),
    [searchTerm, selectedCategory, sort]
  );
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", searchTerm, selectedCategory, sort],
    queryFn: () => expenseApi.listExpenses(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseApi.deleteExpense(id),
    onSuccess: () => {
      toast({ title: "Expense deleted" });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAdd = () => {
    setEditingExpense(null);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const handleSort = (field: "expense_date" | "amount") => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingExpense(null);
      }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expenses</CardTitle>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search expenses..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-xs"
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("expense_date")}
                  >
                    <div className="flex items-center">
                      Date
                      {sort.field === "expense_date" && (
                        sort.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead
                    className="text-right cursor-pointer select-none"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end">
                      Amount
                      {sort.field === "amount" && (
                        sort.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5}>Loading...</TableCell>
                  </TableRow>
                )}
                {!isLoading && expenses && expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>No expenses found.</TableCell>
                  </TableRow>
                )}
                {expenses?.map((exp) => (
                  <ExpenseItem
                    key={exp.id}
                    expense={exp}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          expense={editingExpense ?? undefined}
          userId={userId}
          organizationId={organizationId}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseList;
