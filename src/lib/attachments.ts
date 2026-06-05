import mongoose from "mongoose";
import { Readable } from "node:stream";
import { connectMongo } from "@/lib/mongodb";
import type { DemandAttachment } from "@/types/domain";

export const ATTACHMENT_BUCKET = "demand_attachments";
export const MAX_ATTACHMENT_SIZE = 4 * 1024 * 1024;

export const ACCEPTED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.docx,.xlsx";

type GridFile = {
  _id: mongoose.Types.ObjectId;
  filename: string;
  length: number;
  uploadDate: Date;
  contentType?: string;
  metadata?: {
    demandId?: string;
    uploadedBy?: string;
    uploadedByName?: string;
  };
};

async function getBucket() {
  await connectMongo();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Conexão MongoDB indisponível.");
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: ATTACHMENT_BUCKET });
}

export function isAcceptedAttachment(file: File) {
  return ACCEPTED_ATTACHMENT_TYPES.includes(file.type);
}

export function formatMaxAttachmentSize() {
  return `${MAX_ATTACHMENT_SIZE / 1024 / 1024} MB`;
}

export function serializeAttachment(file: GridFile): DemandAttachment {
  return {
    id: String(file._id),
    demandaId: String(file.metadata?.demandId || ""),
    nome: file.filename,
    tipo: file.contentType || "",
    tamanho: file.length,
    enviadoPor: String(file.metadata?.uploadedBy || ""),
    enviadoPorNome: String(file.metadata?.uploadedByName || ""),
    createdAt: file.uploadDate.toISOString()
  };
}

export async function listDemandAttachments(demandId: string) {
  const bucket = await getBucket();
  const files = await bucket
    .find({ "metadata.demandId": demandId })
    .sort({ uploadDate: -1 })
    .toArray() as GridFile[];

  return files.map(serializeAttachment);
}

export async function saveDemandAttachment(input: {
  demandId: string;
  file: File;
  uploadedBy: string;
  uploadedByName: string;
}) {
  const bucket = await getBucket();
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const filename = input.file.name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").slice(0, 180);

  const fileId = await new Promise<mongoose.Types.ObjectId>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: input.file.type,
      metadata: {
        demandId: input.demandId,
        uploadedBy: input.uploadedBy,
        uploadedByName: input.uploadedByName
      }
    });

    uploadStream.once("error", reject);
    uploadStream.once("finish", () => resolve(uploadStream.id as mongoose.Types.ObjectId));
    uploadStream.end(buffer);
  });

  const files = await bucket.find({ _id: fileId }).toArray() as GridFile[];
  return files[0] ? serializeAttachment(files[0]) : null;
}

export async function getDemandAttachmentFile(demandId: string, fileId: string) {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return null;
  }

  const bucket = await getBucket();
  const objectId = new mongoose.Types.ObjectId(fileId);
  const files = await bucket.find({ _id: objectId, "metadata.demandId": demandId }).toArray() as GridFile[];
  const file = files[0];
  if (!file) {
    return null;
  }

  const stream = bucket.openDownloadStream(objectId);
  return {
    file: serializeAttachment(file),
    stream: Readable.toWeb(stream) as ReadableStream
  };
}

export async function deleteDemandAttachment(demandId: string, fileId: string) {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return false;
  }

  const bucket = await getBucket();
  const objectId = new mongoose.Types.ObjectId(fileId);
  const files = await bucket.find({ _id: objectId, "metadata.demandId": demandId }).toArray();
  if (!files[0]) {
    return false;
  }

  await bucket.delete(objectId);
  return true;
}

export async function deleteDemandAttachments(demandId: string) {
  const bucket = await getBucket();
  const files = await bucket.find({ "metadata.demandId": demandId }).toArray() as GridFile[];

  for (const file of files) {
    await bucket.delete(file._id);
  }

  return files.length;
}
