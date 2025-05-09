
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClientePerfil } from '@/types/cliente';
import Layout from '@/components/Layout';
import { toast } from "sonner";

const UserAccountPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<ClientePerfil>({
    id: '',
    nome: '',
    email: '',
    telefone: ''
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Buscar perfil do usuário
          const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Erro ao buscar perfil:', error);
          } else if (data) {
            // Atualizar o estado com os dados do perfil
            setUserProfile({
              id: data.id || "",
              nome: data.nome || "",
              email: data.email || "",
              telefone: data.telefone || ""
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          nome: userProfile.nome,
          telefone: userProfile.telefone
        })
        .eq('id', userProfile.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error("Erro ao atualizar perfil");
    }
  };
  
  return (
    <Layout title="Minha Conta">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium mb-1">Nome</label>
              <input
                id="nome"
                type="text"
                value={userProfile.nome}
                onChange={(e) => setUserProfile({...userProfile, nome: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
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
              <label htmlFor="telefone" className="block text-sm font-medium mb-1">Telefone</label>
              <input
                id="telefone"
                type="text"
                value={userProfile.telefone || ""}
                onChange={(e) => setUserProfile({...userProfile, telefone: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Salvar Alterações
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default UserAccountPage;
