
import { ClienteSistema, Plano, Contrato, Fatura, StatusFatura, CicloFaturamento, ClienteStatus } from "@/types/admin";

// Keys de localStorage
const CLIENTES_SISTEMA_KEY = "sintonia:clientesSistema";
const PLANOS_KEY = "sintonia:planos";
const CONTRATOS_KEY = "sintonia:contratos";
const FATURAS_KEY = "sintonia:faturas";
const ADMIN_USER_KEY = "sintonia:admin";

// Usuário admin padrão
const defaultAdminUser = {
  email: "admin@prolife.com",
  password: "admin123",
};

// Cliente de exemplo para login por email
const clientesIniciais: ClienteSistema[] = [
  {
    id: "1",
    razaoSocial: "eSocial Brasil",
    tipo: "juridica",
    numeroEmpregados: 50,
    dataInclusao: Date.now(),
    situacao: "liberado",
    cnpj: "12.345.678/0001-90",
    email: "contato@esocial.com.br",
    telefone: "(11) 99999-9999",
    endereco: "Av. Paulista, 1000",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100",
    responsavel: "João Silva"
  },
  {
    id: "2",
    razaoSocial: "Tech Solutions Ltda.",
    tipo: "juridica",
    numeroEmpregados: 25,
    dataInclusao: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 dias atrás
    situacao: "liberado",
    cnpj: "98.765.432/0001-10",
    email: "client@empresa.com",
    telefone: "(11) 88888-8888",
    endereco: "Rua Augusta, 500",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01305-000",
    responsavel: "Maria Oliveira"
  }
];

// Planos iniciais
const planosIniciais: Plano[] = [
  {
    id: "1",
    nome: "eSocial Brasil (Corporativo)",
    descricao: "Plano exclusivo para clientes ativos da plataforma eSocial Brasil. Todos os recursos liberados por um valor simbólico.",
    valorMensal: 99.90,
    valorImplantacao: 599.00,
    limiteEmpresas: 0,
    empresasIlimitadas: true,
    limiteEmpregados: 0,
    empregadosIlimitados: true,
    dataValidade: null,
    semVencimento: true,
    ativo: true
  },
  {
    id: "2",
    nome: "Profissional (Clientes Externos)",
    descricao: "Plano completo com diagnóstico psicossocial e relatórios de conformidade para pequenas e médias empresas.",
    valorMensal: 199.90,
    valorImplantacao: 1599.00,
    limiteEmpresas: 1,
    empresasIlimitadas: false,
    limiteEmpregados: 100,
    empregadosIlimitados: false,
    dataValidade: new Date(new Date().setMonth(new Date().getMonth() + 12)).getTime(),
    semVencimento: false,
    ativo: true
  },
  {
    id: "3",
    nome: "Plano Gratuito",
    descricao: "Versão limitada para testes e experimentações.",
    valorMensal: 0,
    valorImplantacao: 0,
    limiteEmpresas: 1,
    empresasIlimitadas: false,
    limiteEmpregados: 10,
    empregadosIlimitados: false,
    dataValidade: new Date(new Date().setDate(new Date().getDate() + 30)).getTime(),
    semVencimento: false,
    ativo: true
  }
];

// Contratos iniciais
const contratosIniciais: Contrato[] = [
  {
    id: "1",
    numero: "CONT-2025-001",
    clienteSistemaId: "1",
    planoId: "3",
    dataInicio: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 dias atrás
    dataFim: Date.now() + 305 * 24 * 60 * 60 * 1000, // em 305 dias
    dataPrimeiroVencimento: Date.now() - 30 * 24 * 60 * 60 * 1000, // Primeiro vencimento 30 dias atrás
    valorMensal: 999.90,
    status: "ativo",
    taxaImplantacao: 500,
    observacoes: "Cliente piloto",
    cicloFaturamento: "mensal",
    ciclosGerados: 2 // já gerou 2 meses de fatura
  },
  {
    id: "2",
    numero: "CONT-2025-002",
    clienteSistemaId: "2",
    planoId: "2",
    dataInicio: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 dias atrás
    dataFim: Date.now() + 335 * 24 * 60 * 60 * 1000, // em 335 dias
    dataPrimeiroVencimento: Date.now() - 15 * 24 * 60 * 60 * 1000, // Primeiro vencimento 15 dias atrás
    valorMensal: 399.90,
    status: "ativo",
    taxaImplantacao: 300,
    observacoes: "",
    cicloFaturamento: "mensal",
    ciclosGerados: 1 // já gerou 1 mês de fatura
  }
];

// Faturas iniciais
const faturasIniciais: Fatura[] = [
  {
    id: "1",
    numero: "FAT-2025-001",
    clienteSistemaId: "1",
    contratoId: "1",
    dataEmissao: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 dias atrás
    dataVencimento: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 dias atrás
    valor: 999.90,
    status: "pago",
    referencia: "03/2025"
  },
  {
    id: "2",
    numero: "FAT-2025-002",
    clienteSistemaId: "1",
    contratoId: "1",
    dataEmissao: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 dias atrás
    dataVencimento: Date.now() + 10 * 24 * 60 * 60 * 1000, // em 10 dias
    valor: 999.90,
    status: "pendente",
    referencia: "04/2025"
  },
  {
    id: "3",
    numero: "FAT-2025-003",
    clienteSistemaId: "2",
    contratoId: "2",
    dataEmissao: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 dias atrás
    dataVencimento: Date.now() + 5 * 24 * 60 * 60 * 1000, // em 5 dias
    valor: 399.90,
    status: "pendente",
    referencia: "04/2025"
  }
];

// Forçar a inicialização dos dados a cada carregamento do serviço
const inicializarDados = () => {
  // Verificar se já existe algum dado
  let deveLimpar = false;
  
  // Verificar se a estrutura de planos está atualizada (novos campos)
  const planosAtuais = localStorage.getItem(PLANOS_KEY);
  if (planosAtuais) {
    try {
      const planos = JSON.parse(planosAtuais);
      // Verificar se algum plano tem a nova estrutura
      if (planos.length > 0 && !('valorImplantacao' in planos[0])) {
        console.log("Estrutura de planos desatualizada, limpando dados...");
        deveLimpar = true;
      }
    } catch (e) {
      deveLimpar = true;
    }
  }
  
  // Verificar se clientes_sistema precisa ser inicializado
  const clientesSistemaAtuais = localStorage.getItem(CLIENTES_SISTEMA_KEY);
  if (!clientesSistemaAtuais) {
    console.log("Inicializando clientes do sistema...");
    localStorage.setItem(CLIENTES_SISTEMA_KEY, JSON.stringify(clientesIniciais));
  }

  if (deveLimpar) {
    // Limpar dados existentes para garantir a consistência
    localStorage.removeItem(CLIENTES_SISTEMA_KEY);
    localStorage.removeItem(PLANOS_KEY);
    localStorage.removeItem(CONTRATOS_KEY);
    localStorage.removeItem(FATURAS_KEY);
    
    // Reinicializar os dados
    localStorage.setItem(CLIENTES_SISTEMA_KEY, JSON.stringify(clientesIniciais));
    localStorage.setItem(PLANOS_KEY, JSON.stringify(planosIniciais));
    localStorage.setItem(CONTRATOS_KEY, JSON.stringify(contratosIniciais));
    localStorage.setItem(FATURAS_KEY, JSON.stringify(faturasIniciais));
  }
  
  // Inicializar admin
  if (!localStorage.getItem(ADMIN_USER_KEY)) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(defaultAdminUser));
    console.log("Admin inicializado");
  }
  
  // Inicializar contratos se necessário
  if (!localStorage.getItem(CONTRATOS_KEY)) {
    localStorage.setItem(CONTRATOS_KEY, JSON.stringify(contratosIniciais));
    console.log("Contratos inicializados");
  }

  // Inicializar faturas se necessário
  if (!localStorage.getItem(FATURAS_KEY)) {
    localStorage.setItem(FATURAS_KEY, JSON.stringify(faturasIniciais));
    console.log("Faturas inicializadas");
  }

  // Inicializar planos se necessário
  if (!localStorage.getItem(PLANOS_KEY)) {
    localStorage.setItem(PLANOS_KEY, JSON.stringify(planosIniciais));
    console.log("Planos inicializados");
  }
  
  console.log("Verificação de dados concluída");
};

// Inicializar dados ao carregar o serviço
inicializarDados();

// Clientes Sistema
export const getClientesSistema = (): ClienteSistema[] => {
  const clientes = localStorage.getItem(CLIENTES_SISTEMA_KEY);
  if (!clientes) {
    return [];
  }
  return JSON.parse(clientes);
};

export const getClienteSistemaById = (id: string): ClienteSistema | undefined => {
  return getClientesSistema().find(c => c.id === id);
};

export const addClienteSistema = (cliente: Omit<ClienteSistema, "id" | "dataInclusao">): ClienteSistema => {
  const clientes = getClientesSistema();
  const newCliente: ClienteSistema = {
    ...cliente,
    id: Date.now().toString(),
    dataInclusao: Date.now()
  };
  localStorage.setItem(CLIENTES_SISTEMA_KEY, JSON.stringify([...clientes, newCliente]));
  return newCliente;
};

export const updateClienteSistema = (cliente: ClienteSistema): void => {
  const clientes = getClientesSistema();
  const updatedClientes = clientes.map(c => c.id === cliente.id ? cliente : c);
  localStorage.setItem(CLIENTES_SISTEMA_KEY, JSON.stringify(updatedClientes));
};

export const deleteClienteSistema = (id: string): void => {
  const clientes = getClientesSistema();
  const filteredClientes = clientes.filter(c => c.id !== id);
  localStorage.setItem(CLIENTES_SISTEMA_KEY, JSON.stringify(filteredClientes));
  
  // Excluir contratos e faturas do cliente
  const contratos = getContratos();
  const filteredContratos = contratos.filter(c => c.clienteSistemaId !== id);
  localStorage.setItem(CONTRATOS_KEY, JSON.stringify(filteredContratos));
  
  const faturas = getFaturas();
  const filteredFaturas = faturas.filter(f => f.clienteSistemaId !== id);
  localStorage.setItem(FATURAS_KEY, JSON.stringify(filteredFaturas));
};

// Função de compatibilidade para apps que ainda usam o nome antigo
export const getClientes = getClientesSistema;
export const getClienteById = getClienteSistemaById;
export const addCliente = addClienteSistema;
export const updateCliente = updateClienteSistema;
export const deleteCliente = deleteClienteSistema;

// Planos
export const getPlanos = (): Plano[] => {
  const planos = localStorage.getItem(PLANOS_KEY);
  if (!planos) {
    localStorage.setItem(PLANOS_KEY, JSON.stringify(planosIniciais));
    return planosIniciais;
  }
  return JSON.parse(planos);
};

export const getPlanoById = (id: string): Plano | undefined => {
  return getPlanos().find(p => p.id === id);
};

export const addPlano = (plano: Omit<Plano, "id">): Plano => {
  const planos = getPlanos();
  const newPlano: Plano = {
    ...plano,
    id: Date.now().toString()
  };
  localStorage.setItem(PLANOS_KEY, JSON.stringify([...planos, newPlano]));
  return newPlano;
};

export const updatePlano = (plano: Plano): void => {
  const planos = getPlanos();
  const updatedPlanos = planos.map(p => p.id === plano.id ? plano : p);
  localStorage.setItem(PLANOS_KEY, JSON.stringify(updatedPlanos));
};

export const deletePlano = (id: string): void => {
  const planos = getPlanos();
  const filteredPlanos = planos.filter(p => p.id !== id);
  localStorage.setItem(PLANOS_KEY, JSON.stringify(filteredPlanos));
};

// Contratos
export const getContratos = (): Contrato[] => {
  const contratos = localStorage.getItem(CONTRATOS_KEY);
  if (!contratos) {
    localStorage.setItem(CONTRATOS_KEY, JSON.stringify(contratosIniciais));
    return contratosIniciais;
  }
  return JSON.parse(contratos);
};

export const getContratosByClienteSistemaId = (clienteId: string): Contrato[] => {
  return getContratos().filter(c => c.clienteSistemaId === clienteId);
};

export const getContratoById = (id: string): Contrato | undefined => {
  return getContratos().find(c => c.id === id);
};

// Função de compatibilidade
export const getContratosByClienteId = getContratosByClienteSistemaId;

export const gerarNumeroContrato = (): string => {
  const contratos = getContratos();
  const year = new Date().getFullYear();
  const num = contratos.length + 1;
  return `CONT-${year}-${num.toString().padStart(3, '0')}`;
};

export const addContrato = (contrato: Omit<Contrato, "id" | "numero" | "ciclosGerados">): Contrato => {
  const contratos = getContratos();
  const newContrato: Contrato = {
    ...contrato,
    id: Date.now().toString(),
    numero: gerarNumeroContrato(),
    ciclosGerados: 0
  };
  
  // Se não tiver data de término, calcule a proximaRenovacao para 12 ciclos
  if (contrato.planoId && getPlanoById(contrato.planoId)?.semVencimento) {
    newContrato.proximaRenovacao = calcularDataProximaRenovacao(
      new Date(contrato.dataInicio),
      contrato.cicloFaturamento,
      12
    );
  }
  
  localStorage.setItem(CONTRATOS_KEY, JSON.stringify([...contratos, newContrato]));
  
  // Após criar o contrato, gerar automaticamente as faturas programadas
  gerarFaturasProgramadas(newContrato);
  
  return newContrato;
};

export const updateContrato = (contrato: Contrato): void => {
  const contratos = getContratos();
  const updatedContratos = contratos.map(c => c.id === contrato.id ? contrato : c);
  localStorage.setItem(CONTRATOS_KEY, JSON.stringify(updatedContratos));
};

export const deleteContrato = (id: string): void => {
  const contratos = getContratos();
  const filteredContratos = contratos.filter(c => c.id !== id);
  localStorage.setItem(CONTRATOS_KEY, JSON.stringify(filteredContratos));
  
  // Excluir faturas do contrato
  const faturas = getFaturas();
  const filteredFaturas = faturas.filter(f => f.contratoId !== id);
  localStorage.setItem(FATURAS_KEY, JSON.stringify(filteredFaturas));
};

// Faturas
export const getFaturas = (): Fatura[] => {
  const faturas = localStorage.getItem(FATURAS_KEY);
  if (!faturas) {
    localStorage.setItem(FATURAS_KEY, JSON.stringify(faturasIniciais));
    return faturasIniciais;
  }
  return JSON.parse(faturas);
};

export const getFaturasByClienteSistemaId = (clienteId: string): Fatura[] => {
  return getFaturas().filter(f => f.clienteSistemaId === clienteId);
};

export const getFaturasByContratoId = (contratoId: string): Fatura[] => {
  return getFaturas().filter(f => f.contratoId === contratoId);
};

// Função de compatibilidade
export const getFaturasByClienteId = getFaturasByClienteSistemaId;

export const getFaturaById = (id: string): Fatura | undefined => {
  return getFaturas().find(f => f.id === id);
};

export const gerarNumeroFatura = (): string => {
  const faturas = getFaturas();
  const year = new Date().getFullYear();
  const num = faturas.length + 1;
  return `FAT-${year}-${num.toString().padStart(3, '0')}`;
};

export const gerarReferenciaFatura = (date: Date = new Date()): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
};

export const addFatura = (fatura: Omit<Fatura, "id" | "numero" | "referencia">): Fatura => {
  const faturas = getFaturas();
  const newFatura: Fatura = {
    ...fatura,
    id: Date.now().toString(),
    numero: gerarNumeroFatura(),
    referencia: gerarReferenciaFatura(new Date(fatura.dataEmissao))
  };
  localStorage.setItem(FATURAS_KEY, JSON.stringify([...faturas, newFatura]));
  return newFatura;
};

export const updateFatura = (fatura: Fatura): void => {
  const faturas = getFaturas();
  const updatedFaturas = faturas.map(f => f.id === fatura.id ? fatura : f);
  localStorage.setItem(FATURAS_KEY, JSON.stringify(updatedFaturas));
};

export const deleteFatura = (id: string): void => {
  const faturas = getFaturas();
  const filteredFaturas = faturas.filter(f => f.id !== id);
  localStorage.setItem(FATURAS_KEY, JSON.stringify(filteredFaturas));
};

// Funções auxiliares para o ciclo de faturamento
export const calcularDataProximaRenovacao = (
  dataInicio: Date, 
  ciclo: CicloFaturamento, 
  numeroCiclos: number
): number => {
  const data = new Date(dataInicio);
  
  switch (ciclo) {
    case 'mensal':
      data.setMonth(data.getMonth() + numeroCiclos);
      break;
    case 'trimestral':
      data.setMonth(data.getMonth() + (numeroCiclos * 3));
      break;
    case 'anual':
      data.setFullYear(data.getFullYear() + numeroCiclos);
      break;
  }
  
  return data.getTime();
};

export const calcularDataProximaFatura = (
  dataBase: Date,
  ciclo: CicloFaturamento,
  numeroCiclo: number = 1
): Date => {
  const dataFatura = new Date(dataBase);
  
  switch (ciclo) {
    case 'mensal':
      dataFatura.setMonth(dataFatura.getMonth() + numeroCiclo);
      break;
    case 'trimestral':
      dataFatura.setMonth(dataFatura.getMonth() + (numeroCiclo * 3));
      break;
    case 'anual':
      dataFatura.setFullYear(dataFatura.getFullYear() + numeroCiclo);
      break;
  }
  
  // Definir o dia do vencimento para o mesmo dia do início
  return dataFatura;
};

export const gerarFaturasProgramadas = (contrato: Contrato): Fatura[] => {
  const faturas = getFaturas();
  const faturasGeradas: Fatura[] = [];
  
  // Determinar quantas faturas devem ser geradas
  let quantidadeFaturas = 12; // Padrão: 12 faturas para contratos sem data fim
  
  // Para contratos com data fim definida, calcular quantas faturas cabem no período
  if (!getPlanoById(contrato.planoId)?.semVencimento) {
    const dataInicio = new Date(contrato.dataInicio);
    const dataFim = new Date(contrato.dataFim);
    
    switch (contrato.cicloFaturamento) {
      case 'mensal':
        quantidadeFaturas = (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + 
                            (dataFim.getMonth() - dataInicio.getMonth());
        break;
      case 'trimestral':
        quantidadeFaturas = Math.floor(((dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + 
                            (dataFim.getMonth() - dataInicio.getMonth())) / 3);
        break;
      case 'anual':
        quantidadeFaturas = dataFim.getFullYear() - dataInicio.getFullYear();
        break;
    }
    
    quantidadeFaturas = Math.max(1, quantidadeFaturas);
  }
  
  // Usar a data do primeiro vencimento como base
  const dataPrimeiroVencimento = new Date(contrato.dataPrimeiroVencimento);
  
  // Verificar faturas existentes para este contrato
  const faturasExistentes = faturas.filter(f => f.contratoId === contrato.id);
  const referenciasExistentes = new Set(faturasExistentes.map(f => f.referencia));
  
  // Gerar fatura de implantação se houver taxa
  if (contrato.taxaImplantacao > 0) {
    const dataEmissaoImplantacao = new Date(dataPrimeiroVencimento);
    dataEmissaoImplantacao.setDate(dataEmissaoImplantacao.getDate() - 15); // 15 dias antes
    
    const faturaImplantacao: Omit<Fatura, "id" | "numero" | "referencia"> = {
      clienteSistemaId: contrato.clienteSistemaId,
      contratoId: contrato.id,
      dataEmissao: dataEmissaoImplantacao.getTime(),
      dataVencimento: dataPrimeiroVencimento.getTime(),
      valor: contrato.taxaImplantacao,
      status: 'pendente'
    };
    
    // Verificar se já existe uma fatura de implantação
    const implantacaoExistente = faturasExistentes.find(f => 
      f.valor === contrato.taxaImplantacao && 
      f.dataVencimento === dataPrimeiroVencimento.getTime()
    );
    
    if (!implantacaoExistente) {
      const faturaAdicionada = addFatura(faturaImplantacao);
      faturasGeradas.push(faturaAdicionada);
    }
  }

  // Gerar as faturas recorrentes
  for (let i = 0; i < quantidadeFaturas; i++) {
    // Calcular data de vencimento baseada no ciclo e incrementando os meses corretamente
    const dataVencimento = new Date(dataPrimeiroVencimento);
    switch (contrato.cicloFaturamento) {
      case 'mensal':
        dataVencimento.setMonth(dataPrimeiroVencimento.getMonth() + i);
        break;
      case 'trimestral':
        dataVencimento.setMonth(dataPrimeiroVencimento.getMonth() + (i * 3));
        break;
      case 'anual':
        dataVencimento.setFullYear(dataPrimeiroVencimento.getFullYear() + i);
        break;
    }
    
    // Calcular data de emissão (15 dias antes do vencimento)
    const dataEmissaoFatura = new Date(dataVencimento);
    dataEmissaoFatura.setDate(dataEmissaoFatura.getDate() - 15);
    
    // Gerar referência para esta fatura
    const month = (dataVencimento.getMonth() + 1).toString().padStart(2, '0');
    const year = dataVencimento.getFullYear();
    const referencia = `${month}/${year}`;
    
    // Verificar se já existe uma fatura com esta referência para este contrato
    if (referenciasExistentes.has(referencia)) {
      console.log(`Fatura com referência ${referencia} já existe para o contrato ${contrato.numero}, pulando.`);
      continue;
    }
    
    // Criar a fatura
    const novaFatura: Omit<Fatura, "id" | "numero" | "referencia"> = {
      clienteSistemaId: contrato.clienteSistemaId,
      contratoId: contrato.id,
      dataEmissao: dataEmissaoFatura.getTime(),
      dataVencimento: dataVencimento.getTime(),
      valor: contrato.valorMensal,
      status: 'pendente'
    };
    
    // Adicionar a fatura
    const faturaAdicionada = addFatura(novaFatura);
    faturasGeradas.push(faturaAdicionada);
    referenciasExistentes.add(faturaAdicionada.referencia);
  }
  
  // Atualizar o número de ciclos gerados no contrato
  const contratoAtualizado: Contrato = {
    ...contrato,
    ciclosGerados: quantidadeFaturas
  };
  updateContrato(contratoAtualizado);
  
  return faturasGeradas;
};

export const renovarContrato = (contratoId: string, ciclos: number = 12): Contrato | null => {
  const contrato = getContratoById(contratoId);
  if (!contrato) return null;
  
  const dataAtual = new Date();
  const proximaRenovacao = calcularDataProximaRenovacao(
    dataAtual,
    contrato.cicloFaturamento,
    ciclos
  );
  
  const contratoAtualizado: Contrato = {
    ...contrato,
    proximaRenovacao,
    ciclosGerados: 0 // Reinicia a contagem de ciclos gerados
  };
  
  updateContrato(contratoAtualizado);
  
  // Gerar novas faturas programadas para o próximo período
  gerarFaturasProgramadas(contratoAtualizado);
  
  return contratoAtualizado;
};

export const getContratosParaRenovar = (diasAntecedencia: number = 30): Contrato[] => {
  const contratos = getContratos();
  const hoje = new Date();
  const limiteRenovacao = new Date();
  limiteRenovacao.setDate(hoje.getDate() + diasAntecedencia);
  
  return contratos.filter(contrato => {
    // Só verifica contratos ativos
    if (contrato.status !== 'ativo') return false;
    
    // Se tiver proximaRenovacao, compara com o limite
    if (contrato.proximaRenovacao) {
      return contrato.proximaRenovacao <= limiteRenovacao.getTime();
    }
    
    // Para contratos com data fim, verifica se está próximo de vencer
    if (!getPlanoById(contrato.planoId)?.semVencimento) {
      return contrato.dataFim <= limiteRenovacao.getTime();
    }
    
    return false;
  });
};

export const getDashboardStats = () => {
  const clientes = getClientesSistema();
  const contratos = getContratos();
  const faturas = getFaturas();
  
  const clientesAtivos = clientes.filter(c => c.situacao === 'liberado').length;
  const clientesBloqueados = clientes.filter(c => c.situacao === 'bloqueado').length;
  
  const contratosAtivos = contratos.filter(c => c.status === 'ativo').length;
  const contratosEmAnalise = contratos.filter(c => c.status === 'em-analise').length;
  const contratosCancelados = contratos.filter(c => c.status === 'cancelado').length;
  
  const faturasPendentes = faturas.filter(f => f.status === 'pendente');
  const faturasPagas = faturas.filter(f => f.status === 'pago');
  const faturasAtrasadas = faturas.filter(f => f.status === 'atrasado');
  
  const valorTotalPendente = faturasPendentes.reduce((acc, f) => acc + f.valor, 0);
  const valorTotalPago = faturasPagas.reduce((acc, f) => acc + f.valor, 0);
  const valorTotalAtrasado = faturasAtrasadas.reduce((acc, f) => acc + f.valor, 0);
  
  // Adicionar estatísticas de contratos para renovação
  const contratosParaRenovar = getContratosParaRenovar();
  
  return {
    clientesAtivos,
    clientesBloqueados,
    totalClientes: clientes.length,
    
    contratosAtivos,
    contratosEmAnalise,
    contratosCancelados,
    totalContratos: contratos.length,
    
    faturasPendentes: faturasPendentes.length,
    faturasPagas: faturasPagas.length,
    faturasAtrasadas: faturasAtrasadas.length,
    totalFaturas: faturas.length,
    
    valorTotalPendente,
    valorTotalPago,
    valorTotalAtrasado,
    valorTotal: valorTotalPendente + valorTotalPago + valorTotalAtrasado,
    
    contratosParaRenovar: contratosParaRenovar.length,
    listaContratosParaRenovar: contratosParaRenovar.map(c => ({
      id: c.id,
      numero: c.numero,
      clienteId: c.clienteSistemaId,
      clienteNome: getClienteSistemaById(c.clienteSistemaId)?.razaoSocial || 'Cliente não encontrado',
      dataRenovacao: c.proximaRenovacao || c.dataFim
    }))
  };
};

export const checkAdminCredentials = (email: string, password: string): boolean => {
  const admin = JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || '{}');
  return (admin.email === email && admin.password === password) || 
         (defaultAdminUser.email === email && defaultAdminUser.password === password);
};

export const checkClienteCredentials = (email: string, password: string): ClienteSistema | null => {
  console.log("Tentando autenticar cliente:", email);
  const clientes = getClientesSistema();
  console.log("Todos os clientes:", JSON.stringify(clientes));
  
  // Procurar por e-mail
  const cliente = clientes.find(c => c.email === email);
  console.log("Cliente encontrado:", cliente ? JSON.stringify(cliente) : "Nenhum");
  
  if (cliente) {
    console.log("Situação do cliente:", cliente.situacao);
    
    // Verificar se o cliente está liberado
    if (cliente.situacao !== 'liberado') {
      console.log("Cliente está bloqueado");
      return null;
    }
    
    // Verificação simplificada: aceita 'client123' como senha padrão
    if (password === "client123") {
      console.log("Senha padrão aceita");
      return cliente;
    }
    
    // Verificação alternativa (mantida para compatibilidade)
    if (cliente.cnpj) {
      const reverseCpfCnpj = cliente.cnpj.split('').reverse().join('').replace(/[^0-9]/g, '');
      if (password === reverseCpfCnpj) {
        console.log("Senha baseada em CPF/CNPJ aceita");
        return cliente;
      }
    }
  }
  
  console.log("Autenticação de cliente falhou");
  return null;
};

export const checkCredentials = (email: string, password: string): { isValid: boolean, userType: 'admin' | 'cliente' | null, userData?: any } => {
  console.log("Verificando credenciais para:", email);
  
  // Verificar se é admin
  if (checkAdminCredentials(email, password)) {
    console.log("Admin autenticado com sucesso");
    return { isValid: true, userType: 'admin' };
  }
  
  // Verificar se é cliente
  const cliente = checkClienteCredentials(email, password);
  if (cliente) {
    console.log("Cliente autenticado com sucesso");
    return { isValid: true, userType: 'cliente', userData: cliente };
  }
  
  // Nenhum usuário válido encontrado
  console.log("Falha na autenticação");
  return { isValid: false, userType: null };
};
