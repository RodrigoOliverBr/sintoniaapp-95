
import React from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Home">
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
                <CardTitle>Empresas e Funcionários</CardTitle>
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
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/cadastros/empresas")}
                  >
                    Empresas
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/cadastros/funcionarios")}
                  >
                    Funcionários
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>
                  Acesse os relatórios e análises das avaliações realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Visualize diagnósticos individuais, mapas de risco psicossocial
                  e relatórios PGR para tomada de decisões.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/relatorios")}
                  className="w-full"
                >
                  Ver Relatórios
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
