
import React from "react";
import Layout from "@/components/Layout";

const ComoPreencherPage: React.FC = () => {
  return (
    <Layout title="Como Preencher">
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Como Preencher o Formulário ISTAS21-BR</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Instruções Gerais</h2>
              <p className="text-gray-700">
                O formulário ISTAS21-BR é uma ferramenta para avaliação de riscos psicossociais no ambiente de trabalho.
                Siga as orientações abaixo para preenchê-lo corretamente:
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">1. Seleção da Empresa e Funcionário</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Selecione primeiro a empresa que será avaliada</li>
                <li>Em seguida, escolha o funcionário para o qual o formulário será preenchido</li>
                <li>Por fim, selecione o formulário apropriado para a avaliação</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">2. Preenchimento das Questões</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Responda todas as perguntas com "Sim" ou "Não"</li>
                <li>Caso necessário, adicione observações nas perguntas que exigirem mais detalhes</li>
                <li>Certifique-se de que todas as perguntas foram respondidas antes de finalizar</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">3. Salvamento e Finalização</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Você pode salvar o formulário parcialmente e continuar mais tarde</li>
                <li>Utilize a opção "Salvar e Concluir" apenas quando todas as perguntas estiverem respondidas</li>
                <li>Após concluído, o formulário estará disponível para visualização no histórico</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">4. Geração de Relatórios</h3>
              <p className="text-gray-700">
                Após preencher o formulário, você poderá gerar relatórios na seção específica.
                Os relatórios mostrarão os riscos identificados e recomendações para mitigação.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComoPreencherPage;
