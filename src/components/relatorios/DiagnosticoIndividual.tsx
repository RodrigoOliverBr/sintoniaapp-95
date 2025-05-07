
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvaliacaoResposta } from "@/types/avaliacao";
import SeverityBadge from "@/components/SeverityBadge";

interface DiagnosticoIndividualProps {
  respostas: AvaliacaoResposta[];
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({ respostas }) => {
  // Agrupar respostas por risco - verifying respostas is an array first
  const respostasPorRisco = Array.isArray(respostas) ? respostas.reduce((acc, resposta) => {
    if (!resposta.pergunta?.risco) return acc;

    const riscoId = resposta.pergunta.risco.id;
    if (!acc[riscoId]) {
      acc[riscoId] = {
        risco: resposta.pergunta.risco,
        respostas: []
      };
    }
    acc[riscoId].respostas.push(resposta);
    return acc;
  }, {} as { [key: string]: { risco: any, respostas: AvaliacaoResposta[] } }) : {};

  const hasRespostas = Array.isArray(respostas) && respostas.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnóstico Individual por Risco</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 pb-4">
        {hasRespostas ? (
          <ScrollArea className="h-[500px] w-full pr-2">
            <div className="space-y-4">
              {Object.entries(respostasPorRisco).map(([riscoId, { risco, respostas }]) => (
                <div key={riscoId} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{risco.texto}</h3>
                    {risco.severidade && <SeverityBadge severity={risco.severidade} />}
                  </div>
                  <ul className="list-disc pl-5 space-y-2">
                    {respostas.map((resposta) => (
                      <li key={resposta.id}>
                        <p className="font-medium">{resposta.pergunta.texto}</p>
                        <p className="text-sm text-gray-500">
                          Resposta: {resposta.resposta_texto || "Não respondido"}
                        </p>
                        {resposta.observacao && (
                          <p className="text-sm italic mt-1">
                            Observação: {resposta.observacao}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center p-8 text-gray-500">
            Nenhuma resposta disponível para exibir.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIndividual;
