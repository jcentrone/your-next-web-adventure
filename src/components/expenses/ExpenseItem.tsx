import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { ActionsMenu, ActionItem } from "@/components/ui/actions-menu";
import { Pencil, Trash2 } from "lucide-react";
import type { Expense } from "@/integrations/supabase/types";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit, onDelete }) => {
  const actions: ActionItem[] = [
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => onEdit(expense),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(expense.id),
      variant: "destructive",
    },
  ];

  return (
    <TableRow>
      <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
      <TableCell>{expense.category || "Uncategorized"}</TableCell>
      <TableCell>{expense.description}</TableCell>
      <TableCell className="text-right">
        {expense.amount ? `$${expense.amount.toFixed(2)}` : "-"}
      </TableCell>
      <TableCell className="w-[50px]">
        <ActionsMenu actions={actions} />
      </TableCell>
    </TableRow>
  );
};

export default ExpenseItem;
