
export const validateEmployeeForm = (name: string, cpf: string, roleId: string, companyId: string, selectedDepartments: string[]) => {
  if (!name.trim() || !cpf.trim() || !roleId || !companyId || selectedDepartments.length === 0) {
    return {
      isValid: false,
      message: "Todos os campos são obrigatórios"
    };
  }
  return { isValid: true };
};

export const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "");
  
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  } else if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  } else {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  }
};
