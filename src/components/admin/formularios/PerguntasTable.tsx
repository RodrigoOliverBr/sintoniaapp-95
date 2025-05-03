
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Secao } from "@/types/formulario";

interface PerguntaItem {
  id: string;
  texto: string;
  secao_id: string;
  formulario_id: string;
  ordem_pergunta?: number;
  opcoes?: any;
  risco_id?: string;
  observacao_obrigatoria?: boolean;
}

interface PerguntasTableProps {
  perguntas: PerguntaItem[];
  secoes: Secao[];
  onEdit: (pergunta: PerguntaItem) => void;
  onDelete: (pergunta: PerguntaItem) => void;
  isLoading: boolean;
}

const PerguntasTable: React.FC<PerguntasTableProps> = ({
  perguntas,
  secoes,
  onEdit,
  onDelete,
  isLoading,
}) => {
  
  const getSecaoNome = (secaoId: string): string => {
    const secao = secoes.find((s) => s.id === secaoId);
    return secao ? secao.titulo : "Seção não encontrada";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Ordem</TableHead>
            <TableHead className="w-[300px]">Questão</TableHead>
            <TableHead>Seção</TableHead>
            <TableHead>Observação Obrigatória</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {perguntas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhuma pergunta encontrada
              </TableCell>
            </TableRow>
          ) : (
            perguntas.map((pergunta) => (
              <TableRow key={pergunta.id}>
                <TableCell>{pergunta.ordem_pergunta || "-"}</TableCell>
                <TableCell className="font-medium">{pergunta.texto}</TableCell>
                <TableCell>{getSecaoNome(pergunta.secao_id)}</TableCell>
                <TableCell>
                  {pergunta.observacao_obrigatoria ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      Sim
                    </Badge>
                  ) : (
                    <Badge variant="outline">Não</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(pergunta)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(pergunta)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PerguntasTable;
