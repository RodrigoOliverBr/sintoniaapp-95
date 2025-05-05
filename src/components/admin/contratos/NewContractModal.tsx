
import React, { useEffect, useState } from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ContractForm from "./ContractForm";
import { ClienteSistema, Plano, StatusContrato } from "@/types/admin";
import { toast } from "sonner";
import { supabase, ensureAuthenticated, logAuthStatus } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewContractModalProps {
  formClienteId: string;
  setFormClienteId: (value: string) => void;
  formPlanoId: string;
  setFormPlanoId: (value: string) => void;
  formDataInicio: Date;
  setFormDataInicio: (value: Date) => void;
  formDataFim: Date;
  setFormDataFim: (value: Date) => void;
  formDataPrimeiroVencimento: Date;
  setFormDataPrimeiroVencimento: (value: Date) => void;
  formValorMensal: number;
  setFormValorMensal: (value: number) => void;
  formStatus: StatusContrato;
  setFormStatus: (value: StatusContrato) => void;
  formTaxaImplantacao: number;
  setFormTaxaImplantacao: (value: number) => void;
  formObservacoes: string;
  setFormObservacoes: (value: string) => void;
  formNumeroContrato: string;
  setFormNumeroContrato: (value: string) => void;
  clientes: ClienteSistema[];
  planos: Plano[];
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
}

const NewContractModal: React.FC<NewContractModalProps> = ({
  formClienteId,
  setFormClienteId,
  formPlanoId,
  setFormPlanoId,
  formDataInicio,
  setFormDataInicio,
  formDataFim,
  setFormDataFim,
  formDataPrimeiroVencimento,
  setFormDataPrimeiroVencimento,
  formValorMensal,
  setFormValorMensal,
  formStatus,
  setFormStatus,
  formTaxaImplantacao,
  setFormTaxaImplantacao,
  formObservacoes,
  setFormObservacoes,
  formNumeroContrato,
  setFormNumeroContrato,
  clientes,
  planos,
  isLoading,
  onClose,
  onSave,
}) => {
  const [clientesData, setClientesData] = useState<ClienteSistema[]>([]);
  const [planosData, setPlanosData] = useState<Plano[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    // Set local data from props, but also check if they might be empty
    setClientesData(clientes);
    setPlanosData(planos);

    if (clientes.length === 0 || planos.length === 0) {
      loadMissingData();
    }
  }, [clientes, planos]);

  const loadMissingData = async () => {
    setLocalLoading(true);
    console.log("NewContractModal: Carregando dados localmente devido a dados ausentes");

    try {
      // Load clients if needed
      if (clientes.length === 0) {
        const { data: clientesResult, error: clientesError } = await supabase
          .from('clientes_sistema')
          .select('*');
        
        if (clientesError) {
          console.error("NewContractModal: Erro ao carregar clientes localmente:", clientesError);
          toast.error("Erro ao carregar clientes");
        } else if (clientesResult) {
          console.log(`NewContractModal: ${clientesResult.length} clientes carregados localmente`);
          
          const clientesFormatted = clientesResult.map(c => ({
            id: c.id,
            nome: c.razao_social || "",
            razao_social: c.razao_social || "",
            razaoSocial: c.razao_social || "",
            cnpj: c.cnpj || "",
            cpfCnpj: c.cnpj || "",
            telefone: c.telefone || "",
            email: c.email || "",
            responsavel: c.responsavel || "",
            contato: c.responsavel || "",
            situacao: c.situacao || "",
            tipo: "cliente",
            numeroEmpregados: 0,
            dataInclusao: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
            ativo: true,
            planoId: c.plano_id || "",
            contratoId: c.contrato_id || ""
          }));
          
          setClientesData(clientesFormatted);
        }
      }
      
      // Load plans if needed
      if (planos.length === 0) {
        const { data: planosResult, error: planosError } = await supabase
          .from('planos')
          .select('*')
          .eq('ativo', true);
        
        if (planosError) {
          console.error("NewContractModal: Erro ao carregar planos localmente:", planosError);
          toast.error("Erro ao carregar planos");
        } else if (planosResult) {
          console.log(`NewContractModal: ${planosResult.length} planos carregados localmente`);
          
          const planosFormatted = planosResult.map(p => ({
            id: p.id,
            nome: p.nome || "",
            valor: p.valor_mensal || 0,
            valorMensal: p.valor_mensal || 0,
            valorImplantacao: p.valor_implantacao || 0,
            descricao: p.descricao || "",
            ativo: p.ativo || false,
            numeroUsuarios: p.limite_empregados || 0,
            limiteEmpresas: p.limite_empresas || 0,
            limiteEmpregados: p.limite_empregados || 0,
            empresasIlimitadas: p.empresas_ilimitadas || false,
            empregadosIlimitados: p.empregados_ilimitados || false,
            dataValidade: p.data_validade ? new Date(p.data_validade).getTime() : null,
            semVencimento: p.sem_vencimento || false
          }));
          
          setPlanosData(planosFormatted);
        }
      }
    } catch (error) {
      console.error("NewContractModal: Erro ao carregar dados localmente:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const validateForm = () => {
    if (!formClienteId) {
      toast.error("Por favor, selecione um cliente");
      return false;
    }
    if (!formPlanoId) {
      toast.error("Por favor, selecione um plano");
      return false;
    }
    if (!formNumeroContrato) {
      toast.error("Por favor, informe o número do contrato");
      return false;
    }
    if (!formDataInicio) {
      toast.error("Por favor, selecione a data de início");
      return false;
    }
    if (!formDataFim) {
      toast.error("Por favor, selecione a data de fim");
      return false;
    }
    if (!formValorMensal || formValorMensal <= 0) {
      toast.error("Por favor, informe um valor mensal válido");
      return false;
    }
    if (!formStatus) {
      toast.error("Por favor, selecione um status");
      return false;
    }
    if (formTaxaImplantacao < 0) {
      toast.error("A taxa de implantação não pode ser negativa");
      return false;
    }
    return true;
  };
  
  // Verificar autenticação quando o modal for aberto
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Verificando autenticação no NewContractModal...");
      await logAuthStatus();
      
      // Verificar se há clientes e planos disponíveis
      console.log("Clientes disponíveis:", clientesData.length);
      console.log("Planos disponíveis:", planosData.length);
    };
    
    checkAuth();
  }, [clientesData, planosData]);
  
  const handleSave = async () => {
    console.log("Tentando salvar novo contrato com dados:", {
      cliente: formClienteId,
      plano: formPlanoId,
      dataInicio: formDataInicio,
      dataFim: formDataFim,
      valor: formValorMensal,
      status: formStatus
    });
    
    // Verificar autenticação antes de salvar
    const isAuth = await ensureAuthenticated();
    if (!isAuth) {
      console.error("Usuário não autenticado para criar contrato");
      toast.error("Você precisa estar autenticado como administrador para criar o contrato");
      return;
    }
    
    // Log da sessão atual para debug
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("Sessão atual durante handleSave (NewContractModal):", sessionData?.session?.user?.id);
    
    // Log das permissões do usuário
    await logAuthStatus();
    
    if (!validateForm()) return;
    onSave();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Adicionar Novo Contrato</DialogTitle>
        <DialogDescription>
          Preencha as informações do novo contrato. Campos com * são obrigatórios.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[500px]">
        <ContractForm
          formClienteId={formClienteId}
          setFormClienteId={setFormClienteId}
          formPlanoId={formPlanoId}
          setFormPlanoId={setFormPlanoId}
          formDataInicio={formDataInicio}
          setFormDataInicio={setFormDataInicio}
          formDataFim={formDataFim}
          setFormDataFim={setFormDataFim}
          formDataPrimeiroVencimento={formDataPrimeiroVencimento}
          setFormDataPrimeiroVencimento={setFormDataPrimeiroVencimento}
          formValorMensal={formValorMensal}
          setFormValorMensal={setFormValorMensal}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          formTaxaImplantacao={formTaxaImplantacao}
          setFormTaxaImplantacao={setFormTaxaImplantacao}
          formObservacoes={formObservacoes}
          setFormObservacoes={setFormObservacoes}
          formNumeroContrato={formNumeroContrato}
          setFormNumeroContrato={setFormNumeroContrato}
          clientes={clientesData}
          planos={planosData}
          isLoading={isLoading || localLoading}
          validateForm={validateForm}
        />
      </ScrollArea>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading || localLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading || localLoading}>
          {isLoading || localLoading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default NewContractModal;
