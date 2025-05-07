
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Cleanup auth state - helper function
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove sintonia specific items
    localStorage.removeItem("sintonia:userType");
    localStorage.removeItem("sintonia:currentCliente");
    localStorage.removeItem("sintonia:currentUser");
  };
  
  // Verificar se já existe uma sessão ativa
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Sessão existente encontrada:", session.user.id);
        // Verificar o tipo de usuário para redirecionar
        const { data: perfilData } = await supabase
          .from('perfis')
          .select('tipo')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (perfilData) {
          localStorage.setItem("sintonia:userType", perfilData.tipo.toLowerCase());
          
          if (perfilData.tipo.toLowerCase() === 'admin') {
            navigate('/admin/dashboard');
          } else {
            // Buscar dados do cliente
            const { data: clienteData } = await supabase
              .from('clientes_sistema')
              .select('*')
              .eq('email', session.user.email)
              .maybeSingle();
              
            if (clienteData) {
              localStorage.setItem("sintonia:currentCliente", JSON.stringify(clienteData));
            }
            
            navigate('/');
          }
        }
      }
    };
    
    checkExistingSession();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Clear any existing auth state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if sign out fails
        console.log("Sign out before login failed:", err);
      }
      
      console.log("Tentando login com:", email);
      
      // Fazer login com as credenciais fornecidas
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (authError) {
        console.error("Erro de autenticação Supabase:", authError);
        throw new Error(authError.message);
      }
      
      if (!authData?.user) {
        throw new Error("Não foi possível autenticar o usuário");
      }
      
      console.log("Usuário autenticado com sucesso:", authData.user);
      console.log("Sessão completa:", authData.session);
      
      // Buscar o perfil do usuário para confirmar seu tipo (admin ou client)
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (perfilError) {
        console.error("Erro ao obter perfil:", perfilError);
        await supabase.auth.signOut();
        throw new Error("Erro ao buscar perfil de usuário");
      }
      
      console.log("Perfil encontrado:", perfilData);
      
      if (!perfilData) {
        await supabase.auth.signOut();
        throw new Error("Seu perfil não foi encontrado no sistema. Por favor, contate o suporte.");
      }
      
      // Normalizar o tipo de usuário (garantindo case-insensitive)
      const userType = perfilData.tipo?.toLowerCase();
      console.log("Tipo de usuário normalizado:", userType);
      
      if (!userType || (userType !== 'admin' && userType !== 'client')) {
        console.error("Tipo de usuário inválido:", userType);
        await supabase.auth.signOut();
        throw new Error("Tipo de usuário inválido. Por favor, contate o suporte.");
      }
      
      // Definir tipo de usuário no local storage
      localStorage.setItem("sintonia:userType", userType);
      localStorage.setItem("sintonia:currentUser", JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        tipo: userType,
        nome: perfilData.nome
      }));
      
      if (userType === 'client') {
        // Se for cliente, verificar status
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes_sistema')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        console.log("Dados do cliente:", clienteData);
        
        if (clienteError) {
          console.error("Erro ao buscar dados do cliente:", clienteError);
          await supabase.auth.signOut();
          throw new Error("Erro ao verificar status do cliente");
        }
        
        if (!clienteData) {
          await supabase.auth.signOut();
          throw new Error("Dados do cliente não encontrados. Verifique se o email está correto.");
        }
        
        // Array com status permitidos para login
        const statusPermitidos = ['liberado', 'ativo'];
        console.log("Status do cliente:", clienteData.situacao);
        console.log("Status permitidos:", statusPermitidos);
        console.log("Cliente pode logar?", statusPermitidos.includes(clienteData.situacao));
        
        if (!statusPermitidos.includes(clienteData.situacao)) {
          await supabase.auth.signOut();
          throw new Error(`Seu acesso está ${clienteData.situacao}. Entre em contato com o administrador.`);
        }
        
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(clienteData));
      }
      
      toast.success(`Login realizado com sucesso como ${userType === 'admin' ? 'Administrador' : 'Cliente'}`);
      
      // Force full page reload instead of React navigation to ensure clean state
      setTimeout(() => {
        if (userType === 'admin') {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/";
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Erro no processo de login:", error);
      toast.error(error.message || "Credenciais inválidas");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">SintoniaApp</CardTitle>
          <CardDescription className="text-center">
            Entre com seu email e senha para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground text-center">
          <p>
            Sistema de Gestão de Saúde Mental Ocupacional
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
