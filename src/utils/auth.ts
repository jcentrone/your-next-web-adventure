import { supabase } from "@/integrations/supabase/client";

export const sendMagicLink = async (email: string) => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `https://homereportpro.com/auth/confirm`,
      },
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://homereportpro.com/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const requestEmailChange = async (newEmail: string) => {
  try {
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      {
        emailRedirectTo: `https://homereportpro.com/auth/confirm?type=email_change`,
      }
    );

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};