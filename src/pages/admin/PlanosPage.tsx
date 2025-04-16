
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Pencil, Trash2, Plus, X, Check, CalendarIcon } from "lucide-react";
import { Plano } from "@/types/admin";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const PlanosPage: React.FC = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentPlano, setCurrentPlano] = useState<Plano | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form fields
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formValorMensal, setFormValorMensal] = useState(0);
  const [formValorImplantacao, setFormValorImplantacao] = useState(0);
  const [formLimiteEmpresas, setFormLimiteEmpresas] = useState(1);
  const [formEmpresasIlimitadas, setFormEmpresasIlimitadas] = useState(false);
  const [formLimiteEmpregados, setFormLimiteEmpregados] = useState(10);
  const [formEmpregadosIlimitados, setFormEmpregadosIlimitados] = useState(false);
  const [formDataValidade, setFormDataValidade] = useState<Date | null>(null);
  const [formSemVencimento, setFormSemVencimento] = useState(false);
  const [formAtivo, setFormAtivo] = useState(true);

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*');

      if (error) {
        throw error;
      }

      // Transform the data to match our Plano interface
      const transformedPlanos: Plano[] = data.map(item => ({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao || "",
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
    }
  };

  const handleAddPlano = async () => {
    try {
      // Transform data to match Supabase table structure
      const newPlano = {
        nome: formNome,
        descricao: formDescricao,
        valor_mensal: formValorMensal,
        valor_implantacao: formValorImplantacao,
        limite_empresas: formEmpresasIlimitadas ? null : formLimiteEmpresas,
        empresas_ilimitadas: formEmpresasIlimitadas,
        limite_empregados: formEmpregadosIlimitados ? null : formLimiteEmpregados,
        empregados_ilimitados: formEmpregadosIlimitados,
        data_validade: formSemVencimento ? null : (formDataValidade ? formDataValidade.toISOString() : null),
        sem_vencimento: formSemVencimento,
        ativo: formAtivo
      };

      const { data, error } = await supabase
        .from('planos')
        .insert([newPlano])
        .select();

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      // Add the new plano to state after successful insertion
      if (data && data.length > 0) {
        const addedPlano: Plano = {
          id: data[0].id,
          nome: data[0].nome,
          descricao: data[0].descricao || "",
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
        setOpenNewModal(false);
        clearForm();
        toast.success('Plano adicionado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar plano:', error);
      if (error.code === '42501') {
        toast.error('Erro de permissão: você não tem autorização para adicionar planos.');
      } else {
        toast.error('Erro ao adicionar plano.');
      }
    }
  };

  const handleUpdatePlano = async () => {
    if (!currentPlano) return;

    try {
      const updatedPlano = {
        nome: formNome,
        descricao: formDescricao,
        valor_mensal: formValorMensal,
        valor_implantacao: formValorImplantacao,
        limite_empresas: formEmpresasIlimitadas ? null : formLimiteEmpresas,
        empresas_ilimitadas: formEmpresasIlimitadas,
        limite_empregados: formEmpregadosIlimitados ? null : formLimiteEmpregados,
        empregados_ilimitados: formEmpregadosIlimitados,
        data_validade: formSemVencimento ? null : (formDataValidade ? formDataValidade.toISOString() : null),
        sem_vencimento: formSemVencimento,
        ativo: formAtivo
      };

      const { error } = await supabase
        .from('planos')
        .update(updatedPlano)
        .eq('id', currentPlano.id);

      if (error) {
        throw error;
      }

      // Update the plano in state
      const updatedPlanoObj: Plano = {
        ...currentPlano,
        nome: formNome,
        descricao: formDescricao,
        valorMensal: formValorMensal,
        valorImplantacao: formValorImplantacao,
        limiteEmpresas: formEmpresasIlimitadas ? 0 : formLimiteEmpresas,
        empresasIlimitadas: formEmpresasIlimitadas,
        limiteEmpregados: formEmpregadosIlimitados ? 0 : formLimiteEmpregados,
        empregadosIlimitados: formEmpregadosIlimitados,
        dataValidade: formSemVencimento ? null : (formDataValidade ? formDataValidade.getTime() : null),
        semVencimento: formSemVencimento,
        ativo: formAtivo
      };
      
      setPlanos(prevPlanos => 
        prevPlanos.map(plano => plano.id === currentPlano.id ? updatedPlanoObj : plano)
      );
      
      setOpenEditModal(false);
      clearForm();
      toast.success('Plano atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error);
      if (error.code === '42501') {
        toast.error('Erro de permissão: você não tem autorização para atualizar planos.');
      } else {
        toast.error('Erro ao atualizar plano.');
      }
    }
  };

  const handleDeletePlano = async () => {
    if (!currentPlano) return;

    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', currentPlano.id);

      if (error) {
        throw error;
      }

      setPlanos(prevPlanos => prevPlanos.filter(plano => plano.id !== currentPlano.id));
      setOpenDeleteModal(false);
      toast.success('Plano excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir plano:', error);
      if (error.code === '42501') {
        toast.error('Erro de permissão: você não tem autorização para excluir planos.');
      } else {
        toast.error('Erro ao excluir plano.');
      }
    }
  };

  const clearForm = () => {
    setFormNome("");
    setFormDescricao("");
    setFormValorMensal(0);
    setFormValorImplantacao(0);
    setFormLimiteEmpresas(1);
    setFormEmpresasIlimitadas(false);
    setFormLimiteEmpregados(10);
    setFormEmpregadosIlimitados(false);
    setFormDataValidade(null);
    setFormSemVencimento(false);
    setFormAtivo(true);
  };
  
  const handleOpenEditModal = (plano: Plano) => {
    setCurrentPlano(plano);
    setFormNome(plano.nome);
    setFormDescricao(plano.descricao || "");
    setFormValorMensal(plano.valorMensal);
    setFormValorImplantacao(plano.valorImplantacao);
    setFormLimiteEmpresas(plano.limiteEmpresas || 1);
    setFormEmpresasIlimitadas(plano.empresasIlimitadas);
    setFormLimiteEmpregados(plano.limiteEmpregados || 10);
    setFormEmpregadosIlimitados(plano.empregadosIlimitados);
    setFormDataValidade(plano.dataValidade ? new Date(plano.dataValidade) : null);
    setFormSemVencimento(plano.semVencimento);
    setFormAtivo(plano.ativo);
    setOpenEditModal(true);
  };
  
  const handleOpenDeleteModal = (plano: Plano) => {
    setCurrentPlano(plano);
    setOpenDeleteModal(true);
  };
  
  const filteredPlanos = planos.filter(plano => 
    plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plano.descricao && plano.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatarLimiteEmpresas = (plano: Plano) => {
    if (plano.empresasIlimitadas) return "Ilimitadas";
    return plano.limiteEmpresas === 1 ? "1 empresa" : `${plano.limiteEmpresas} empresas`;
  };

  const formatarLimiteEmpregados = (plano: Plano) => {
    if (plano.empregadosIlimitados) return "Ilimitados";
    return `Até ${plano.limiteEmpregados}`;
  };

  const formatarDataValidade = (plano: Plano) => {
    if (plano.semVencimento) return "Sem vencimento";
    if (!plano.dataValidade) return "Não definida";
    return format(new Date(plano.dataValidade), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <AdminLayout title="Planos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Planos</CardTitle>
              <CardDescription>
                Crie e gerencie os planos oferecidos aos clientes
              </CardDescription>
            </div>
            <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Plano</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo plano comercial.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Plano</Label>
                    <Input id="nome" value={formNome} onChange={(e) => setFormNome(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea 
                      id="descricao" 
                      value={formDescricao} 
                      onChange={(e) => setFormDescricao(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                      <Input 
                        id="valorMensal" 
                        type="number" 
                        min={0}
                        step={0.01}
                        value={formValorMensal} 
                        onChange={(e) => setFormValorMensal(Number(e.target.value))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valorImplantacao">Valor de Implantação (R$)</Label>
                      <Input 
                        id="valorImplantacao" 
                        type="number" 
                        min={0}
                        step={0.01}
                        value={formValorImplantacao} 
                        onChange={(e) => setFormValorImplantacao(Number(e.target.value))} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="limiteEmpresas">Limite de Empresas</Label>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="empresasIlimitadas"
                            checked={formEmpresasIlimitadas} 
                            onCheckedChange={setFormEmpresasIlimitadas}
                          />
                          <Label htmlFor="empresasIlimitadas" className="font-normal">Ilimitadas</Label>
                        </div>
                        {!formEmpresasIlimitadas && (
                          <Input 
                            id="limiteEmpresas" 
                            type="number" 
                            min={1}
                            value={formLimiteEmpresas} 
                            onChange={(e) => setFormLimiteEmpresas(Number(e.target.value))} 
                          />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limiteEmpregados">Limite de Empregados</Label>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="empregadosIlimitados"
                            checked={formEmpregadosIlimitados} 
                            onCheckedChange={setFormEmpregadosIlimitados}
                          />
                          <Label htmlFor="empregadosIlimitados" className="font-normal">Ilimitados</Label>
                        </div>
                        {!formEmpregadosIlimitados && (
                          <Input 
                            id="limiteEmpregados" 
                            type="number" 
                            min={1}
                            value={formLimiteEmpregados} 
                            onChange={(e) => setFormLimiteEmpregados(Number(e.target.value))} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Validade</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="semVencimento"
                          checked={formSemVencimento} 
                          onCheckedChange={setFormSemVencimento}
                        />
                        <Label htmlFor="semVencimento" className="font-normal">Sem vencimento</Label>
                      </div>
                      {!formSemVencimento && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formDataValidade && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formDataValidade ? format(formDataValidade, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formDataValidade || undefined}
                              onSelect={date => setFormDataValidade(date)}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status do Plano</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="ativo"
                        checked={formAtivo} 
                        onCheckedChange={setFormAtivo}
                      />
                      <Label htmlFor="ativo" className="font-normal">
                        {formAtivo ? "Ativo" : "Inativo"}
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenNewModal(false)}>Cancelar</Button>
                  <Button onClick={handleAddPlano}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="pt-4">
            <Input
              placeholder="Buscar plano por nome ou descrição..."
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
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valores</TableHead>
                <TableHead>Limites</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlanos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Nenhum plano encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlanos.map((plano) => (
                  <TableRow key={plano.id}>
                    <TableCell className="font-medium">{plano.nome}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{plano.descricao}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>Mensal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valorMensal)}</span>
                        <span className="text-xs text-muted-foreground">
                          Impl: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valorImplantacao)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatarLimiteEmpresas(plano)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatarLimiteEmpregados(plano)} empregados
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatarDataValidade(plano)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={plano.ativo ? "default" : "secondary"}>
                        {plano.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditModal(plano)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteModal(plano)}
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
      
      {/* Modal de Edição - Mesmo conteúdo do modal de Adição */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Atualize as informações do plano comercial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome do Plano</Label>
              <Input id="edit-nome" value={formNome} onChange={(e) => setFormNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea 
                id="edit-descricao" 
                value={formDescricao} 
                onChange={(e) => setFormDescricao(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-valorMensal">Valor Mensal (R$)</Label>
                <Input 
                  id="edit-valorMensal" 
                  type="number" 
                  min={0}
                  step={0.01}
                  value={formValorMensal} 
                  onChange={(e) => setFormValorMensal(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-valorImplantacao">Valor de Implantação (R$)</Label>
                <Input 
                  id="edit-valorImplantacao" 
                  type="number" 
                  min={0}
                  step={0.01}
                  value={formValorImplantacao} 
                  onChange={(e) => setFormValorImplantacao(Number(e.target.value))} 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-limiteEmpresas">Limite de Empresas</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="edit-empresasIlimitadas"
                      checked={formEmpresasIlimitadas} 
                      onCheckedChange={setFormEmpresasIlimitadas}
                    />
                    <Label htmlFor="edit-empresasIlimitadas" className="font-normal">Ilimitadas</Label>
                  </div>
                  {!formEmpresasIlimitadas && (
                    <Input 
                      id="edit-limiteEmpresas" 
                      type="number" 
                      min={1}
                      value={formLimiteEmpresas} 
                      onChange={(e) => setFormLimiteEmpresas(Number(e.target.value))} 
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-limiteEmpregados">Limite de Empregados</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="edit-empregadosIlimitados"
                      checked={formEmpregadosIlimitados} 
                      onCheckedChange={setFormEmpregadosIlimitados}
                    />
                    <Label htmlFor="edit-empregadosIlimitados" className="font-normal">Ilimitados</Label>
                  </div>
                  {!formEmpregadosIlimitados && (
                    <Input 
                      id="edit-limiteEmpregados" 
                      type="number" 
                      min={1}
                      value={formLimiteEmpregados} 
                      onChange={(e) => setFormLimiteEmpregados(Number(e.target.value))} 
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data de Validade</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="edit-semVencimento"
                    checked={formSemVencimento} 
                    onCheckedChange={setFormSemVencimento}
                  />
                  <Label htmlFor="edit-semVencimento" className="font-normal">Sem vencimento</Label>
                </div>
                {!formSemVencimento && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formDataValidade && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formDataValidade ? format(formDataValidade, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formDataValidade || undefined}
                        onSelect={date => setFormDataValidade(date)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status do Plano</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-ativo"
                  checked={formAtivo} 
                  onCheckedChange={setFormAtivo}
                />
                <Label htmlFor="edit-ativo" className="font-normal">
                  {formAtivo ? "Ativo" : "Inativo"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditModal(false)}>Cancelar</Button>
            <Button onClick={handleUpdatePlano}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Exclusão */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o plano "{currentPlano?.nome}". Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeletePlano}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PlanosPage;
