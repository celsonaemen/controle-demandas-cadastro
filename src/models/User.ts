import mongoose, { InferSchemaType, Schema, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["solicitante", "admin"], default: "solicitante", index: true },
    ativo: { type: Boolean, default: true },
    statusAcesso: { type: String, enum: ["pendente", "aprovado", "rejeitado"], default: "pendente", index: true },
    cadastroIp: { type: String, default: "", trim: true },
    cadastroUserAgent: { type: String, default: "", trim: true },
    aprovadoEm: { type: Date, default: null },
    aprovadoPor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    aprovadoPorNome: { type: String, default: "", trim: true }
  },
  {
    collection: "users",
    timestamps: true
  }
);

export type UserRecord = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const UserModel =
  (mongoose.models.User as Model<UserRecord> | undefined) || mongoose.model<UserRecord>("User", UserSchema);
