
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
  
  // Effect to check if user is already logged in
  useEffect(() => {
    const checkCurrentSession = async () => {
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Clear any existing userType to avoid conflicts
        localStorage.removeItem("sintonia:userType");
        
        // Get actual user type from the database to verify
        const { data: profileData, error: profileError } = await supabase
          .from('perfis')
          .select('tipo')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          await supabase.auth.signOut();
          localStorage.clear();
          return;
        }
        
        if (profileData) {
          const userType = profileData.tipo.toLowerCase();
          
          if (userType === 'admin') {
            localStorage.setItem("sintonia:userType", "admin");
            navigate("/admin/dashboard");
          } else {
            localStorage.setItem("sintonia:userType", "client");
            navigate("/");
          }
        } else {
          // No profile found - unexpected state
          await supabase.auth.signOut();
          localStorage.clear();
          toast.error("Perfil de usuário não encontrado. Entre em contato com o suporte.");
        }
      }
    };
    
    checkCurrentSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Tentando login com:", email);
      
      // Attempt login with provided credentials
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      // Handle error cases first
      if (authError) {
        // Special case for unconfirmed emails - we'll attempt to continue
        if (authError.message === "Email not confirmed") {
          console.log("Email não confirmado, mas continuando com o login...");
          
          // Let's see if we can get a session anyway
          const { data: sessionData } = await supabase.auth.getSession();
          
          // If no session despite the email not being confirmed, throw the original error
          if (!sessionData.session) {
            throw new Error(authError.message);
          }
          
          // If we have a session, we'll use it to continue with the login flow
          console.log("Sessão recuperada apesar do email não confirmado");
        } else {
          // For other auth errors, just throw
          console.error("Erro de autenticação:", authError);
          throw new Error(authError.message);
        }
      }
      
      // Get the current session (either from successful login or from the special case above)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Não foi possível estabelecer uma sessão de usuário");
      }
      
      console.log("Usuário autenticado com sucesso:", session.user);
      
      // Get user profile to determine their type
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (perfilError) {
        console.error("Erro ao obter perfil:", perfilError);
        await supabase.auth.signOut();
        throw new Error("Erro ao buscar perfil de usuário");
      }
      
      if (!perfilData) {
        await supabase.auth.signOut();
        throw new Error("Perfil de usuário não encontrado. Verifique se seu cadastro está completo.");
      }
      
      console.log("Perfil encontrado:", perfilData);
      
      // Determine user type from profile data
      const userType = perfilData.tipo.toLowerCase();
      console.log("Tipo de usuário detectado:", userType);
      
      // Clear any existing userType to avoid conflicts
      localStorage.removeItem("sintonia:userType");
      
      if (userType === 'client' || userType === 'cliente') {
        // For client users, verify their status in the clientes_sistema table
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes_sistema')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        console.log("Dados do cliente:", clienteData, "Erro:", clienteError);
        
        if (clienteError) {
          console.error("Erro ao buscar dados do cliente:", clienteError);
          await supabase.auth.signOut();
          throw new Error("Erro ao verificar status do cliente");
        }
        
        if (!clienteData) {
          console.error("Cliente não encontrado para o email:", email);
          await supabase.auth.signOut();
          throw new Error("Dados do cliente não encontrados. Email: " + email);
        }
        
        // Check if client is allowed to access the system
        if (clienteData.situacao !== 'liberado' && clienteData.situacao !== 'ativo') {
          await supabase.auth.signOut();
          throw new Error("Acesso indisponível. Entre em contato com o time de suporte do aplicativo Sintonia.");
        }
        
        // Store client data and user type in localStorage
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(clienteData));
        localStorage.setItem("sintonia:userType", "client");
        
        toast.success("Login realizado com sucesso como Cliente");
        
        // Reset loading state and navigate IMMEDIATELY
        setIsLoading(false);
        navigate("/");
      } else if (userType === 'admin') {
        // For admin users, store the type and redirect to admin dashboard
        localStorage.setItem("sintonia:userType", "admin");
        
        toast.success("Login realizado com sucesso como Administrador");
        
        // Reset loading state and navigate IMMEDIATELY
        setIsLoading(false);
        navigate("/admin/dashboard");
      } else {
        // Unknown user type
        console.error("Tipo de perfil desconhecido:", userType);
        await supabase.auth.signOut();
        throw new Error(`Tipo de usuário "${userType}" não reconhecido. Entre em contato com o suporte.`);
      }
    } catch (error: any) {
      console.error("Erro no processo de login:", error);
      toast.error(error.message || "Credenciais inválidas. Verifique seu e-mail e senha.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/5fbfce9a-dae3-444b-99c8-9b92040ef7e2.png" 
              alt="Logo" 
              className="h-16" 
            />
          </div>
          <p className="text-gray-500 mt-2">Faça login para acessar o sistema</p>
        </div>

        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Acesse o sistema com suas credenciais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Digite seu e-mail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Digite sua senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Carregando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">© 2025 eSocial Brasil. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
