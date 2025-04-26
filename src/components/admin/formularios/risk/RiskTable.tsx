
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Risk } from "@/types/form";

interface RiskTableProps {
  risks: Risk[];
  onEdit: (risk: Risk) => void;
  onDelete: (risk: Risk) => void;
}

export const RiskTable: React.FC<RiskTableProps> = ({
  risks,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Texto</TableHead>
          <TableHead>Severidade</TableHead>
          <TableHead>Mitigações</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {risks.map((risco) => (
          <TableRow key={risco.id}>
            <TableCell className="font-medium">{risco.texto}</TableCell>
            <TableCell>{risco.severidade?.nivel}</TableCell>
            <TableCell>
              {/* Use optional chaining to safely access mitigations length */}
              {Array.isArray(risco.mitigations) ? risco.mitigations.length : 0}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(risco)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(risco)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
