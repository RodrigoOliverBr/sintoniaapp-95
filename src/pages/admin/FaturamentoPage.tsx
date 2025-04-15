import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdminLayout from "@/components/AdminLayout";
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
import { Check, Copy, Edit, Plus, Trash2 } from "lucide-react";
import { 
  Fatura, 
  ClienteSistema, 
  StatusFatura, 
  Contrato 
} from "@/types/admin";
import { 
  getFaturas, 
  addFatura, 
  updateFatura, 
  deleteFatura, 
  getClientesSistema, 
  getContratosByClienteSistemaId 
} from "@/services/adminService";
import { toast } from "sonner";
import InvoicePreview from "@/components/admin/InvoicePreview";

const FaturamentoPage: React.FC = () => {
  const [faturas, setFaturas] = useState<Fatura[]>(getFaturas());
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [currentFatura, setCurrentFatura] = useState<Fatura | null>(null);
  const [currentCliente, setCurrentCliente] = useState<ClienteSistema | null>(null);
  const [currentContrato, setCurrentContrato] = useState<Contrato | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [clientes, setClientes] = useState<ClienteSistema[]>(
    getClientesSistema().map(cliente => ({
      ...cliente,
      nome: cliente.razaoSocial // Adicionar nome como alias para compatibilidade
    }))
  );
  const [contratos, setContratos] = useState<Contrato[]>([]);
  
  const [formClienteId, setFormClienteId] = useState("");
  const [formContratoId, setFormContratoId] = useState("");
  const [formDataEmissao, setFormDataEmissao] = useState<Date | undefined>(new Date());
  const [formDataVencimento, setFormDataVencimento] = useState<Date | undefined>(new Date());
  const [formValor, setFormValor] = useState(0);
  const [formStatus, setFormStatus] = useState<StatusFatura>("pendente");
  
  const refreshFaturas = () => {
    setFaturas(getFaturas());
  };
  
  useEffect(() => {
    if (formClienteId) {
      setContratos(getContratosByClienteSistemaId(formClienteId));
    } else {
      setContratos([]);
    }
  }, [formClienteId]);
  
  const clearForm = () => {
    setFormClienteId("");
    setFormContratoId("");
    setFormDataEmissao(new Date());
    setFormDataVencimento(new Date());
    setFormValor(0);
    setFormStatus("pendente");
  };
  
  const handleOpenEditModal = (fatura: Fatura) => {
    const cliente = getClientesSistema().find(c => c.id === fatura.clienteSistemaId);
    const contrato = getContratosByClienteSistemaId(fatura.clienteSistemaId).find(ct => ct.id === fatura.contratoId);
    
    if (cliente) {
      setCurrentCliente(cliente);
    }
    if (contrato) {
      setCurrentContrato(contrato);
    }
    
    setCurrentFatura(fatura);
    setFormClienteId(fatura.clienteSistemaId);
    setFormContratoId(fatura.contratoId);
    setFormDataEmissao(new Date(fatura.dataEmissao));
    setFormDataVencimento(new Date(fatura.dataVencimento));
    setFormValor(fatura.valor);
    setFormStatus(fatura.status);
    setOpenEditModal(true);
  };
  
  const handleOpenDeleteModal = (fatura: Fatura) => {
    setCurrentFatura(fatura);
    setOpenDeleteModal(true);
  };

  const handleOpenPreviewModal = (fatura: Fatura) => {
    const cliente = getClientesSistema().find(c => c.id === fatura.clienteSistemaId);
    const contrato = getContratosByClienteSistemaId(fatura.clienteSistemaId).find(ct => ct.id === fatura.contratoId);
    
    if (cliente) {
      setCurrentCliente(cliente);
    }
    if (contrato) {
      setCurrentContrato(contrato);
    }
    
    setCurrentFatura(fatura);
    setOpenPreviewModal(true);
  };
  
  const handleAddFatura = () => {
    try {
      addFatura({
        clienteSistemaId: formClienteId, // Usar clienteSistemaId em vez de clienteId
        contratoId: formContratoId,
        dataEmissao: formDataEmissao.getTime(),
        dataVencimento: formDataVencimento.getTime(),
        valor: formValor,
        status: formStatus,
        referencia: format(formDataVencimento, "MM/yyyy")
      });
      refreshFaturas();
      setOpenNewModal(false);
      clearForm();
      toast.success("Fatura adicionada com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar fatura.");
    }
  };
  
  const handleUpdateFatura = () => {
    if (!currentFatura) return;
    
    try {
      updateFatura({
        ...currentFatura,
        clienteSistemaId: formClienteId, // Usar clienteSistemaId em vez de clienteId
        contratoId: formContratoId,
        dataEmissao: formDataEmissao.getTime(),
        dataVencimento: formDataVencimento.getTime(),
        valor: formValor,
        status: formStatus,
        referencia: format(formDataVencimento, "MM/yyyy")
      });
      refreshFaturas();
      setOpenEditModal(false);
      clearForm();
      toast.success("Fatura atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar fatura.");
    }
  };
  
  const handleDeleteFatura = () => {
    if (!currentFatura) return;
    
    try {
      deleteFatura(currentFatura.id);
      refreshFaturas();
      setOpenDeleteModal(false);
      toast.success("Fatura excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir fatura.");
    }
  };
  
  const getClienteNome = (clienteSistemaId: string) => {
    const cliente = clientes.find(c => c.id === clienteSistemaId);
    return cliente ? cliente.razaoSocial : "Cliente não encontrado";
  };
  
  const getContratoNumero = (contratoId: string) => {
    const contrato = contratos.find(c => c.id === contratoId);
    return contrato ? contrato.numero : "Contrato não encontrado";
  };
  
  const filteredFaturas = faturas.filter(fatura => {
    const clienteNome = getClienteNome(fatura.clienteSistemaId).toLowerCase();
    const contratoNumero = getContratoNumero(fatura.contratoId).toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      clienteNome.includes(searchTermLower) ||
      contratoNumero.includes(searchTermLower) ||
      fatura.numero.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <AdminLayout title="Faturamento">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Faturas</CardTitle>
              <CardDescription>
                Cadastre e gerencie as faturas dos clientes
              </CardDescription>
            </div>
            <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Nova Fatura
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Fatura</DialogTitle>
                  <DialogDescription>
                    Preencha as informações da nova fatura.
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
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.razaoSocial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contrato">Contrato</Label>
                    <Select 
                      value={formContratoId} 
                      onValueChange={(value) => setFormContratoId(value)}
                      disabled={!formClienteId}
                    >
                      <SelectTrigger id="contrato">
                        <SelectValue placeholder="Selecione o contrato" />
                      </SelectTrigger>
                      <SelectContent>
                        {contratos.map(contrato => (
                          <SelectItem key={contrato.id} value={contrato.id}>
                            {contrato.numero}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emissao">Data de Emissão</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !formDataEmissao && "text-muted-foreground"
                          )}
                        >
                          {formDataEmissao ? (
                            format(formDataEmissao, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formDataEmissao}
                          onSelect={setFormDataEmissao}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vencimento">Data de Vencimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !formDataVencimento && "text-muted-foreground"
                          )}
                        >
                          {formDataVencimento ? (
                            format(formDataVencimento, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formDataVencimento}
                          onSelect={setFormDataVencimento}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor</Label>
                    <Input 
                      id="valor" 
                      type="number" 
                      min={0}
                      value={formValor} 
                      onChange={(e) => setFormValor(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formStatus} 
                      onValueChange={(value: StatusFatura) => setFormStatus(value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                        <SelectItem value="programada">Programada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenNewModal(false)}>Cancelar</Button>
                  <Button onClick={handleAddFatura}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="pt-4">
            <Input
              placeholder="Buscar fatura por cliente, contrato ou número..."
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
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaturas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    Nenhuma fatura encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFaturas.map((fatura) => (
                  <TableRow key={fatura.id}>
                    <TableCell className="font-medium">{fatura.numero}</TableCell>
                    <TableCell>{getClienteNome(fatura.clienteSistemaId)}</TableCell>
                    <TableCell>{getContratoNumero(fatura.contratoId)}</TableCell>
                    <TableCell>
                      {format(new Date(fatura.dataEmissao), "dd/MM/yyyy", {locale: ptBR})}
                    </TableCell>
                    <TableCell>
                      {format(new Date(fatura.dataVencimento), "dd/MM/yyyy", {locale: ptBR})}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fatura.valor)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                          fatura.status === "pago" ? "success" :
                          fatura.status === "atrasado" ? "destructive" :
                          fatura.status === "programada" ? "secondary" : "default"
                        }>
                        {fatura.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenPreviewModal(fatura)}
                          title="Visualizar Fatura"
                        >
                          <Copy size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditModal(fatura)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteModal(fatura)}
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
            <DialogTitle>Editar Fatura</DialogTitle>
            <DialogDescription>
              Atualize as informações da fatura.
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
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contrato">Contrato</Label>
              <Select 
                value={formContratoId} 
                onValueChange={(value) => setFormContratoId(value)}
                disabled={!formClienteId}
              >
                <SelectTrigger id="edit-contrato">
                  <SelectValue placeholder="Selecione o contrato" />
                </SelectTrigger>
                <SelectContent>
                  {contratos.map(contrato => (
                    <SelectItem key={contrato.id} value={contrato.id}>
                      {contrato.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emissao">Data de Emissão</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formDataEmissao && "text-muted-foreground"
                    )}
                  >
                    {formDataEmissao ? (
                      format(formDataEmissao, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDataEmissao}
                    onSelect={setFormDataEmissao}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vencimento">Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formDataVencimento && "text-muted-foreground"
                    )}
                  >
                    {formDataVencimento ? (
                      format(formDataVencimento, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDataVencimento}
                    onSelect={setFormDataVencimento}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-valor">Valor</Label>
              <Input 
                id="edit-valor" 
                type="number" 
                min={0}
                value={formValor} 
                onChange={(e) => setFormValor(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formStatus} 
                onValueChange={(value: StatusFatura) => setFormStatus(value)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="programada">Programada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditModal(false)}>Cancelar</Button>
            <Button onClick={handleUpdateFatura}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir a fatura número "{currentFatura?.numero}". Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteFatura}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentFatura && currentCliente && currentContrato && (
        <InvoicePreview
          fatura={currentFatura}
          cliente={currentCliente}
          contrato={currentContrato}
          open={openPreviewModal}
          onOpenChange={setOpenPreviewModal}
        />
      )}
    </AdminLayout>
  );
};

export default FaturamentoPage;
