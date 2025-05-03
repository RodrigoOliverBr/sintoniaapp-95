import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"
import { handleSupabaseError } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UserAccountPage: React.FC = () => {
  const user = useUser();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ nome?: string; email?: string; telefone?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast: legacyToast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const { data, error } = await supabase
            .from('perfis')
            .select('nome, email, telefone')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Erro ao buscar perfil do usuário:", error);
            legacyToast({
              variant: "destructive",
              title: "Erro!",
              description: handleSupabaseError(error),
            })
          } else {
            setUserProfile(data);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        legacyToast({
          variant: "destructive",
          title: "Erro!",
          description: "Não foi possível carregar o perfil do usuário.",
        })
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, router, legacyToast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!user) {
        throw new Error("Usuário não autenticado.");
      }

      const nome = (e.target.elements.namedItem('nome') as HTMLInputElement).value;
      const email = (e.target.elements.namedItem('email') as HTMLInputElement).value;
      const telefone = (e.target.elements.namedItem('telefone') as HTMLInputElement).value;

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
    return <Layout title="Perfil">Carregando...</Layout>;
  }

  if (!userProfile) {
    return <Layout title="Perfil">Não foi possível carregar o perfil.</Layout>;
  }

  const telefoneDisplay = userProfile?.telefone || '-';

  return (
    <Layout title="Perfil">
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
    </Layout>
  );
};

export default UserAccountPage;
