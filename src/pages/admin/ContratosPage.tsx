
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, addMonths, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Check, Pencil, Trash2 } from "lucide-react";
import { 
  ClienteSistema, 
  Plano, 
  Contrato, 
  StatusContrato,
  CicloFaturamento
} from "@/types/admin";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const ContratosPage: React.FC = () => {
  // Funções auxiliares para formatação e obtenção de dados
  const getClienteNome = (clienteSistemaId: string) => {
    const cliente = clientes.find(c => c.id === clienteSistemaId);
    return cliente ? cliente.razaoSocial : "Cliente não encontrado";
  };
  
  const getPlanoNome = (planoId: string) => {
    const plano = planos.find(p => p.id === planoId);
    return plano ? plano.nome : "Plano não encontrado";
  };
  
  const formatarData = (data: number) => {
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  };

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentContrato, setCurrentContrato] = useState<Contrato | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formClienteId, setFormClienteId] = useState("");
  const [formPlanoId, setFormPlanoId] = useState("");
  const [formDataInicio, setFormDataInicio] = useState<Date>(new Date());
  const [formDataFim, setFormDataFim] = useState<Date>(addMonths(new Date(), 12));
  const [formDataPrimeiroVencimento, setFormDataPrimeiroVencimento] = useState<Date>(new Date());
  const [formValorMensal, setFormValorMensal] = useState(0);
  const [formStatus, setFormStatus] = useState<StatusContrato>("ativo");
  const [formTaxaImplantacao, setFormTaxaImplantacao] = useState(0);
  const [formObservacoes, setFormObservacoes] = useState("");
  const [formNumeroContrato, setFormNumeroContrato] = useState("");
  
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  
  // Efeito para atualizar a data de fim quando a data de início mudar
  useEffect(() => {
    // Calcula a data de fim como 12 meses após a data de início
    setFormDataFim(addMonths(formDataInicio, 12));
  }, [formDataInicio]);

  // Efeito para gerar automaticamente o número do contrato ao abrir o modal
  useEffect(() => {
    if (openNewModal) {
      const ano = new Date().getFullYear();
      const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
      setFormNumeroContrato(`CONT-${ano}-${numeroAleatorio}`);
    }
  }, [openNewModal]);
  
  // Carregando dados do Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        // Carregar clientes do sistema
        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes_sistema')
          .select('*');
        
        if (clientesError) {
          console.error('Erro ao carregar clientes:', clientesError);
          return;
        }
        
        const clientesFormatados = clientesData.map(cliente => ({
          id: cliente.id,
          razaoSocial: cliente.razao_social,
          nome: cliente.razao_social, // Para compatibilidade
          tipo: 'juridica' as const,
          numeroEmpregados: 0,
          dataInclusao: Date.now(),
          situacao: cliente.situacao as 'liberado' | 'bloqueado',
          cnpj: cliente.cnpj,
          cpfCnpj: cliente.cnpj, // Para compatibilidade
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          responsavel: cliente.responsavel || '',
          contato: cliente.responsavel, // Para compatibilidade
          planoId: cliente.plano_id,
          contratoId: cliente.contrato_id,
        }));
        
        setClientes(clientesFormatados);
        
        // Carregar planos
        const { data: planosData, error: planosError } = await supabase
          .from('planos')
          .select('*')
          .eq('ativo', true);
        
        if (planosError) {
          console.error('Erro ao carregar planos:', planosError);
          return;
        }
        
        const planosFormatados = planosData.map(plano => ({
          id: plano.id,
          nome: plano.nome,
          descricao: plano.descricao || '',
          valorMensal: Number(plano.valor_mensal),
          valorImplantacao: Number(plano.valor_implantacao),
          limiteEmpresas: plano.limite_empresas || 0,
          empresasIlimitadas: plano.empresas_ilimitadas || false,
          limiteEmpregados: plano.limite_empregados || 0,
          empregadosIlimitados: plano.empregados_ilimitados || false,
          dataValidade: plano.data_validade ? new Date(plano.data_validade).getTime() : null,
          semVencimento: plano.sem_vencimento || false,
          ativo: plano.ativo
        }));
        
        setPlanos(planosFormatados);
        
        await refreshContratos();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    }

    fetchData();
  }, []);
  
  const filteredContratos = contratos.filter(contrato => {
    const clienteNome = getClienteNome(contrato.clienteSistemaId);
    return clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           contrato.numero.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const refreshContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*');
      
      if (error) {
        console.error('Erro ao recarregar contratos:', error);
        return;
      }
      
      const contratosFormatados = data.map(contrato => ({
        id: contrato.id,
        numero: contrato.numero,
        clienteSistemaId: contrato.cliente_sistema_id || contrato.cliente_id,
        clienteId: contrato.cliente_id,
        planoId: contrato.plano_id,
        dataInicio: new Date(contrato.data_inicio).getTime(),
        dataFim: new Date(contrato.data_fim).getTime(),
        dataPrimeiroVencimento: new Date(contrato.data_primeiro_vencimento).getTime(),
        valorMensal: Number(contrato.valor_mensal),
        status: contrato.status as StatusContrato,
        taxaImplantacao: Number(contrato.taxa_implantacao),
        observacoes: contrato.observacoes || '',
        cicloFaturamento: contrato.ciclo_faturamento as CicloFaturamento,
        proximaRenovacao: contrato.proxima_renovacao ? new Date(contrato.proxima_renovacao).getTime() : undefined,
        ciclosGerados: contrato.ciclos_gerados || 0
      }));
      
      setContratos(contratosFormatados);
    } catch (error) {
      console.error('Erro ao recarregar contratos:', error);
    }
  };
  
  const clearForm = () => {
    setFormClienteId("");
    setFormPlanoId("");
    setFormDataInicio(new Date());
    setFormDataFim(addMonths(new Date(), 12));
    setFormDataPrimeiroVencimento(new Date());
    setFormValorMensal(0);
    setFormStatus("ativo");
    setFormTaxaImplantacao(0);
    setFormObservacoes("");
    const ano = new Date().getFullYear();
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    setFormNumeroContrato(`CONT-${ano}-${numeroAleatorio}`);
  };
  
  const handleOpenEditModal = (contrato: Contrato) => {
    setCurrentContrato(contrato);
    setFormClienteId(contrato.clienteSistemaId);
    setFormPlanoId(contrato.planoId);
    setFormDataInicio(new Date(contrato.dataInicio));
    setFormDataFim(new Date(contrato.dataFim));
    setFormDataPrimeiroVencimento(new Date(contrato.dataPrimeiroVencimento));
    setFormValorMensal(contrato.valorMensal);
    setFormStatus(contrato.status);
    setFormTaxaImplantacao(contrato.taxaImplantacao);
    setFormObservacoes(contrato.observacoes);
    setFormNumeroContrato(contrato.numero);
    setOpenEditModal(true);
  };
  
  const handleOpenDeleteModal = (contrato: Contrato) => {
    setCurrentContrato(contrato);
    setOpenDeleteModal(true);
  };

  // Efeito para atualizar o valor mensal quando o plano é selecionado
  useEffect(() => {
    if (formPlanoId) {
      const planoSelecionado = planos.find(p => p.id === formPlanoId);
      if (planoSelecionado) {
        setFormValorMensal(planoSelecionado.valorMensal);
        setFormTaxaImplantacao(planoSelecionado.valorImplantacao);
      }
    }
  }, [formPlanoId, planos]);
  
  // Função para gerar as faturas automáticas
  const gerarFaturasAutomaticas = async (contratoId: string, clienteId: string, valorMensal: number, taxaImplantacao: number, dataInicio: Date, dataPrimeiroVencimento: Date, numeroContrato: string) => {
    try {
      const faturas = [];
      
      // Fatura de implantação (parcela 0)
      if (taxaImplantacao > 0) {
        faturas.push({
          numero: `FAT-${Date.now().toString().slice(-8)}`,
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
          numero: `FAT-${Date.now().toString().slice(-8)}-${i+1}`,
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
      
      // Inserir faturas no Supabase
      const { error } = await supabase
        .from('faturas')
        .insert(faturas);
      
      if (error) {
        console.error('Erro ao gerar faturas:', error);
        toast.error('Erro ao gerar faturas automáticas');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar faturas automáticas:', error);
      toast.error('Erro ao gerar faturas automáticas');
      return false;
    }
  };
  
  const handleAddContrato = async () => {
    if (!formClienteId || !formPlanoId || !formNumeroContrato) {
      toast.error("Cliente, Plano e Número do Contrato são obrigatórios");
      return;
    }

    try {
      setIsLoading(true);
      
      // Inserir o contrato
      const { data, error } = await supabase
        .from('contratos')
        .insert({
          numero: formNumeroContrato,
          cliente_sistema_id: formClienteId,
          cliente_id: formClienteId, // Usando o mesmo ID do clienteSistema para o cliente_id
          plano_id: formPlanoId,
          data_inicio: formDataInicio.toISOString(),
          data_fim: formDataFim.toISOString(),
          data_primeiro_vencimento: formDataPrimeiroVencimento.toISOString(),
          valor_mensal: formValorMensal,
          status: formStatus,
          taxa_implantacao: formTaxaImplantacao,
          observacoes: formObservacoes,
          ciclo_faturamento: 'mensal' // Sempre mensal agora
        })
        .select();

      if (error) {
        console.error("Erro ao adicionar contrato:", error);
        toast.error("Erro ao adicionar contrato: " + error.message);
        return;
      }

      // Atualiza o cliente com a referência ao contrato
      await supabase
        .from('clientes_sistema')
        .update({ contrato_id: data[0].id })
        .eq('id', formClienteId);

      // Se o contrato for ativo, gerar faturas automáticas
      if (formStatus === 'ativo') {
        const faturasGeradas = await gerarFaturasAutomaticas(
          data[0].id,
          formClienteId,
          formValorMensal,
          formTaxaImplantacao,
          formDataInicio,
          formDataPrimeiroVencimento,
          formNumeroContrato
        );
        
        if (faturasGeradas) {
          toast.success("Contrato e faturas geradas com sucesso!");
        } else {
          toast.warning("Contrato salvo, mas houve um problema ao gerar as faturas");
        }
      } else {
        toast.success("Contrato adicionado com sucesso!");
      }

      await refreshContratos();
      setOpenNewModal(false);
      clearForm();
    } catch (error: any) {
      console.error("Erro ao adicionar contrato:", error);
      toast.error("Erro ao adicionar contrato: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateContrato = async () => {
    if (!currentContrato) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contratos')
        .update({
          numero: formNumeroContrato,
          cliente_sistema_id: formClienteId,
          cliente_id: formClienteId, // Corrigido: Garantindo que cliente_id seja preenchido
          plano_id: formPlanoId,
          data_inicio: formDataInicio.toISOString(),
          data_fim: formDataFim.toISOString(),
          data_primeiro_vencimento: formDataPrimeiroVencimento.toISOString(),
          valor_mensal: formValorMensal,
          status: formStatus,
          taxa_implantacao: formTaxaImplantacao,
          observacoes: formObservacoes,
          ciclo_faturamento: 'mensal' // Sempre mensal agora
        })
        .eq('id', currentContrato.id);

      if (error) {
        console.error("Erro ao atualizar contrato:", error);
        toast.error("Erro ao atualizar contrato: " + error.message);
        return;
      }

      await refreshContratos();
      setOpenEditModal(false);
      clearForm();
      toast.success("Contrato atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar contrato:", error);
      toast.error("Erro ao atualizar contrato: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteContrato = async () => {
    if (!currentContrato) return;
    
    try {
      setIsLoading(true);
      // Primeiro, atualiza o cliente para remover a referência ao contrato
      await supabase
        .from('clientes_sistema')
        .update({ contrato_id: null })
        .eq('id', currentContrato.clienteSistemaId);

      // Depois exclui o contrato
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', currentContrato.id);

      if (error) {
        console.error("Erro ao excluir contrato:", error);
        toast.error("Erro ao excluir contrato: " + error.message);
        return;
      }

      await refreshContratos();
      setOpenDeleteModal(false);
      toast.success("Contrato excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir contrato:", error);
      toast.error("Erro ao excluir contrato: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const ContratosContent = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Contratos</CardTitle>
            <CardDescription>
              Cadastre e gerencie os contratos dos clientes
            </CardDescription>
          </div>
          <Dialog open={openNewModal} onOpenChange={(open) => {
            setOpenNewModal(open);
            if (!open) clearForm();
          }}>
            <DialogTrigger asChild>
              <Button>Novo Contrato</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Contrato</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo contrato.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select 
                    value={formClienteId} 
                    onValueChange={(value) => setFormClienteId(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="cliente">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>{cliente.razaoSocial}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plano">Plano</Label>
                  <Select 
                    value={formPlanoId} 
                    onValueChange={(value) => setFormPlanoId(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="plano">
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {planos.map(plano => (
                        <SelectItem key={plano.id} value={plano.id}>{plano.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroContrato">Número do Contrato</Label>
                  <Input
                    id="numeroContrato"
                    value={formNumeroContrato}
                    onChange={(e) => setFormNumeroContrato(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={isLoading}
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formDataInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formDataInicio ? (
                          format(formDataInicio, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={formDataInicio}
                        onSelect={(date) => date && setFormDataInicio(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data de Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={isLoading}
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formDataFim && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formDataFim ? (
                          format(formDataFim, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={formDataFim}
                        onSelect={(date) => date && setFormDataFim(date)}
                        disabled={(date) =>
                          date < formDataInicio
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataPrimeiroVencimento">Data do Primeiro Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={isLoading}
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formDataPrimeiroVencimento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formDataPrimeiroVencimento ? (
                          format(formDataPrimeiroVencimento, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={formDataPrimeiroVencimento}
                        onSelect={(date) => date && setFormDataPrimeiroVencimento(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorMensal">Valor Mensal</Label>
                  <Input 
                    id="valorMensal" 
                    type="number" 
                    value={formValorMensal} 
                    onChange={(e) => setFormValorMensal(Number(e.target.value))} 
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formStatus} 
                    onValueChange={(value: StatusContrato) => setFormStatus(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="em-analise">Em Análise</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxaImplantacao">Taxa de Implantação</Label>
                  <Input 
                    id="taxaImplantacao" 
                    type="number" 
                    value={formTaxaImplantacao} 
                    onChange={(e) => setFormTaxaImplantacao(Number(e.target.value))} 
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input 
                    id="observacoes" 
                    value={formObservacoes} 
                    onChange={(e) => setFormObservacoes(e.target.value)} 
                    disabled={isLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenNewModal(false)} disabled={isLoading}>Cancelar</Button>
                <Button onClick={handleAddContrato} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="pt-4">
          <Input
            placeholder="Buscar contrato por cliente ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xl"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Data de Início</TableHead>
              <TableHead>Data de Fim</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContratos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Nenhum contrato encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredContratos.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell className="font-medium">{getClienteNome(contrato.clienteSistemaId)}</TableCell>
                  <TableCell>{getPlanoNome(contrato.planoId)}</TableCell>
                  <TableCell>{formatarData(contrato.dataInicio)}</TableCell>
                  <TableCell>{formatarData(contrato.dataFim)}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valorMensal)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                        contrato.status === "ativo" ? "default" : 
                        contrato.status === "em-analise" ? "secondary" : 
                        "destructive"
                      }>
                      {contrato.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenEditModal(contrato)}
                        disabled={isLoading}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenDeleteModal(contrato)}
                        disabled={isLoading}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout title="Contratos">
      <ContratosContent />
      
      <Dialog open={openEditModal} onOpenChange={(open) => {
        setOpenEditModal(open);
        if (!open) clearForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Contrato</DialogTitle>
            <DialogDescription>
              Atualize as informações do contrato.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cliente">Cliente</Label>
              <Select 
                value={formClienteId} 
                onValueChange={(value) => setFormClienteId(value)}
                disabled={isLoading}
              >
                <SelectTrigger id="edit-cliente">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>{cliente.razaoSocial}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-plano">Plano</Label>
              <Select 
                value={formPlanoId} 
                onValueChange={(value) => setFormPlanoId(value)}
                disabled={isLoading}
              >
                <SelectTrigger id="edit-plano">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {planos.map(plano => (
                    <SelectItem key={plano.id} value={plano.id}>{plano.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-numeroContrato">Número do Contrato</Label>
              <Input
                id="edit-numeroContrato"
                value={formNumeroContrato}
                onChange={(e) => setFormNumeroContrato(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dataInicio">Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    disabled={isLoading}
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formDataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDataInicio ? (
                      format(formDataInicio, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={formDataInicio}
                    onSelect={(date) => date && setFormDataInicio(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dataFim">Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    disabled={isLoading}
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formDataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDataFim ? (
                      format(formDataFim, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={formDataFim}
                    onSelect={(date) => date && setFormDataFim(date)}
                    disabled={(date) =>
                      date < formDataInicio
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dataPrimeiroVencimento">Data do Primeiro Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    disabled={isLoading}
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formDataPrimeiroVencimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDataPrimeiroVencimento ? (
                      format(formDataPrimeiroVencimento, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={formDataPrimeiroVencimento}
                    onSelect={(date) => date && setFormDataPrimeiroVencimento(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-valorMensal">Valor Mensal</Label>
              <Input 
                id="edit-valorMensal" 
                type="number" 
                value={formValorMensal} 
                onChange={(e) => setFormValorMensal(Number(e.target.value))} 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formStatus} 
                onValueChange={(value: StatusContrato) => setFormStatus(value)}
                disabled={isLoading}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="em-analise">Em Análise</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-taxaImplantacao">Taxa de Implantação</Label>
              <Input 
                id="edit-taxaImplantacao" 
                type="number" 
                value={formTaxaImplantacao} 
                onChange={(e) => setFormTaxaImplantacao(Number(e.target.value))} 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-observacoes">Observações</Label>
              <Input 
                id="edit-observacoes" 
                value={formObservacoes} 
                onChange={(e) => setFormObservacoes(e.target.value)} 
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditModal(false)} disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleUpdateContrato} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o contrato. Tem certeza?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)} disabled={isLoading}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteContrato} disabled={isLoading}>
              {isLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ContratosPage;
