// NOTE: Supabase constraint needs update to allow source='unimed'
// Run: ALTER TABLE savior_bookings DROP CONSTRAINT savior_bookings_source_check;
//      ALTER TABLE savior_bookings ADD CONSTRAINT savior_bookings_source_check CHECK (source IN ('web','whatsapp','phone','api','hospital_system','insurance','corporate_portal','unimed'));

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../../lib/supabase";
import './unimed-booking.css';

// Keep C only for dynamic inline styles (computed backgrounds per ambulance type)
const C = {
  green: "#00995D", greenDk: "#007A4A", greenBr: "#00B86E",
  amber: "#E8A624", pink: "#D4577A",
};

const DIAG_OPTIONS = [
  { value: "pos_op", label: "Pós-operatório ou alta hospitalar", suggests: "basic" },
  { value: "cardiaco", label: "Problema no coração", suggests: "uti" },
  { value: "respiratorio", label: "Dificuldade para respirar", suggests: "uti" },
  { value: "fratura", label: "Fratura ou trauma", suggests: "basic" },
  { value: "idoso", label: "Idoso que precisa ir ao hospital", suggests: "basic" },
  { value: "tratamento", label: "Tratamento contínuo (quimio, hemodiálise, fisio)", suggests: "basic" },
  { value: "neonatal", label: "Recém-nascido", suggests: "neonatal" },
  { value: "outro", label: "Outro (descreva abaixo)", suggests: null },
];

const MOBILITY = [
  { value: "walks", label: "Caminha normalmente" },
  { value: "sits", label: "Consegue sentar, não caminha" },
  { value: "stretcher", label: "Precisa de maca (deitado)" },
  { value: "intubated", label: "Intubado ou em ventilação mecânica" },
];

const OBS_CHECKS = [
  "Prédio sem elevador para maca",
  "Condomínio com portaria (precisa liberar acesso)",
  "Paciente acima de 120kg",
  "Precisa de oxigênio no trajeto",
  "Paciente com doença infecciosa",
];

const ACCESS_LABELS: Record<string, string> = {
  casa_terreo: "Casa/térreo",
  apto_elevador: "Apartamento com elevador",
  apto_escada: "Apartamento só com escada",
  comercial: "Prédio comercial",
  hospital: "Hospital/clínica",
};

const STEP_NAMES = ["Paciente", "Trajeto", "Contato", "Confirmar"];

// ===== MICRO COMPONENTS =====
function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="bf-label">
      {children}{required && <span className="bf-label-required">*</span>}
    </label>
  );
}

function Field({ id, label, required, error, children }: { id?: string; label?: string; required?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="bf-field">
      {label && <Label htmlFor={id || ""} required={required}>{label}</Label>}
      {children}
      {error && <div role="alert" className="bf-field-error">{error}</div>}
    </div>
  );
}

function TextInput({ id, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return <input id={id} className={`bf-input ${className || ""}`} {...props} />;
}

function Select({ id, children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { id: string; children: React.ReactNode }) {
  return <select id={id} className={`bf-select ${className || ""}`} {...props}>{children}</select>;
}

function QuickButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`bf-quick-btn ${selected ? "is-selected" : ""}`}
      aria-pressed={selected}>
      {label}
    </button>
  );
}

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}
      aria-label={`Etapa ${current + 1} de ${total}`}
      className="bf-stepbar">
      <div className="bf-stepbar-track">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`bf-stepbar-seg ${i <= current ? "is-active" : ""}`} />
        ))}
      </div>
      <div className="bf-stepbar-label">
        Etapa {current + 1} de {total} · {STEP_NAMES[current]}
      </div>
    </div>
  );
}

function NavBtns({ onBack, onNext, canNext, nextLabel, loading, confirmStyle, onInvalid }: { onBack?: () => void; onNext?: () => void; canNext?: boolean; nextLabel?: string; loading?: boolean; confirmStyle?: boolean; onInvalid?: () => void }) {
  const handleClick = () => {
    if (!canNext && onInvalid) {
      onInvalid();
      return;
    }
    if (canNext && onNext) onNext();
  };
  return (
    <div className="bf-nav">
      {onBack && <button type="button" onClick={onBack} className="bf-btn-back">Voltar</button>}
      {onNext && <button type="button" onClick={handleClick} disabled={loading}
        className={`bf-btn-next ${loading ? "is-loading" : ""} ${confirmStyle ? "bf-btn-confirm" : ""}`}>
        {loading ? "Enviando..." : (nextLabel || "Continuar")}
      </button>}
    </div>
  );
}

// ===== AMBULANCE SUGGESTION =====
function AmbSuggestion({ type, onChangeType, showPicker, setShowPicker }: { type: string; onChangeType: (v: string) => void; showPicker: boolean; setShowPicker: (v: boolean) => void }) {
  const info: Record<string, { label: string; team: string; price: string; color: string; desc: string }> = {
    basic: { label: "Ambulância Básica", team: "Condutor + Enfermeiro", price: "A partir de R$ 1.200", color: C.green,
      desc: "Para paciente estável. Maca, oxigênio, suporte para soro." },
    uti: { label: "Ambulância UTI Móvel", team: "Condutor + Enfermeiro + Médico", price: "A partir de R$ 2.200", color: C.amber,
      desc: "Para paciente com risco. Monitor cardíaco, ventilador, desfibrilador." },
    neonatal: { label: "UTI Neonatal", team: "Neonatologista + Enfermeiro", price: "Sob consulta", color: C.pink,
      desc: "Para recém-nascidos de risco. Incubadora de transporte." },
  };
  const d = info[type];
  return (
    <div className="bf-amb">
      <div className="bf-amb-card">
        <div className="bf-amb-icon" style={{ background: d.color }}>
          {type === "uti" ? "UTI" : type === "neonatal" ? "NEO" : "BAS"}
        </div>
        <div className="bf-amb-info">
          <div className="bf-amb-title">Recomendação: {d.label}</div>
          <div className="bf-amb-desc">{d.desc}</div>
          <div className="bf-amb-price" style={{ color: d.color }}>{d.price}</div>
        </div>
        <button type="button" onClick={() => setShowPicker(!showPicker)} className="bf-amb-toggle">
          {showPicker ? "Fechar" : "Mudar tipo"}
        </button>
      </div>
      {showPicker && (
        <div className="bf-amb-picker">
          {Object.entries(info).map(([key, val]) => (
            <button key={key} type="button" onClick={() => { onChangeType(key); setShowPicker(false); }}
              aria-label={`Selecionar ${val.label}`}
              className={`bf-amb-option ${type === key ? "is-selected" : ""}`}
              style={type === key ? { background: `${val.color}12`, borderColor: val.color } : undefined}>
              <div className="bf-amb-option-label">{val.label}</div>
              <div className="bf-amb-option-team">{val.team}</div>
              <div className="bf-amb-option-price" style={{ color: val.color }}>{val.price}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== HOSPITAL SELECTOR =====
function HospitalPicker({ hospitals, regions, value, onChange }: { hospitals: any[]; regions: any[]; value: string | null; onChange: (v: string | null) => void }) {
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filtered = useMemo(() => {
    let h = hospitals;
    if (filterRegion) h = h.filter(x => x.region_id === filterRegion);
    if (search) {
      const s = search.toLowerCase();
      h = h.filter(x => x.name.toLowerCase().includes(s) || (x.neighborhood || "").toLowerCase().includes(s));
    }
    return h;
  }, [hospitals, filterRegion, search]);
  const shown = showAll ? filtered : filtered.slice(0, 6);
  const selected = hospitals.find(h => h.id === value);

  return (
    <div>
      <div className="bf-hosp-filters">
        <TextInput id="hospital-search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou bairro..." aria-label="Buscar hospital"
          className="bf-hosp-search" />
        <Select id="hospital-region" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
          aria-label="Filtrar por região" className="bf-hosp-region">
          <option value="">Todas as regiões</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
      </div>
      {selected && (
        <div className="bf-hosp-selected">
          <div>
            <span className="bf-hosp-selected-label">Selecionado: </span>
            <span className="bf-hosp-selected-name">{selected.name}</span>
            {selected.neighborhood && <span className="bf-hosp-selected-area">{selected.neighborhood}</span>}
          </div>
          <button type="button" onClick={() => onChange(null)} className="bf-hosp-clear">Trocar</button>
        </div>
      )}
      <div className="bf-hosp-list">
        {shown.map(h => {
          const net = h.savior_hospital_networks;
          return (
            <button key={h.id} type="button" onClick={() => onChange(h.id)}
              aria-label={`${h.name} — ${h.detail || ""}`}
              className={`bf-hosp-item ${value === h.id ? "is-selected" : ""}`}>
              <div className="bf-hosp-initials"
                style={{ background: net?.color_bg || "#00995D", color: net?.color_text || "#FFFFFF" }}>
                {h.initials || h.name.substring(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="bf-hosp-name">{h.name}</div>
                <div className="bf-hosp-detail">{h.detail}</div>
              </div>
              {net && <span className="bf-hosp-network">{net.name}</span>}
            </button>
          );
        })}
      </div>
      {filtered.length > 6 && !showAll && (
        <button type="button" onClick={() => setShowAll(true)} className="bf-hosp-more">
          Ver todos os {filtered.length} hospitais
        </button>
      )}
      {filtered.length === 0 && <div className="bf-hosp-empty">Nenhum hospital encontrado.</div>}
    </div>
  );
}

// ===== MAIN =====
export default function UnimedBooking() {
  const [step, setStep] = useState(0);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState("");
  const [waUrl, setWaUrl] = useState("");
  const [showAmbPicker, setShowAmbPicker] = useState(false);
  const [showHospitalSearch, setShowHospitalSearch] = useState(false);
  const [showOriginHospitalSearch, setShowOriginHospitalSearch] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    service_type: "scheduled", ambulance_type: "", patient_name: "", patient_gender: "", patient_dob: "",
    patient_weight: "", patient_height: "", diagnosis_select: "", diagnosis_other: "", equipment_needs: "", mobility: "",
    origin_address: "", origin_hospital_id: null as string | null,
    destination_hospital_id: null as string | null, destination_address: "",
    access_type: "", floor_number: "",
    scheduled_date: "", scheduled_time: "", date_quick: "", time_quick: "",
    contact_name: "", contact_phone: "", contact_alt_phone: "",
    payment_method: "", notes: "", obs_checks: [] as string[],
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const touch = (key: string) => setTouched(t => ({ ...t, [key]: true }));

  // Persistence: save to sessionStorage
  useEffect(() => {
    if (form.patient_name || form.diagnosis_select) {
      sessionStorage.setItem("unimed_draft", JSON.stringify({ form, step }));
    }
  }, [form, step]);

  // Persistence: restore on load
  useEffect(() => {
    const draft = sessionStorage.getItem("unimed_draft");
    if (draft) {
      try {
        const { form: f, step: s } = JSON.parse(draft);
        setForm(f);
        setStep(s);
      } catch {}
    }
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Load data
  useEffect(() => {
    (async () => {
      const [h, r] = await Promise.all([
        supabase.from("savior_hospitals").select("*, savior_hospital_networks(*)").eq("active", true).order("name"),
        supabase.from("savior_regions").select("*").eq("active", true).order("name")
      ]);
      setHospitals(h.data || []);
      setRegions(r.data || []);
      setLoading(false);
    })();
  }, []);

  // Smart suggestion
  const diagOption = DIAG_OPTIONS.find(d => d.value === form.diagnosis_select);
  const suggestedType = useMemo(() => {
    if (form.mobility === "intubated") return "uti";
    if (diagOption?.suggests) return diagOption.suggests;
    if (form.equipment_needs?.length > 2) return "uti";
    const d = (form.diagnosis_other || "").toLowerCase();
    if (["cardíac", "respiratóri", "intubad", "uti", "grave", "instável"].some(w => d.includes(w))) return "uti";
    return "basic";
  }, [form.diagnosis_select, form.diagnosis_other, form.equipment_needs, form.mobility, diagOption]);

  const ambType = form.ambulance_type || suggestedType;

  // Date helpers
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  function setDateQuick(q: string) {
    set("date_quick", q);
    if (q === "hoje") set("scheduled_date", today);
    else if (q === "amanha") set("scheduled_date", tomorrow);
    else set("scheduled_date", "");
  }
  function setTimeQuick(q: string) {
    set("time_quick", q);
    if (q === "manha") set("scheduled_time", "09:00");
    else if (q === "tarde") set("scheduled_time", "14:00");
    else if (q === "noite") set("scheduled_time", "19:00");
    else set("scheduled_time", "");
  }

  // Diagnosis text for message
  const diagText = diagOption?.value === "outro" ? form.diagnosis_other : (diagOption?.label || form.diagnosis_other || "");

  // Submit
  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    const destHospital = hospitals.find(h => h.id === form.destination_hospital_id);
    const ambLabel = ambType === "uti" ? "UTI Móvel" : ambType === "neonatal" ? "UTI Neonatal" : "Básica";
    const mobLabel = MOBILITY.find(m => m.value === form.mobility)?.label || "";
    const payLabel = { pix: "Pix (5% desc.)", card: "Cartão até 3x", billing: "Faturamento" }[form.payment_method] || "";
    const svcLabel = form.service_type === "recurring" ? "RECORRENTE" : "PROGRAMADA";
    const accessInfo = form.access_type ? `Acesso: ${ACCESS_LABELS[form.access_type] || form.access_type}${form.floor_number ? ` (${form.floor_number}º andar)` : ''}` : '';
    const obsAll = [accessInfo, ...form.obs_checks, form.notes].filter(Boolean).join("; ");

    await supabase.from("savior_bookings").insert({
      service_type: form.service_type,
      ambulance_type: ambType,
      ambulance_type_suggested: suggestedType,
      patient_name: form.patient_name,
      patient_dob: form.patient_dob || null,
      patient_weight: form.patient_weight || null,
      diagnosis: diagText,
      equipment_needs: form.equipment_needs,
      mobility: form.mobility,
      origin_address: form.origin_hospital_id
        ? (hospitals.find(h => h.id === form.origin_hospital_id)?.name || '') + ' — ' + (hospitals.find(h => h.id === form.origin_hospital_id)?.neighborhood || '')
        : form.origin_address,
      destination_hospital_id: form.destination_hospital_id,
      destination_address: form.destination_address,
      scheduled_date: form.scheduled_date || null,
      scheduled_time: form.scheduled_time || null,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      contact_alt_phone: form.contact_alt_phone,
      payment_method: form.payment_method,
      patient_gender: form.patient_gender || null,
      patient_height: form.patient_height || null,
      access_type: form.access_type || null,
      floor_number: form.floor_number || null,
      notes: obsAll,
      source: "unimed",
    });

    const msg = [
      `[UNIMED - ${svcLabel}]`, "",
      `*Paciente:* ${form.patient_name}`,
      form.patient_dob ? `*Nasc:* ${form.patient_dob.split("-").reverse().join("/")}` : null,
      form.patient_weight ? `*Peso:* ${form.patient_weight}kg` : null,
      form.patient_height ? `*Altura:* ${form.patient_height}cm` : null,
      form.patient_gender && form.patient_gender !== 'prefiro_nao_informar' ? `*Gênero:* ${form.patient_gender === 'masculino' ? 'Masculino' : 'Feminino'}` : null,
      `*Diagnóstico:* ${diagText}`,
      mobLabel ? `*Mobilidade:* ${mobLabel}` : null,
      form.equipment_needs ? `*Equipamentos:* ${form.equipment_needs}` : null,
      "", `*Ambulância:* ${ambLabel}`,
      `*Origem:* ${form.origin_hospital_id ? (hospitals.find(h => h.id === form.origin_hospital_id)?.name || '') + ' (' + (hospitals.find(h => h.id === form.origin_hospital_id)?.neighborhood || '') + ')' : form.origin_address}`,
      `*Destino:* ${destHospital ? destHospital.name + " (" + (destHospital.neighborhood || "") + ")" : form.destination_address}`,
      form.access_type ? `*Acesso:* ${ACCESS_LABELS[form.access_type] || form.access_type}${form.floor_number ? ` (${form.floor_number}º andar)` : ''}` : null,
      form.scheduled_date ? `*Data:* ${form.scheduled_date.split("-").reverse().join("/")}${form.scheduled_time ? " às " + form.scheduled_time : ""}` : null,
      "", `*Contato:* ${form.contact_name}`, `*Tel:* ${form.contact_phone}`,
      form.contact_alt_phone ? `*Tel alt:* ${form.contact_alt_phone}` : null,
      `*Pagamento:* ${payLabel}`,
      obsAll ? `\n*Obs:* ${obsAll}` : null,
    ].filter(Boolean).join("\n");

    sessionStorage.removeItem("unimed_draft");
    setSubmittedMsg(msg);
    setWaUrl(`https://wa.me/5521980358200?text=${encodeURIComponent(msg)}`);
    setSubmitting(false);
    setSubmitted(true);
  }

  // Validations
  const v1ok = !!form.patient_name && !!form.patient_gender && !!form.diagnosis_select && (form.diagnosis_select !== "outro" || !!form.diagnosis_other);
  const v2ok = (!!form.origin_address || !!form.origin_hospital_id) && (!!form.destination_hospital_id || !!form.destination_address);
  const v3ok = !!form.contact_phone && !!form.contact_name;

  // ===== RENDER =====
  if (loading) return (
    <div className="bf-loading">
      <div className="bf-loading-inner">
        <div className="bf-loading-brand">UNIMED</div>
        <div className="bf-loading-sub">Carregando hospitais...</div>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="bf-success">
      <div className="bf-success-inner">
        <div className="bf-success-header">
          <div className="bf-success-check">&#10003;</div>
          <div className="bf-success-title">Pedido registrado</div>
          <div className="bf-success-desc">
            Agora envie a mensagem pelo WhatsApp para a central confirmar o agendamento.
          </div>
        </div>
        <div className="bf-success-msg-box">
          <div className="bf-success-msg-label">Mensagem para a central</div>
          <div className="bf-success-msg-text">
            {submittedMsg.replace(/\*(.*?)\*/g, "$1")}
          </div>
        </div>
        <a href={waUrl} target="_blank" rel="noopener" className="bf-success-wa">Enviar pelo WhatsApp</a>
        <a href="tel:+552131713030" className="bf-success-phone">Ou ligar: (21) 3171-3030</a>
        <div className="bf-success-note">
          A mensagem chega formatada na central. O atendente já recebe tudo estruturado, sem precisar perguntar de novo.
        </div>
        <div className="bf-powered-by">
          Powered by <strong>Savior Medical Service</strong> · (21) 3171-3030
        </div>
      </div>
    </div>
  );

  return (
    <div className="bf-shell">
      {/* SKIP LINK */}
      <a href="#form-start" className="bf-skip">
        Ir para o formulário
      </a>

      {/* TOPBAR — Unimed green header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#00995D',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,153,93,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontWeight: 900, fontSize: 24, color: 'white' }}>Unimed</span>
          <span style={{ fontWeight: 400, fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>Rio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>Transporte de Pacientes</span>
          <a href="tel:+552131713030" style={{ color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>(21) 3171-3030</a>
        </div>
      </div>

      {/* FORM */}
      <div id="form-start" ref={formRef} className="bf-container">
        <div className="bf-eyebrow">Central 24 horas</div>
        <h1 className="bf-title">
          Vamos organizar o transporte do paciente
        </h1>
        <p className="bf-subtitle">
          Preencha com calma. Nossa central confirma tudo por telefone.
        </p>

        {/* Service type toggle */}
        <div className="bf-service-toggle">
          <QuickButton label="Remoção programada" selected={form.service_type === "scheduled"} onClick={() => set("service_type", "scheduled")} />
          <QuickButton label="Transporte recorrente" selected={form.service_type === "recurring"} onClick={() => set("service_type", "recurring")} />
        </div>

        <StepBar current={step} total={4} />

        {/* ===== STEP 1: PACIENTE ===== */}
        {step === 0 && (
          <div>
            <h2 className="bf-section-title">Sobre o paciente</h2>

            <Field id="patient_name" label="Nome do paciente" required error={touched.patient_name && !form.patient_name ? "Informe o nome" : null}>
              <TextInput id="patient_name" value={form.patient_name} placeholder="Nome completo"
                onChange={e => set("patient_name", e.target.value)} onBlur={() => touch("patient_name")} />
            </Field>

            <Field id="patient_gender" label="Gênero" required>
              <Select id="patient_gender" value={form.patient_gender} onChange={e => set("patient_gender", e.target.value)}>
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="prefiro_nao_informar">Prefiro não informar</option>
              </Select>
            </Field>

            <Field id="patient_dob" label="Data de nascimento">
              <TextInput id="patient_dob" type="date" value={form.patient_dob} onChange={e => set("patient_dob", e.target.value)} />
            </Field>

            <Field id="diagnosis" label="Qual é a situação do paciente?" required
              error={touched.diagnosis && !form.diagnosis_select ? "Selecione uma opção" : null}>
              <Select id="diagnosis" value={form.diagnosis_select}
                onChange={e => set("diagnosis_select", e.target.value)} onBlur={() => touch("diagnosis")}>
                <option value="">Selecione</option>
                {DIAG_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </Select>
            </Field>

            {form.diagnosis_select === "outro" && (
              <Field id="diagnosis_other" label="Descreva a situação" required>
                <TextInput id="diagnosis_other" value={form.diagnosis_other} placeholder="Descreva com suas palavras"
                  onChange={e => set("diagnosis_other", e.target.value)} />
              </Field>
            )}

            <Field id="mobility" label="Como o paciente se locomove?">
              <Select id="mobility" value={form.mobility} onChange={e => set("mobility", e.target.value)}>
                <option value="">Selecione</option>
                {MOBILITY.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </Select>
            </Field>

            <div className="bf-grid-3">
              <Field id="weight" label="Peso aproximado (kg)">
                <TextInput id="weight" type="number" value={form.patient_weight} placeholder="Ex: 70"
                  onChange={e => set("patient_weight", e.target.value)} />
              </Field>
              <Field id="height" label="Altura aproximada (cm)">
                <TextInput id="height" type="number" value={form.patient_height} placeholder="Ex: 178"
                  onChange={e => set("patient_height", e.target.value)} />
              </Field>
              <Field id="equipment" label="Usa equipamento?">
                <TextInput id="equipment" value={form.equipment_needs} placeholder="Oxigênio, monitor..."
                  onChange={e => set("equipment_needs", e.target.value)} />
              </Field>
            </div>

            {form.diagnosis_select && <AmbSuggestion type={ambType} onChangeType={v => set("ambulance_type", v)} showPicker={showAmbPicker} setShowPicker={setShowAmbPicker} />}

            <NavBtns onNext={() => setStep(1)} canNext={v1ok}
              onInvalid={() => setTouched(t => ({ ...t, patient_name: true, diagnosis: true }))} />
          </div>
        )}

        {/* ===== STEP 2: TRAJETO ===== */}
        {step === 1 && (
          <div>
            <h2 className="bf-section-title">De onde para onde?</h2>

            <Field id="origin" label="Endereço de origem (onde buscar o paciente)" required>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <TextInput id="origin-address"
                    value={form.origin_hospital_id
                      ? (hospitals.find(h => h.id === form.origin_hospital_id)?.name || '') + ' — ' + (hospitals.find(h => h.id === form.origin_hospital_id)?.neighborhood || '')
                      : form.origin_address}
                    placeholder="Rua, número, bairro"
                    onChange={e => {
                      set("origin_address", e.target.value);
                      set("origin_hospital_id", null);
                    }}
                    readOnly={!!form.origin_hospital_id}
                  />
                </div>
                <button type="button"
                  onClick={() => setShowOriginHospitalSearch(true)}
                  className="bf-btn-hospital-search"
                  style={{
                    padding: '10px 16px',
                    background: '#007A4A',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 6,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit'
                  }}>
                  {form.origin_hospital_id ? '✕ Trocar' : '🏥 Buscar hospital'}
                </button>
              </div>
              {form.origin_hospital_id && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#00995D' }}>
                  ✓ Hospital selecionado da lista
                </div>
              )}
            </Field>

            <Field id="destination" label="Destino" required>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <TextInput id="dest-address"
                    value={form.destination_hospital_id
                      ? (hospitals.find(h => h.id === form.destination_hospital_id)?.name || '') + ' — ' + (hospitals.find(h => h.id === form.destination_hospital_id)?.neighborhood || '')
                      : form.destination_address}
                    placeholder="Digite o endereço de destino"
                    onChange={e => {
                      set("destination_address", e.target.value);
                      set("destination_hospital_id", null);
                    }}
                    readOnly={!!form.destination_hospital_id}
                  />
                </div>
                <button type="button"
                  onClick={() => setShowHospitalSearch(true)}
                  className="bf-btn-hospital-search"
                  style={{
                    padding: '10px 16px',
                    background: '#007A4A',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 6,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit'
                  }}>
                  {form.destination_hospital_id ? '✕ Trocar' : '🏥 Buscar hospital'}
                </button>
              </div>
              {form.destination_hospital_id && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#00995D' }}>
                  ✓ Hospital selecionado da lista
                </div>
              )}
            </Field>

            <Field id="access_type" label="Tipo de acesso no local de busca">
              <Select id="access_type" value={form.access_type} onChange={e => set("access_type", e.target.value)}>
                <option value="">Selecione se necessário</option>
                <option value="casa_terreo">Casa/térreo (sem escadas)</option>
                <option value="apto_elevador">Apartamento com elevador</option>
                <option value="apto_escada">Apartamento só com escada</option>
                <option value="comercial">Prédio comercial</option>
                <option value="hospital">Hospital/clínica</option>
              </Select>
            </Field>

            {form.access_type === "apto_escada" && (
              <Field id="floor_number" label="Qual andar?">
                <TextInput id="floor_number" type="number" value={form.floor_number} placeholder="Ex: 3"
                  onChange={e => set("floor_number", e.target.value)} />
              </Field>
            )}

            <Field label="Quando precisa da ambulância?">
              <div className="bf-quick-row">
                <QuickButton label="Hoje" selected={form.date_quick === "hoje"} onClick={() => setDateQuick("hoje")} />
                <QuickButton label="Amanhã" selected={form.date_quick === "amanha"} onClick={() => setDateQuick("amanha")} />
                <QuickButton label="Escolher data" selected={form.date_quick === "custom"} onClick={() => setDateQuick("custom")} />
              </div>
              {form.date_quick === "custom" && (
                <TextInput id="date-pick" type="date" value={form.scheduled_date} onChange={e => set("scheduled_date", e.target.value)} />
              )}
            </Field>

            <Field label="Em que período?">
              <div className="bf-quick-row">
                <QuickButton label="Manhã (8h-12h)" selected={form.time_quick === "manha"} onClick={() => setTimeQuick("manha")} />
                <QuickButton label="Tarde (12h-18h)" selected={form.time_quick === "tarde"} onClick={() => setTimeQuick("tarde")} />
                <QuickButton label="Noite (18h-22h)" selected={form.time_quick === "noite"} onClick={() => setTimeQuick("noite")} />
                <QuickButton label="Horário exato" selected={form.time_quick === "custom"} onClick={() => setTimeQuick("custom")} />
              </div>
              {form.time_quick === "custom" && (
                <TextInput id="time-pick" type="time" value={form.scheduled_time} onChange={e => set("scheduled_time", e.target.value)} />
              )}
            </Field>

            <NavBtns onBack={() => setStep(0)} onNext={() => setStep(2)} canNext={v2ok}
              onInvalid={() => setTouched(t => ({ ...t, origin_address: true, destination: true }))} />

            {showHospitalSearch && (
              <div className="admin-modal-overlay" onClick={() => setShowHospitalSearch(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div onClick={e => e.stopPropagation()}
                  style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, maxWidth: 560, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#333333', margin: 0 }}>Buscar hospital de destino</h3>
                    <button type="button" onClick={() => setShowHospitalSearch(false)}
                      style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999999' }}>×</button>
                  </div>
                  <HospitalPicker hospitals={hospitals} regions={regions}
                    value={form.destination_hospital_id}
                    onChange={v => {
                      set("destination_hospital_id", v);
                      if (v) set("destination_address", "");
                      setShowHospitalSearch(false);
                    }} />
                </div>
              </div>
            )}

            {showOriginHospitalSearch && (
              <div className="admin-modal-overlay" onClick={() => setShowOriginHospitalSearch(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div onClick={e => e.stopPropagation()}
                  style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, maxWidth: 560, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#333333', margin: 0 }}>Buscar hospital de origem</h3>
                    <button type="button" onClick={() => setShowOriginHospitalSearch(false)}
                      style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999999' }}>×</button>
                  </div>
                  <HospitalPicker hospitals={hospitals} regions={regions}
                    value={form.origin_hospital_id}
                    onChange={v => {
                      set("origin_hospital_id", v);
                      if (v) set("origin_address", "");
                      setShowOriginHospitalSearch(false);
                    }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 3: CONTATO ===== */}
        {step === 2 && (
          <div>
            <h2 className="bf-section-title">Como falar com você</h2>

            <Field id="contact_name" label="Nome do responsável (quem vamos ligar)" required>
              <TextInput id="contact_name" value={form.contact_name} placeholder="Seu nome ou de quem acompanha"
                onChange={e => set("contact_name", e.target.value)} />
            </Field>

            <div className="bf-grid-2">
              <Field id="phone" label="Telefone principal" required>
                <TextInput id="phone" type="tel" value={form.contact_phone} placeholder="(21) 99999-9999"
                  onChange={e => set("contact_phone", e.target.value)} />
              </Field>
              <Field id="phone2" label="Telefone alternativo">
                <TextInput id="phone2" type="tel" value={form.contact_alt_phone} placeholder="Caso não atenda"
                  onChange={e => set("contact_alt_phone", e.target.value)} />
              </Field>
            </div>

            <Field id="payment" label="Forma de pagamento">
              <Select id="payment" value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>
                <option value="">Selecione</option>
                <option value="pix">Pix (5% de desconto)</option>
                <option value="card">Cartão em até 3x</option>
                <option value="billing">Faturamento (empresas)</option>
              </Select>
            </Field>

            <Field label="Informações adicionais para a equipe">
              <div className="bf-obs-grid">
                {OBS_CHECKS.map((obs, i) => (
                  <label key={i} className={`bf-obs-label ${form.obs_checks.includes(obs) ? "is-checked" : ""}`}>
                    <input type="checkbox" checked={form.obs_checks.includes(obs)}
                      onChange={e => {
                        const next = e.target.checked ? [...form.obs_checks, obs] : form.obs_checks.filter(x => x !== obs);
                        set("obs_checks", next);
                      }}
                      className="bf-obs-checkbox" />
                    {obs}
                  </label>
                ))}
              </div>
              <textarea id="notes" value={form.notes} onChange={e => set("notes", e.target.value)}
                placeholder="Outras observações (opcional)"
                className="bf-textarea"
              />
            </Field>

            <NavBtns onBack={() => setStep(1)} onNext={() => setStep(3)} canNext={v3ok}
              onInvalid={() => setTouched(t => ({ ...t, contact_name: true, contact_phone: true }))} />
          </div>
        )}

        {/* ===== STEP 4: CONFIRMAR ===== */}
        {step === 3 && (
          <div>
            <h2 className="bf-section-title">Está tudo certo?</h2>
            <div className="bf-confirm-table">
              {[
                ["Paciente", form.patient_name],
                ["Gênero", form.patient_gender === 'masculino' ? 'Masculino' : form.patient_gender === 'feminino' ? 'Feminino' : form.patient_gender === 'prefiro_nao_informar' ? 'Prefiro não informar' : null],
                ["Situação", diagText],
                ["Ambulância", ambType === "uti" ? "UTI Móvel" : ambType === "neonatal" ? "UTI Neonatal" : "Básica"],
                ["Mobilidade", MOBILITY.find(m => m.value === form.mobility)?.label],
                ["Altura", form.patient_height ? `${form.patient_height} cm` : null],
                ["Origem", form.origin_hospital_id ? hospitals.find(h => h.id === form.origin_hospital_id)?.name || form.origin_address : form.origin_address],
                ["Destino", hospitals.find(h => h.id === form.destination_hospital_id)?.name || form.destination_address],
                ["Acesso", form.access_type ? ACCESS_LABELS[form.access_type] + (form.floor_number ? ` (${form.floor_number}º andar)` : '') : null],
                ["Data/Hora", [form.scheduled_date?.split("-").reverse().join("/"), form.scheduled_time].filter(Boolean).join(" às ") || "A definir com a central"],
                ["Contato", `${form.contact_name} · ${form.contact_phone}`],
                ["Pagamento", { pix: "Pix (5% desc.)", card: "Cartão até 3x", billing: "Faturamento" }[form.payment_method]],
              ].filter(([, v]) => v).map(([label, val], i) => (
                <div key={i} className="bf-confirm-row">
                  <span className="bf-confirm-label">{label}</span>
                  <span className="bf-confirm-value">{val}</span>
                </div>
              ))}
            </div>

            {form.obs_checks.length > 0 && (
              <div className="bf-warnings">
                <div className="bf-warnings-title">Avisos para a equipe:</div>
                {form.obs_checks.map((obs, i) => (
                  <div key={i} className="bf-warnings-item">&#9656; {obs}</div>
                ))}
              </div>
            )}

            <div className="bf-confirm-note">
              Ao confirmar, nossa central recebe os dados e entra em contato para confirmar agendamento e valor. Nenhuma cobrança agora.
            </div>

            <NavBtns onBack={() => setStep(2)} onNext={handleSubmit} canNext={true} nextLabel="Confirmar pedido" loading={submitting} confirmStyle />
          </div>
        )}
      </div>

      {/* POWERED BY FOOTER */}
      <div className="bf-powered-by">
        Powered by <strong>Savior Medical Service</strong> · (21) 3171-3030
      </div>

      {/* FLOATING BOTTOM BAR */}
      {!submitted && (
        <div className="bf-bottom-bar">
          <span className="bf-bottom-text">Prefere falar?</span>
          <a href="tel:+552131713030" className="bf-bottom-call">Ligar</a>
          <a href="https://wa.me/5521980358200?text=Oi%2C%20comecei%20o%20agendamento%20online%20mas%20prefiro%20falar%20com%20alguém." className="bf-bottom-wa">WhatsApp</a>
        </div>
      )}
    </div>
  );
}
