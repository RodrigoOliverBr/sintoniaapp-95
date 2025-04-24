
import React from "react";
import { Company } from "@/types/cadastro";
import { Button } from "@/components/ui/button";

interface CompanySelectProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onCompanyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onNewEmployee: () => void;
}

const CompanySelect: React.FC<CompanySelectProps> = ({
  companies,
  selectedCompanyId,
  onCompanyChange,
  onNewEmployee,
}) => {
  // Find the selected company name to display in the button
  const selectedCompany = selectedCompanyId 
    ? companies.find(company => company.id === selectedCompanyId)
    : null;

  return (
    <div className="flex space-x-2">
      <select
        className="border rounded px-2 py-1"
        onChange={onCompanyChange}
        value={selectedCompanyId || ""}
      >
        <option value="">Selecione uma empresa</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
      <Button onClick={onNewEmployee} disabled={!selectedCompanyId}>
        Novo Funcionário
      </Button>
    </div>
  );
};

export default CompanySelect;
