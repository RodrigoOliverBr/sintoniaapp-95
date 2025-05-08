
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  userType: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Don't make Supabase calls directly in the callback
        // Use setTimeout to avoid potential deadlocks
        if (newSession?.user) {
          setTimeout(() => {
            const storedUserType = localStorage.getItem("sintonia:userType");
            setUserType(storedUserType);
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      const storedUserType = localStorage.getItem("sintonia:userType");
      setUserType(storedUserType);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing auth state
      localStorage.removeItem("sintonia:userType");
      localStorage.removeItem("sintonia:currentCliente");
      
      // Clean Supabase auth tokens
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out first to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error("Failed to authenticate user");
      }
      
      // Get user profile to confirm type (admin or client)
      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('tipo')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (profileError) {
        await supabase.auth.signOut();
        throw new Error("Error fetching user profile");
      }
      
      if (!profileData) {
        await supabase.auth.signOut();
        throw new Error("Your profile was not found in the system. Please contact support.");
      }
      
      const userType = profileData.tipo?.toLowerCase();
      localStorage.setItem("sintonia:userType", userType);
      setUserType(userType);
      
      toast.success(`Login successful as ${userType === 'admin' ? 'Administrator' : 'Client'}`);
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clean local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clean cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setSession(null);
      setUserType(null);
      
      // Force navigation to login
      window.location.href = "/login";
    } catch (error: any) {
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, userType }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
