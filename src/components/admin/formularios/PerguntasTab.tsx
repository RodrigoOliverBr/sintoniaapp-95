
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Pergunta {
  id: string;
  texto: string;
  secao: string;
  risco?: {
    id: string;
    texto: string;
    severidade?: {
      id: string;
      nivel: string;
    }
  };
  ordem?: number;
}

interface Secao {
  nome: string;
  count: number;
}

interface Risco {
  id: string;
  texto: string;
}

const PerguntasTab = () => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroSecao, setFiltroSecao] = useState<string>("all");
  const [filtroRisco, setFiltroRisco] = useState<string>("all");

  const fetchPerguntas = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('perguntas')
        .select(`
          *,
          risco:riscos (
            *,
            severidade:severidade (*)
          )
        `);

      if (filtroSecao !== "all") {
        query = query.eq('secao', filtroSecao);
      }

      if (filtroRisco !== "all") {
        query = query.eq('risco_id', filtroRisco);
      }

      const { data, error } = await query.order('secao');

      if (error) {
        throw error;
      }
      
      setPerguntas(data || []);
      
      // Extract unique sections for the filter
      const uniqueSections = Array.from(new Set(data?.map(p => p.secao) || []));
      setSecoes(
        uniqueSections.map(section => ({
          nome: section,
          count: data?.filter(p => p.secao === section).length || 0
        }))
      );
      
      // Fetch risks for the filter
      const { data: riscosData, error: riscosError } = await supabase
        .from('riscos')
        .select('id, texto')
        .order('texto');
        
      if (riscosError) {
        throw riscosError;
      }
      
      setRiscos(riscosData || []);
      
    } catch (error) {
      toast.error("Erro ao carregar perguntas");
      console.error("Erro ao carregar perguntas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerguntas();
  }, [filtroSecao, filtroRisco]);

  const handleEditPergunta = (id: string) => {
    // Will be implemented later
    console.log("Edit pergunta:", id);
  };

  const handleDeletePergunta = (id: string) => {
    // Will be implemented later
    console.log("Delete pergunta:", id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Perguntas</h2>
          <div className="flex gap-4">
            <Select 
              value={filtroSecao} 
              onValueChange={setFiltroSecao}
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
              onValueChange={setFiltroRisco}
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
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Pergunta
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando perguntas...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Texto</TableHead>
              <TableHead>Seção</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perguntas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {filtroSecao !== "all" || filtroRisco !== "all" ? 
                    "Nenhuma pergunta encontrada com os filtros selecionados." :
                    "Nenhuma pergunta cadastrada. Clique em 'Nova Pergunta' para adicionar."}
                </TableCell>
              </TableRow>
            ) : (
              perguntas.map((pergunta) => (
                <TableRow key={pergunta.id}>
                  <TableCell className="font-medium">{pergunta.texto}</TableCell>
                  <TableCell>{pergunta.secao}</TableCell>
                  <TableCell>{pergunta.risco?.texto || "-"}</TableCell>
                  <TableCell>{pergunta.ordem || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditPergunta(pergunta.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeletePergunta(pergunta.id)}
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
      )}
    </div>
  );
};

export default PerguntasTab;
