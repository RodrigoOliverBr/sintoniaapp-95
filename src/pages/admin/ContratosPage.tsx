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
import { format } from "date-fns"
import { CalendarIcon, Check, Pencil, Trash2 } from "lucide-react";
import { 
  ClienteSistema, 
  Plano, 
  Contrato, 
  StatusContrato, 
  CicloFaturamento 
} from "@/types/admin";
import { 
  getClientesSistema, 
  getPlanos, 
  getContratos, 
  addContrato, 
  updateContrato, 
  deleteContrato 
} from "@/services/adminService";
import { toast } from "sonner";

const ContratosPage: React.FC = () => {
  const [contratos, setContratos] = useState<Contrato[]>(getContratos());
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentContrato, setCurrentContrato] = useState<Contrato | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formClienteId, setFormClienteId] = useState("");
  const [formPlanoId, setFormPlanoId] = useState("");
  const [formDataInicio, setFormDataInicio] = useState<Date>(new Date());
  const [formDataFim, setFormDataFim] = useState<Date>(new Date());
  const [formDataPrimeiroVencimento, setFormDataPrimeiroVencimento] = useState<Date>(new Date());
  const [formValorMensal, setFormValorMensal] = useState(0);
  const [formStatus, setFormStatus] = useState<StatusContrato>("ativo");
  const [formTaxaImplantacao, setFormTaxaImplantacao] = useState(0);
  const [formObservacoes, setFormObservacoes] = useState("");
  const [formCicloFaturamento, setFormCicloFaturamento] = useState<CicloFaturamento>("mensal");
  
  const [clientes, setClientes] = useState<ClienteSistema[]>(
    getClientesSistema().map(cliente => ({
      ...cliente,
      nome: cliente.razaoSocial // Adicionar nome como alias para compatibilidade
    }))
  );
  const [planos, setPlanos] = useState<Plano[]>(getPlanos());
  
  const getClienteNome = (clienteSistemaId: string) => {
    const cliente = clientes.find(c => c.id === clienteSistemaId);
    return cliente ? cliente.razaoSocial : "Cliente não encontrado";
  };
  
  const getPlanoNome = (planoId: string) => {
    const plano = planos.find(p => p.id === planoId);
    return plano ? plano.nome : "Plano não encontrado";
  };
  
  const filteredContratos = contratos.filter(contrato => {
    const clienteNome = getClienteNome(contrato.clienteSistemaId);
    return clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           contrato.numero.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const refreshContratos = () => {
    setContratos(getContratos());
  };
  
  const clearForm = () => {
    setFormClienteId("");
    setFormPlanoId("");
    setFormDataInicio(new Date());
    setFormDataFim(new Date());
    setFormDataPrimeiroVencimento(new Date());
    setFormValorMensal(0);
    setFormStatus("ativo");
    setFormTaxaImplantacao(0);
    setFormObservacoes("");
    setFormCicloFaturamento("mensal");
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
    setFormCicloFaturamento(contrato.cicloFaturamento);
    setOpenEditModal(true);
  };
  
  const handleOpenDeleteModal = (contrato: Contrato) => {
    setCurrentContrato(contrato);
    setOpenDeleteModal(true);
  };
  
  const handleAddContrato = () => {
    try {
      addContrato({
        clienteSistemaId: formClienteId, // Usar clienteSistemaId em vez de clienteId
        planoId: formPlanoId,
        dataInicio: formDataInicio.getTime(),
        dataFim: formDataFim.getTime(),
        dataPrimeiroVencimento: formDataPrimeiroVencimento.getTime(),
        valorMensal: formValorMensal,
        status: formStatus,
        taxaImplantacao: formTaxaImplantacao,
        observacoes: formObservacoes,
        cicloFaturamento: formCicloFaturamento
      });
      refreshContratos();
      setOpenNewModal(false);
      clearForm();
      toast.success("Contrato adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar contrato.");
    }
  };
  
  const handleUpdateContrato = () => {
    if (!currentContrato) return;
    
    try {
      updateContrato({
        ...currentContrato,
        clienteSistemaId: formClienteId, // Usar clienteSistemaId em vez de clienteId
        planoId: formPlanoId,
        dataInicio: formDataInicio.getTime(),
        dataFim: formDataFim.getTime(),
        dataPrimeiroVencimento: formDataPrimeiroVencimento.getTime(),
        valorMensal: formValorMensal,
        status: formStatus,
        taxaImplantacao: formTaxaImplantacao,
        observacoes: formObservacoes,
        cicloFaturamento: formCicloFaturamento
      });
      refreshContratos();
      setOpenEditModal(false);
      clearForm();
      toast.success("Contrato atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar contrato.");
    }
  };
  
  const handleDeleteContrato = () => {
    if (!currentContrato) return;
    
    try {
      deleteContrato(currentContrato.id);
      refreshContratos();
      setOpenDeleteModal(false);
      toast.success("Contrato excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir contrato.");
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Contratos</CardTitle>
              <CardDescription>
                Cadastre e gerencie os contratos dos clientes
              </CardDescription>
            </div>
            <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
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
                    >
                      <SelectTrigger id="cliente">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
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
                    >
                      <SelectTrigger id="plano">
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {planos.map(plano => (
                          <SelectItem key={plano.id} value={plano.id}>{plano.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !formDataInicio && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formDataInicio ? (
                            format(formDataInicio, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formDataInicio}
                          onSelect={setFormDataInicio}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !formDataFim && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formDataFim ? (
                            format(formDataFim, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formDataFim}
                          onSelect={setFormDataFim}
                          disabled={(date) =>
                            date < formDataInicio
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataPrimeiroVencimento">Data do Primeiro Vencimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !formDataPrimeiroVencimento && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formDataPrimeiroVencimento ? (
                            format(formDataPrimeiroVencimento, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formDataPrimeiroVencimento}
                          onSelect={setFormDataPrimeiroVencimento}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formStatus} 
                      onValueChange={(value: StatusContrato) => setFormStatus(value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cicloFaturamento">Ciclo de Faturamento</Label>
                    <Select 
                      value={formCicloFaturamento} 
                      onValueChange={(value: CicloFaturamento) => setFormCicloFaturamento(value)}
                    >
                      <SelectTrigger id="cicloFaturamento">
                        <SelectValue placeholder="Selecione o ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input id="observacoes" value={formObservacoes} onChange={(e) => setFormObservacoes(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenNewModal(false)}>Cancelar</Button>
                  <Button onClick={handleAddContrato}>Salvar</Button>
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
                    <TableCell>{format(new Date(contrato.dataInicio), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{format(new Date(contrato.dataFim), "dd/MM/yyyy")}</TableCell>
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
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteModal(contrato)}
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
      
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
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
              >
                <SelectTrigger id="edit-cliente">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
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
              >
                <SelectTrigger id="edit-plano">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {planos.map(plano => (
                    <SelectItem key={plano.id} value={plano.id}>{plano.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dataInicio">Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formDataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDataInicio ? (
                      format(formDataInicio, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDataInicio}
                    onSelect={setFormDataInicio}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dataFim">Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formDataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDataFim ? (
                      format(formDataFim, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDataFim}
                    onSelect={setFormDataFim}
                    disabled={(date) =>
                      date < formDataInicio
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dataPrimeiroVencimento">Data do Primeiro Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formDataPrimeiroVencimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDataPrimeiroVencimento ? (
                      format(formDataPrimeiroVencimento, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDataPrimeiroVencimento}
                    onSelect={setFormDataPrimeiroVencimento}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formStatus} 
                onValueChange={(value: StatusContrato) => setFormStatus(value)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cicloFaturamento">Ciclo de Faturamento</Label>
              <Select 
                value={formCicloFaturamento} 
                onValueChange={(value: CicloFaturamento) => setFormCicloFaturamento(value)}
              >
                <SelectTrigger id="edit-cicloFaturamento">
                  <SelectValue placeholder="Selecione o ciclo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-observacoes">Observações</Label>
              <Input id="edit-observacoes" value={formObservacoes} onChange={(e) => setFormObservacoes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditModal(false)}>Cancelar</Button>
            <Button onClick={handleUpdateContrato}>Salvar</Button>
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
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteContrato}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContratosPage;
