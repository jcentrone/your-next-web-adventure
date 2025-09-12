import React from "react";
import { Card } from "@/components/ui/card";
import { ActionsMenu, ActionItem } from "@/components/ui/actions-menu";
import { Pencil, Trash2 } from "lucide-react";
import type { Expense } from "@/integrations/supabase/types";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const handleEdit = () => onEdit(expense);
  const handleDelete = () => onDelete(expense.id);

  const actions: ActionItem[] = [
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEdit,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
    },
  ];

  return (
    <Card className="relative p-4">
      <div className="flex justify-between mb-2">
        <div>
          <div className="font-medium">
            {new Date(expense.expense_date).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {expense.category || "Uncategorized"}
          </div>
        </div>
        <div className="text-right font-semibold">
          {expense.amount ? `$${expense.amount.toFixed(2)}` : "-"}
        </div>
      </div>
      <p className="text-sm">{expense.description}</p>
      <div className="absolute top-2 right-2">
        <ActionsMenu actions={actions} />
      </div>
    </Card>
  );
};

export default ExpenseCard;

