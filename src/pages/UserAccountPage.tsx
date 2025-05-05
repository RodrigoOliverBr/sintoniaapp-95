import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { handleSupabaseError } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SimpleLayout from '@/components/SimpleLayout';

interface UserProfile {
  nome?: string;
  email?: string;
  telefone?: string;  // Add this field to match usage
}

const UserAccountPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast: legacyToast } = useToast();

  useEffect(() => {
    const fetchUserSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        setUser(data.session.user);
        fetchUserProfile(data.session.user.id);
      } else {
        // Redirect to login or handle not authenticated
        window.location.href = '/login';
      }
    };
    
    fetchUserSession();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('nome, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        legacyToast({
          variant: "destructive",
          title: "Erro!",
          description: handleSupabaseError(error),
        });
      } else {
        // Add telefone property with default value
        setUserProfile({
          ...data,
          telefone: data.telefone || ''
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      legacyToast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível carregar o perfil do usuário.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!user) {
        throw new Error("Usuário não autenticado.");
      }

      const formData = new FormData(e.currentTarget);
      const nome = formData.get('nome') as string;
      const email = formData.get('email') as string;
      const telefone = formData.get('telefone') as string;

      const { error } = await supabase
        .from('perfis')
        .update({
          nome,
          email,
          telefone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        toast.error(handleSupabaseError(error) || "Erro ao atualizar perfil.");
      } else {
        setUserProfile({ nome, email, telefone });
        toast.success("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error((error as Error).message || "Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SimpleLayout title="Perfil">Carregando...</SimpleLayout>;
  }

  if (!userProfile) {
    return <SimpleLayout title="Perfil">Não foi possível carregar o perfil.</SimpleLayout>;
  }

  const telefoneDisplay = userProfile?.telefone || '-';

  return (
    <SimpleLayout title="Perfil">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Conta</CardTitle>
          <CardDescription>Atualize as informações da sua conta aqui.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleUpdateProfile} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                type="text"
                id="name"
                name="nome"
                defaultValue={userProfile.nome || ""}
                required
                className="bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                defaultValue={userProfile.email || ""}
                required
                className="bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                type="tel"
                id="telefone"
                name="telefone"
                defaultValue={telefoneDisplay}
                className="bg-white"
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </SimpleLayout>
  );
};

export default UserAccountPage;
