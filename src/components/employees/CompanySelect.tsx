
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/cadastro";

interface CompanySelectProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onCompanyChange: (companyId: string) => void;
  onNewEmployee?: () => void;
}

const CompanySelect: React.FC<CompanySelectProps> = ({
  companies,
  selectedCompanyId,
  onCompanyChange,
  onNewEmployee,
}) => {
  const handleValueChange = (value: string) => {
    onCompanyChange(value);
  };

  const handleAddEmployeeClick = () => {
    if (onNewEmployee) {
      onNewEmployee();
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-full">
        <Select
          value={selectedCompanyId || ""}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full min-w-[300px]">
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent className="min-w-[300px] z-50">
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedCompanyId && onNewEmployee && (
        <Button
          onClick={handleAddEmployeeClick}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default CompanySelect;
