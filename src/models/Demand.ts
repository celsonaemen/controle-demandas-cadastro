import mongoose, { InferSchemaType, Schema, type Model } from "mongoose";
import { PRIORITY_OPTIONS, SERVICE_TYPES, STATUS_OPTIONS } from "@/lib/constants";

const LegalizationFlagsSchema = new Schema(
  {
    alteracaoEndereco: { type: Boolean, default: false },
    mudancaMunicipio: { type: Boolean, default: false },
    mudancaUf: { type: Boolean, default: false },
    entradaSocio: { type: Boolean, default: false },
    saidaSocio: { type: Boolean, default: false },
    alteracaoAdministrador: { type: Boolean, default: false },
    alteracaoCapital: { type: Boolean, default: false },
    alteracaoCnae: { type: Boolean, default: false },
    alteracaoObjetoSocial: { type: Boolean, default: false },
    aberturaFilial: { type: Boolean, default: false },
    baixaFilial: { type: Boolean, default: false },
    baixaEmpresa: { type: Boolean, default: false },
    transformacaoEmpresarial: { type: Boolean, default: false },
    viabilidadeNecessaria: { type: Boolean, default: false },
    dbeNecessario: { type: Boolean, default: false }
  },
  { _id: false }
);

const DemandSchema = new Schema(
  {
    numero: { type: Number, required: true, index: true },
    empresa: { type: String, required: true, trim: true, index: true },
    cnpjCpf: { type: String, required: true, trim: true, index: true },
    solicitante: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    telefone: { type: String, default: "", trim: true },
    tipoServico: { type: String, required: true, enum: SERVICE_TYPES },
    orgaoEnvolvido: { type: String, required: true, trim: true },
    status: { type: String, enum: STATUS_OPTIONS, default: "Recebida", index: true },
    prioridade: { type: String, enum: PRIORITY_OPTIONS, default: "Média", index: true },
    responsavel: { type: String, default: "", trim: true, index: true },
    prazo: { type: Date, required: true, index: true },
    objetivo: { type: String, required: true, trim: true },
    proximaAcao: { type: String, required: true, trim: true },
    observacoes: { type: String, default: "", trim: true },
    documentosPendentes: { type: String, default: "", trim: true },
    protocolo: { type: String, default: "", trim: true },
    dbe: { type: String, default: "", trim: true },
    viabilidade: { type: String, default: "", trim: true },
    caminhoPasta: { type: String, default: "", trim: true },
    flags: { type: LegalizationFlagsSchema, default: {} },
    resumoOperacional: { type: String, default: "" },
    criadoPor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    criadoPorNome: { type: String, required: true, trim: true },
    concluidaEm: { type: Date, default: null },
    canceladaEm: { type: Date, default: null }
  },
  {
    collection: "demands",
    timestamps: true
  }
);

export type DemandRecord = InferSchemaType<typeof DemandSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const DemandModel =
  (mongoose.models.Demand as Model<DemandRecord> | undefined) ||
  mongoose.model<DemandRecord>("Demand", DemandSchema);
