import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cnpj as cnpjValidator } from "cpf-cnpj-validator";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ClienteSistema } from "@/types/cadastro";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContractCreated?: () => void;
}

type ClienteStatus = "liberado" | "bloqueado" | "pendente" | "ativo" | "em-analise" | "sem-contrato" | "bloqueado-manualmente";
type TipoPessoa = "fisica" | "juridica";

const NewContractModal: React.FC<NewContractModalProps> = ({ open, onOpenChange, onContractCreated }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>("fisica");
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast: legacyToast } = useToast();

  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clientes_sistema')
          .select('*');

        if (error) {
          console.error("Erro ao buscar clientes:", error);
          legacyToast({
            variant: "destructive",
            title: "Erro!",
            description: handleSupabaseError(error),
          });
        } else {
          const clientesFormatted = data.map(cliente => ({
            ...cliente,
            dataInclusao: cliente.dataInclusao ? new Date(cliente.dataInclusao).getTime() : null,
            dataUltimaAlteracao: cliente.dataUltimaAlteracao ? new Date(cliente.dataUltimaAlteracao).getTime() : null,
          }));
          setClientes(clientesFormatted.map(cliente => ({
            ...cliente, 
            situacao: cliente.situacao as ClienteStatus,
            tipo: cliente.tipo as TipoPessoa
          })));
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        legacyToast({
          variant: "destructive",
          title: "Erro!",
          description: "Não foi possível carregar a lista de clientes.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validate CPF/CNPJ based on the selected type
    if (tipoPessoa === "fisica" && !cpfValidator.isValid(cpfCnpj)) {
      toast.error("CPF inválido.");
      setIsSaving(false);
      return;
    }

    if (tipoPessoa === "juridica" && !cnpjValidator.isValid(cpfCnpj)) {
      toast.error("CNPJ inválido.");
      setIsSaving(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .insert([
          {
            nome: nome,
            email: email,
            cpfCnpj: cpfCnpj,
            tipo: tipoPessoa,
            dataInclusao: new Date().toISOString(),
            dataUltimaAlteracao: new Date().toISOString(),
            situacao: 'pendente', // Set initial status to 'pendente'
          },
        ]);

      if (error) {
        console.error("Erro ao criar cliente:", error);
        toast.error(handleSupabaseError(error) || "Erro ao criar cliente.");
      } else {
        toast.success("Cliente criado com sucesso!");
        setNome("");
        setEmail("");
        setCpfCnpj("");
        setTipoPessoa("fisica");
        onOpenChange(false); // Close the modal
        if (onContractCreated) {
          onContractCreated(); // Refresh the contracts list
        }
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error((error as Error).message || "Erro ao criar cliente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Novo Contrato</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                type="text"
                id="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input
                type="text"
                id="cpfCnpj"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo Pessoa</Label>
              <Select value={tipoPessoa} onValueChange={(value) => setTipoPessoa(value as TipoPessoa)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Física</SelectItem>
                  <SelectItem value="juridica">Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Criando..." : "Criar Contrato"}
            </Button>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewContractModal;
