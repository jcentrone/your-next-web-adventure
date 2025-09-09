import { supabase } from "./client";
import type { Account, CreateAccount, UpdateAccount } from "@/lib/accountSchemas";

export const accountsApi = {
  async list(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, tags')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data as Account[];
  },

  async get(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, tags')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Account;
  },

  async create(account: CreateAccount): Promise<Account> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const accountData = {
      name: account.name,
      type: account.type,
      industry: account.industry,
      website: account.website,
      phone: account.phone,
      email: account.email,
      address: account.address,
      city: account.city,
      state: account.state,
      zip_code: account.zip_code,
      notes: account.notes,
      annual_revenue: account.annual_revenue,
      employee_count: account.employee_count,
      tags: account.tags,
      user_id: user.user.id,
    };

    const { data, error } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single();
    
    if (error) throw error;
    return data as Account;
  },

  async update(id: string, updates: UpdateAccount): Promise<Account> {
    const updateData = {
      ...updates,
      tags: updates.tags,
    };

    const { data, error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Account;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  async search(userId: string, query: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, tags')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,website.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data as Account[];
  },

  async getContacts(accountId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_active', true)
      .order('first_name');

    if (error) throw error;
    return data;
  },
};
