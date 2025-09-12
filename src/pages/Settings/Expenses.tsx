import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Edit2, Archive, ArchiveRestore, Trash2, Plus } from "lucide-react";
import { expenseCategoriesApi, ExpenseCategory } from "@/integrations/supabase/expenseCategoriesApi";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function Expenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<ExpenseCategory | null>(null);
  const [categoryUsage, setCategoryUsage] = React.useState<Record<string, number>>({});

  // Fetch categories including archived ones
  const { data: allCategories = [] } = useQuery({
    queryKey: ["expense-categories", "all"],
    queryFn: () => expenseCategoriesApi.listExpenseCategories(true),
  });

  const activeCategories = allCategories.filter(cat => !cat.is_archived);
  const archivedCategories = allCategories.filter(cat => cat.is_archived);

  // Load usage counts for active categories
  React.useEffect(() => {
    const loadUsageCounts = async () => {
      const usage: Record<string, number> = {};
      for (const category of activeCategories) {
        try {
          const count = await expenseCategoriesApi.checkCategoryUsage(category.name);
          usage[category.name] = count;
        } catch (error) {
          console.error(`Failed to check usage for ${category.name}:`, error);
          usage[category.name] = 0;
        }
      }
      setCategoryUsage(usage);
    };

    if (activeCategories.length > 0) {
      loadUsageCounts();
    }
  }, [activeCategories]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (name: string) => expenseCategoriesApi.createExpenseCategory({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      setNewCategoryName("");
      setIsAddDialogOpen(false);
      toast({ title: "Category created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create category", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      expenseCategoriesApi.updateExpenseCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      setEditingCategory(null);
      toast({ title: "Category updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update category", description: error.message, variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => expenseCategoriesApi.archiveExpenseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast({ title: "Category archived successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to archive category", description: error.message, variant: "destructive" });
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id: string) => expenseCategoriesApi.unarchiveExpenseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast({ title: "Category restored successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to restore category", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseCategoriesApi.deleteExpenseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      setCategoryToDelete(null);
      toast({ title: "Category deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete category", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category.id);
    setEditValue(category.name);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editValue.trim()) {
      updateMutation.mutate({ id: editingCategory, name: editValue.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  const handleDeleteOrArchive = async (category: ExpenseCategory) => {
    if (category.is_default) {
      toast({ 
        title: "Cannot delete default category", 
        description: "Default categories cannot be deleted or archived.",
        variant: "destructive" 
      });
      return;
    }

    const usage = await expenseCategoriesApi.checkCategoryUsage(category.name);
    
    if (usage > 0) {
      // Has expenses, archive instead
      archiveMutation.mutate(category.id);
      toast({
        title: "Category archived",
        description: `This category has ${usage} expense(s) and was archived instead of deleted.`
      });
    } else {
      // No expenses, can delete
      setCategoryToDelete(category);
    }
  };

  const CategoryCard = ({ category, isArchived = false }: { category: ExpenseCategory; isArchived?: boolean }) => (
    <Card key={category.id} className="relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editingCategory === category.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="h-8"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              </div>
            ) : (
              <>
                <span className="font-medium">{category.name}</span>
                {category.is_default && <Badge variant="secondary">Default</Badge>}
                {!isArchived && categoryUsage[category.name] > 0 && (
                  <Badge variant="outline">{categoryUsage[category.name]} expenses</Badge>
                )}
              </>
            )}
          </div>
          
          {editingCategory !== category.id && (
            <div className="flex items-center gap-1">
              {!isArchived ? (
                <>
                  {!category.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {!category.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteOrArchive(category)}
                    >
                      {categoryUsage[category.name] > 0 ? (
                        <Archive className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => unarchiveMutation.mutate(category.id)}
                >
                  <ArchiveRestore className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Expense Categories
          </CardTitle>
          <CardDescription>
            Manage your expense categories. Categories with associated expenses will be archived instead of deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="active">
                  Active ({activeCategories.length})
                </TabsTrigger>
                <TabsTrigger value="archived">
                  Archived ({archivedCategories.length})
                </TabsTrigger>
              </TabsList>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
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
                        if (e.key === "Enter" && newCategoryName.trim()) {
                          createMutation.mutate(newCategoryName.trim());
                        }
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => createMutation.mutate(newCategoryName.trim())}
                        disabled={!newCategoryName.trim() || createMutation.isPending}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="active" className="space-y-4">
              {activeCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active categories found. Add one to get started.
                </div>
              ) : (
                <div className="grid gap-3">
                  {activeCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived" className="space-y-4">
              {archivedCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No archived categories found.
                </div>
              ) : (
                <div className="grid gap-3">
                  {archivedCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} isArchived />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (categoryToDelete) {
                  deleteMutation.mutate(categoryToDelete.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}