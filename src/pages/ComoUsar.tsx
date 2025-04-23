import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, HelpCircle, FileSearch, ClipboardList, AlertCircle, CheckCircle2, X, BookOpen, AlertTriangle, Activity, Lightbulb, Target, Info, Shield, TrendingUp, FileLineChart, Scale } from "lucide-react";

const ComoUsar: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="metodo" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="metodo">Visão Geral</TabsTrigger>
            <TabsTrigger value="preencher">Como Preencher</TabsTrigger>
            <TabsTrigger value="avaliar">Como Avaliar</TabsTrigger>
            <TabsTrigger value="mitigacoes">Mitigações</TabsTrigger>
          </TabsList>

          <TabsContent value="metodo">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-esocial-blue">
                  <HelpCircle className="h-5 w-5" />
                  <CardTitle>Visão Geral do Método</CardTitle>
                </div>
                <CardDescription>
                  Entenda como o Sintonia.app utiliza o ISTAS21-BR para gerenciar riscos psicossociais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-4">
                    O <strong>Sintonia.app</strong> utiliza uma metodologia reconhecida para mapear 
                    riscos psicossociais nas empresas. A base da avaliação é o formulário 
                    <strong> ISTAS21-BR</strong>, validado e adaptado para atender às exigências da
                    <strong> NR-01</strong> e do <strong>eSocial</strong>.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Com esse formulário, é possível identificar fatores de risco que afetam a saúde 
                    mental dos colaboradores, como sobrecarga, baixa autonomia, clima organizacional 
                    e muito mais.
                  </p>
                  <p className="text-muted-foreground">
                    O diferencial do Sintonia.app é transformar essas informações em
                    <strong> indicadores inteligentes</strong> e <strong>planos de ação automáticos</strong>,
                    permitindo uma gestão prática, preventiva e em conformidade com a legislação.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Principais Benefícios</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Metodologia validada e reconhecida internacionalmente
                    </li>
                    <li>
                      Conformidade com a NR-01 e requisitos do eSocial
                    </li>
                    <li>
                      Identificação preventiva de riscos psicossociais
                    </li>
                    <li>
                      Geração automática de planos de ação baseados nos resultados
                    </li>
                    <li>
                      Acompanhamento contínuo e indicadores de evolução
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preencher">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-esocial-blue">
                  <FileText className="h-5 w-5" />
                  <CardTitle>Como Preencher</CardTitle>
                </div>
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
          </TabsContent>

          <TabsContent value="avaliar">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-esocial-blue">
                  <FileSearch className="h-5 w-5" />
                  <CardTitle>Como Avaliar os Resultados</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Interpretação dos Resultados</h3>
                  <p className="text-muted-foreground">
                    Os resultados do formulário ISTAS21-BR devem ser analisados considerando tanto as 
                    respostas positivas (Sim) quanto a severidade dos riscos psicossociais identificados. 
                    A interpretação adequada permitirá estabelecer prioridades e implementar ações 
                    efetivas de mitigação.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Análise por Severidade</h3>
                  
                  <div className="p-4 border rounded-lg bg-severity-light/10 border-severity-light/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-severity-light mt-1" />
                      <div>
                        <h4 className="font-medium mb-1">Levemente Prejudicial</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Interpretação:</strong> Representa um risco psicossocial de menor impacto, 
                          mas que ainda requer atenção.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Ações recomendadas:</strong> Monitoramento contínuo, ações preventivas e 
                          verificação periódica para evitar agravamento.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Prazo sugerido:</strong> Implementar melhorias dentro de 90 dias.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-severity-medium/10 border-severity-medium/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-severity-medium mt-1" />
                      <div>
                        <h4 className="font-medium mb-1">Prejudicial</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Interpretação:</strong> Indica um risco significativo que afeta 
                          diretamente o bem-estar psicológico dos trabalhadores.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Ações recomendadas:</strong> Intervenção planejada, revisão de políticas 
                          e processos, implementação de medidas corretivas específicas.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Prazo sugerido:</strong> Implementar melhorias dentro de 60 dias.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-severity-high/10 border-severity-high/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-severity-high mt-1" />
                      <div>
                        <h4 className="font-medium mb-1">Extremamente Prejudicial</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Interpretação:</strong> Representa uma situação crítica com potencial 
                          para causar danos graves à saúde mental dos trabalhadores.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Ações recomendadas:</strong> Intervenção imediata, investigação 
                          aprofundada, ações corretivas urgentes, possível afastamento dos envolvidos 
                          e suporte psicológico às vítimas.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Prazo sugerido:</strong> Implementar melhorias imediatas, dentro de 30 dias.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-esocial-blue" />
                    Avaliação dos Níveis de Risco
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Baixo (0-20%)</p>
                      <p className="text-sm text-muted-foreground">
                        Ambiente de trabalho saudável com riscos psicossociais bem controlados. Manter 
                        monitoramento e práticas preventivas.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Moderado (21-40%)</p>
                      <p className="text-sm text-muted-foreground">
                        Existem alguns fatores de risco que precisam ser abordados. Implementar melhorias 
                        nos pontos identificados e monitorar a evolução.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Considerável (41-60%)</p>
                      <p className="text-sm text-muted-foreground">
                        Presença significativa de riscos psicossociais que afetam o bem-estar dos 
                        trabalhadores. Necessário plano de ação estruturado com prazos definidos.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Alto (61-80%)</p>
                      <p className="text-sm text-muted-foreground">
                        Ambiente de trabalho com múltiplos fatores de risco que exigem intervenção 
                        prioritária. Requer ações imediatas e monitoramento constante.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Extremo (81-100%)</p>
                      <p className="text-sm text-muted-foreground">
                        Situação crítica com alto potencial de dano à saúde mental dos trabalhadores. 
                        Intervenção urgente, possível necessidade de mudanças estruturais na organização.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-esocial-blue" />
                    Estratégia de Análise
                  </h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Visão geral do resultado:</span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Avalie a proporção de respostas "Sim" em relação ao total de perguntas, 
                        entendendo o panorama geral dos riscos.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">Análise por severidade:</span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Identifique quais categorias de severidade concentram mais respostas positivas, 
                        priorizando aquelas classificadas como extremamente prejudiciais.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">Análise por seção:</span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Verifique quais áreas (Demandas Psicológicas, Organização do Trabalho, etc.) 
                        apresentam mais problemas, direcionando a intervenção de forma específica.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">Identificação de padrões:</span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Busque padrões nas respostas que possam indicar problemas sistêmicos ou 
                        relacionados a departamentos ou lideranças específicas.
                      </p>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-esocial-blue" />
                    Direcionando Ações
                  </h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Com base na análise dos resultados, as ações devem ser direcionadas considerando:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Priorização por severidade:</span> Abordar primeiro as questões 
                        extremamente prejudiciais, seguidas pelas prejudiciais.
                      </li>
                      <li>
                        <span className="font-medium">Ações de curto prazo:</span> Implementar medidas imediatas para 
                        estabilizar situações críticas (ex: afastamento em casos de assédio).
                      </li>
                      <li>
                        <span className="font-medium">Ações de médio prazo:</span> Desenvolver programas e políticas 
                        para resolver as causas raiz dos problemas identificados.
                      </li>
                      <li>
                        <span className="font-medium">Ações de longo prazo:</span> Estabelecer mudanças na cultura 
                        organizacional e capacitar lideranças para prevenir recorrências.
                      </li>
                      <li>
                        <span className="font-medium">Monitoramento contínuo:</span> Estabelecer indicadores e 
                        acompanhar a evolução dos riscos psicossociais ao longo do tempo.
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mitigacoes">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-esocial-blue">
                  <ClipboardList className="h-5 w-5" />
                  <CardTitle>Mitigações Recomendadas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Estratégias de Mitigação de Riscos Psicossociais
                  </h3>
                  <p className="text-muted-foreground">
                    A implementação de estratégias de mitigação é crucial para reduzir os riscos
                    psicossociais identificados no ambiente de trabalho. As ações devem ser
                    direcionadas para as causas dos problemas, visando promover um ambiente mais
                    saudável e produtivo.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-esocial-blue" />
                    Ações Preventivas
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">
                        Implementação de políticas de saúde mental:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Criar e divulgar políticas que promovam a saúde mental e o bem-estar no
                        trabalho, incluindo programas de apoio psicológico e combate ao estigma.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">
                        Treinamento e conscientização:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Oferecer treinamentos regulares para gestores e colaboradores sobre riscos
                        psicossociais, sinais de alerta e formas de buscar ajuda.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">
                        Promoção de um ambiente de trabalho positivo:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Incentivar a comunicação aberta, o respeito e a colaboração entre os
                        membros da equipe, criando um ambiente de apoio e confiança.
                      </p>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-esocial-blue" />
                    Ações Corretivas
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">
                        Avaliação e gestão do estresse:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Implementar programas de gestão do estresse que ensinem técnicas de
                        relaxamento, mindfulness e resolução de problemas.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">
                        Melhoria das condições de trabalho:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Realizar ajustes nas tarefas, horários e ambiente físico para reduzir a
                        sobrecarga e aumentar o conforto dos colaboradores.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">
                        Intervenção em casos de assédio:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Adotar medidas rigorosas para investigar e punir casos de assédio moral ou
                        sexual, oferecendo apoio às vítimas e promovendo uma cultura de respeito.
                      </p>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-esocial-blue" />
                    Ações de Acompanhamento
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">
                        Monitoramento contínuo:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Realizar pesquisas de clima organizacional, entrevistas e avaliações
                        periódicas para identificar novos riscos e verificar a eficácia das
                        medidas implementadas.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">
                        Ajustes nas estratégias:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Adaptar as estratégias de mitigação com base nos resultados do
                        monitoramento, garantindo que as ações estejam alinhadas com as
                        necessidades dos colaboradores e da organização.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">
                        Comunicação transparente:
                      </span>{" "}
                      <p className="text-muted-foreground mt-1">
                        Informar os colaboradores sobre as ações que estão sendo realizadas para
                        mitigar os riscos psicossociais, incentivando a participação e o
                        engajamento de todos.
                      </p>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Dicas Adicionais</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Priorize as ações de mitigação com base na severidade dos riscos
                      identificados.
                    </li>
                    <li>
                      Envolva os colaboradores no planejamento e implementação das estratégias de
                      mitigação.
                    </li>
                    <li>
                      Busque o apoio de profissionais especializados em saúde mental e segurança do
                      trabalho.
                    </li>
                    <li>
                      Documente todas as ações realizadas e os resultados obtidos.
                    </li>
                    <li>
                      Mantenha-se atualizado sobre as melhores práticas e as novas tendências em
                      gestão de riscos psicossociais.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ComoUsar;
