
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
  CheckCircle2,
  LifeBuoy, 
  Brain, 
  Clock, 
  UserCheck, 
  UsersRound,
  ShieldAlert,
  HeartHandshake
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ComoAvaliar: React.FC = () => {
  return (
    <Layout title="Como Avaliar">
      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="avaliacao" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="avaliacao">Como Avaliar</TabsTrigger>
            <TabsTrigger value="sobre">Sobre o Formulário</TabsTrigger>
            <TabsTrigger value="mitigacoes">Mitigações</TabsTrigger>
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

          <TabsContent value="mitigacoes">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2 text-esocial-blue">
                  <LifeBuoy className="h-5 w-5" />
                  <CardTitle>Guia de Mitigações para Riscos Psicossociais</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Este guia apresenta estratégias e ações recomendadas para mitigar os riscos 
                  psicossociais identificados através do ISTAS21-BR. As medidas estão organizadas 
                  por categorias, abordando diferentes aspectos do ambiente de trabalho que podem 
                  afetar a saúde mental dos trabalhadores.
                </p>

                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="item-1" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:bg-esocial-lightGray/50">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-esocial-blue" />
                        <span className="font-medium">Gestão de Demandas Psicológicas</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Pressão por Metas e Prazos</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Estabelecer metas realistas e alcançáveis, baseadas em indicadores objetivos</li>
                            <li>Implementar sistemas de avaliação de desempenho transparentes e justos</li>
                            <li>Revisar periodicamente prazos e ajustá-los quando necessário</li>
                            <li>Oferecer recursos adequados para o cumprimento das tarefas designadas</li>
                            <li>Estabelecer canais de comunicação para reportar prazos irrealistas</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Ansiedade e Preocupação nas Decisões</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Proporcionar suporte técnico e capacitação para tomada de decisões</li>
                            <li>Implementar processos decisórios colaborativos quando apropriado</li>
                            <li>Estabelecer protocolos claros para decisões de maior complexidade</li>
                            <li>Oferecer feedback construtivo sobre decisões tomadas anteriormente</li>
                            <li>Disponibilizar suporte psicológico para gestão da ansiedade</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Exigências Emocionais</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Promover uma cultura que valorize a expressão saudável das emoções</li>
                            <li>Oferecer treinamento em inteligência emocional para funcionários e gestores</li>
                            <li>Implementar rodízio em funções com alto desgaste emocional</li>
                            <li>Criar espaços seguros para compartilhamento de sentimentos e preocupações</li>
                            <li>Disponibilizar programas de apoio psicológico confidencial</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Interrupções e Dispersão da Atenção</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Estabelecer períodos protegidos para trabalho sem interrupções</li>
                            <li>Implementar protocolos de comunicação que minimizem interrupções desnecessárias</li>
                            <li>Treinar líderes sobre o impacto negativo das interrupções frequentes</li>
                            <li>Organizar o ambiente físico para reduzir distrações</li>
                            <li>Utilizar ferramentas de gestão do tempo e priorização de tarefas</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:bg-esocial-lightGray/50">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-esocial-blue" />
                        <span className="font-medium">Organização do Tempo de Trabalho</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Jornadas Extensas e Horas Extras</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Estabelecer política clara sobre horas extras, com aviso prévio adequado</li>
                            <li>Implementar sistema de compensação justa para trabalho extraordinário</li>
                            <li>Monitorar sistematicamente a frequência e duração das horas extras</li>
                            <li>Dimensionar adequadamente as equipes para evitar sobrecarga</li>
                            <li>Garantir períodos mínimos de descanso entre jornadas</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Alterações de Turnos</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Estabelecer escalas de turnos com antecedência mínima de 15 dias</li>
                            <li>Considerar preferências e necessidades pessoais na distribuição de turnos</li>
                            <li>Limitar mudanças de última hora apenas para situações emergenciais</li>
                            <li>Criar mecanismos de compensação para alterações não programadas</li>
                            <li>Implementar rodízio justo entre turnos menos desejáveis</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Pausas Durante o Trabalho</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Garantir pausas regulares de acordo com a natureza da atividade</li>
                            <li>Criar ambientes adequados para descanso e recuperação</li>
                            <li>Estabelecer pausas adicionais para tarefas de alta concentração ou desgaste</li>
                            <li>Incentivar a realização de micropausas para alongamento e relaxamento</li>
                            <li>Monitorar o cumprimento das pausas previstas em lei</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Equilíbrio Trabalho-Vida Pessoal</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Implementar políticas de flexibilidade horária quando possível</li>
                            <li>Respeitar integralmente folgas e períodos de férias</li>
                            <li>Estabelecer limites claros para contato fora do horário de trabalho</li>
                            <li>Oferecer apoio para necessidades familiares (licenças, horários especiais)</li>
                            <li>Promover cultura organizacional que valorize o equilíbrio trabalho-vida</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:bg-esocial-lightGray/50">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-esocial-blue" />
                        <span className="font-medium">Autonomia e Desenvolvimento Profissional</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Participação nas Decisões</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Implementar reuniões regulares para coleta de sugestões e feedback</li>
                            <li>Criar canais permanentes para contribuições dos funcionários</li>
                            <li>Incluir representantes de diferentes níveis em comitês decisórios</li>
                            <li>Oferecer feedback sobre sugestões não implementadas</li>
                            <li>Reconhecer e valorizar contribuições relevantes</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Clareza de Funções e Responsabilidades</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Elaborar descrições de cargo detalhadas e atualizadas</li>
                            <li>Realizar reuniões periódicas para esclarecer expectativas</li>
                            <li>Fornecer feedback regular sobre desempenho e resultados esperados</li>
                            <li>Definir claramente os limites de autoridade e autonomia</li>
                            <li>Criar manuais e guias de referência para processos complexos</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Desenvolvimento de Competências</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Oferecer programas regulares de capacitação e desenvolvimento</li>
                            <li>Implementar planos de desenvolvimento individual</li>
                            <li>Promover rotação de funções para aprendizado multidisciplinar</li>
                            <li>Criar mentoria interna e comunidades de prática</li>
                            <li>Incentivar e apoiar a continuidade da formação acadêmica</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Inovação e Melhoria Contínua</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Estabelecer processos estruturados para avaliação de novas ideias</li>
                            <li>Promover eventos e desafios de inovação</li>
                            <li>Criar espaços físicos e temporais para experimentação</li>
                            <li>Reconhecer e celebrar iniciativas inovadoras, mesmo quando não implementadas</li>
                            <li>Treinar gestores para apoiar e estimular a criatividade das equipes</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:bg-esocial-lightGray/50">
                      <div className="flex items-center gap-2">
                        <UsersRound className="h-5 w-5 text-esocial-blue" />
                        <span className="font-medium">Relacionamento e Apoio Social</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Qualidade da Liderança</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Investir em programas de desenvolvimento de lideranças</li>
                            <li>Implementar avaliação regular de gestores por suas equipes</li>
                            <li>Capacitar líderes em habilidades de comunicação e feedback construtivo</li>
                            <li>Desenvolver competências de gestão emocional e resolução de conflitos</li>
                            <li>Selecionar líderes considerando habilidades interpessoais e técnicas</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Respeito e Reconhecimento</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Promover políticas de tolerância zero para comportamentos desrespeitosos</li>
                            <li>Implementar programas estruturados de reconhecimento</li>
                            <li>Capacitar líderes em comunicação não-violenta</li>
                            <li>Criar canais seguros para relatar situações de desrespeito</li>
                            <li>Monitorar clima organizacional com foco em respeito e valorização</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Apoio entre Pares</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Promover atividades de integração e team building</li>
                            <li>Implementar programas de mentoria e apadrinhamento</li>
                            <li>Criar espaços físicos que estimulem a interação espontânea</li>
                            <li>Incentivar o trabalho em equipe e a cooperação interdepartamental</li>
                            <li>Reconhecer e valorizar comportamentos de suporte e ajuda mútua</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Resolução de Conflitos</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Estabelecer procedimentos claros para mediação de conflitos</li>
                            <li>Treinar gestores em técnicas de resolução construtiva de conflitos</li>
                            <li>Criar canais neutros para buscar ajuda em situações de impasse</li>
                            <li>Promover cultura de diálogo e respeito às diferenças</li>
                            <li>Monitorar e intervir precocemente em situações de tensão</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:bg-esocial-lightGray/50">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-esocial-blue" />
                        <span className="font-medium">Prevenção e Combate ao Assédio</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Assédio Moral</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Estabelecer política específica de prevenção e combate ao assédio moral</li>
                            <li>Implementar canal confidencial para denúncias com proteção ao denunciante</li>
                            <li>Realizar treinamentos periódicos sobre identificação e prevenção</li>
                            <li>Garantir investigação imparcial e rápida das denúncias</li>
                            <li>Aplicar medidas disciplinares consistentes para casos confirmados</li>
                            <li>Oferecer apoio psicológico contínuo às vítimas</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Assédio Sexual</h4>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Implementar política de tolerância zero para assédio sexual</li>
                            <li>Criar protocolo específico para denúncias, com garantia de sigilo</li>
                            <li>Estabelecer comitê independente para investigação de casos</li>
                            <li>Realizar campanhas educativas e treinamentos obrigatórios</li>
                            <li>Garantir medidas protetivas imediatas para a vítima durante investigação</li>
                            <li>Oferecer apoio jurídico e psicológico especializado</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ComoAvaliar;
