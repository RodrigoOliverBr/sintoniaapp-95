
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PasswordChangeForm from '@/components/auth/PasswordChangeForm';

// Schema simplificado para evitar problemas de tipagem
const profileFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  telefone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserAccountPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) throw error;
          
          const userProfile = {
            ...profile,
            email: session.user.email,
          };
          
          setUser(userProfile);
          
          form.reset({
            nome: profile?.nome || '',
            email: session.user.email || '',
            telefone: profile?.telefone || '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        toast.error('Não foi possível carregar os dados do usuário');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      
      // Atualiza o perfil no banco de dados
      const { error } = await supabase
        .from('perfis')
        .update({
          nome: data.nome,
          telefone: data.telefone,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback>{user?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-medium">{user?.nome}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">{user?.tipo}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="informacoes">
              <TabsList className="mb-4">
                <TabsTrigger value="informacoes">Informações Pessoais</TabsTrigger>
                <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
              </TabsList>
              
              <TabsContent value="informacoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Atualize suas informações pessoais</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} disabled />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={loading}>
                          {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="senha">
                <Card>
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>Atualize sua senha de acesso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PasswordChangeForm />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserAccountPage;
