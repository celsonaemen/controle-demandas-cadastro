import type { DemandPriority, DemandStatus, ServiceType, UserRole } from "@/types/domain";

export const USER_ROLES: UserRole[] = ["solicitante", "admin"];

export const STATUS_OPTIONS: DemandStatus[] = [
  "Recebida",
  "Em análise",
  "Em execução",
  "Aguardando cliente",
  "Aguardando órgão",
  "Aguardando pagamento",
  "Aguardando autorização",
  "Concluída",
  "Cancelada"
];

export const KANBAN_STATUSES: DemandStatus[] = [
  "Recebida",
  "Em análise",
  "Em execução",
  "Aguardando cliente",
  "Aguardando órgão",
  "Aguardando pagamento",
  "Aguardando autorização",
  "Concluída"
];

export const PRIORITY_OPTIONS: DemandPriority[] = ["Alta", "Média", "Normal", "Baixa"];

export const SERVICE_TYPES: ServiceType[] = [
  "Abertura de empresa",
  "Alteração contratual",
  "Baixa de empresa",
  "Alteração de endereço",
  "Alteração de sócio",
  "Alteração de dados de sócios",
  "Alteração de CNAE",
  "Alteração de capital",
  "Transformação empresarial",
  "Abertura de filial",
  "Baixa de filial",
  "Viabilidade",
  "DBE",
  "JUCEMG",
  "Prefeitura",
  "Alvará",
  "Vigilância Sanitária",
  "Corpo de Bombeiros",
  "Consulta de débitos",
  "Cadastro interno",
  "Alteração de dados no WPHD",
  "Inserção de dados no WPHD",
  "Ativação de empresa no WPHD",
  "Desativação de empresa no WPHD",
  "Inclusão de documentos no Scan",
  "Atualização cadastral de empresa",
  "Atualização cadastral de sócio",
  "Correção de cadastro interno",
  "Cadastro de nova empresa no WPHD",
  "Cadastro de filial no WPHD",
  "Conferência cadastral",
  "Outro"
];

export const OPEN_STATUSES: DemandStatus[] = STATUS_OPTIONS.filter(
  (status) => status !== "Concluída" && status !== "Cancelada"
);

export const LEGALIZATION_FLAGS = [
  { key: "alteracaoEndereco", label: "Alteração de endereço" },
  { key: "mudancaMunicipio", label: "Mudança de município" },
  { key: "mudancaUf", label: "Mudança de UF" },
  { key: "entradaSocio", label: "Entrada de sócio" },
  { key: "saidaSocio", label: "Saída de sócio" },
  { key: "alteracaoAdministrador", label: "Alteração de administrador" },
  { key: "alteracaoCapital", label: "Alteração de capital" },
  { key: "alteracaoCnae", label: "Alteração de CNAE" },
  { key: "alteracaoObjetoSocial", label: "Alteração de objeto social" },
  { key: "aberturaFilial", label: "Abertura de filial" },
  { key: "baixaFilial", label: "Baixa de filial" },
  { key: "baixaEmpresa", label: "Baixa da empresa" },
  { key: "transformacaoEmpresarial", label: "Transformação empresarial" },
  { key: "viabilidadeNecessaria", label: "Viabilidade necessária" },
  { key: "dbeNecessario", label: "DBE necessário" }
] as const;
