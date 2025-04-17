
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Limpar todos os dados de sessão e impersonamento
    localStorage.removeItem("sintonia:userType");
    localStorage.removeItem("sintonia:currentCliente");
    sessionStorage.removeItem('impersonatedClientId');
    sessionStorage.removeItem('impersonatedClientName');
    
    toast.success("Logout realizado com sucesso");
    
    // Forçar redirecionamento para a página de login após o logout
    window.location.href = "/login";
    
    return { error: null };
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Erro ao fazer logout");
    return { error };
  }
};
