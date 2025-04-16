
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusFatura, Fatura } from "@/types/admin";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface FormValues {
  clienteId: string;
  clienteSistemaId: string;
  contratoId: string;
  dataEmissao: Date;
  dataVencimento: Date;
  valor: number;
  status: StatusFatura;
  numero: string;
}

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingInvoice: Fatura | null;
}

interface Cliente {
  id: string;
  razao_social: string;
}

interface Contrato {
  id: string;
  numero: string;
  cliente_id: string;
}

const statusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "atrasado", label: "Atrasado" },
  { value: "programada", label: "Programada" },
];

const InvoiceForm: React.FC<InvoiceFormProps> = ({ open, onOpenChange, onSuccess, editingInvoice }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [filteredContratos, setFilteredContratos] = useState<Contrato[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [valorFormatado, setValorFormatado] = useState("");

  const [formValues, setFormValues] = useState<FormValues>({
    clienteId: "",
    clienteSistemaId: "",
    contratoId: "",
    dataEmissao: new Date(),
    dataVencimento: new Date(),
    valor: 0,
    status: "pendente",
    numero: `FAT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
  });

  useEffect(() => {
    if (open) {
      fetchClientes();
      fetchContratos();
      
      if (editingInvoice) {
        setFormValues({
          clienteId: editingInvoice.clienteId || "",
          clienteSistemaId: editingInvoice.clienteSistemaId || "",
          contratoId: editingInvoice.contratoId || "",
          dataEmissao: new Date(editingInvoice.dataEmissao),
          dataVencimento: new Date(editingInvoice.dataVencimento),
          valor: editingInvoice.valor || 0,
          status: editingInvoice.status || "pendente",
          numero: editingInvoice.numero || "",
        });
        
        // Formatar o valor da fatura para exibição
        setValorFormatado(formatarValorParaExibicao(editingInvoice.valor || 0));
      } else {
        // Reset form for new invoice
        setFormValues({
          clienteId: "",
          clienteSistemaId: "",
          contratoId: "",
          dataEmissao: new Date(),
          dataVencimento: new Date(),
          valor: 0,
          status: "pendente",
          numero: `FAT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
        });
        
        setValorFormatado("");
      }
    }
  }, [open, editingInvoice]);

  useEffect(() => {
    if (formValues.clienteId) {
      const clienteContratos = contratos.filter(contrato => contrato.cliente_id === formValues.clienteId);
      setFilteredContratos(clienteContratos);
    } else {
      setFilteredContratos([]);
    }
  }, [formValues.clienteId, contratos]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .select('id, razao_social')
        .order('razao_social', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error("Não foi possível carregar a lista de clientes");
    }
  };

  const fetchContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('id, numero, cliente_id')
        .order('numero', { ascending: true });

      if (error) throw error;
      setContratos(data || []);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      toast.error("Não foi possível carregar a lista de contratos");
    }
  };

  const formatarValorParaExibicao = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).replace('R$', '').trim();
  };

  const parseValorParaNumero = (valorFormatado: string): number => {
    // Remove todos os caracteres não-numéricos, exceto o ponto decimal
    const valorLimpo = valorFormatado.replace(/[^0-9,]/g, '').replace(',', '.');
    return parseFloat(valorLimpo) || 0;
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValor = e.target.value;
    
    // Remove formatação existente
    let valorNumerico = inputValor.replace(/[^\d,]/g, '');
    
    // Trata a entrada do usuário
    if (valorNumerico) {
      // Converte para o formato de número
      valorNumerico = valorNumerico.replace(',', '.');
      const numero = parseFloat(valorNumerico);
      
      if (!isNaN(numero)) {
        // Atualiza o estado com o valor numérico
        setFormValues({
          ...formValues,
          valor: numero
        });
        
        // Atualiza o campo formatado
        setValorFormatado(formatarValorParaExibicao(numero));
      }
    } else {
      setFormValues({
        ...formValues,
        valor: 0
      });
      setValorFormatado('');
    }
  };

  const handleClienteChange = (value: string) => {
    setFormValues({
      ...formValues,
      clienteId: value,
      clienteSistemaId: value, // Usando o mesmo ID para ambos os campos
      contratoId: "", // Reset contrato when cliente changes
    });
  };

  const handleContratoChange = (value: string) => {
    setFormValues({
      ...formValues,
      contratoId: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validação básica
      if (!formValues.clienteId) {
        toast.error("Cliente é obrigatório");
        setIsLoading(false);
        return;
      }

      const invoiceData = {
        cliente_id: formValues.clienteId,
        cliente_sistema_id: formValues.clienteSistemaId,
        contrato_id: formValues.contratoId === 'sem-contrato' ? null : formValues.contratoId || null,
        data_emissao: formValues.dataEmissao.toISOString(),
        data_vencimento: formValues.dataVencimento.toISOString(),
        valor: formValues.valor,
        status: formValues.status,
        numero: formValues.numero,
      };

      console.log("Dados a serem salvos:", invoiceData);

      let result;
      if (editingInvoice) {
        result = await supabase
          .from('faturas')
          .update(invoiceData)
          .eq('id', editingInvoice.id);
      } else {
        result = await supabase
          .from('faturas')
          .insert([invoiceData]);
      }

      if (result.error) throw result.error;

      toast.success(editingInvoice ? "Fatura atualizada com sucesso!" : "Fatura criada com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar fatura:', error);
      toast.error("Erro ao salvar fatura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingInvoice ? "Editar Fatura" : "Adicionar Nova Fatura"}</DialogTitle>
          <DialogDescription>
            {editingInvoice ? "Altere as informações da fatura." : "Preencha as informações da nova fatura."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Cliente Select */}
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select
                value={formValues.clienteId}
                onValueChange={handleClienteChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contrato Select - Agora opcional */}
            <div className="space-y-2">
              <Label htmlFor="contrato">Contrato (opcional)</Label>
              <Select
                value={formValues.contratoId}
                onValueChange={handleContratoChange}
                disabled={isLoading || !formValues.clienteId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!formValues.clienteId ? "Selecione um cliente primeiro" : "Selecione o contrato (opcional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem-contrato">Sem contrato (cobrança avulsa)</SelectItem>
                  {filteredContratos.map((contrato) => (
                    <SelectItem key={contrato.id} value={contrato.id}>
                      {contrato.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Data de Emissão */}
              <div className="space-y-2">
                <Label htmlFor="dataEmissao">Data de Emissão</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formValues.dataEmissao && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formValues.dataEmissao ? (
                        format(formValues.dataEmissao, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formValues.dataEmissao}
                      onSelect={(date) => date && setFormValues({ ...formValues, dataEmissao: date })}
                      initialFocus
                      locale={ptBR}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data de Vencimento */}
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formValues.dataVencimento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formValues.dataVencimento ? (
                        format(formValues.dataVencimento, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formValues.dataVencimento}
                      onSelect={(date) => date && setFormValues({ ...formValues, dataVencimento: date })}
                      initialFocus
                      locale={ptBR}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valor com formato brasileiro */}
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  type="text"
                  id="valor"
                  value={`R$ ${valorFormatado}`}
                  onChange={handleValorChange}
                  placeholder="R$ 0,00"
                  disabled={isLoading}
                  className="text-right"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value) => setFormValues({ ...formValues, status: value as StatusFatura })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Número da Fatura (editável) */}
            <div className="space-y-2">
              <Label htmlFor="numero">Número da Fatura</Label>
              <Input
                id="numero"
                value={formValues.numero}
                onChange={(e) => setFormValues({ ...formValues, numero: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;
