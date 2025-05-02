
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeStatusProps {
  employeeId: string;
}

export default function EmployeeStatus({ employeeId }: EmployeeStatusProps) {
  const [status, setStatus] = useState<string>("active");
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Aqui você poderia buscar o status do funcionário no Supabase
        // Exemplo:
        // const { data, error } = await supabase
        //  .from('funcionario_status')
        //  .select('status')
        //  .eq('funcionario_id', employeeId)
        //  .single();
        
        // Por enquanto, vamos simular um status
        setStatus("active");
      } catch (error) {
        console.error("Erro ao buscar status do funcionário:", error);
        setStatus("unknown");
      }
    };
    
    fetchStatus();
  }, [employeeId]);
  
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inativo</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-500">Suspenso</Badge>;
      default:
        return <Badge className="bg-gray-300">Desconhecido</Badge>;
    }
  };
  
  return (
    <div>
      {getStatusBadge()}
    </div>
  );
}
