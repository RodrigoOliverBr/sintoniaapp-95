
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Plano } from "@/types/admin";
import { toast } from "sonner";

interface PlanoPersistenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  planoToEdit?: Plano;
}

const PlanoPersistenceModal: React.FC<PlanoPersistenceModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  planoToEdit,
}) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorMensal, setValorMensal] = useState<number>(0);
  const [valorImplantacao, setValorImplantacao] = useState<number>(0);
  const [limiteEmpresas, setLimiteEmpresas] = useState<number>(0);
  const [limiteEmpregados, setLimiteEmpregados] = useState<number>(0);
  const [empresasIlimitadas, setEmpresasIlimitadas] = useState(false);
  const [empregadosIlimitados, setEmpregadosIlimitados] = useState(false);
  const [semVencimento, setSemVencimento] = useState(false);
  const [dataValidade, setDataValidade] = useState<Date | undefined>(undefined);
  const [ativo, setAtivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (planoToEdit) {
      setNome(planoToEdit.nome);
      setDescricao(planoToEdit.descricao || "");
      setValorMensal(Number(planoToEdit.valor_mensal));
      setValorImplantacao(Number(planoToEdit.valor_implantacao));
      setLimiteEmpresas(planoToEdit.limite_empresas || 0);
      setLimiteEmpregados(planoToEdit.limite_empregados || 0);
      setEmpresasIlimitadas(Boolean(planoToEdit.empresas_ilimitadas));
      setEmpregadosIlimitados(Boolean(planoToEdit.empregados_ilimitados));
      setSemVencimento(Boolean(planoToEdit.sem_vencimento));
      setAtivo(Boolean(planoToEdit.ativo));
      
      // Convert date from string or timestamp if exists
      if (planoToEdit.data_validade) {
        const dateValue = new Date(planoToEdit.data_validade);
        if (!isNaN(dateValue.getTime())) {
          setDataValidade(dateValue);
        }
      }
    } else {
      resetForm();
    }
  }, [planoToEdit, open]);

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setValorMensal(0);
    setValorImplantacao(0);
    setLimiteEmpresas(0);
    setLimiteEmpregados(0);
    setEmpresasIlimitadas(false);
    setEmpregadosIlimitados(false);
    setSemVencimento(false);
    setDataValidade(undefined);
    setAtivo(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome) {
      toast.error("O nome do plano é obrigatório");
      return;
    }

    setIsSubmitting(true);

    try {
      const planoData: any = {
        nome,
        descricao,
        valor_mensal: valorMensal,
        valor_implantacao: valorImplantacao,
        limite_empresas: empresasIlimitadas ? null : limiteEmpresas,
        limite_empregados: empregadosIlimitados ? null : limiteEmpregados,
        empresas_ilimitadas: empresasIlimitadas,
        empregados_ilimitados: empregadosIlimitados,
        sem_vencimento: semVencimento,
        ativo,
      };

      // Only add data_validade if semVencimento is false and dataValidade is set
      if (!semVencimento && dataValidade) {
        // Convert to ISO string for proper database storage
        planoData.data_validade = dataValidade.toISOString();
      } else {
        planoData.data_validade = null;
      }

      if (planoToEdit) {
        const { error } = await supabase
          .from("planos")
          .update(planoData)
          .eq("id", planoToEdit.id);

        if (error) throw error;
        toast.success("Plano atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("planos").insert(planoData);
        if (error) throw error;
        toast.success("Plano cadastrado com sucesso!");
      }

      // Close modal and refresh data
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      toast.error("Erro ao salvar o plano. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {planoToEdit ? "Editar Plano" : "Adicionar Novo Plano"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do novo plano comercial.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Plano</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="text-sm"
                autoFocus
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
              <Input
                id="valorMensal"
                type="number"
                value={valorMensal}
                onChange={(e) => setValorMensal(Number(e.target.value))}
                min={0}
                step="0.01"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorImplantacao">Valor de Implantação (R$)</Label>
              <Input
                id="valorImplantacao"
                type="number"
                value={valorImplantacao}
                onChange={(e) => setValorImplantacao(Number(e.target.value))}
                min={0}
                step="0.01"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="limiteEmpresas">Limite de Empresas</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="empresasIlimitadas" className="text-sm">Ilimitadas</Label>
                  <Switch
                    id="empresasIlimitadas"
                    checked={empresasIlimitadas}
                    onCheckedChange={setEmpresasIlimitadas}
                  />
                </div>
              </div>
              <Input
                id="limiteEmpresas"
                type="number"
                value={limiteEmpresas}
                onChange={(e) => setLimiteEmpresas(Number(e.target.value))}
                min={0}
                disabled={empresasIlimitadas}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="limiteEmpregados">Limite de Empregados</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="empregadosIlimitados" className="text-sm">Ilimitados</Label>
                  <Switch
                    id="empregadosIlimitados"
                    checked={empregadosIlimitados}
                    onCheckedChange={setEmpregadosIlimitados}
                  />
                </div>
              </div>
              <Input
                id="limiteEmpregados"
                type="number"
                value={limiteEmpregados}
                onChange={(e) => setLimiteEmpregados(Number(e.target.value))}
                min={0}
                disabled={empregadosIlimitados}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dataValidade">Data de Validade</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="semVencimento" className="text-sm">Sem vencimento</Label>
                  <Switch
                    id="semVencimento"
                    checked={semVencimento}
                    onCheckedChange={setSemVencimento}
                  />
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild disabled={semVencimento}>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-sm",
                      !dataValidade && !semVencimento && "text-muted-foreground"
                    )}
                    disabled={semVencimento}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataValidade && !semVencimento ? (
                      format(dataValidade, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={dataValidade}
                    onSelect={setDataValidade}
                    initialFocus
                    disabled={(date) => date < new Date("1900-01-01")}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ativo">Status do Plano</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ativo" className="text-sm">Ativo</Label>
                  <Switch
                    id="ativo"
                    checked={ativo}
                    onCheckedChange={setAtivo}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : planoToEdit ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanoPersistenceModal;
