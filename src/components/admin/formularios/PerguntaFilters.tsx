
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Risk } from "@/types/form";

interface PerguntaFiltersProps {
  secoes: { nome: string; count: number; }[];
  riscos: Risk[];
  filtroSecao: string;
  filtroRisco: string;
  onSecaoChange: (value: string) => void;
  onRiscoChange: (value: string) => void;
}

const PerguntaFilters: React.FC<PerguntaFiltersProps> = ({
  secoes,
  riscos,
  filtroSecao,
  filtroRisco,
  onSecaoChange,
  onRiscoChange
}) => {
  return (
    <div className="flex gap-4">
      <Select 
        value={filtroSecao} 
        onValueChange={onSecaoChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por Seção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Seções</SelectItem>
          {secoes.map((secao) => (
            <SelectItem key={secao.nome} value={secao.nome}>
              {secao.nome} ({secao.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select 
        value={filtroRisco} 
        onValueChange={onRiscoChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por Risco" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Riscos</SelectItem>
          {riscos.map((risco) => (
            <SelectItem key={risco.id} value={risco.id}>
              {risco.texto}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PerguntaFilters;
