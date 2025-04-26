import React from "react";

interface RiscosTabProps {
  formularioId: string;
}

const RiscosTab: React.FC<RiscosTabProps> = ({ formularioId }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Riscos para o Formulário: {formularioId}</h2>
      <p>Esta seção permite gerenciar os riscos associados ao formulário.</p>
      {/* Implementar conteúdo da tab de riscos */}
    </div>
  );
};

export default RiscosTab;
