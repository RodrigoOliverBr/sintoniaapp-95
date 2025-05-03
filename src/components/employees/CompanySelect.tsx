
import React, { useEffect } from "react";
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

const CompanySelect: React.FC<CompanySelectProps> = ({
  companies,
  selectedCompanyId,
  onCompanyChange,
  onNewEmployee,
}) => {
  const safeCompanies = Array.isArray(companies) ? companies : [];
  
  // Log para depuração
  useEffect(() => {
    console.log("CompanySelect: Empresas carregadas:", safeCompanies.length, safeCompanies);
    console.log("CompanySelect: Empresa selecionada:", selectedCompanyId);
  }, [safeCompanies, selectedCompanyId]);

  return (
    <div className="flex items-center gap-2 w-full justify-between">
      <div className="flex items-center gap-2 flex-1">
        <Select
          value={selectedCompanyId || undefined}
          onValueChange={onCompanyChange}
        >
          <SelectTrigger className="w-full max-w-[300px] bg-white">
            <SelectValue placeholder={
              safeCompanies.length === 0 
                ? "Carregando empresas..." 
                : "Selecione uma empresa"
            } />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white">
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
      </div>
      
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
