import { supabase } from "./client";

export interface UserSectionOrder {
  id: string;
  user_id: string;
  report_type: string;
  section_key: string;
  sort_order: number;
  section_type: 'standard' | 'custom';
  created_at: string;
  updated_at: string;
}

export async function getUserSectionOrder(
  userId: string, 
  reportType: string
): Promise<UserSectionOrder[]> {
  const { data, error } = await supabase
    .from('user_section_order')
    .select('*')
    .eq('user_id', userId)
    .eq('report_type', reportType)
    .order('sort_order');

  if (error) {
    console.error('Error fetching user section order:', error);
    throw error;
  }

  return data || [];
}

export async function updateUserSectionOrder(
  userId: string,
  reportType: string,
  sections: Array<{key: string, type: 'standard' | 'custom', sortOrder: number}>
): Promise<void> {
  // First, delete existing orders for this user and report type
  const { error: deleteError } = await supabase
    .from('user_section_order')
    .delete()
    .eq('user_id', userId)
    .eq('report_type', reportType);

  if (deleteError) {
    console.error('Error deleting existing section order:', deleteError);
    throw deleteError;
  }

  // Then insert new orders
  const newOrders = sections.map(section => ({
    user_id: userId,
    report_type: reportType,
    section_key: section.key,
    sort_order: section.sortOrder,
    section_type: section.type
  }));

  const { error: insertError } = await supabase
    .from('user_section_order')
    .insert(newOrders);

  if (insertError) {
    console.error('Error inserting new section order:', insertError);
    throw insertError;
  }
}