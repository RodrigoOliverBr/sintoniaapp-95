
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContextType, UserProfile, ClienteSistema } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [impersonatedClient, setImpersonatedClient] = useState<ClienteSistema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is impersonating a client
  const isImpersonating = !!impersonatedClient;
  
  // Determine user type
  const isAdmin = currentUser?.tipo?.toLowerCase() === 'admin';
  const isClient = currentUser?.tipo?.toLowerCase() === 'client' || 
                  currentUser?.tipo?.toLowerCase() === 'cliente';

  useEffect(() => {
    checkCurrentSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          await fetchUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setImpersonatedClient(null);
        localStorage.removeItem("sintonia:userType");
        localStorage.removeItem("sintonia:currentCliente");
        sessionStorage.removeItem('impersonatedClientId');
        sessionStorage.removeItem('impersonatedClientName');
      }
    });

    // Check for impersonation on initial load
    const impersonatedId = sessionStorage.getItem('impersonatedClientId');
    if (impersonatedId) {
      fetchImpersonatedClient(impersonatedId);
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentUser(data as UserProfile);
        localStorage.setItem("sintonia:userType", data.tipo.toLowerCase() === 'admin' ? 'admin' : 'client');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImpersonatedClient = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;

      if (data) {
        setImpersonatedClient(data as ClienteSistema);
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching impersonated client:', error);
      sessionStorage.removeItem('impersonatedClientId');
      sessionStorage.removeItem('impersonatedClientName');
    }
  };

  const checkCurrentSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await fetchUserProfile(session.user.id);
        
        // Check if user is impersonating
        const impersonatedId = sessionStorage.getItem('impersonatedClientId');
        if (impersonatedId) {
          await fetchImpersonatedClient(impersonatedId);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Handle special case for unconfirmed emails
        if (error.message === "Email not confirmed") {
          toast.warning("Email não confirmado, mas tentando continuar...");
          
          // Try to get session anyway
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            await fetchUserProfile(sessionData.session.user.id);
            return;
          }
        }
        
        throw error;
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("sintonia:userType");
      localStorage.removeItem("sintonia:currentCliente");
      sessionStorage.removeItem('impersonatedClientId');
      sessionStorage.removeItem('impersonatedClientName');
      setCurrentUser(null);
      setImpersonatedClient(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startImpersonation = (client: ClienteSistema) => {
    sessionStorage.setItem('impersonatedClientId', client.id);
    sessionStorage.setItem('impersonatedClientName', client.razaoSocial);
    setImpersonatedClient(client);
    toast.success(`Acessando como cliente: ${client.razaoSocial}`);
    navigate('/');
  };

  const endImpersonation = () => {
    sessionStorage.removeItem('impersonatedClientId');
    sessionStorage.removeItem('impersonatedClientName');
    localStorage.removeItem("sintonia:currentCliente");
    setImpersonatedClient(null);
    toast.info("Modo de acesso como cliente encerrado");
    navigate('/admin/clientes');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      impersonatedClient,
      isImpersonating,
      isAdmin,
      isClient,
      login,
      logout,
      endImpersonation,
      startImpersonation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
