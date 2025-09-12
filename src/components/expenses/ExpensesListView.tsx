import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import ExpenseItem from "./ExpenseItem";
import { type Expense } from "@/integrations/supabase/expenseApi";

interface ExpensesListViewProps {
  expenses: Expense[];
  isLoading: boolean;
  sort: { field: "expense_date" | "amount"; direction: "asc" | "desc" };
  onSort: (field: "expense_date" | "amount") => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpensesListView: React.FC<ExpensesListViewProps> = ({
  expenses,
  isLoading,
  sort,
  onSort,
  onEdit,
  onDelete
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => onSort("expense_date")}
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
              onClick={() => onSort("amount")}
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
          {expenses?.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};