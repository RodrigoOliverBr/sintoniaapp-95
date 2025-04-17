
// Update the ClienteSistema type to include telefone and situacao
export interface ClienteSistema {
  id: string;
  razao_social: string;
  nome: string;
  tipo: string;
  numeroEmpregados: number;
  dataInclusao: number;
  situacao: ClienteStatus;
  cnpj: string;
  cpfCnpj: string;
  email: string;
  telefone?: string;
  responsavel?: string;
  contato?: string;
  planoId?: string;
  contratoId?: string;
  clienteId?: string;
}

// Explicitly define ClienteStatus type
export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente';

// Add FormResult interface that was missing
export interface FormResult {
  employeeId: string;
  data: any;
  lastUpdated: number;
}
