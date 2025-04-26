
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

interface Mitigacao {
  id: string;
  texto: string;
  risco: {
    id: string;
    texto: string;
  } | null;
}

interface Risco {
  id: string;
  texto: string;
}

const MitigacoesTab = () => {
  const [mitigacoes, setMitigacoes] = useState<Mitigacao[]>([]);
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRisco, setFiltroRisco] = useState<string>("");

  const fetchMitigacoes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('mitigacoes')
        .select(`
          *,
          risco:riscos (
            id,
            texto
          )
        `);

      if (filtroRisco) {
        query = query.eq('risco_id', filtroRisco);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      setMitigacoes(data || []);
      
    } catch (error) {
      toast.error("Erro ao carregar ações de mitigação");
      console.error("Erro ao carregar ações de mitigação:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiscos = async () => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select('id, texto')
        .order('texto');
        
      if (error) {
        throw error;
      }
      
      setRiscos(data || []);
    } catch (error) {
      toast.error("Erro ao carregar riscos");
      console.error("Erro ao carregar riscos:", error);
    }
  };

  useEffect(() => {
    fetchRiscos();
    fetchMitigacoes();
  }, []);

  useEffect(() => {
    fetchMitigacoes();
  }, [filtroRisco]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Ações de Mitigação</h2>
          <div className="flex gap-4">
            <Select 
              value={filtroRisco} 
              onValueChange={setFiltroRisco}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Riscos</SelectItem>
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
          Nova Ação de Mitigação
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando ações de mitigação...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Texto</TableHead>
              <TableHead>Risco Associado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mitigacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  {filtroRisco ? 
                    "Nenhuma ação de mitigação encontrada para este risco." :
                    "Nenhuma ação de mitigação cadastrada. Clique em 'Nova Ação de Mitigação' para adicionar."}
                </TableCell>
              </TableRow>
            ) : (
              mitigacoes.map((mitigacao) => (
                <TableRow key={mitigacao.id}>
                  <TableCell className="font-medium">{mitigacao.texto}</TableCell>
                  <TableCell>{mitigacao.risco?.texto || "-"}</TableCell>
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

export default MitigacoesTab;
