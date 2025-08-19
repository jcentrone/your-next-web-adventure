import { supabase } from './client';
import type { Contact, Appointment, Task, Activity } from '@/lib/crmSchemas';

// Contacts API
export const contactsApi = {
  async list(userId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    return data as Contact[];
  },

  async get(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Contact;
  },

  async create(contact: any): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();
    
    if (error) throw error;
    return data as Contact;
  },

  async update(id: string, updates: Partial<Contact>): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Contact;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async search(userId: string, query: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    return data as Contact[];
  }
};

// Appointments API
export const appointmentsApi = {
  async list(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(first_name, last_name, email, phone),
        report:reports(title, status)
      `)
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return data as Appointment[];
  },

  async get(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(*),
        report:reports(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Appointment;
  },

  async create(appointment: any): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
    
    if (error) throw error;
    return data as Appointment;
  },

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Appointment;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getUpcoming(userId: string, limit: number = 5): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(first_name, last_name, email, phone)
      `)
      .eq('user_id', userId)
      .gte('appointment_date', new Date().toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .order('appointment_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data as Appointment[];
  },

  async getByContactId(contactId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('contact_id', contactId)
      .order('appointment_date', { ascending: false });

    if (error) throw error;
    return data as Appointment[];
  }
};

// Tasks API
export const tasksApi = {
  async list(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contacts(first_name, last_name),
        appointments(title, appointment_date),
        reports(title, status)
      `)
      .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    return data as Task[];
  },

  async get(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contact:contacts(*),
        appointment:appointments(*),
        report:reports(*),
        assigned_user:profiles!tasks_assigned_to_fkey(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Task;
  },

  async create(task: any): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data as Task;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Task;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getOverdue(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contact:contacts(first_name, last_name)
      `)
      .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
      .neq('status', 'completed')
      .neq('status', 'cancelled')
      .lt('due_date', new Date().toISOString())
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data as Task[];
  },

  async getByContactId(contactId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Task[];
  }
};

// Activities API
export const activitiesApi = {
  async list(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        contact:contacts(first_name, last_name),
        appointment:appointments(title),
        report:reports(title),
        task:tasks(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data as Activity[];
  },

  async create(activity: any): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    
    if (error) throw error;
    return data as Activity;
  },

  async getForContact(contactId: string, limit: number = 10): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Activity[];
  },

  async trackActivity(params: {
    userId: string;
    activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task_completed' | 'appointment_created' | 'report_delivered' | 'report_created' | 'contact_created';
    title: string;
    description?: string;
    contact_id?: string;
    appointment_id?: string;
    report_id?: string;
    task_id?: string;
    organization_id?: string;
  }): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: params.userId,
        activity_type: params.activity_type,
        title: params.title,
        description: params.description,
        contact_id: params.contact_id,
        appointment_id: params.appointment_id,
        report_id: params.report_id,
        task_id: params.task_id,
        organization_id: params.organization_id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Activity;
  }
};

// Contact Relationships API
export const contactRelationshipsApi = {
  async create(data: {
    from_contact_id: string;
    to_contact_id: string;
    relationship_type: string;
    custom_relationship_label?: string;
    notes?: string;
  }): Promise<any> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from('contact_relationships')
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async getByContactId(contactId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('contact_relationships')
      .select(`
        *,
        from_contact:contacts!contact_relationships_from_contact_id_fkey(id, first_name, last_name, contact_type),
        to_contact:contacts!contact_relationships_to_contact_id_fkey(id, first_name, last_name, contact_type)
      `)
      .or(`from_contact_id.eq.${contactId},to_contact_id.eq.${contactId}`)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contact_relationships')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const crmApi = {
  contacts: contactsApi,
  appointments: appointmentsApi,
  tasks: tasksApi,
  activities: activitiesApi,
  contactRelationships: contactRelationshipsApi,
};