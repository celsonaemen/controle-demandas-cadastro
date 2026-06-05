import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectMongo } from "../src/lib/mongodb";
import { buildOperationalSummary, emptyFlags } from "../src/lib/demand-utils";
import { DemandModel } from "../src/models/Demand";
import { DemandHistoryModel } from "../src/models/DemandHistory";
import { UserModel } from "../src/models/User";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  await connectMongo();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@cadastro.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123456!";

  let admin = await UserModel.findOne({ email: adminEmail });
  if (!admin) {
    admin = await UserModel.create({
      nome: "Administrador Cadastro",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "admin",
      ativo: true
    });
  }

  const demandCount = await DemandModel.estimatedDocumentCount();
  if (demandCount === 0) {
    const examples = [
      {
        numero: 1,
        empresa: "IM COSMETICS LTDA",
        cnpjCpf: "12.345.678/0001-90",
        solicitante: "Atendimento",
        email: "atendimento@exemplo.com",
        telefone: "",
        tipoServico: "Alteração contratual",
        orgaoEnvolvido: "JUCEMG, REDESIM, Prefeitura",
        status: "Em execução",
        prioridade: "Alta",
        responsavel: "Elias",
        prazo: addDays(5),
        objetivo: "Transferir matriz de MG para ES e baixar filial.",
        proximaAcao: "Conferir viabilidade, DBE e dados da filial.",
        observacoes: "Processo com mudança de UF.",
        documentosPendentes: "Comprovante do novo endereço e NIRE da filial.",
        protocolo: "",
        dbe: "",
        viabilidade: "",
        caminhoPasta: "",
        flags: { ...emptyFlags(), mudancaUf: true, baixaFilial: true, viabilidadeNecessaria: true, dbeNecessario: true }
      },
      {
        numero: 2,
        empresa: "CONSULTÓRIO OPTOMÉTRICO LTDA",
        cnpjCpf: "23.456.789/0001-10",
        solicitante: "Cliente",
        email: "cliente@exemplo.com",
        telefone: "",
        tipoServico: "Abertura de empresa",
        orgaoEnvolvido: "JUCEMG, REDESIM, Prefeitura",
        status: "Recebida",
        prioridade: "Média",
        responsavel: "",
        prazo: addDays(12),
        objetivo: "Abertura de empresa para consultório optométrico.",
        proximaAcao: "Validar CNAE e iniciar viabilidade.",
        observacoes: "",
        documentosPendentes: "Documentos dos sócios e comprovante de endereço.",
        protocolo: "",
        dbe: "",
        viabilidade: "",
        caminhoPasta: "",
        flags: { ...emptyFlags(), viabilidadeNecessaria: true, dbeNecessario: true }
      }
    ];

    for (const item of examples) {
      const resumoOperacional = buildOperationalSummary({
        empresa: item.empresa,
        cnpjCpf: item.cnpjCpf,
        tipoServico: item.tipoServico as never,
        objetivo: item.objetivo,
        orgaoEnvolvido: item.orgaoEnvolvido,
        prazo: item.prazo.toISOString().slice(0, 10),
        responsavel: item.responsavel,
        proximaAcao: item.proximaAcao,
        documentosPendentes: item.documentosPendentes
      });

      const demanda = await DemandModel.create({
        ...item,
        resumoOperacional,
        criadoPor: admin._id,
        criadoPorNome: admin.nome
      });

      await DemandHistoryModel.create({
        demandaId: demanda._id,
        usuarioId: admin._id,
        usuarioNome: admin.nome,
        acao: "Demanda criada pelo seed",
        antes: null,
        depois: { numero: item.numero, empresa: item.empresa }
      });
    }
  }

  console.log("Seed concluído.");
  console.log(`Admin: ${adminEmail}`);
  console.log(`Senha inicial: ${adminPassword}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
