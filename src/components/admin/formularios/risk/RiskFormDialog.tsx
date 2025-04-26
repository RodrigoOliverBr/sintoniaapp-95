
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MitigationsList from "../MitigationsList";
import { Mitigation, Risk, Severity } from "@/types/form";

interface RiskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
  isEditing: boolean;
  novoTexto: string;
  setNovoTexto: (texto: string) => void;
  novaSeveridadeId: string;
  setNovaSeveridadeId: (id: string) => void;
  severidades: Severity[];
  mitigations: Mitigation[];
  setMitigations: React.Dispatch<React.SetStateAction<Mitigation[]>>;
}

export const RiskFormDialog: React.FC<RiskFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  loading,
  isEditing,
  novoTexto,
  setNovoTexto,
  novaSeveridadeId,
  setNovaSeveridadeId,
  severidades,
  mitigations,
  setMitigations,
}) => {
  const handleAddMitigation = () => {
    setMitigations([...mitigations, { id: '', risco_id: '', texto: '' }]);
  };

  const handleRemoveMitigation = (index: number) => {
    setMitigations(mitigations.filter((_, i) => i !== index));
  };

  const handleChangeMitigation = (index: number, texto: string) => {
    const newMitigations = [...mitigations];
    newMitigations[index] = { ...newMitigations[index], texto };
    setMitigations(newMitigations);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Risco" : "Novo Risco"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite as informações do risco e suas ações de mitigação abaixo."
              : "Preencha as informações para criar um novo risco e suas ações de mitigação."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="textoRisco">Texto</Label>
              <Input
                id="textoRisco"
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                placeholder="Digite o texto do risco"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="severidadeRisco">Severidade</Label>
              <Select
                value={novaSeveridadeId}
                onValueChange={setNovaSeveridadeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a severidade" />
                </SelectTrigger>
                <SelectContent>
                  {severidades.map((severidade) => (
                    <SelectItem key={severidade.id} value={severidade.id}>
                      {severidade.nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <MitigationsList
                mitigations={mitigations}
                onAdd={handleAddMitigation}
                onRemove={handleRemoveMitigation}
                onChange={handleChangeMitigation}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSave}
            disabled={loading || !novoTexto || !novaSeveridadeId}
          >
            {isEditing ? "Salvar alterações" : "Criar risco"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
