import { supabase } from './client';

export interface Service {
  id?: string;
  user_id: string;
  name: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export const servicesApi = {
  async list(userId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data as Service[]) || [];
  },

  async create(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  },

  async update(id: string, updates: Partial<Omit<Service, 'id' | 'user_id'>>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export default servicesApi;
