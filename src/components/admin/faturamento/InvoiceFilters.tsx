
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface FilterProps {
  onFilterChange: (filters: Filters) => void;
}

export interface Filters {
  search: string;
  month: string;
  status: string;
  year: string;
}

const InvoiceFilters: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    month: "all",
    status: "all",
    year: new Date().getFullYear().toString()
  });
  
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());
  
  const months = [
    { value: "all", label: "Todos os meses" },
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];
  
  const statuses = [
    { value: "all", label: "Todos os status" },
    { value: "pendente", label: "Pendente" },
    { value: "pago", label: "Pago" },
    { value: "atrasado", label: "Atrasado" },
    { value: "programada", label: "Programada" }
  ];
  
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Buscar por cliente, número da fatura ou número do contrato..." 
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </form>
        </div>
        
        <div className="w-48">
          <Select
            value={filters.month}
            onValueChange={(value) => handleFilterChange('month', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-48">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-28">
          <Select
            value={filters.year}
            onValueChange={(value) => handleFilterChange('year', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" onClick={handleSearch}>
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>
    </div>
  );
};

export default InvoiceFilters;
