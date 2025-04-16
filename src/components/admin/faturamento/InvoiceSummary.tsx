
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryProps {
  totalValue: number;
  totalCount: number;
  paidValue: number;
  paidCount: number;
  pendingValue: number;
  pendingCount: number;
  lateValue: number;
  lateCount: number;
}

const InvoiceSummary: React.FC<SummaryProps> = ({
  totalValue,
  totalCount,
  paidValue,
  paidCount,
  pendingValue,
  pendingCount,
  lateValue,
  lateCount,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Total de Faturas</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-gray-500">{totalCount} faturas no total</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Recebido</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidValue)}</p>
            <p className="text-sm text-gray-500">{paidCount} faturas pagas</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Pendente</h3>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(pendingValue)}</p>
            <p className="text-sm text-gray-500">{pendingCount} faturas pendentes</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Atrasado</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(lateValue)}</p>
            <p className="text-sm text-gray-500">{lateCount} faturas atrasadas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceSummary;
