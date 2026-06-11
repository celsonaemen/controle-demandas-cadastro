"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LEGALIZATION_FLAGS, PRIORITY_OPTIONS, SERVICE_TYPES, STATUS_OPTIONS } from "@/lib/constants";
import { emptyFlags } from "@/lib/demand-utils";
import type { SessionUser } from "@/lib/session";
import type { Demand, DemandFormValues, LegalizationFlags } from "@/types/domain";

const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.docx,.xlsx";
const MAX_ATTACHMENT_SIZE_MB = 4;

type DemandFormProps = {
  user: SessionUser;
  demandId?: string;
};

const initialValues: DemandFormValues = {
  empresa: "",
  cnpjCpf: "",
  solicitante: "",
  email: "",
  telefone: "",
  tipoServico: "Abertura de empresa",
  orgaoEnvolvido: "",
  status: "Recebida",
  prioridade: "Normal",
  responsavel: "",
  prazo: "",
  objetivo: "",
  proximaAcao: "",
  observacoes: "",
  documentosPendentes: "",
  protocolo: "",
  dbe: "",
  viabilidade: "",
  caminhoPasta: "",
  flags: emptyFlags()
};

export function DemandForm({ user, demandId }: DemandFormProps) {
  const router = useRouter();
  const isAdmin = user.role === "admin";
  const isEditing = Boolean(demandId);
  const [values, setValues] = useState<DemandFormValues>(initialValues);
  const [loading, setLoading] = useState(Boolean(demandId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const title = useMemo(() => {
    if (isEditing) return "Editar demanda";
    return "Nova demanda";
  }, [isEditing]);

  useEffect(() => {
    if (!demandId) {
      setValues({
        ...initialValues,
        solicitante: user.nome,
        email: user.email
      });
      return;
    }

    async function loadDemand() {
      setLoading(true);
      const response = await fetch(`/api/demandas/${demandId}`);
      const data = await response.json().catch(() => ({}));
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "Não foi possível carregar a demanda.");
        return;
      }

      const demand = data.demanda as Demand;
      setValues({
        empresa: demand.empresa,
        cnpjCpf: demand.cnpjCpf,
        solicitante: demand.solicitante,
        email: demand.email,
        telefone: demand.telefone,
        tipoServico: demand.tipoServico,
        orgaoEnvolvido: demand.orgaoEnvolvido,
        status: demand.status,
        prioridade: demand.prioridade,
        responsavel: demand.responsavel,
        prazo: demand.prazo,
        objetivo: demand.objetivo,
        proximaAcao: demand.proximaAcao,
        observacoes: demand.observacoes,
        documentosPendentes: demand.documentosPendentes,
        protocolo: demand.protocolo,
        dbe: demand.dbe,
        viabilidade: demand.viabilidade,
        caminhoPasta: demand.caminhoPasta,
        flags: demand.flags || emptyFlags()
      });
    }

    loadDemand();
  }, [demandId, user.email, user.nome]);

  function updateField<K extends keyof DemandFormValues>(key: K, value: DemandFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateFlag(key: keyof LegalizationFlags, checked: boolean) {
    setValues((current) => ({
      ...current,
      flags: {
        ...current.flags,
        [key]: checked
      }
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch(demandId ? `/api/demandas/${demandId}` : "/api/demandas", {
      method: demandId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setSaving(false);
      setError(data.error || "Não foi possível salvar.");
      return;
    }

    const savedDemand = data.demanda as Demand;
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));

      const uploadResponse = await fetch(`/api/demandas/${savedDemand.id}/arquivos`, {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadResponse.json().catch(() => ({}));

      if (!uploadResponse.ok) {
        setSaving(false);
        setError(uploadData.error || "Demanda salva, mas não foi possível anexar os arquivos.");
        if (!demandId) {
          router.replace(`/nova-demanda?id=${savedDemand.id}`);
        }
        return;
      }
    }

    setSaving(false);
    router.push(isAdmin ? "/admin" : "/demandas");
    router.refresh();
  }

  function selectFiles(fileList: FileList | null) {
    const files = Array.from(fileList || []);
    const oversized = files.find((file) => file.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setError(`O arquivo "${oversized.name}" excede o limite de ${MAX_ATTACHMENT_SIZE_MB} MB.`);
      return;
    }
    setError("");
    setSelectedFiles(files);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Cadastro e Legalização</p>
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar demanda
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-950">Informações básicas</h3>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Empresa" required>
            <Input value={values.empresa} onChange={(event) => updateField("empresa", event.target.value)} required disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="CNPJ/CPF" required>
            <Input value={values.cnpjCpf} onChange={(event) => updateField("cnpjCpf", event.target.value)} required disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Solicitante" required>
            <Input value={values.solicitante} onChange={(event) => updateField("solicitante", event.target.value)} required disabled={!isAdmin} />
          </Field>
          <Field label="E-mail" required>
            <Input type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} required disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Telefone">
            <Input value={values.telefone} onChange={(event) => updateField("telefone", event.target.value)} disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Tipo de serviço" required>
            <Select value={values.tipoServico} onChange={(event) => updateField("tipoServico", event.target.value as DemandFormValues["tipoServico"])} disabled={isEditing && !isAdmin}>
              {SERVICE_TYPES.map((service) => <option key={service} value={service}>{service}</option>)}
            </Select>
          </Field>
          <Field label="Órgão envolvido" required>
            <Input value={values.orgaoEnvolvido} onChange={(event) => updateField("orgaoEnvolvido", event.target.value)} required disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Prazo" required>
            <Input type="date" value={values.prazo} onChange={(event) => updateField("prazo", event.target.value)} required disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Status">
            <Select value={values.status} onChange={(event) => updateField("status", event.target.value as DemandFormValues["status"])} disabled={!isAdmin}>
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
          </Field>
          <Field label="Prioridade">
            <Select value={values.prioridade} onChange={(event) => updateField("prioridade", event.target.value as DemandFormValues["prioridade"])}>
              {PRIORITY_OPTIONS.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </Select>
          </Field>
          <Field label="Responsável">
            <Input value={values.responsavel} onChange={(event) => updateField("responsavel", event.target.value)} disabled={!isAdmin} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-950">Descrição</h3>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <Field label="Objetivo da demanda" required>
            <Textarea value={values.objetivo} onChange={(event) => updateField("objetivo", event.target.value)} required disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Próxima ação" required>
            <Textarea value={values.proximaAcao} onChange={(event) => updateField("proximaAcao", event.target.value)} required disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Observações">
            <Textarea value={values.observacoes} onChange={(event) => updateField("observacoes", event.target.value)} />
          </Field>
          <Field label="Documentos">
            <Textarea value={values.documentosPendentes} onChange={(event) => updateField("documentosPendentes", event.target.value)} disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Anexar documentos">
            <div className="grid gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
              <label className="flex min-h-16 cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-white px-3 py-4 text-center text-sm font-semibold text-slate-700 hover:bg-emerald-50">
                <Upload className="h-5 w-5 text-primary" />
                <span>Selecionar PDF, foto ou arquivo</span>
                <input
                  className="hidden"
                  type="file"
                  multiple
                  accept={ATTACHMENT_ACCEPT}
                  onChange={(event) => selectFiles(event.target.files)}
                />
              </label>
              <p className="text-xs font-semibold text-slate-500">
                Aceita PDF, JPG, PNG, DOCX e XLSX. Limite de {MAX_ATTACHMENT_SIZE_MB} MB por arquivo.
              </p>
              {selectedFiles.length > 0 && (
                <div className="grid gap-2">
                  {selectedFiles.map((file) => (
                    <div key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-xs font-semibold text-slate-700">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-950">Legalização</h3>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {LEGALIZATION_FLAGS.map((flag) => (
            <label key={flag.key} className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
              <Checkbox
                checked={values.flags[flag.key]}
                onChange={(event) => updateFlag(flag.key, event.target.checked)}
                disabled={isEditing && !isAdmin}
              />
              {flag.label}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-950">Protocolos e rede</h3>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Protocolo">
            <Input value={values.protocolo} onChange={(event) => updateField("protocolo", event.target.value)} disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="DBE">
            <Input value={values.dbe} onChange={(event) => updateField("dbe", event.target.value)} disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Viabilidade">
            <Input value={values.viabilidade} onChange={(event) => updateField("viabilidade", event.target.value)} disabled={isEditing && !isAdmin} />
          </Field>
          <Field label="Caminho da pasta">
            <Input value={values.caminhoPasta} onChange={(event) => updateField("caminhoPasta", event.target.value)} disabled={isEditing && !isAdmin} />
          </Field>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}
