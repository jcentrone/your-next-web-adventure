import { supabase } from "./client";

export interface ExpenseCategory {
  id: string;
  name: string;
  user_id: string;
  organization_id?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const expenseCategoriesApi = {
  async listExpenseCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async createExpenseCategory(payload: { name: string; organization_id?: string }): Promise<ExpenseCategory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("expense_categories")
      .insert({
        name: payload.name,
        user_id: user.id,
        organization_id: payload.organization_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpenseCategory(id: string, payload: { name: string }): Promise<ExpenseCategory> {
    const { data, error } = await supabase
      .from("expense_categories")
      .update({ name: payload.name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpenseCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from("expense_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};