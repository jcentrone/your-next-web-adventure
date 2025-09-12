import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi, type Expense } from "@/integrations/supabase/expenseApi";
import { expenseCategoriesApi } from "@/integrations/supabase/expenseCategoriesApi";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { ExpensesListView } from "./ExpensesListView";
import { ExpensesCardView } from "./ExpensesCardView";
import { ExpensesViewToggle } from "./ExpensesViewToggle";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import ExpenseForm from "./ExpenseForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpenseListProps {
  userId: string;
  organizationId: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ userId, organizationId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [view, setView] = React.useState<"list" | "card">("list");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const effectiveView = isMobile ? "card" : view;
  const [sort, setSort] = React.useState<{ field: "expense_date" | "amount"; direction: "asc" | "desc" }>(
    { field: "expense_date", direction: "desc" }
  );

  // Fetch expense categories (only active ones for filtering)
  const { data: categories = [] } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expenseCategoriesApi.listExpenseCategories(false),
  });

  // Create categories list for filter
  const categoryOptions = [
    { label: "All", value: "all" },
    ...categories.map(cat => ({ label: cat.name, value: cat.name }))
  ];

  React.useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const queryParams = React.useMemo(
    () => ({
      search: searchTerm || undefined,
      category: selectedCategory && selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy: sort.field,
      sortDir: sort.direction,
    }),
    [searchTerm, selectedCategory, sort]
  );
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", searchTerm, selectedCategory, sort],
    queryFn: () => expenseApi.listExpenses(queryParams),
  });

  // Pagination calculations
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  // Reset pagination when expenses change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [expenses.length]);

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
          <div className="flex items-center gap-2">
            {!isMobile && <ExpensesViewToggle view={view} onViewChange={setView} />}
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </DialogTrigger>
          </div>
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
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {effectiveView === "list" ? (
            <ExpensesListView
              expenses={currentExpenses}
              isLoading={isLoading}
              sort={sort}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <ExpensesCardView
              expenses={currentExpenses}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          
          {/* Pagination */}
          {expenses.length > 0 && (
            <DataTablePagination
              currentPage={currentPage}
              totalItems={expenses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
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
