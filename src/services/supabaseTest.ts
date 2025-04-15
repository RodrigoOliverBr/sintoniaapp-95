
import { supabase } from "@/integrations/supabase/client";
import { ClienteSistema } from "@/types/admin";

export const insertTestClient = async () => {
  try {
    const { data, error } = await supabase
      .from('clientes_sistema')
      .insert({
        razao_social: 'Empresa Teste Sintonia',
        cnpj: '12.345.678/0001-90',
        email: 'contato@empresateste.com.br',
        telefone: '(11) 99999-9999',
        responsavel: 'João da Silva',
        situacao: 'liberado'
      })
      .select();

    if (error) {
      console.error('Erro ao inserir cliente:', error);
      return null;
    }

    console.log('Cliente inserido com sucesso:', data);
    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return null;
  }
};

// Uncomment to test immediately
// insertTestClient();
