
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
    // Verificar se o usuário já está logado e redirecionar de acordo com o tipo
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Buscar o perfil do usuário para determinar o tipo
          const { data: perfilData, error: perfilError } = await supabase
            .from('perfis')
            .select('tipo')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (perfilError) {
            console.error("Erro ao verificar tipo de usuário:", perfilError);
            return;
          }
          
          const userType = perfilData?.tipo?.toLowerCase();
          console.log("Usuário já autenticado. Tipo:", userType);
          
          if (userType === 'admin') {
            navigate("/admin/dashboard");
          } else if (userType === 'client') {
            navigate("/");
          } else {
            console.warn("Tipo de usuário não reconhecido:", userType);
            localStorage.removeItem("sintonia:userType"); // Limpa o cache caso exista
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
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
      
      // Definir tipo de usuário no local storage
      localStorage.setItem("sintonia:userType", userType === 'admin' ? 'admin' : 'client');
      
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
        
        if (clienteData.situacao !== 'liberado') {
          await supabase.auth.signOut();
          throw new Error(`Seu acesso está ${clienteData.situacao}. Entre em contato com o administrador.`);
        }
        
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(clienteData));
      }
      
      toast.success(`Login realizado com sucesso como ${userType === 'admin' ? 'Administrador' : 'Cliente'}`);
      
      // Redirecionar com pequeno delay para garantir que o toast seja exibido
      setTimeout(() => {
        if (userType === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
        setIsLoading(false);
      }, 1000);
      
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
