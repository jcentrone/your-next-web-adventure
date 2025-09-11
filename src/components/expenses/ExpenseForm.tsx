import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "@/integrations/supabase/expenseApi";
import type { Expense } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Camera } from "lucide-react";

interface ExpenseFormProps {
  expense?: Expense;
  userId: string;
  organizationId: string;
  onSuccess?: (expense: Expense) => void;
  onCancel?: () => void;
}

interface FormValues {
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  receipt: FileList | null;
}

const defaultCategories = [
  { label: "Travel", value: "travel" },
  { label: "Supplies", value: "supplies" },
  { label: "Meals", value: "meals" },
  { label: "Other", value: "other" },
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  userId,
  organizationId,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      expense_date: expense?.expense_date ?? "",
      category: expense?.category ?? "",
      description: expense?.description ?? "",
      amount: expense?.amount ?? 0,
      receipt: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Omit<Expense, "id" | "created_at">) =>
      expenseApi.createExpense(payload),
    onSuccess: (data) => {
      toast({ title: "Expense created" });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<Expense, "id" | "created_at">> }) =>
      expenseApi.updateExpense(id, payload),
    onSuccess: (data) => {
      toast({ title: "Expense updated" });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    let receiptUrl = expense?.receipt_url ?? null;
    if (values.receipt && values.receipt[0]) {
      // Receipt upload handling could be implemented here
    }

    const payload = {
      expense_date: values.expense_date,
      category: values.category || null,
      description: values.description || null,
      amount: Number(values.amount),
      receipt_url: receiptUrl,
      user_id: userId,
      organization_id: organizationId,
    };

    if (expense) {
      updateMutation.mutate({ id: expense.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="expense_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {defaultCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="receipt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt</FormLabel>
              <FormControl>
                <>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => field.onChange(e.target.files)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {expense ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExpenseForm;
