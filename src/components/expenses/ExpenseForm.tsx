import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { expenseApi, type Expense } from "@/integrations/supabase/expenseApi";
import { expenseCategoriesApi } from "@/integrations/supabase/expenseCategoriesApi";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Camera, Upload, Plus } from "lucide-react";
import { CameraCapture } from "@/components/reports/CameraCapture";

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
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  
  // State for categories and adding new ones
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  // Fetch expense categories
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expenseCategoriesApi.listExpenseCategories(),
  });

  // Create new category mutation
  const createCategoryMutation = useMutation({
    mutationFn: expenseCategoriesApi.createExpenseCategory,
    onSuccess: () => {
      refetchCategories();
      setIsAddingCategory(false);
      setNewCategoryName("");
      toast({ title: "Category created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({ 
        name: newCategoryName.trim(),
        organization_id: organizationId 
      });
    }
  };

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

  const handleCameraCapture = (file: File) => {
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => index === 0 ? file : null,
      [Symbol.iterator]: function* () {
        yield file;
      }
    } as FileList;
    
    form.setValue("receipt", fileList);
    setIsCameraOpen(false);
  };

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
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                    <DialogTrigger asChild>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                        <Plus className="h-4 w-4" />
                        Add new category
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddCategory();
                            }
                          }}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsAddingCategory(false);
                              setNewCategoryName("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                          >
                            Add Category
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                    onChange={(e) => field.onChange(e.target.files)}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsCameraOpen(true)}
                      title="Take Photo"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload File"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {field.value && field.value[0] && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {field.value[0].name}
                    </p>
                  )}
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
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </Form>
  );
};

export default ExpenseForm;
