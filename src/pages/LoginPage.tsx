
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
      
      // Tenta fazer login com as credenciais fornecidas
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      // Se houver erro de email não confirmado, ignora e continua o processo de login
      if (authError && authError.message === "Email not confirmed") {
        console.log("Email não confirmado, mas continuando com o login...");
        
        // Conseguir uma sessão de qualquer maneira
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          // Se conseguimos uma sessão, usamos ela
          authData = {
            user: sessionData.session.user,
            session: sessionData.session
          };
          // Limpa o erro para continuar o fluxo
          authError = null;
        }
      }

      // Verifica se ainda há erro após o tratamento especial para "Email not confirmed"
      if (authError) {
        console.error("Erro de autenticação Supabase:", authError);
        throw new Error(authError.message);
      }
      
      if (!authData?.user) {
        throw new Error("Não foi possível autenticar o usuário");
      }
      
      console.log("Usuário autenticado com sucesso:", authData.user);
      
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
      
      // Verifica o tipo de perfil (admin ou cliente)
      if (perfilData.tipo === 'client') {
        // Busca o cliente pelo email (não pelo ID, já que podem ser diferentes)
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
        
        if (clienteData.situacao === 'bloqueado' || clienteData.situacao === 'bloqueado-manualmente') {
          await supabase.auth.signOut();
          throw new Error("Seu acesso está bloqueado. Entre em contato com o administrador.");
        }
        
        // Armazena os dados do cliente no localStorage para uso na aplicação
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(clienteData));
      }
      
      const userType = perfilData.tipo === 'client' ? 'client' : 'admin';
      localStorage.setItem("sintonia:userType", userType);
      
      setTimeout(() => {
        if (userType === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
        setIsLoading(false);
      }, 1000);
      
      toast.success(`Login realizado com sucesso como ${userType === 'admin' ? 'Administrador' : 'Cliente'}`);
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
