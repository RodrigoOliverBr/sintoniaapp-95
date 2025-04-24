
import React from "react";
import { Company } from "@/types/cadastro";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompanySelectProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onCompanyChange: (value: string) => void;
  onNewEmployee: () => void;
}

const CompanySelect = ({
  companies,
  selectedCompanyId,
  onCompanyChange,
  onNewEmployee,
}: CompanySelectProps) => {
  // Ensure we always have a valid array of companies
  const safeCompanies = Array.isArray(companies) ? companies : [];

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedCompanyId || undefined}
        onValueChange={onCompanyChange}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[200px]">
            {safeCompanies.length > 0 ? (
              safeCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="empty" disabled>
                Nenhuma empresa disponível
              </SelectItem>
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
      
      <Button 
        onClick={onNewEmployee} 
        disabled={!selectedCompanyId}
        className="whitespace-nowrap"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Novo Funcionário
      </Button>
    </div>
  );
};

export default CompanySelect;
