
import { supabase } from "@/integrations/supabase/client";
import { ClienteSistema } from "@/types/admin";
import { useEffect } from "react";

export const insertTestClient = async () => {
  console.log("Iniciando teste de inserção...");
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

    console.log("Dados retornados:", data);
    
    if (error) {
      console.error("Erro de inserção:", error);
      return null;
    }

    console.log('Cliente inserido com sucesso:', data);
    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return null;
  }
};

// Função para chamar insertTestClient em um componente
export const useTestClientInsertion = () => {
  useEffect(() => {
    console.log("Chamando insertTestClient no useEffect");
    insertTestClient().then(result => {
      if (result) {
        console.log('✅ Teste de inserção realizado com sucesso!');
      } else {
        console.log('❌ Falha no teste de inserção no banco de dados.');
      }
    });
  }, []); // Array vazio garante que só seja chamado uma vez
};
