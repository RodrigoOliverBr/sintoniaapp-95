
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'sonner';
import Layout from "@/components/Layout";
import { Search, UserPlus, Trash2, KeyRound } from 'lucide-react';
import PasswordChangeForm from '@/components/auth/PasswordChangeForm';

interface ClientUser {
  id: string;
  nome: string;
  email: string;
  created_at: string;
}

const newUserSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha precisa ter pelo menos 8 caracteres"),
});

type NewUserFormData = z.infer<typeof newUserSchema>;

const UserAccountPage: React.FC = () => {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

  const form = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
    }
  });

  useEffect(() => {
    const getCurrentClientInfo = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;
        
        const userId = sessionData.session.user.id;
        
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (perfilError) throw perfilError;
        
        // Se for um perfil de cliente, buscar o ID do cliente
        if (perfilData.tipo === 'client') {
          // Buscar o ID do cliente (empresa) associado a este perfil
          const clientData = localStorage.getItem("sintonia:currentCliente");
          if (clientData) {
            const client = JSON.parse(clientData);
            setCurrentClientId(client.id);
          }
        }
      } catch (error) {
        console.error('Erro ao obter informações do cliente:', error);
      }
    };
    
    getCurrentClientInfo();
  }, []);

  useEffect(() => {
    if (currentClientId) {
      fetchUsers();
    }
  }, [currentClientId]);

  const fetchUsers = async () => {
    if (!currentClientId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('tipo', 'client')
        .eq('cliente_id', currentClientId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar usuários: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (data: NewUserFormData) => {
    if (!currentClientId) {
      toast.error("ID da empresa não encontrado");
      return;
    }
    
    try {
      // 1. Criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });
      
      if (authError) throw authError;
      
      const userId = authData.user.id;
      
      // 2. Inserir na tabela de perfis
      const { error: perfilError } = await supabase
        .from('perfis')
        .insert({
          id: userId,
          email: data.email,
          nome: data.nome,
          tipo: 'client',
          cliente_id: currentClientId
        });
      
      if (perfilError) throw perfilError;
      
      toast.success('Usuário criado com sucesso!');
      form.reset();
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordId) return;
    
    setIsResetting(true);
    try {
      const userToReset = users.find(u => u.id === resetPasswordId);
      
      if (!userToReset?.email) {
        throw new Error('E-mail do usuário não encontrado');
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        userToReset.email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      
      if (error) throw error;
      
      toast.success(`E-mail de redefinição enviado para ${userToReset.email}`);
      setResetPasswordId(null);
    } catch (error: any) {
      toast.error(`Erro ao redefinir senha: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    setIsDeleting(true);
    try {
      // 1. Remover o usuário do Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(deleteUserId);
      
      if (error) throw error;
      
      // 2. O registro na tabela de perfis será removido automaticamente via CASCADE
      
      toast.success('Usuário removido com sucesso');
      setDeleteUserId(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
        
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="password">Alterar Senha</TabsTrigger>
            <TabsTrigger value="users">Usuários da Empresa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password">
            <PasswordChangeForm />
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuários da Empresa</CardTitle>
                
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="Buscar usuário..." 
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4 py-4">
                          <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome completo" {...field} />
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
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                  <Input placeholder="email@exemplo.com" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha Inicial</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mínimo 8 caracteres" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit">
                              Criar Usuário
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead className="w-24 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Carregando usuários...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          {searchTerm ? "Nenhum usuário encontrado com esse termo" : "Nenhum usuário cadastrado para esta empresa"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.nome}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setResetPasswordId(user.id)}
                                  >
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Redefinir Senha</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Um e-mail de redefinição de senha será enviado para {users.find(u => u.id === resetPasswordId)?.email}.
                                      Deseja continuar?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setResetPasswordId(null)}>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetPassword} disabled={isResetting}>
                                      {isResetting ? "Enviando..." : "Enviar e-mail"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setDeleteUserId(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Você tem certeza que deseja excluir o usuário {users.find(u => u.id === deleteUserId)?.nome}?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeleteUserId(null)}>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
                                      {isDeleting ? "Excluindo..." : "Excluir Usuário"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserAccountPage;
