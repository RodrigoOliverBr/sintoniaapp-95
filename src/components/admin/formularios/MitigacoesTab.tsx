import React from "react";

interface MitigacoesTabProps {
  formularioId: string;
}

const MitigacoesTab: React.FC<MitigacoesTabProps> = ({ formularioId }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ações de Mitigação para o Formulário: {formularioId}</h2>
      <p>Esta seção permite gerenciar as ações de mitigação associadas ao formulário.</p>
      {/* Implementar conteúdo da tab de mitigações */}
    </div>
  );
};

export default MitigacoesTab;
