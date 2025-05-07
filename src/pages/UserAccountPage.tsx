import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserAccountPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        setUser(session.user);
        
        const { data, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        setProfile(data);
        
        // Only update form data if profile exists
        if (data) {
          setFormData({
            nome: data.nome || "",
            email: data.email || "",
            telefone: data.telefone || "",
          });
        }
      } catch (error) {
        console.error("Error in getProfile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
  }, [navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Update profile in the database
      const { error: profileError } = await supabase
        .from('perfis')
        .update({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
        })
        .eq('id', user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Update email in auth if it has changed
      if (formData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        
        if (authError) {
          throw authError;
        }
      }
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      
      if (error) {
        throw error;
      }
      
      toast.success("E-mail de redefinição de senha enviado!");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(`Erro ao solicitar redefinição de senha: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout title="Minha Conta">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Minha Conta">
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e configurações da conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seuemail@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(XX) XXXX-XXXX"
                />
              </div>
              <Button type="submit">
                Atualizar Perfil
              </Button>
            </form>
            
            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Redefinir Senha</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Clique no botão abaixo para receber um e-mail com instruções
                para redefinir sua senha.
              </p>
              <Button variant="outline" onClick={handlePasswordReset}>
                Redefinir Senha
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserAccountPage;
