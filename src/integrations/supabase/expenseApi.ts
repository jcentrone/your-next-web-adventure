import { supabase } from './client';

export interface Expense {
  id: string;
  user_id: string;
  organization_id: string;
  expense_date: string;
  category?: string;
  description?: string;
  amount: number;
  receipt_url?: string;
  created_at: string;
}

export const expenseApi = {
  async listExpenses({
    search,
    category,
    sortBy = 'expense_date',
    sortDir = 'desc',
    startDate,
    endDate,
  }: {
    search?: string;
    category?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  } = {}): Promise<Expense[]> {
    try {
      let query = supabase.from('expenses').select('*');

      if (search) {
        query = query.ilike('description', `%${search}%`);
      }
      if (category) {
        query = query.eq('category', category);
      }
      if (startDate) {
        query = query.gte('expense_date', startDate);
      }
      if (endDate) {
        query = query.lte('expense_date', endDate);
      }

      query = query.order(sortBy, { ascending: sortDir === 'asc' });

      const { data, error } = await query;
      if (error) {
        console.error('Error listing expenses:', error);
        throw new Error(`Failed to fetch expenses: ${error.message}`);
      }

      return (data as Expense[]) || [];
    } catch (error) {
      console.error('Unexpected error in listExpenses:', error);
      throw error;
    }
  },

  async createExpense(payload: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw new Error(`Failed to create expense: ${error.message}`);
    }

    return data as Expense;
  },

  async updateExpense(id: string, payload: Partial<Omit<Expense, 'id' | 'created_at'>>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    return data as Expense;
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  },

  async getExpenseAnalytics(startDate: string, endDate: string): Promise<{
    totalAmount: number;
    totalCount: number;
    categoryTotals: { category: string; amount: number }[];
    monthlyData: { month: string; amount: number }[];
  }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, category, expense_date')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date');

    if (error) {
      console.error('Error fetching expense analytics:', error);
      throw new Error(`Failed to fetch expense analytics: ${error.message}`);
    }

    const expenses = (data as Pick<Expense, 'amount' | 'category' | 'expense_date'>[]) || [];
    const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalCount = expenses.length;

    const categoryMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const category = exp.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + exp.amount);
    });
    const categoryTotals = Array.from(categoryMap.entries()).map(([category, amount]) => ({ category, amount }));

    const monthlyMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const month = new Date(exp.expense_date).toISOString().slice(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + exp.amount);
    });
    const monthlyData = Array.from(monthlyMap.entries()).map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      amount,
    }));

    return { totalAmount, totalCount, categoryTotals, monthlyData };
  },
};
