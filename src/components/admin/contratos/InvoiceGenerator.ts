
import { supabase } from "@/integrations/supabase/client";
import { addMonths, addDays } from "date-fns";

interface GenerateInvoicesProps {
  contratoId: string;
  clienteId: string;
  valorMensal: number;
  taxaImplantacao: number;
  dataInicio: Date;
  dataPrimeiroVencimento: Date;
  numeroContrato: string;
}

export const gerarFaturasAutomaticas = async ({
  contratoId,
  clienteId,
  valorMensal,
  taxaImplantacao,
  dataInicio,
  dataPrimeiroVencimento,
  numeroContrato
}: GenerateInvoicesProps): Promise<boolean> => {
  try {
    const faturas = [];
    const timestamp = Date.now();
    
    // Fatura de implantação (parcela 0)
    if (taxaImplantacao > 0) {
      faturas.push({
        numero: `FAT-${timestamp.toString().slice(-8)}`,
        cliente_id: clienteId,
        cliente_sistema_id: clienteId,
        contrato_id: contratoId,
        data_emissao: dataInicio.toISOString(),
        data_vencimento: dataPrimeiroVencimento.toISOString(),
        valor: taxaImplantacao,
        status: 'pendente',
        referencia: `${numeroContrato}-0-12`
      });
    }
    
    // 12 faturas mensais (parcelas 1 a 12)
    for (let i = 0; i < 12; i++) {
      const dataEmissao = addMonths(dataInicio, i);
      const dataVencimento = addDays(dataEmissao, 7); // Vencimento 7 dias após emissão
      
      faturas.push({
        numero: `FAT-${timestamp.toString().slice(-8)}-${i+1}`,
        cliente_id: clienteId,
        cliente_sistema_id: clienteId,
        contrato_id: contratoId,
        data_emissao: dataEmissao.toISOString(),
        data_vencimento: dataVencimento.toISOString(),
        valor: valorMensal,
        status: 'pendente',
        referencia: `${numeroContrato}-${i+1}-12`
      });
    }
    
    // Inserir faturas no Supabase usando um único insert para melhor performance
    const { error } = await supabase
      .from('faturas')
      .insert(faturas);
    
    if (error) {
      console.error('Erro ao gerar faturas:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar faturas automáticas:', error);
    return false;
  }
};
