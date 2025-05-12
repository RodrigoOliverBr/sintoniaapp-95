import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone?: string; // Make telefone optional
}

const UserAccountPage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "",
    nome: "",
    email: "",
    telefone: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Buscar os dados do usuário autenticado
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Buscar dados adicionais do perfil
          const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Erro ao buscar perfil:', error);
          } else if (data) {
            // Atualizar o estado com os dados do perfil, garantindo que telefone exista
            setUserProfile({
              id: data.id || "",
              nome: data.nome || "",
              email: data.email || "",
              telefone: data.telefone || "" // Handle possibly missing telefone property
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          nome: userProfile.nome,
          telefone: userProfile.telefone || null // Use null if telefone is empty
        })
        .eq('id', userProfile.id);
        
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil');
      } else {
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      toast.error('Erro ao processar atualização');
    }
  };

  return (
    <Layout title="Minha Conta">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        {isLoading ? (
          <p>Carregando dados...</p>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
            <div>
              <Label htmlFor="nome" className="block text-sm font-medium mb-1">Nome</Label>
              <Input
                id="nome"
                type="text"
                value={userProfile.nome}
                onChange={(e) => setUserProfile({...userProfile, nome: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="block text-sm font-medium mb-1">Email</Label>
              <Input
                id="email"
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                className="w-full p-2 border rounded-md"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>
            
            <div>
              <Label htmlFor="telefone" className="block text-sm font-medium mb-1">Telefone</Label>
              <Input
                id="telefone"
                type="text"
                value={userProfile.telefone || ""}
                onChange={(e) => setUserProfile({...userProfile, telefone: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <Button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Salvar Alterações
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default UserAccountPage;
