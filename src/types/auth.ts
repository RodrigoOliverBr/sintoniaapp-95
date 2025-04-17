
export interface UserProfile {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  tipo: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  impersonatedClient: ClienteSistema | null;
  isImpersonating: boolean;
  isAdmin: boolean;
  isClient: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  endImpersonation: () => void;
  startImpersonation: (client: ClienteSistema) => void;
}

export interface ClienteSistema {
  id: string;
  razaoSocial: string;
  nome?: string; // Alias for backward compatibility
  tipo?: string;
  numeroEmpregados?: number;
  dataInclusao?: number; // timestamp
  situacao: string;
  cnpj: string;
  cpfCnpj?: string; // Alias for backward compatibility
  email: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  responsavel: string;
  contato?: string; // Alias for backward compatibility
  planoId?: string;
  contratoId?: string;
  clienteId?: string; // For backward compatibility
}
