
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; // Using Loader2 from lucide-react as alternative

interface Perfil {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo: string;
  created_at: string;
  updated_at: string;
  // Adicione outros campos conforme necessário
}

const UserAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        setUser(session.user);
        await fetchPerfil(session.user.email);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const fetchPerfil = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        toast.error('Erro ao carregar informações do perfil.');
      }

      if (data) {
        setPerfil(data as Perfil);
        setNome(data.nome);
        setTelefone(data.telefone || '');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast.error('Erro ao carregar informações do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarClick = () => {
    setIsEditing(true);
  };

  const handleSalvarClick = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ nome, telefone })
        .eq('id', perfil?.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar informações do perfil.');
        return;
      }

      // Atualiza o estado local com os novos dados
      setPerfil({
        ...perfil!,
        nome,
        telefone
      });
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar informações do perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Redirecionando para login...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Minha Conta</CardTitle>
          <CardDescription>Gerencie suas informações de perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                {isEditing ? (
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                ) : (
                  <Input id="nome" value={perfil?.nome || ''} readOnly />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                {isEditing ? (
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                ) : (
                  <Input id="telefone" value={perfil?.telefone || 'Não informado'} readOnly />
                )}
              </div>
              <div className="flex justify-end">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading} className="mr-2">
                      Cancelar
                    </Button>
                    <Button onClick={handleSalvarClick} disabled={loading}>
                      Salvar
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEditarClick} disabled={loading}>
                    Editar Perfil
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccountPage;
