
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
  
  useEffect(() => {
    const userType = localStorage.getItem("sintonia:userType");
    if (userType) {
      if (userType === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Tentando login com:", email);
      
      // Attempt login with provided credentials
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      // Handle special case for unconfirmed emails but continue login process
      if (authError && authError.message === "Email not confirmed") {
        console.log("Email não confirmado, mas continuando com o login...");
        
        // Try to get a session anyway
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          // If we got a session, use it
          authData = {
            user: sessionData.session.user,
            session: sessionData.session
          };
          // Clear the error to continue the flow
          authError = null;
        }
      }

      // Check if there's still an error after the special treatment
      if (authError) {
        console.error("Erro de autenticação Supabase:", authError);
        throw new Error(authError.message);
      }
      
      if (!authData?.user) {
        throw new Error("Não foi possível autenticar o usuário");
      }
      
      console.log("Usuário autenticado com sucesso:", authData.user);
      
      // Get user profile to determine their type (admin or client)
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
        throw new Error("Perfil de usuário não encontrado. Verifique se seu cadastro está completo.");
      }
      
      // Explicit verification of user type for correct redirection
      const userType = perfilData.tipo.toLowerCase();
      
      if (userType === 'client') {
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
        
        // Store client data and user type in localStorage for use in the application
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(clienteData));
        localStorage.setItem("sintonia:userType", "client");
        
        // Redirect clients to the client home page
        setTimeout(() => {
          navigate("/");
          setIsLoading(false);
        }, 1000);
        
        toast.success("Login realizado com sucesso como Cliente");
      } else if (userType === 'admin') {
        // For admin users, store the type and redirect to admin dashboard
        localStorage.setItem("sintonia:userType", "admin");
        
        setTimeout(() => {
          navigate("/admin/dashboard");
          setIsLoading(false);
        }, 1000);
        
        toast.success("Login realizado com sucesso como Administrador");
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
