
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvaliacaoResposta, AvaliacaoRisco } from "@/types/avaliacao";
import { Badge } from "@/components/ui/badge";
import SeverityBadge from "@/components/SeverityBadge";

interface DiagnosticoIndividualProps {
  risco: AvaliacaoRisco;
  respostas: AvaliacaoResposta[];
  companyId: string;
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({
  risco,
  respostas,
  companyId
}) => {
  // Calcular estatísticas
  const totalRespostas = respostas.length;
  const respostasSim = respostas.filter(r => r.resposta === true).length;
  const percentualSim = totalRespostas > 0 ? (respostasSim / totalRespostas) * 100 : 0;

  // Determinar nível de severidade com base no percentual
  let severidadeNivel = "Baixo";
  if (percentualSim >= 70) {
    severidadeNivel = "Alto";
  } else if (percentualSim >= 40) {
    severidadeNivel = "Médio";
  }

  // Map risk severity to appropriate object for SeverityBadge
  const severityObj = {
    id: risco.id,
    nivel: severidadeNivel
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {risco.texto || "Diagnóstico Individual"}
          <SeverityBadge severity={severityObj} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Resumo</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Total de respostas: {totalRespostas}</li>
              <li>Respostas positivas: {respostasSim} ({Math.round(percentualSim)}%)</li>
              <li>Nível de risco: {severidadeNivel}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Respostas detalhadas</h4>
            <div className="space-y-4">
              {respostas.map((resposta) => (
                <div key={resposta.id} className="border p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{resposta.perguntaId}</p>
                      <p className="text-sm text-muted-foreground">
                        Resposta: {resposta.resposta ? "Sim" : "Não"}
                      </p>
                    </div>
                    <Badge variant={resposta.resposta ? "destructive" : "outline"}>
                      {resposta.resposta ? "Sim" : "Não"}
                    </Badge>
                  </div>
                  {resposta.observacao && (
                    <div className="mt-2 text-sm">
                      <p className="text-xs text-muted-foreground">Observação:</p>
                      <p className="bg-muted p-2 rounded-sm mt-1">{resposta.observacao}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIndividual;
