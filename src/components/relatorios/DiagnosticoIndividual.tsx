
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvaliacaoResposta, AvaliacaoRisco } from "@/types/avaliacao";
// Fix the import to use the default export from SeverityBadge
import SeverityBadge from "@/components/SeverityBadge";

interface DiagnosticoIndividualProps {
  risco: AvaliacaoRisco;
  respostas: AvaliacaoResposta[];
  companyId: string;
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({ respostas, risco }) => {
  // Agrupar respostas por risco
  const respostasPorRisco = respostas.reduce((acc, resposta) => {
    // Usamos o ID do risco fornecido como prop
    const riscoId = risco.id;
    if (!acc[riscoId]) {
      acc[riscoId] = {
        risco: risco,
        respostas: []
      };
    }
    acc[riscoId].respostas.push(resposta);
    return acc;
  }, {} as { [key: string]: { risco: AvaliacaoRisco, respostas: AvaliacaoResposta[] } });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnóstico Individual por Risco</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 pb-4">
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
                      <p className="font-medium">Pergunta ID: {resposta.perguntaId}</p>
                      <p className="text-sm text-gray-500">
                        Resposta: {resposta.resposta ? "Sim" : "Não"}
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
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIndividual;
