
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Temporary mock data until we connect to the backend
const mockRiscos = [
  { id: "1", texto: "Desrespeito e Desvalorização Profissional", severidade: "PREJUDICIAL", acoesMitigacao: 3 },
  { id: "2", texto: "Falta de Suporte da Liderança", severidade: "LEVEMENTE PREJUDICIAL", acoesMitigacao: 2 },
  { id: "3", texto: "Gestão Inadequada de Conflitos", severidade: "PREJUDICIAL", acoesMitigacao: 3 },
  { id: "4", texto: "Isolamento e Falta de Apoio Social", severidade: "LEVEMENTE PREJUDICIAL", acoesMitigacao: 3 },
];

const RiscosTab = () => {
  const [riscos, setRiscos] = useState(mockRiscos);
  
  // In the future, we'll fetch real data from the API
  useEffect(() => {
    // Fetch risks from API when connected
    console.log("Risks component mounted, would fetch data here");
  }, []);

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "PREJUDICIAL":
        return "bg-red-500";
      case "LEVEMENTE PREJUDICIAL":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Riscos</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Risco
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Texto</TableHead>
            <TableHead>Severidade</TableHead>
            <TableHead>Ações de Mitigação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {riscos.map((risco) => (
            <TableRow key={risco.id}>
              <TableCell className="font-medium">{risco.texto}</TableCell>
              <TableCell>
                <Badge className={`${getSeveridadeColor(risco.severidade)}`}>
                  {risco.severidade}
                </Badge>
              </TableCell>
              <TableCell>{risco.acoesMitigacao}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RiscosTab;
