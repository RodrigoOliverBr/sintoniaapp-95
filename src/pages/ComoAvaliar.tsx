
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BookOpen, 
  AlertTriangle, 
  Activity, 
  Lightbulb, 
  Target, 
  Info, 
  FileText, 
  Shield, 
  TrendingUp, 
  FileLineChart,
  Scale,
  CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ComoAvaliar: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="avaliacao" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="avaliacao">Como Avaliar</TabsTrigger>
            <TabsTrigger value="sobre">Sobre o Formulário</TabsTrigger>
          </TabsList>
          
          <TabsContent value="avaliacao">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2 text-esocial-blue">
                  <BookOpen className="h-5 w-5" />
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
          
          <TabsContent value="sobre">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2 text-esocial-blue">
                  <Info className="h-5 w-5" />
                  <CardTitle>Sobre o Formulário ISTAS21-BR</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-esocial-blue" />
                    Origem e Desenvolvimento
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O ISTAS21-BR é uma adaptação brasileira do questionário Copenhagen Psychosocial 
                    Questionnaire (COPSOQ), originalmente desenvolvido na Dinamarca e posteriormente 
                    adaptado pelo Instituto Sindical de Trabajo, Ambiente y Salud (ISTAS) da Espanha.
                  </p>
                  <p className="text-muted-foreground">
                    A versão brasileira foi adaptada considerando as particularidades do contexto 
                    laboral do Brasil e está alinhada às exigências da Norma Regulamentadora nº 01 (NR-01), 
                    que estabelece disposições gerais e gerenciamento de riscos ocupacionais.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-esocial-blue" />
                    Base Legal e Normativa
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    A aplicação do ISTAS21-BR está fundamentada na NR-01, que incluiu os riscos 
                    psicossociais entre os fatores de risco ocupacional a serem gerenciados pelas 
                    organizações. Esta norma estabelece a obrigatoriedade de identificação, avaliação 
                    e controle dos riscos psicossociais, assim como os demais riscos ocupacionais.
                  </p>
                  <p className="text-muted-foreground">
                    A inclusão dos riscos psicossociais na NR-01 representa um avanço significativo 
                    na legislação trabalhista brasileira, reconhecendo a importância da saúde mental 
                    dos trabalhadores no ambiente laboral.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-esocial-blue" />
                    Objetivo e Finalidade
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O principal objetivo do formulário ISTAS21-BR é identificar, avaliar e monitorar 
                    os fatores de risco psicossocial presentes no ambiente de trabalho que podem 
                    afetar a saúde mental e o bem-estar dos trabalhadores.
                  </p>
                  <p className="text-muted-foreground">
                    O instrumento permite:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>
                      Mapear os principais riscos psicossociais presentes na organização
                    </li>
                    <li>
                      Avaliar a severidade e o impacto potencial desses riscos
                    </li>
                    <li>
                      Identificar áreas que necessitam de intervenção prioritária
                    </li>
                    <li>
                      Estabelecer uma base para o desenvolvimento de programas de prevenção
                    </li>
                    <li>
                      Monitorar a evolução dos riscos psicossociais ao longo do tempo
                    </li>
                    <li>
                      Atender às exigências legais relacionadas à gestão de riscos ocupacionais
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <FileLineChart className="h-5 w-5 text-esocial-blue" />
                    Estrutura e Dimensões Avaliadas
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O formulário ISTAS21-BR está estruturado em diferentes seções, cada uma avaliando 
                    dimensões específicas dos riscos psicossociais:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Demandas Psicológicas</p>
                      <p className="text-sm text-muted-foreground">
                        Avalia exigências cognitivas e emocionais no trabalho, pressão por resultados 
                        e prazos, necessidade de esconder emoções.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Organização e Gestão do Trabalho</p>
                      <p className="text-sm text-muted-foreground">
                        Analisa aspectos como horários, turnos, clareza sobre funções e responsabilidades, 
                        previsibilidade nas tarefas.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Trabalho Ativo e Desenvolvimento de Competências</p>
                      <p className="text-sm text-muted-foreground">
                        Avalia autonomia na execução do trabalho, oportunidades de desenvolvimento 
                        profissional, utilização de habilidades e conhecimentos.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Apoio Social e Qualidade da Liderança</p>
                      <p className="text-sm text-muted-foreground">
                        Examina relações interpessoais, apoio de superiores e colegas, qualidade da 
                        gestão e comunicação.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Compensação e Reconhecimento</p>
                      <p className="text-sm text-muted-foreground">
                        Analisa a percepção sobre recompensas, reconhecimento, estabilidade no emprego 
                        e perspectivas de carreira.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Dupla Presença: Conflito Trabalho-Casa</p>
                      <p className="text-sm text-muted-foreground">
                        Avalia o equilíbrio entre vida profissional e pessoal, conflitos de tempo e 
                        energia entre as duas esferas.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Assédio Moral e Sexual</p>
                      <p className="text-sm text-muted-foreground">
                        Identifica situações de violência psicológica e sexual no ambiente de trabalho.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-esocial-blue" />
                    Classificação de Severidade
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    As questões do formulário são classificadas em três níveis de severidade:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Levemente Prejudicial</p>
                      <p className="text-sm text-muted-foreground">
                        Situações que representam um risco de menor impacto, mas que ainda devem ser 
                        monitoradas e tratadas preventivamente.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Prejudicial</p>
                      <p className="text-sm text-muted-foreground">
                        Condições com potencial significativo para afetar a saúde mental e o bem-estar 
                        dos trabalhadores, exigindo ações corretivas.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Extremamente Prejudicial</p>
                      <p className="text-sm text-muted-foreground">
                        Situações críticas que podem causar danos graves à saúde mental, demandando 
                        intervenção imediata, como casos de assédio moral ou sexual.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-esocial-blue" />
                    Uso Prático nas Empresas
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    O ISTAS21-BR pode ser utilizado pelas empresas como:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Ferramenta diagnóstica:</span> Para identificar os principais 
                      riscos psicossociais presentes no ambiente de trabalho.
                    </li>
                    <li>
                      <span className="font-medium">Instrumento de compliance:</span> Para atender às exigências da 
                      NR-01 relacionadas à gestão de riscos psicossociais.
                    </li>
                    <li>
                      <span className="font-medium">Base para programas preventivos:</span> Orientando o desenvolvimento 
                      de ações de promoção da saúde mental no trabalho.
                    </li>
                    <li>
                      <span className="font-medium">Indicador de saúde organizacional:</span> Permitindo o monitoramento 
                      contínuo da qualidade do ambiente psicossocial.
                    </li>
                    <li>
                      <span className="font-medium">Evidência para defesa legal:</span> Documentando as ações da empresa 
                      para gerenciar riscos psicossociais em caso de reclamações trabalhistas.
                    </li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    A aplicação regular do formulário permite às organizações acompanhar a evolução dos 
                    riscos psicossociais ao longo do tempo e avaliar a efetividade das medidas de 
                    controle implementadas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ComoAvaliar;
