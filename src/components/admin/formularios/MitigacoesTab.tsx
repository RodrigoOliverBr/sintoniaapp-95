
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MitigacoesTab = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Ações de Mitigação</h2>
          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por Risco" />
            </SelectTrigger>
            <SelectContent>
              {/* Risk options will be added later */}
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ação de Mitigação
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Texto</TableHead>
            <TableHead>Risco</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Table content will be added later */}
        </TableBody>
      </Table>
    </div>
  );
};

export default MitigacoesTab;
