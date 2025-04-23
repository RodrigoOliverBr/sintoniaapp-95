
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, AlertCircle, CheckCircle2, X } from "lucide-react";

const ComoPreencher: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 text-esocial-blue">
              <HelpCircle className="h-5 w-5" />
              <CardTitle>Instruções para Preenchimento</CardTitle>
            </div>
            <CardDescription>
              O formulário ISTAS21-BR deve ser preenchido com atenção aos detalhes para garantir uma
              avaliação precisa dos riscos psicossociais no ambiente de trabalho.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Objetivo do Formulário</h3>
              <p className="text-muted-foreground">
                O ISTAS21-BR avalia riscos psicossociais no ambiente de trabalho, conforme exigido pela
                NR-01. Sua finalidade é identificar fatores que podem afetar a saúde mental dos
                trabalhadores e orientar ações de mitigação.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Passo a Passo</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <span className="font-medium">Leia cada pergunta com atenção:</span>{" "}
                  <p className="text-muted-foreground mt-1">
                    Certifique-se de entender completamente o que está sendo perguntado antes de
                    responder.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Observe o período de referência:</span>{" "}
                  <p className="text-muted-foreground mt-1">
                    Algumas perguntas se referem às últimas duas semanas, outras às últimas quatro
                    semanas. Considere apenas eventos ocorridos nestes períodos.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Responda com sinceridade:</span>{" "}
                  <p className="text-muted-foreground mt-1">
                    O objetivo é melhorar condições de trabalho, não encontrar culpados. Respostas
                    sinceras ajudarão a criar um ambiente mais saudável.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Adicione observações quando necessário:</span>{" "}
                  <p className="text-muted-foreground mt-1">
                    Em perguntas sensíveis ou que permitem comentários adicionais, forneça detalhes
                    relevantes para uma compreensão mais completa da situação.
                  </p>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Entendendo as Respostas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2 p-3 rounded-lg border">
                  <div className="mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Sim</p>
                    <p className="text-sm text-muted-foreground">
                      Indica que a situação descrita ocorreu no período especificado, podendo
                      representar um risco psicossocial.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg border">
                  <div className="mt-0.5">
                    <X className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">Não</p>
                    <p className="text-sm text-muted-foreground">
                      Indica que a situação descrita não ocorreu no período especificado, não
                      representando um risco psicossocial naquele aspecto.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Níveis de Severidade</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium">Levemente Prejudicial</p>
                    <p className="text-sm text-muted-foreground">
                      Situações que representam um impacto menor na saúde psicossocial, mas que ainda
                      assim merecem atenção e monitoramento.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Prejudicial</p>
                    <p className="text-sm text-muted-foreground">
                      Situações com impacto significativo na saúde mental e bem-estar do trabalhador,
                      exigindo intervenção.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">Extremamente Prejudicial</p>
                    <p className="text-sm text-muted-foreground">
                      Situações graves que podem causar danos severos à saúde mental, demandando
                      intervenção imediata e rigorosa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Dicas Importantes</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Complete o formulário em um ambiente tranquilo e sem interrupções.
                </li>
                <li>
                  Não se apresse nas respostas; reflita sobre cada situação apresentada.
                </li>
                <li>
                  Caso uma pergunta não se aplique à sua realidade, assinale "Não".
                </li>
                <li>
                  O preenchimento do formulário é confidencial e visa melhorar o ambiente de trabalho.
                </li>
                <li>
                  Ao finalizar, revise suas respostas antes de visualizar os resultados.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ComoPreencher;
