import mongoose, { InferSchemaType, Schema, type Model } from "mongoose";

const DemandHistorySchema = new Schema(
  {
    demandaId: { type: Schema.Types.ObjectId, ref: "Demand", required: true, index: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    usuarioNome: { type: String, required: true, trim: true },
    acao: { type: String, required: true, trim: true },
    antes: { type: Schema.Types.Mixed, default: null },
    depois: { type: Schema.Types.Mixed, default: null }
  },
  {
    collection: "demand_history",
    timestamps: true
  }
);

export type DemandHistoryRecord = InferSchemaType<typeof DemandHistorySchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const DemandHistoryModel =
  (mongoose.models.DemandHistory as Model<DemandHistoryRecord> | undefined) ||
  mongoose.model<DemandHistoryRecord>("DemandHistory", DemandHistorySchema);
