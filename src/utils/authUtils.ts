
import { supabase } from '@/integrations/supabase/client';

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message === "Email not confirmed") {
        console.warn("Email not confirmed, but attempting to continue...");
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          return { user: sessionData.session.user, error: null };
        }
      }
      throw error;
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    return { user: null, error };
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem("sintonia:userType");
    localStorage.removeItem("sintonia:currentCliente");
    sessionStorage.removeItem('impersonatedClientId');
    sessionStorage.removeItem('impersonatedClientName');
    return { error: null };
  } catch (error) {
    console.error("Logout error:", error);
    return { error };
  }
};
