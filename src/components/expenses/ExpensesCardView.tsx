import React from "react";
import ExpenseCard from "./ExpenseCard";
import { type Expense } from "@/integrations/supabase/expenseApi";

interface ExpensesCardViewProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpensesCardView: React.FC<ExpensesCardViewProps> = ({
  expenses,
  isLoading,
  onEdit,
  onDelete
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (expenses.length === 0) {
    return <div>No expenses found.</div>;
  }

  return (
    <div className="grid gap-4">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};