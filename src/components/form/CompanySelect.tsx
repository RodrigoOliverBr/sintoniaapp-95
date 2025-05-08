
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/cadastro";

interface CompanySelectProps {
  companies: Company[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CompanySelect: React.FC<CompanySelectProps> = ({
  companies,
  value,
  onChange,
  disabled = false
}) => {
  const sortedCompanies = React.useMemo(() => {
    return [...companies].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [companies]);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione uma empresa" />
      </SelectTrigger>
      <SelectContent>
        {sortedCompanies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.nome}
          </SelectItem>
        ))}
        {sortedCompanies.length === 0 && (
          <SelectItem value="none" disabled>
            Nenhuma empresa encontrada
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default CompanySelect;
