import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../../lib/supabase";


const C = {
  navy: "#0B2540", navyDeep: "#07182B", navyMid: "#143458",
  green: "#00B87C", greenDk: "#00A06C", greenBr: "#1FD29A",
  cream: "#F4EFE6", creamDk: "#E8DFCC", white: "#FAFAF8",
  gray: "#5A6370", grayLt: "#D5DAE0", red: "#E74C3C",
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

const STEP_NAMES = ["Paciente", "Trajeto", "Contato", "Confirmar"];

// ===== STYLES =====
const focusRing = "0 0 0 3px rgba(0,184,124,.35)";
const inputBase = {
  width: "100%", padding: "12px 14px", border: `1.5px solid ${C.grayLt}`,
  borderRadius: 8, fontSize: 15, fontFamily: "Inter, sans-serif",
  background: C.white, boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s",
  outline: "none", WebkitAppearance: "none",
};
const btnBase = {
  padding: "14px 24px", borderRadius: 8, fontSize: 15, fontWeight: 700,
  border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif",
  transition: "all .15s", minHeight: 48,
};

// ===== MICRO COMPONENTS =====
function Label({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>
      {children}{required && <span style={{ color: C.red, marginLeft: 4 }}>*</span>}
    </label>
  );
}

function Field({ id, label, required, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      {children}
      {error && <div role="alert" style={{ fontSize: 12, color: C.red, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function TextInput({ id, ...props }) {
  return <input id={id} {...props} style={{ ...inputBase, ...props.style }}
    onFocus={e => { e.target.style.borderColor = C.green; e.target.style.boxShadow = focusRing; }}
    onBlur={e => { e.target.style.borderColor = C.grayLt; e.target.style.boxShadow = "none"; }}
  />;
}

function Select({ id, children, ...props }) {
  return <select id={id} {...props} style={{ ...inputBase, cursor: "pointer", ...props.style }}
    onFocus={e => { e.target.style.borderColor = C.green; e.target.style.boxShadow = focusRing; }}
    onBlur={e => { e.target.style.borderColor = C.grayLt; e.target.style.boxShadow = "none"; }}
  >{children}</select>;
}

function QuickButton({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      ...btnBase, padding: "10px 16px", fontSize: 13,
      background: selected ? C.navy : C.white,
      color: selected ? C.white : C.navy,
      border: `1.5px solid ${selected ? C.navy : C.grayLt}`,
      minHeight: 44,
    }}>{label}</button>
  );
}

function StepBar({ current, total }) {
  return (
    <div role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}
      aria-label={`Etapa ${current + 1} de ${total}`}
      style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 6, borderRadius: 3,
            background: i <= current ? C.green : C.grayLt,
            transition: "background .3s"
          }} />
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>
        Etapa {current + 1} de {total} — {STEP_NAMES[current]}
      </div>
    </div>
  );
}

function NavBtns({ onBack, onNext, canNext, nextLabel, loading }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
      {onBack && <button type="button" onClick={onBack} style={{
        ...btnBase, background: "transparent", border: `1.5px solid ${C.grayLt}`, color: C.navy
      }}>Voltar</button>}
      {onNext && <button type="button" onClick={onNext} disabled={!canNext || loading} style={{
        ...btnBase, flex: 1,
        background: canNext && !loading ? C.green : C.grayLt,
        color: canNext && !loading ? "#fff" : C.gray,
        opacity: loading ? 0.7 : 1,
      }}>{loading ? "Enviando..." : (nextLabel || "Continuar")}</button>}
    </div>
  );
}

// ===== AMBULANCE SUGGESTION =====
function AmbSuggestion({ type, onChangeType, showPicker, setShowPicker }) {
  const info = {
    basic: { label: "Ambulância Básica", team: "Condutor + Enfermeiro", price: "A partir de R$ 1.200", color: C.green,
      desc: "Para paciente estável. Maca, oxigênio, suporte para soro." },
    uti: { label: "Ambulância UTI Móvel", team: "Condutor + Enfermeiro + Médico", price: "A partir de R$ 2.200", color: C.amber,
      desc: "Para paciente com risco. Monitor cardíaco, ventilador, desfibrilador." },
    neonatal: { label: "UTI Neonatal", team: "Neonatologista + Enfermeiro", price: "Sob consulta", color: C.pink,
      desc: "Para recém-nascidos de risco. Incubadora de transporte." },
  };
  const d = info[type];
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        padding: 16, background: C.navyDeep, borderRadius: 10,
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 8, background: d.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0
        }}>{type === "uti" ? "UTI" : type === "neonatal" ? "NEO" : "BAS"}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Recomendação: {d.label}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 2 }}>{d.desc}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: d.color, marginTop: 4 }}>{d.price}</div>
        </div>
        <button type="button" onClick={() => setShowPicker(!showPicker)} style={{
          ...btnBase, padding: "8px 14px", fontSize: 12, minHeight: 36,
          background: "transparent", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.6)"
        }}>{showPicker ? "Fechar" : "Mudar tipo"}</button>
      </div>
      {showPicker && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginTop: 8 }}>
          {Object.entries(info).map(([key, val]) => (
            <button key={key} type="button" onClick={() => { onChangeType(key); setShowPicker(false); }}
              aria-label={`Selecionar ${val.label}`}
              style={{
                padding: 16, borderRadius: 8, textAlign: "left", cursor: "pointer", minHeight: 64,
                background: type === key ? `${val.color}12` : C.white,
                border: type === key ? `2px solid ${val.color}` : `2px solid ${C.grayLt}`,
              }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{val.label}</div>
              <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{val.team}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: val.color, marginTop: 4 }}>{val.price}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== HOSPITAL SELECTOR =====
function HospitalPicker({ hospitals, regions, value, onChange }) {
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
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <TextInput id="hospital-search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou bairro..." aria-label="Buscar hospital"
          style={{ flex: "1 1 220px" }} />
        <Select id="hospital-region" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
          aria-label="Filtrar por região" style={{ flex: "0 1 200px" }}>
          <option value="">Todas as regiões</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
      </div>
      {selected && (
        <div style={{
          padding: 14, background: `${C.green}0D`, border: `1.5px solid ${C.green}40`,
          borderRadius: 8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>Selecionado: </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{selected.name}</span>
            {selected.neighborhood && <span style={{ fontSize: 12, color: C.gray, marginLeft: 8 }}>{selected.neighborhood}</span>}
          </div>
          <button type="button" onClick={() => onChange(null)} style={{
            ...btnBase, padding: "6px 12px", fontSize: 12, minHeight: 32,
            background: "transparent", border: `1px solid ${C.red}40`, color: C.red
          }}>Trocar</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 4 }}>
        {shown.map(h => {
          const net = h.savior_hospital_networks;
          return (
            <button key={h.id} type="button" onClick={() => onChange(h.id)}
              aria-label={`${h.name} — ${h.detail || ""}`}
              style={{
                padding: 16, minHeight: 64,
                background: value === h.id ? `${C.green}0D` : C.white,
                border: value === h.id ? `2px solid ${C.green}` : `1.5px solid ${C.grayLt}`,
                borderRadius: 8, cursor: "pointer", textAlign: "left",
                display: "flex", gap: 12, alignItems: "center", transition: "all .1s",
                marginBottom: 0,
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14, flexShrink: 0,
                background: net?.color_bg || C.navy, color: net?.color_text || "#fff"
              }}>{h.initials || h.name.substring(0, 2)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{h.name}</div>
                <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{h.detail}</div>
              </div>
              {net && <span style={{
                fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                color: C.greenDk, background: `${C.green}10`, padding: "3px 8px", borderRadius: 4,
                whiteSpace: "nowrap", flexShrink: 0
              }}>{net.name}</span>}
            </button>
          );
        })}
      </div>
      {filtered.length > 6 && !showAll && (
        <button type="button" onClick={() => setShowAll(true)} style={{
          ...btnBase, width: "100%", marginTop: 8, fontSize: 13,
          background: "transparent", border: `1.5px solid ${C.grayLt}`, color: C.navy, minHeight: 44,
        }}>Ver todos os {filtered.length} hospitais</button>
      )}
      {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center", color: C.gray, fontSize: 13 }}>Nenhum hospital encontrado.</div>}
    </div>
  );
}

// ===== MAIN =====
export default function SaviorBooking() {
  const [step, setStep] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState("");
  const [waUrl, setWaUrl] = useState("");
  const [showAmbPicker, setShowAmbPicker] = useState(false);
  const [touched, setTouched] = useState({});
  const formRef = useRef(null);

  const [form, setForm] = useState({
    service_type: "scheduled", ambulance_type: "", patient_name: "", patient_dob: "",
    patient_weight: "", diagnosis_select: "", diagnosis_other: "", equipment_needs: "", mobility: "",
    origin_address: "", destination_hospital_id: null, destination_address: "",
    scheduled_date: "", scheduled_time: "", date_quick: "", time_quick: "",
    contact_name: "", contact_phone: "", contact_alt_phone: "",
    payment_method: "", notes: "", obs_checks: [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const touch = (key) => setTouched(t => ({ ...t, [key]: true }));

  // Persistence: save to sessionStorage
  useEffect(() => {
    if (form.patient_name || form.diagnosis_select) {
      sessionStorage.setItem("savior_draft", JSON.stringify({ form, step }));
    }
  }, [form, step]);

  // Persistence: restore on load
  useEffect(() => {
    const draft = sessionStorage.getItem("savior_draft");
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

  function setDateQuick(q) {
    set("date_quick", q);
    if (q === "hoje") set("scheduled_date", today);
    else if (q === "amanha") set("scheduled_date", tomorrow);
    else set("scheduled_date", "");
  }
  function setTimeQuick(q) {
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
    const obsAll = [...form.obs_checks, form.notes].filter(Boolean).join("; ");

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
      origin_address: form.origin_address,
      destination_hospital_id: form.destination_hospital_id,
      destination_address: form.destination_address,
      scheduled_date: form.scheduled_date || null,
      scheduled_time: form.scheduled_time || null,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      contact_alt_phone: form.contact_alt_phone,
      payment_method: form.payment_method,
      notes: obsAll,
      source: "web",
    });

    const msg = [
      `[AGENDAMENTO VIA SITE - ${svcLabel}]`, "",
      `*Paciente:* ${form.patient_name}`,
      form.patient_dob ? `*Nasc:* ${form.patient_dob.split("-").reverse().join("/")}` : null,
      form.patient_weight ? `*Peso:* ${form.patient_weight}kg` : null,
      `*Diagnóstico:* ${diagText}`,
      mobLabel ? `*Mobilidade:* ${mobLabel}` : null,
      form.equipment_needs ? `*Equipamentos:* ${form.equipment_needs}` : null,
      "", `*Ambulância:* ${ambLabel}`,
      `*Origem:* ${form.origin_address}`,
      `*Destino:* ${destHospital ? destHospital.name + " (" + (destHospital.neighborhood || "") + ")" : form.destination_address}`,
      form.scheduled_date ? `*Data:* ${form.scheduled_date.split("-").reverse().join("/")}${form.scheduled_time ? " às " + form.scheduled_time : ""}` : null,
      "", `*Contato:* ${form.contact_name}`, `*Tel:* ${form.contact_phone}`,
      form.contact_alt_phone ? `*Tel alt:* ${form.contact_alt_phone}` : null,
      `*Pagamento:* ${payLabel}`,
      obsAll ? `\n*Obs:* ${obsAll}` : null,
    ].filter(Boolean).join("\n");

    sessionStorage.removeItem("savior_draft");
    setSubmittedMsg(msg);
    setWaUrl(`https://wa.me/5521980358200?text=${encodeURIComponent(msg)}`);
    setSubmitting(false);
    setSubmitted(true);
  }

  // Validations
  const v1ok = !!form.patient_name && !!form.diagnosis_select && (form.diagnosis_select !== "outro" || !!form.diagnosis_other);
  const v2ok = !!form.origin_address && (!!form.destination_hospital_id || !!form.destination_address);
  const v3ok = !!form.contact_phone && !!form.contact_name;

  // ===== RENDER =====
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: "-0.03em" }}>SAVIOR</div>
        <div style={{ fontSize: 13, color: C.gray, marginTop: 8 }}>Carregando hospitais...</div>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: C.navy, fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.green, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff" }}>✓</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Pedido registrado</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>
            Agora envie a mensagem pelo WhatsApp para a central confirmar o agendamento.
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 10, padding: 20, marginBottom: 24, border: "1px solid rgba(255,255,255,.1)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.greenBr, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>Mensagem para a central</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {submittedMsg.replace(/\*(.*?)\*/g, "$1")}
          </div>
        </div>
        <a href={waUrl} target="_blank" rel="noopener" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "16px 28px", background: C.green, color: "#fff", borderRadius: 8,
          fontSize: 16, fontWeight: 700, textDecoration: "none", width: "100%", minHeight: 52, marginBottom: 12
        }}>Enviar pelo WhatsApp</a>
        <a href="tel:+552131713030" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "14px 28px", background: "transparent", color: "rgba(255,255,255,.5)",
          border: "1px solid rgba(255,255,255,.15)", borderRadius: 8,
          fontSize: 14, fontWeight: 600, textDecoration: "none", width: "100%", minHeight: 48
        }}>Ou ligar: (21) 3171-3030</a>
        <div style={{ marginTop: 20, padding: 14, background: "rgba(0,184,124,.08)", border: "1px solid rgba(0,184,124,.15)", borderRadius: 8, fontSize: 12, color: "rgba(255,255,255,.55)", lineHeight: 1.6 }}>
          A mensagem chega formatada na central. O atendente já recebe tudo estruturado, sem precisar perguntar de novo.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "Inter, sans-serif" }}>
      {/* SKIP LINK */}
      <a href="#form-start" style={{
        position: "absolute", top: -100, left: 0, background: C.green, color: "#fff",
        padding: "8px 16px", zIndex: 999, fontSize: 13, fontWeight: 600,
      }} onFocus={e => e.target.style.top = "0"} onBlur={e => e.target.style.top = "-100px"}>
        Ir para o formulário
      </a>

      {/* EMERGENCY HEADER */}
      <div style={{
        background: C.red, color: "#fff", padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap",
        fontSize: 13, fontWeight: 600, textAlign: "center"
      }}>
        <span>Emergência? Não preencha formulário.</span>
        <a href="tel:+552131713030" style={{
          color: "#fff", background: "rgba(0,0,0,.2)", padding: "6px 14px",
          borderRadius: 6, textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap"
        }}>(21) 3171-3030</a>
        <a href="https://wa.me/5521980358200?text=EMERGÊNCIA" style={{
          color: "#fff", background: "rgba(0,0,0,.2)", padding: "6px 14px",
          borderRadius: 6, textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap"
        }}>WhatsApp</a>
      </div>

      {/* TOPBAR */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100, background: C.navyDeep,
        borderBottom: `1px solid ${C.green}20`, padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 52
      }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.03em" }}>SAVIOR</div>
        <a href="tel:+552131713030" style={{ fontSize: 12, color: "rgba(255,255,255,.5)", textDecoration: "none" }}>(21) 3171-3030</a>
      </div>

      {/* FORM */}
      <div id="form-start" ref={formRef} style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 120px" }}>
        <div style={{ fontSize: 14, color: C.greenDk, fontWeight: 500, marginBottom: 4 }}>Central 24 horas · Resposta em minutos</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: "-0.03em", marginBottom: 6, lineHeight: 1.15 }}>
          Vamos organizar o transporte do paciente.
        </h1>
        <p style={{ fontSize: 14, color: C.gray, marginBottom: 24, lineHeight: 1.55 }}>
          Preencha com calma. Nossa central confirma tudo por telefone.
        </p>

        {/* Service type toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <QuickButton label="Remoção programada" selected={form.service_type === "scheduled"} onClick={() => set("service_type", "scheduled")} />
          <QuickButton label="Transporte recorrente" selected={form.service_type === "recurring"} onClick={() => set("service_type", "recurring")} />
        </div>

        <StepBar current={step} total={4} />

        {/* ===== STEP 1: PACIENTE ===== */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Dados do paciente</h2>

            <Field id="patient_name" label="Nome do paciente" required error={touched.patient_name && !form.patient_name ? "Informe o nome" : null}>
              <TextInput id="patient_name" value={form.patient_name} placeholder="Nome completo"
                onChange={e => set("patient_name", e.target.value)} onBlur={() => touch("patient_name")} />
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field id="weight" label="Peso aproximado (kg)">
                <TextInput id="weight" type="number" value={form.patient_weight} placeholder="Ex: 70"
                  onChange={e => set("patient_weight", e.target.value)} />
              </Field>
              <Field id="equipment" label="Usa equipamento?">
                <TextInput id="equipment" value={form.equipment_needs} placeholder="Oxigênio, monitor..."
                  onChange={e => set("equipment_needs", e.target.value)} />
              </Field>
            </div>

            {form.diagnosis_select && <AmbSuggestion type={ambType} onChangeType={v => set("ambulance_type", v)} showPicker={showAmbPicker} setShowPicker={setShowAmbPicker} />}

            <NavBtns onNext={() => setStep(1)} canNext={v1ok} />
          </div>
        )}

        {/* ===== STEP 2: TRAJETO ===== */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Trajeto</h2>

            <Field id="origin" label="Endereço de origem (onde buscar o paciente)" required>
              <TextInput id="origin" value={form.origin_address} placeholder="Rua, número, bairro"
                onChange={e => set("origin_address", e.target.value)} />
            </Field>

            <Field label="Destino (hospital ou endereço)" required>
              <HospitalPicker hospitals={hospitals} regions={regions}
                value={form.destination_hospital_id} onChange={v => { set("destination_hospital_id", v); if (v) set("destination_address", ""); }} />
              <div style={{ marginTop: 12 }}>
                <TextInput id="dest-address" value={form.destination_address}
                  placeholder="Ou digite o endereço se não for hospital da lista"
                  onChange={e => { set("destination_address", e.target.value); if (e.target.value) set("destination_hospital_id", null); }}
                  aria-label="Endereço de destino alternativo" />
              </div>
            </Field>

            <Field label="Quando precisa da ambulância?">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <QuickButton label="Hoje" selected={form.date_quick === "hoje"} onClick={() => setDateQuick("hoje")} />
                <QuickButton label="Amanhã" selected={form.date_quick === "amanha"} onClick={() => setDateQuick("amanha")} />
                <QuickButton label="Escolher data" selected={form.date_quick === "custom"} onClick={() => setDateQuick("custom")} />
              </div>
              {form.date_quick === "custom" && (
                <TextInput id="date-pick" type="date" value={form.scheduled_date} onChange={e => set("scheduled_date", e.target.value)} />
              )}
            </Field>

            <Field label="Em que período?">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <QuickButton label="Manhã (8h-12h)" selected={form.time_quick === "manha"} onClick={() => setTimeQuick("manha")} />
                <QuickButton label="Tarde (12h-18h)" selected={form.time_quick === "tarde"} onClick={() => setTimeQuick("tarde")} />
                <QuickButton label="Noite (18h-22h)" selected={form.time_quick === "noite"} onClick={() => setTimeQuick("noite")} />
                <QuickButton label="Horário exato" selected={form.time_quick === "custom"} onClick={() => setTimeQuick("custom")} />
              </div>
              {form.time_quick === "custom" && (
                <TextInput id="time-pick" type="time" value={form.scheduled_time} onChange={e => set("scheduled_time", e.target.value)} />
              )}
            </Field>

            <NavBtns onBack={() => setStep(0)} onNext={() => setStep(2)} canNext={v2ok} />
          </div>
        )}

        {/* ===== STEP 3: CONTATO ===== */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Contato e pagamento</h2>

            <Field id="contact_name" label="Nome do responsável (quem vamos ligar)" required>
              <TextInput id="contact_name" value={form.contact_name} placeholder="Seu nome ou de quem acompanha"
                onChange={e => set("contact_name", e.target.value)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              <div style={{ display: "grid", gap: 6, marginBottom: 8 }}>
                {OBS_CHECKS.map((obs, i) => (
                  <label key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: C.white, borderRadius: 6, cursor: "pointer", fontSize: 13,
                    border: `1.5px solid ${form.obs_checks.includes(obs) ? C.green : C.grayLt}`,
                    minHeight: 44, transition: "border-color .15s"
                  }}>
                    <input type="checkbox" checked={form.obs_checks.includes(obs)}
                      onChange={e => {
                        const next = e.target.checked ? [...form.obs_checks, obs] : form.obs_checks.filter(x => x !== obs);
                        set("obs_checks", next);
                      }}
                      style={{ width: 18, height: 18, accentColor: C.green }} />
                    {obs}
                  </label>
                ))}
              </div>
              <textarea id="notes" value={form.notes} onChange={e => set("notes", e.target.value)}
                placeholder="Outras observações (opcional)"
                style={{ ...inputBase, minHeight: 56, resize: "vertical", fontSize: 14 }}
                onFocus={e => { e.target.style.borderColor = C.green; e.target.style.boxShadow = focusRing; }}
                onBlur={e => { e.target.style.borderColor = C.grayLt; e.target.style.boxShadow = "none"; }}
              />
            </Field>

            <NavBtns onBack={() => setStep(1)} onNext={() => setStep(3)} canNext={v3ok} />
          </div>
        )}

        {/* ===== STEP 4: CONFIRMAR ===== */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Confirmar pedido</h2>
            <div style={{ background: C.white, borderRadius: 10, overflow: "hidden", border: `1.5px solid ${C.grayLt}` }}>
              {[
                ["Paciente", form.patient_name],
                ["Situação", diagText],
                ["Ambulância", ambType === "uti" ? "UTI Móvel" : ambType === "neonatal" ? "UTI Neonatal" : "Básica"],
                ["Mobilidade", MOBILITY.find(m => m.value === form.mobility)?.label],
                ["Origem", form.origin_address],
                ["Destino", hospitals.find(h => h.id === form.destination_hospital_id)?.name || form.destination_address],
                ["Data/Hora", [form.scheduled_date?.split("-").reverse().join("/"), form.scheduled_time].filter(Boolean).join(" às ") || "A definir com a central"],
                ["Contato", `${form.contact_name} · ${form.contact_phone}`],
                ["Pagamento", { pix: "Pix (5% desc.)", card: "Cartão até 3x", billing: "Faturamento" }[form.payment_method]],
              ].filter(([, v]) => v).map(([label, val], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "14px 20px",
                  borderBottom: `1px solid ${C.cream}`, fontSize: 14
                }}>
                  <span style={{ color: C.gray }}>{label}</span>
                  <span style={{ fontWeight: 700, color: C.navy, textAlign: "right", maxWidth: "60%" }}>{val}</span>
                </div>
              ))}
            </div>

            {form.obs_checks.length > 0 && (
              <div style={{ marginTop: 12, padding: 14, background: `${C.amber}10`, border: `1px solid ${C.amber}30`, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Avisos para a equipe:</div>
                {form.obs_checks.map((obs, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.gray }}>▸ {obs}</div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: 16, padding: 14, background: `${C.green}08`, border: `1px solid ${C.green}25`,
              borderRadius: 8, fontSize: 13, color: C.navy, lineHeight: 1.6
            }}>
              Ao confirmar, nossa central recebe os dados e entra em contato para confirmar agendamento e valor. Nenhuma cobrança agora.
            </div>

            <NavBtns onBack={() => setStep(2)} onNext={handleSubmit} canNext={true} nextLabel="Confirmar pedido" loading={submitting} />
          </div>
        )}
      </div>

      {/* FLOATING BOTTOM BAR — "Prefere falar?" */}
      {!submitted && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: C.navyDeep, borderTop: `1px solid ${C.green}20`,
          padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginRight: 4 }}>Prefere falar?</span>
          <a href="tel:+552131713030" style={{
            fontSize: 12, color: "rgba(255,255,255,.7)", padding: "8px 14px",
            border: "1px solid rgba(255,255,255,.15)", borderRadius: 6, textDecoration: "none", minHeight: 36,
            display: "flex", alignItems: "center"
          }}>Ligar</a>
          <a href="https://wa.me/5521980358200?text=Oi%2C%20comecei%20o%20agendamento%20online%20mas%20prefiro%20falar%20com%20alguém." style={{
            fontSize: 12, color: "#fff", background: C.green, padding: "8px 14px",
            borderRadius: 6, textDecoration: "none", fontWeight: 600, minHeight: 36,
            display: "flex", alignItems: "center"
          }}>WhatsApp</a>
        </div>
      )}
    </div>
  );
}
