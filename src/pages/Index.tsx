
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Sistema de Avaliação ISTAS21-BR</h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Avaliação de Riscos</CardTitle>
                <CardDescription>
                  Realize avaliações de riscos psicossociais para seus funcionários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use o formulário ISTAS21-BR para identificar e avaliar os fatores de risco 
                  psicossocial no ambiente de trabalho.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate("/formulario")}>
                  Iniciar Avaliação
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cadastros</CardTitle>
                <CardDescription>
                  Gerencie empresas e funcionários no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acesse o módulo de cadastros para adicionar, editar ou remover 
                  empresas e funcionários do sistema.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/cadastros/empresas")}
                >
                  Gerenciar Cadastros
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sobre o ISTAS21-BR</h2>
            <p className="mb-4">
              O questionário ISTAS21-BR é um instrumento para identificação e avaliação 
              de fatores de risco psicossocial no trabalho. Baseado no modelo demanda-controle, 
              este instrumento permite avaliar o impacto das condições de trabalho na saúde mental 
              dos trabalhadores.
            </p>
            <p>
              Utilize o sistema para conduzir avaliações, gerar relatórios e implementar 
              medidas preventivas e corretivas nos ambientes de trabalho.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
