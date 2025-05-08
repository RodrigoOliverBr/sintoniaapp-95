
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const clienteFormSchema = z.object({
  razao_social: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  cnpj: z.string().min(14, { message: 'CNPJ inválido' }),
  email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  telefone: z.string().optional().or(z.literal('')),
  responsavel: z.string().optional().or(z.literal('')),
  senha: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
});

type ClienteFormValues = z.infer<typeof clienteFormSchema>;

interface ClienteFormProps {
  onSubmit: (data: ClienteFormValues) => Promise<void>;
  defaultValues?: Partial<ClienteFormValues>;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  onSubmit,
  defaultValues = {
    razao_social: '',
    cnpj: '',
    email: '',
    telefone: '',
    responsavel: '',
    senha: ''
  },
  isLoading = false,
  isEditing = false
}) => {
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues
  });

  const handleSubmit = async (data: ClienteFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="razao_social"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razão Social</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
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
                <Input type="email" {...field} disabled={isLoading} />
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
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isLoading} placeholder="Mínimo 6 caracteres" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
