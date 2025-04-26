
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Formulario {
  id: string;
  titulo: string;
  descricao?: string;
  version?: string;
  created_at: string;
}

export const FormulariosListing = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFormularios();
  }, []);

  const loadFormularios = async () => {
    try {
      const { data, error } = await supabase
        .from('formularios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFormularios(data || []);
    } catch (error) {
      console.error('Erro ao carregar formulários:', error);
      toast.error('Erro ao carregar formulários');
    } finally {
      setLoading(false);
    }
  };

  const handleFormularioClick = (formularioId: string) => {
    navigate(`/admin/formularios/${formularioId}`);
  };

  if (loading) {
    return <div>Carregando formulários...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {formularios.map((formulario) => (
        <Card 
          key={formulario.id}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleFormularioClick(formulario.id)}
        >
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="text-lg">{formulario.titulo}</span>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          {formulario.descricao && (
            <CardContent>
              <p className="text-sm text-gray-600">{formulario.descricao}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
