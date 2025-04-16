import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { Plano } from "@/types/admin";

interface PlanoPersistenceModalProps {
  plano?: Plano | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (plano: Omit<Plano, 'id'>) => void;
}

const PlanoPersistenceModal: React.FC<PlanoPersistenceModalProps> = ({
  plano,
  isOpen,
  onOpenChange,
  onSubmit
}) => {
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
    if (plano) {
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
    }
  }, [plano]);

  const handleSubmit = () => {
    onSubmit({
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
    });
    onOpenChange(false);
  };

  const isEditing = !!plano;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Plano" : "Adicionar Novo Plano"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações do plano comercial." 
              : "Preencha as informações do novo plano comercial."}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanoPersistenceModal;
