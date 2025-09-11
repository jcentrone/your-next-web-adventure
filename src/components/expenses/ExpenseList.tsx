import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "@/integrations/supabase/expenseApi";
import type { Expense } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Plus } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import ExpenseItem from "./ExpenseItem";

interface ExpenseListProps {
  userId: string;
  organizationId: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ userId, organizationId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => expenseApi.listExpenses(),
    onError: (error: Error) => {
      toast({
        title: "Error loading expenses",
        description: error.message,
        variant: "destructive",
      });
    },
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
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expenses</CardTitle>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6">
            <ExpenseForm
              expense={editingExpense ?? undefined}
              userId={userId}
              organizationId={organizationId}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
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
  );
};

export default ExpenseList;
