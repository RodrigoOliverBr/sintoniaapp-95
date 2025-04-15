
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
  
  // Verificar se já está autenticado ao carregar
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
      // Log para debug
      console.log("Tentando login com:", email);
      
      // Tentar autenticar com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (authError) {
        console.error("Erro de autenticação Supabase:", authError);
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error("Não foi possível autenticar o usuário");
      }
      
      console.log("Usuário autenticado com sucesso:", authData.user);
      
      // Buscar perfil do usuário para verificar o tipo
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (perfilError) {
        console.error("Erro ao obter perfil:", perfilError);
        await supabase.auth.signOut(); // Deslogar em caso de erro
        throw new Error("Erro ao buscar perfil de usuário");
      }
      
      console.log("Perfil encontrado:", perfilData);
      
      // Verificar se o perfil existe
      if (!perfilData) {
        await supabase.auth.signOut();
        throw new Error("Perfil de usuário não encontrado. Verifique se seu cadastro está completo.");
      }
      
      // Verificar situação do cliente para usuários tipo cliente
      if (perfilData.tipo === 'cliente') {
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes_sistema')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        if (clienteError) {
          console.error("Erro ao buscar dados do cliente:", clienteError);
          await supabase.auth.signOut();
          throw new Error("Erro ao verificar status do cliente");
        }
        
        if (!clienteData) {
          await supabase.auth.signOut();
          throw new Error("Dados do cliente não encontrados");
        }
        
        if (clienteData.situacao === 'bloqueado') {
          await supabase.auth.signOut();
          throw new Error("Seu acesso está bloqueado. Entre em contato com o administrador.");
        }
        
        // Salvar dados do cliente no localStorage
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(clienteData));
      }
      
      // Salvar dados de sessão
      const userType = perfilData.tipo;
      localStorage.setItem("sintonia:userType", userType);
      
      // Redirecionar com base no tipo de usuário
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

  // Função auxiliar para preencher credenciais de teste
  const preencherCredenciais = (tipo: 'admin' | 'cliente') => {
    if (tipo === 'admin') {
      setEmail("admin@prolife.com");
      setPassword("admin123");
    } else {
      setEmail("client@empresa.com");
      setPassword("client123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/5fbfce9a-dae3-444b-99c8-9b92040ef7e2.png" 
              alt="Sintonia Logo" 
              className="h-16" 
            />
          </div>
          <h1 className="text-3xl font-bold text-esocial-darkGray">Sintonia</h1>
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
              <div className="text-sm text-muted-foreground pt-2">
                <p className="font-semibold mb-1">Credenciais para teste:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs justify-start"
                    onClick={() => preencherCredenciais('admin')}
                  >
                    Admin: admin@prolife.com
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs justify-start"
                    onClick={() => preencherCredenciais('cliente')}
                  >
                    Cliente: client@empresa.com
                  </Button>
                </div>
                <p className="text-xs mt-1 text-center">(Clique nas opções acima para preencher os campos)</p>
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
