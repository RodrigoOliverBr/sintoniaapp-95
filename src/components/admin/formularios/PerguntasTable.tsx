
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Question } from "@/types/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PerguntasTableProps {
  perguntas: Question[];
  onEdit: (pergunta: Question) => void;
  onDelete: (id: string) => void;
}

const PerguntasTable: React.FC<PerguntasTableProps> = ({
  perguntas,
  onEdit,
  onDelete
}) => {
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
      try {
        // Check if there are any responses for this question
        const { data: respostasData, error: respostasError } = await supabase
          .from('respostas')
          .select('id')
          .eq('pergunta_id', id);

        if (respostasError) throw respostasError;
        
        if (respostasData && respostasData.length > 0) {
          toast.error("Não é possível excluir esta pergunta pois já existem respostas associadas");
          return;
        }

        const { error } = await supabase
          .from('perguntas')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success("Pergunta excluída com sucesso");
        onDelete(id);
      } catch (error) {
        console.error("Erro ao excluir pergunta:", error);
        toast.error("Erro ao excluir pergunta");
      }
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Texto</TableHead>
          <TableHead>Seção</TableHead>
          <TableHead>Risco</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {perguntas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8">
              Nenhuma pergunta cadastrada. Clique em 'Nova Pergunta' para adicionar.
            </TableCell>
          </TableRow>
        ) : (
          perguntas.map((pergunta) => (
            <TableRow key={pergunta.id}>
              <TableCell className="font-medium">{pergunta.texto}</TableCell>
              <TableCell>{pergunta.secao}</TableCell>
              <TableCell>{pergunta.risco?.texto || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(pergunta)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(pergunta.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default PerguntasTable;
