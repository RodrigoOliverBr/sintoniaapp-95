
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from 'lucide-react';

const clienteFormSchema = z.object({
  razao_social: z.string().min(1, 'Razão Social é obrigatória'),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  responsavel: z.string().min(1, 'Nome do responsável é obrigatório'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').optional(),
  confirmarSenha: z.string().optional()
}).refine((data) => {
  if (data.senha || data.confirmarSenha) {
    return data.senha === data.confirmarSenha;
  }
  return true;
}, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
});

type ClienteFormData = z.infer<typeof clienteFormSchema>;

interface ClienteFormProps {
  onSubmit: (data: ClienteFormData) => Promise<void>;
  defaultValues?: Partial<ClienteFormData>;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const ClienteForm = ({ onSubmit, defaultValues, isLoading, isEditing }: ClienteFormProps) => {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      razao_social: '',
      cnpj: '',
      email: '',
      telefone: '',
      responsavel: '',
      senha: '',
      confirmarSenha: '',
      ...defaultValues
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="razao_social"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razão Social</FormLabel>
              <FormControl>
                <Input {...field} className="text-sm" />
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
                <Input {...field} className="text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-500">Informações de Acesso</span>
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className="text-sm" />
                  </FormControl>
                  <FormDescription className="text-sm">
                    Este email será usado para acessar o sistema
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <>
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmarSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} className="text-sm" />
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
              <FormLabel>Nome do Responsável</FormLabel>
              <FormControl>
                <Input {...field} className="text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
