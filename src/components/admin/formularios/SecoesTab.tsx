
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Secao {
  nome: string;
  descricao: string | null;
  count: number;
  ordem: number;
}

const SecoesTab = () => {
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecoes = async () => {
      try {
        setLoading(true);
        // Fetch distinct sections from perguntas table
        const { data, error } = await supabase
          .from('perguntas')
          .select('secao, secao_descricao')
          .order('secao');

        if (error) {
          throw error;
        }

        // Count questions per section
        const secoesCounts = data.reduce((acc: Record<string, Secao>, item) => {
          const secao = item.secao;
          if (!acc[secao]) {
            acc[secao] = {
              nome: secao,
              descricao: item.secao_descricao,
              count: 0,
              ordem: 0, // We'll need to implement a proper ordering system later
            };
          }
          acc[secao].count++;
          return acc;
        }, {});

        setSecoes(Object.values(secoesCounts));
      } catch (error) {
        toast.error("Erro ao carregar seções");
        console.error("Erro ao carregar seções:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecoes();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Seções do Formulário</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Seção
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando seções...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Quantidade de Perguntas</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhuma seção cadastrada. Clique em 'Nova Seção' para adicionar.
                </TableCell>
              </TableRow>
            ) : (
              secoes.map((secao) => (
                <TableRow key={secao.nome}>
                  <TableCell className="font-medium">{secao.nome}</TableCell>
                  <TableCell>{secao.descricao || "-"}</TableCell>
                  <TableCell>{secao.count}</TableCell>
                  <TableCell>{secao.ordem || "-"}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default SecoesTab;
