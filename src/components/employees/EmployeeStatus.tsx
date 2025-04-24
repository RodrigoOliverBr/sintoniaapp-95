
import React from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export const getEmployeeStatusComponent = (employeeId: string) => {
  if (!employeeId) return null;
  
  const status = getFormStatusByEmployeeId(employeeId);

  switch (status) {
    case 'completed':
      return <CheckCircle className="text-green-500 h-4 w-4 inline-block mr-1" />;
    case 'pending':
      return <Clock className="text-yellow-500 h-4 w-4 inline-block mr-1" />;
    case 'error':
      return <AlertTriangle className="text-red-500 h-4 w-4 inline-block mr-1" />;
    default:
      return null;
  }
};

import { getFormStatusByEmployeeId } from "@/services";
export { getEmployeeStatusComponent };
