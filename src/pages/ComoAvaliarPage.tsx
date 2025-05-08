
import React from "react";
import Layout from "@/components/Layout";

const ComoAvaliarPage: React.FC = () => {
  return (
    <Layout title="Como Avaliar">
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Como Avaliar os Resultados do ISTAS21-BR</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Metodologia de Avaliação</h2>
              <p className="text-gray-700">
                A avaliação dos resultados do ISTAS21-BR deve seguir uma metodologia específica
                para identificar corretamente os riscos psicossociais presentes no ambiente de trabalho.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">1. Interpretação das Respostas</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>As respostas "Sim" indicam presença de risco psicossocial</li>
                <li>Analise a severidade associada a cada risco identificado</li>
                <li>Considere as observações adicionais para contextualizar as respostas</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">2. Análise dos Relatórios</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>O Diagnóstico Individual apresenta os riscos por funcionário</li>
                <li>O Mapa de Risco Psicossocial mostra a distribuição de riscos na empresa</li>
                <li>O Relatório PGR fornece informações para o Programa de Gerenciamento de Riscos</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">3. Classificação dos Riscos</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Levemente Prejudicial:</strong> Requer atenção preventiva</li>
                <li><strong>Prejudicial:</strong> Necessita de intervenção a médio prazo</li>
                <li><strong>Extremamente Prejudicial:</strong> Exige ação imediata</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">4. Elaboração de Plano de Ação</h3>
              <p className="text-gray-700">
                Com base nos riscos identificados, elabore um plano de ação que priorize
                os riscos mais severos e implemente medidas de mitigação adequadas.
                Utilize as recomendações de mitigação disponíveis no sistema.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComoAvaliarPage;
