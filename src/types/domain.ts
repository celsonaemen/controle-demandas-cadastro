export type UserRole = "solicitante" | "admin";

export type DemandStatus =
  | "Recebida"
  | "Em análise"
  | "Em execução"
  | "Aguardando cliente"
  | "Aguardando órgão"
  | "Aguardando pagamento"
  | "Aguardando autorização"
  | "Concluída"
  | "Cancelada";

export type DemandPriority = "Alta" | "Média" | "Normal" | "Baixa";

export type ServiceType =
  | "Abertura de empresa"
  | "Alteração contratual"
  | "Baixa de empresa"
  | "Alteração de endereço"
  | "Alteração de sócio"
  | "Alteração de dados de sócios"
  | "Alteração de CNAE"
  | "Alteração de capital"
  | "Transformação empresarial"
  | "Abertura de filial"
  | "Baixa de filial"
  | "Viabilidade"
  | "DBE"
  | "JUCEMG"
  | "Prefeitura"
  | "Alvará"
  | "Vigilância Sanitária"
  | "Corpo de Bombeiros"
  | "Consulta de débitos"
  | "Cadastro interno"
  | "Alteração de dados no WPHD"
  | "Inserção de dados no WPHD"
  | "Ativação de empresa no WPHD"
  | "Desativação de empresa no WPHD"
  | "Inclusão de documentos no Scan"
  | "Atualização cadastral de empresa"
  | "Atualização cadastral de sócio"
  | "Correção de cadastro interno"
  | "Cadastro de nova empresa no WPHD"
  | "Cadastro de filial no WPHD"
  | "Conferência cadastral"
  | "Outro";

export type User = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LegalizationFlags = {
  alteracaoEndereco: boolean;
  mudancaMunicipio: boolean;
  mudancaUf: boolean;
  entradaSocio: boolean;
  saidaSocio: boolean;
  alteracaoAdministrador: boolean;
  alteracaoCapital: boolean;
  alteracaoCnae: boolean;
  alteracaoObjetoSocial: boolean;
  aberturaFilial: boolean;
  baixaFilial: boolean;
  baixaEmpresa: boolean;
  transformacaoEmpresarial: boolean;
  viabilidadeNecessaria: boolean;
  dbeNecessario: boolean;
};

export type Demand = {
  id: string;
  numero: number;
  empresa: string;
  cnpjCpf: string;
  solicitante: string;
  email: string;
  telefone: string;
  tipoServico: ServiceType;
  orgaoEnvolvido: string;
  responsavel: string;
  prazo: string;
  objetivo: string;
  proximaAcao: string;
  observacoes: string;
  documentosPendentes: string;
  protocolo: string;
  dbe: string;
  viabilidade: string;
  caminhoPasta: string;
  flags: LegalizationFlags;
  prioridade: DemandPriority;
  status: DemandStatus;
  resumoOperacional: string;
  criadoPor: string;
  criadoPorNome: string;
  createdAt: string;
  updatedAt: string;
  concluidaEm: string | null;
  canceladaEm: string | null;
};

export type DemandHistory = {
  id: string;
  demandaId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  antes: Record<string, unknown> | null;
  depois: Record<string, unknown> | null;
  createdAt: string;
};

export type DemandAttachment = {
  id: string;
  demandaId: string;
  nome: string;
  tipo: string;
  tamanho: number;
  enviadoPor: string;
  enviadoPorNome: string;
  createdAt: string;
};

export type DemandFormValues = {
  empresa: string;
  cnpjCpf: string;
  solicitante: string;
  email: string;
  telefone: string;
  tipoServico: ServiceType;
  orgaoEnvolvido: string;
  status: DemandStatus;
  prioridade: DemandPriority;
  responsavel: string;
  prazo: string;
  objetivo: string;
  proximaAcao: string;
  observacoes: string;
  documentosPendentes: string;
  protocolo: string;
  dbe: string;
  viabilidade: string;
  caminhoPasta: string;
  flags: LegalizationFlags;
};

export type DemandFilters = {
  company: string;
  document: string;
  responsible: string;
  status: string;
  priority: string;
  service: string;
  dueDate: string;
  createdDate: string;
};
