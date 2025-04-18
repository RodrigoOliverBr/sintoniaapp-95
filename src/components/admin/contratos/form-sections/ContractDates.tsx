
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface ContractDatesProps {
  formDataInicio: Date;
  setFormDataInicio: (value: Date) => void;
  formDataFim: Date;
  setFormDataFim: (value: Date) => void;
  formDataPrimeiroVencimento: Date;
  setFormDataPrimeiroVencimento: (value: Date) => void;
  isLoading: boolean;
}

const ContractDates: React.FC<ContractDatesProps> = ({
  formDataInicio,
  setFormDataInicio,
  formDataFim,
  setFormDataFim,
  formDataPrimeiroVencimento,
  setFormDataPrimeiroVencimento,
  isLoading,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="dataInicio">Data de Início</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formDataInicio && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formDataInicio ? (
                format(formDataInicio, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={formDataInicio}
              onSelect={(date) => date && setFormDataInicio(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataFim">Data de Fim</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formDataFim && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formDataFim ? (
                format(formDataFim, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={formDataFim}
              onSelect={(date) => date && setFormDataFim(date)}
              disabled={(date) => date < formDataInicio}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataPrimeiroVencimento">Data do Primeiro Vencimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formDataPrimeiroVencimento && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formDataPrimeiroVencimento ? (
                format(formDataPrimeiroVencimento, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={formDataPrimeiroVencimento}
              onSelect={(date) => date && setFormDataPrimeiroVencimento(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default ContractDates;
