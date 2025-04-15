
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, ExternalLink, Lock, Unlock, Check, AlertTriangle } from "lucide-react";
import { ClienteSistema, TipoPessoa, ClienteStatus } from "@/types/admin";
import { 
  getClientesSistema, 
  addClienteSistema, 
  updateClienteSistema, 
  deleteClienteSistema, 
  getFaturasByClienteSistemaId 
} from "@/services/adminService";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ClientesPage: React.FC = () => {
  const [clientesSistema, setClientesSistema] = useState<ClienteSistema[]>(getClientesSistema());
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<ClienteSistema | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formRazaoSocial, setFormRazaoSocial] = useState("");
  const [formTipo, setFormTipo] = useState<TipoPessoa>("juridica");
  const [formNumeroEmpregados, setFormNumeroEmpregados] = useState(0);
  const [formSituacao, setFormSituacao] = useState<ClienteStatus>("liberado");
  const [formCnpj, setFormCnpj] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formEndereco, setFormEndereco] = useState("");
  const [formCidade, setFormCidade] = useState("");
  const [formEstado, setFormEstado] = useState("");
  const [formCep, setFormCep] = useState("");
  const [formResponsavel, setFormResponsavel] = useState("");
  
  const navigate = useNavigate();
  
  const refreshClientes = () => {
    setClientesSistema(getClientesSistema());
  };
  
  const clearForm = () => {
    setFormRazaoSocial("");
    setFormTipo("juridica");
    setFormNumeroEmpregados(0);
    setFormSituacao("liberado");
    setFormCnpj("");
    setFormEmail("");
    setFormTelefone("");
    setFormEndereco("");
    setFormCidade("");
    setFormEstado("");
    setFormCep("");
    setFormResponsavel("");
  };
  
  const handleOpenEditModal = (cliente: ClienteSistema) => {
    setCurrentCliente(cliente);
    setFormRazaoSocial(cliente.razaoSocial);
    setFormTipo(cliente.tipo);
    setFormNumeroEmpregados(cliente.numeroEmpregados);
    setFormSituacao(cliente.situacao);
    setFormCnpj(cliente.cnpj);
    setFormEmail(cliente.email);
    setFormTelefone(cliente.telefone);
    setFormEndereco(cliente.endereco);
    setFormCidade(cliente.cidade);
    setFormEstado(cliente.estado);
    setFormCep(cliente.cep);
    setFormResponsavel(cliente.responsavel);
    setOpenEditModal(true);
  };
  
  const handleOpenDeleteModal = (cliente: ClienteSistema) => {
    setCurrentCliente(cliente);
    setOpenDeleteModal(true);
  };
  
  const handleAddCliente = () => {
    try {
      addClienteSistema({
        razaoSocial: formRazaoSocial,
        tipo: formTipo,
        numeroEmpregados: formNumeroEmpregados,
        situacao: formSituacao,
        cnpj: formCnpj,
        email: formEmail,
        telefone: formTelefone,
        endereco: formEndereco,
        cidade: formCidade,
        estado: formEstado,
        cep: formCep,
        responsavel: formResponsavel
      });
      refreshClientes();
      setOpenNewModal(false);
      clearForm();
      toast.success("Cliente adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar cliente.");
    }
  };
  
  const handleUpdateCliente = () => {
    if (!currentCliente) return;
    
    try {
      updateClienteSistema({
        ...currentCliente,
        razaoSocial: formRazaoSocial,
        tipo: formTipo,
        numeroEmpregados: formNumeroEmpregados,
        situacao: formSituacao,
        cnpj: formCnpj,
        email: formEmail,
        telefone: formTelefone,
        endereco: formEndereco,
        cidade: formCidade,
        estado: formEstado,
        cep: formCep,
        responsavel: formResponsavel
      });
      refreshClientes();
      setOpenEditModal(false);
      clearForm();
      toast.success("Cliente atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar cliente.");
    }
  };
  
  const handleDeleteCliente = () => {
    if (!currentCliente) return;
    
    try {
      deleteClienteSistema(currentCliente.id);
      refreshClientes();
      setOpenDeleteModal(false);
      toast.success("Cliente excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir cliente.");
    }
  };
  
  const handleAccessClienteArea = (cliente: ClienteSistema) => {
    localStorage.setItem("sintonia:userType", "cliente");
    localStorage.setItem("sintonia:currentCliente", JSON.stringify(cliente));
    navigate("/");
  };
  
  const checkClienteStatus = (clienteId: string) => {
    const faturas = getFaturasByClienteSistemaId(clienteId);
    const hasOverdueFatura = faturas.some(
      f => f.status === 'atrasado' || 
      (f.status === 'pendente' && new Date(f.dataVencimento) < new Date())
    );
    return hasOverdueFatura ? 'atrasado' : 'em_dia';
  };
  
  const handleToggleStatus = (cliente: ClienteSistema) => {
    const newStatus: ClienteStatus = cliente.situacao === 'liberado' ? 'bloqueado' : 'liberado';
    const updatedCliente = {
      ...cliente,
      situacao: newStatus
    };
    updateClienteSistema(updatedCliente);
    refreshClientes();
    toast.success(`Cliente ${newStatus === 'liberado' ? 'liberado' : 'bloqueado'} com sucesso!`);
  };
  
  const filteredClientes = clientesSistema.filter(cliente => 
    cliente.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Clientes Sistema">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Clientes Sistema</CardTitle>
              <CardDescription>
                Cadastre e gerencie os clientes que contratam o sistema
              </CardDescription>
            </div>
            <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo cliente.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input id="razaoSocial" value={formRazaoSocial} onChange={(e) => setFormRazaoSocial(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select 
                      value={formTipo} 
                      onValueChange={(value: TipoPessoa) => setFormTipo(value)}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fisica">Pessoa Física</SelectItem>
                        <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" value={formCnpj} onChange={(e) => setFormCnpj(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroEmpregados">Número de Empregados</Label>
                    <Input 
                      id="numeroEmpregados" 
                      type="number" 
                      min={0}
                      value={formNumeroEmpregados} 
                      onChange={(e) => setFormNumeroEmpregados(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Nome do Responsável</Label>
                    <Input id="responsavel" value={formResponsavel} onChange={(e) => setFormResponsavel(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="situacao">Situação</Label>
                    <Select 
                      value={formSituacao} 
                      onValueChange={(value: ClienteStatus) => setFormSituacao(value)}
                    >
                      <SelectTrigger id="situacao">
                        <SelectValue placeholder="Selecione a situação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liberado">Liberado</SelectItem>
                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" value={formEndereco} onChange={(e) => setFormEndereco(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" value={formCidade} onChange={(e) => setFormCidade(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input id="estado" value={formEstado} onChange={(e) => setFormEstado(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" value={formCep} onChange={(e) => setFormCep(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenNewModal(false)}>Cancelar</Button>
                  <Button onClick={handleAddCliente}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="pt-4">
            <Input
              placeholder="Buscar cliente por razão social ou CNPJ..."
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
                <TableHead>Razão Social</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Funcionários</TableHead>
                <TableHead>Data de Inclusão</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Status Pagamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.razaoSocial}</TableCell>
                    <TableCell>{cliente.tipo === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}</TableCell>
                    <TableCell>{cliente.cnpj}</TableCell>
                    <TableCell>{cliente.numeroEmpregados}</TableCell>
                    <TableCell>
                      {format(new Date(cliente.dataInclusao), "dd/MM/yyyy", {locale: ptBR})}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cliente.situacao === "liberado" ? "default" : "destructive"}>
                        {cliente.situacao === "liberado" ? "Liberado" : "Bloqueado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {checkClienteStatus(cliente.id) === 'em_dia' ? (
                        <Badge variant="success" className="bg-green-500">
                          <Check className="w-4 h-4 mr-1" />
                          Em dia
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Faturas atrasadas
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleAccessClienteArea(cliente)}
                          title="Acessar Área do Cliente"
                        >
                          <ExternalLink size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(cliente)}
                          title={cliente.situacao === 'liberado' ? 'Bloquear Acesso' : 'Liberar Acesso'}
                        >
                          {cliente.situacao === 'liberado' ? 
                            <Lock size={16} /> : 
                            <Unlock size={16} />
                          }
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditModal(cliente)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteModal(cliente)}
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
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-razaoSocial">Razão Social</Label>
              <Input id="edit-razaoSocial" value={formRazaoSocial} onChange={(e) => setFormRazaoSocial(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo</Label>
              <Select 
                value={formTipo} 
                onValueChange={(value: TipoPessoa) => setFormTipo(value)}
              >
                <SelectTrigger id="edit-tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cnpj">CNPJ</Label>
              <Input id="edit-cnpj" value={formCnpj} onChange={(e) => setFormCnpj(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-numeroEmpregados">Número de Empregados</Label>
              <Input 
                id="edit-numeroEmpregados" 
                type="number" 
                min={0}
                value={formNumeroEmpregados} 
                onChange={(e) => setFormNumeroEmpregados(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input id="edit-telefone" value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-responsavel">Nome do Responsável</Label>
              <Input id="edit-responsavel" value={formResponsavel} onChange={(e) => setFormResponsavel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-situacao">Situação</Label>
              <Select 
                value={formSituacao} 
                onValueChange={(value: ClienteStatus) => setFormSituacao(value)}
              >
                <SelectTrigger id="edit-situacao">
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liberado">Liberado</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endereco">Endereço</Label>
              <Input id="edit-endereco" value={formEndereco} onChange={(e) => setFormEndereco(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cidade">Cidade</Label>
              <Input id="edit-cidade" value={formCidade} onChange={(e) => setFormCidade(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <Input id="edit-estado" value={formEstado} onChange={(e) => setFormEstado(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cep">CEP</Label>
              <Input id="edit-cep" value={formCep} onChange={(e) => setFormCep(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditModal(false)}>Cancelar</Button>
            <Button onClick={handleUpdateCliente}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o cliente "{currentCliente?.razaoSocial}". Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteCliente}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClientesPage;
