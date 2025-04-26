
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Formulários Disponíveis</h2>
        <Button onClick={() => navigate("/admin/formularios/novo")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Formulário
        </Button>
      </div>

      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertDescription className="text-yellow-800">
          Os formulários padrão são baseados em metodologias científicas validadas e não podem ser alterados em sua estrutura principal.
          Você pode duplicá-los e personalizar as cópias conforme necessário para sua empresa.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {formularios.map((formulario) => (
          <Card 
            key={formulario.id}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleFormularioClick(formulario.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                {formulario.titulo}
              </CardTitle>
              {formulario.version && (
                <div className="text-sm text-gray-500">
                  Versão: {formulario.version}
                </div>
              )}
            </CardHeader>
            {formulario.descricao && (
              <CardContent>
                <CardDescription>{formulario.descricao}</CardDescription>
              </CardContent>
            )}
          </Card>
        ))}

        <Card 
          className="cursor-pointer hover:bg-gray-50 transition-colors border-dashed"
          onClick={() => navigate("/admin/formularios/novo")}
        >
          <CardHeader className="flex items-center justify-center h-full text-center">
            <Plus className="h-8 w-8 text-gray-400 mb-2" />
            <CardTitle className="text-gray-600">Adicionar Novo Formulário</CardTitle>
            <CardDescription>Criar um formulário personalizado</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
