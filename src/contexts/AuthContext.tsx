
import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionCheck } from '@/hooks/useSessionCheck';
import { useClientImpersonation } from '@/hooks/useClientImpersonation';
import { login as authLogin, logout as authLogout } from '@/utils/authUtils';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useSessionCheck();
  const { 
    impersonatedClient, 
    startImpersonation, 
    endImpersonation 
  } = useClientImpersonation();

  const isImpersonating = !!impersonatedClient;
  const isAdmin = currentUser?.tipo?.toLowerCase() === 'admin';
  const isClient = currentUser?.tipo?.toLowerCase() === 'client' || 
                  currentUser?.tipo?.toLowerCase() === 'cliente';

  const login = async (email: string, password: string) => {
    const { error } = await authLogin(email, password);
    if (error) throw error;
  };

  const logout = async () => {
    await authLogout();
    navigate("/login");
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
