
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plano } from "@/types/admin";

export function usePlanos() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlanos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('planos').select('*');
      if (error) throw error;

      const transformedPlanos: Plano[] = data.map(item => ({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao || "",
        valor: Number(item.valor_mensal || 0),
        numeroUsuarios: 0,
        valorMensal: Number(item.valor_mensal),
        valorImplantacao: Number(item.valor_implantacao),
        limiteEmpresas: item.limite_empresas || 0,
        empresasIlimitadas: item.empresas_ilimitadas || false,
        limiteEmpregados: item.limite_empregados || 0,
        empregadosIlimitados: item.empregados_ilimitados || false,
        dataValidade: item.data_validade ? new Date(item.data_validade).getTime() : null,
        semVencimento: item.sem_vencimento || false,
        ativo: item.ativo || true
      }));

      setPlanos(transformedPlanos);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar os planos.');
    } finally {
      setIsLoading(false);
    }
  };

  const addPlano = async (novoPlanoDados: Omit<Plano, 'id'>) => {
    try {
      const newPlano = {
        nome: novoPlanoDados.nome,
        descricao: novoPlanoDados.descricao,
        valor_mensal: novoPlanoDados.valorMensal,
        valor_implantacao: novoPlanoDados.valorImplantacao,
        limite_empresas: novoPlanoDados.empresasIlimitadas ? null : novoPlanoDados.limiteEmpresas,
        empresas_ilimitadas: novoPlanoDados.empresasIlimitadas,
        limite_empregados: novoPlanoDados.empregadosIlimitados ? null : novoPlanoDados.limiteEmpregados,
        empregados_ilimitados: novoPlanoDados.empregadosIlimitados,
        data_validade: novoPlanoDados.semVencimento ? null : 
          (novoPlanoDados.dataValidade ? new Date(novoPlanoDados.dataValidade).toISOString() : null),
        sem_vencimento: novoPlanoDados.semVencimento,
        ativo: novoPlanoDados.ativo
      };

      const { data, error } = await supabase.from('planos').insert([newPlano]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        const addedPlano: Plano = {
          id: data[0].id,
          nome: data[0].nome,
          descricao: data[0].descricao || "",
          valor: Number(data[0].valor_mensal || 0),
          numeroUsuarios: 0,
          valorMensal: Number(data[0].valor_mensal),
          valorImplantacao: Number(data[0].valor_implantacao),
          limiteEmpresas: data[0].limite_empresas || 0,
          empresasIlimitadas: data[0].empresas_ilimitadas || false,
          limiteEmpregados: data[0].limite_empregados || 0,
          empregadosIlimitados: data[0].empregados_ilimitados || false,
          dataValidade: data[0].data_validade ? new Date(data[0].data_validade).getTime() : null,
          semVencimento: data[0].sem_vencimento || false,
          ativo: data[0].ativo || true
        };
        
        setPlanos(prevPlanos => [...prevPlanos, addedPlano]);
        toast.success('Plano adicionado com sucesso!');
      }
      return true;
    } catch (error) {
      console.error('Erro ao adicionar plano:', error);
      toast.error('Erro ao adicionar plano.');
      return false;
    }
  };

  const updatePlano = async (id: string, planoDados: Omit<Plano, 'id'>) => {
    try {
      const updatedPlano = {
        nome: planoDados.nome,
        descricao: planoDados.descricao,
        valor_mensal: planoDados.valorMensal,
        valor_implantacao: planoDados.valorImplantacao,
        limite_empresas: planoDados.empresasIlimitadas ? null : planoDados.limiteEmpresas,
        empresas_ilimitadas: planoDados.empresasIlimitadas,
        limite_empregados: planoDados.empregadosIlimitados ? null : planoDados.limiteEmpregados,
        empregados_ilimitados: planoDados.empregadosIlimitados,
        data_validade: planoDados.semVencimento ? null : 
          (planoDados.dataValidade ? new Date(planoDados.dataValidade).toISOString() : null),
        sem_vencimento: planoDados.semVencimento,
        ativo: planoDados.ativo
      };

      const { error } = await supabase
        .from('planos')
        .update(updatedPlano)
        .eq('id', id);

      if (error) throw error;

      const updatedPlanoObj: Plano = {
        id,
        ...planoDados,
        valor: planoDados.valorMensal, // Make sure to set valor field
        numeroUsuarios: 0 // Default value
      };
      
      setPlanos(prevPlanos => 
        prevPlanos.map(plano => plano.id === id ? updatedPlanoObj : plano)
      );
      
      toast.success('Plano atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast.error('Erro ao atualizar plano.');
      return false;
    }
  };

  const deletePlano = async (id: string) => {
    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlanos(prevPlanos => prevPlanos.filter(plano => plano.id !== id));
      toast.success('Plano excluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast.error('Erro ao excluir plano.');
      return false;
    }
  };

  useEffect(() => {
    fetchPlanos();
  }, []);

  return {
    planos,
    isLoading,
    fetchPlanos,
    addPlano,
    updatePlano,
    deletePlano
  };
}
