import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Risk } from "@/types/form";
import { toast } from "sonner";

interface RiscosTabProps {
  formularioId: string;
}

const RiscosTab: React.FC<RiscosTabProps> = ({ formularioId }) => {
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [formData, riscosData] = await Promise.all([
        supabase.from('formularios').select('titulo').eq('id', formularioId).single(),
        supabase.from('riscos').select('*, severidade(*)').order('texto')
      ]);

      if (formData.data) {
        setFormTitle(formData.data.titulo);
      }

      if (riscosData.data) {
        setRiscos(riscosData.data);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [formularioId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Riscos para o Formulário</h2>
          <p className="text-muted-foreground">Formulário: {formTitle}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Risco
        </Button>
      </div>

      {loading ? (
        <div>Carregando riscos...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Texto</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riscos.map((risco) => (
              <TableRow key={risco.id}>
                <TableCell>{risco.texto}</TableCell>
                <TableCell>{risco.severidade?.nivel}</TableCell>
                <TableCell className="text-right">
                  {/* Add edit/delete actions here */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default RiscosTab;
