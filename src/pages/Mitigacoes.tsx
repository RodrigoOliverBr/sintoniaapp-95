
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LifeBuoy, 
  Brain, 
  Clock, 
  UserCheck, 
  UsersRound,
  ShieldAlert,
  Scale,
  HeartHandshake
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Mitigacoes: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
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

                    <div>
                      <h4 className="font-medium mb-2">Violência Psicológica</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Treinar líderes e equipes para identificar sinais de violência psicológica</li>
                        <li>Implementar programas de educação sobre comunicação não-violenta</li>
                        <li>Criar espaços seguros para discussão de problemas interpessoais</li>
                        <li>Monitorar índices de afastamento e rotatividade como alertas</li>
                        <li>Realizar avaliações periódicas de clima organizacional com foco em violência psicológica</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Cultura de Respeito e Dignidade</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Promover valores organizacionais pautados no respeito à dignidade</li>
                        <li>Incluir comportamentos respeitosos como critério em avaliações de desempenho</li>
                        <li>Reconhecer e celebrar exemplos positivos de respeito e inclusão</li>
                        <li>Garantir que lideranças deem exemplo de comportamento respeitoso</li>
                        <li>Implementar treinamentos sobre vieses inconscientes e diversidade</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:bg-esocial-lightGray/50">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-esocial-blue" />
                    <span className="font-medium">Reconhecimento e Segurança</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Estabilidade e Segurança no Emprego</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Estabelecer comunicação transparente sobre situação e perspectivas da empresa</li>
                        <li>Evitar ameaças de demissão como ferramenta de gestão</li>
                        <li>Implementar critérios claros e objetivos para decisões sobre desligamentos</li>
                        <li>Oferecer programas de recolocação e apoio em caso de necessidade de redução</li>
                        <li>Criar planos de carreira e desenvolvimento que promovam segurança no emprego</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Reconhecimento e Valorização</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Implementar programas estruturados de reconhecimento e premiação</li>
                        <li>Capacitar líderes em técnicas de feedback positivo e construtivo</li>
                        <li>Realizar celebrações de conquistas e marcos importantes</li>
                        <li>Criar sistemas de reconhecimento entre pares</li>
                        <li>Garantir que reconhecimentos sejam justos, transparentes e frequentes</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Gestão de Mudanças Organizacionais</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Comunicar mudanças com antecedência e de forma transparente</li>
                        <li>Envolver funcionários no planejamento e implementação de mudanças</li>
                        <li>Oferecer suporte e capacitação para adaptação a novas condições</li>
                        <li>Realizar avaliações do impacto psicossocial de grandes mudanças</li>
                        <li>Implementar período de transição adequado para mudanças significativas</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recompensa pelo Esforço</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Estabelecer sistemas justos de remuneração baseados em contribuições</li>
                        <li>Implementar bônus e incentivos por resultados alcançados</li>
                        <li>Criar programas de participação nos resultados</li>
                        <li>Oferecer benefícios flexíveis que atendam diferentes necessidades</li>
                        <li>Garantir equilíbrio entre exigências e compensações</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:bg-esocial-lightGray/50">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-5 w-5 text-esocial-blue" />
                    <span className="font-medium">Promoção de Saúde Mental</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Programas de Bem-Estar</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Implementar programas regulares de educação sobre saúde mental</li>
                        <li>Oferecer atividades de redução de estresse (meditação, yoga, etc.)</li>
                        <li>Criar espaços de descompressão no ambiente de trabalho</li>
                        <li>Promover práticas de mindfulness e atenção plena</li>
                        <li>Realizar campanhas sobre equilíbrio trabalho-vida e autocuidado</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Suporte Psicológico</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Disponibilizar Programa de Apoio ao Empregado (PAE) com acesso a psicólogos</li>
                        <li>Garantir confidencialidade absoluta nos serviços de apoio</li>
                        <li>Promover grupos de apoio facilitados por profissionais</li>
                        <li>Treinar líderes para identificar sinais de sofrimento psíquico</li>
                        <li>Criar protocolo para acolhimento e encaminhamento de casos identificados</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Combate ao Estigma</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Realizar campanhas educativas sobre saúde mental no trabalho</li>
                        <li>Promover relatos e depoimentos que normalizem o cuidado com a saúde mental</li>
                        <li>Capacitar líderes para abordagem adequada de questões de saúde mental</li>
                        <li>Incluir temas de saúde mental em comunicações internas regulares</li>
                        <li>Monitorar e combater linguagem estigmatizante no ambiente de trabalho</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Cultura de Prevenção</h4>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Implementar avaliação periódica de riscos psicossociais</li>
                        <li>Criar indicadores para monitoramento contínuo da saúde mental</li>
                        <li>Estabelecer comitê multidisciplinar para promoção da saúde mental</li>
                        <li>Incluir saúde mental como pauta em reuniões gerenciais regulares</li>
                        <li>Desenvolver planos preventivos baseados em dados e evidências</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Mitigacoes;
