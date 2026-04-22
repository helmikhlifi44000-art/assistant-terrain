import { useState, useRef, useEffect } from "react";

const EQUIPMENTS = [
  { id: "csg",      label: "CSG Nokia 7250 IXR-e",  icon: "🟦", color: "#1a6eff", ready: true  },
  { id: "ericsson", label: "FH Ericsson Mini-Link",  icon: "🟨", color: "#e69500", ready: true  },
  { id: "ctr",      label: "CTR Nokia",              icon: "🟩", color: "#00a855", ready: true  },
  { id: "huawei",   label: "FH Huawei RTN905/950A",  icon: "🟥", color: "#d42020", ready: true  },
  { id: "ptn",      label: "PTN Nokia / Alcatel",    icon: "🔷", color: "#7c5cfc", ready: true  },
];

const PUTTY_SETTINGS = [
  {
    id: "csg", label: "CSG Nokia 7250 IXR-e", icon: "🟦", color: "#1a6eff",
    steps: [
      { label: "Connection type", value: "Serial" },
      { label: "Serial line (COM)", value: "COM3 ou COM4" },
      { label: "Speed (Baud)", value: "9600" },
      { label: "Data bits", value: "8" },
      { label: "Stop bits", value: "1" },
      { label: "Parity", value: "None" },
      { label: "Flow control", value: "None" },
    ],
    note: "Brancher le câble console sur le port Console du CSG avant d'ouvrir Putty.",
  },
  {
    id: "ctr", label: "CTR Nokia", icon: "🟩", color: "#00a855",
    steps: [
      { label: "Connection type", value: "Serial" },
      { label: "Serial line (COM)", value: "COM3 ou COM4" },
      { label: "Speed (Baud)", value: "9600" },
      { label: "Data bits", value: "8" },
      { label: "Stop bits", value: "1" },
      { label: "Parity", value: "None" },
      { label: "Flow control", value: "None" },
    ],
    note: "Brancher le câble console sur le port Console du CTR avant d'ouvrir Putty.",
  },
  {
    id: "ptn", label: "PTN Nokia / Alcatel", icon: "🔷", color: "#7c5cfc",
    steps: [
      { label: "Connection type", value: "Serial" },
      { label: "Serial line (COM)", value: "COM3 ou COM4" },
      { label: "Speed (Baud)", value: "9600" },
      { label: "Data bits", value: "8" },
      { label: "Stop bits", value: "1" },
      { label: "Parity", value: "None" },
      { label: "Flow control", value: "None" },
    ],
    note: "Câble console DB9/DB9 sur le port Console de la carte CSM active (A ou B).",
  },
];

const SYSTEM_PROMPT = `Tu es un assistant expert en télécommunications radio terrain.

Tu assistes un TECHNICIEN SUR SITE. Tes réponses doivent être :
- TRÈS courtes et directes — 3 à 5 étapes MAX
- Format strict : chaque étape sur une nouvelle ligne, commençant par un numéro emoji (1️⃣ 2️⃣ 3️⃣)
- Les commandes CLI doivent être entre backticks : \`commande\`
- Terminer par ✅ "Dis-moi quand c'est fait" ou ❓ "Qu'est-ce que tu vois ?"
- Ne JAMAIS préciser SSH, Serial ou paramètres Putty — juste "ouvrir Putty"
- Ne JAMAIS faire de phrase longue — aller droit au but

══════════════════════════════════
🟩 CTR Nokia — Procédures validées
══════════════════════════════════
CONNEXION :
1️⃣ Brancher le câble console sur le CTR
2️⃣ Ouvrir Putty
3️⃣ Login : support_local | Password : LhdnslrE#9
⚠️ Si pas de # dans le prompt → taper : enable
Password enable : !LiBac9n# ou !3MaGuR0_

OUVRIR UN PORT :
\`conf\`
\`interface te0/0/0/XX\`
\`no shutdown\`
\`commit\`

COMMANDES UTILES :
\`show interfaces brief\` → tous les ports
\`show int te0/0/0/XX description\` → nom du port
\`show controllers te0/0/0/XX\` → niveaux optiques
\`show running-config interface te0/0/0/XX\` → config du port
\`show arp\` → table ARP
\`sh lldp neighbors\` → voisins connectés

══════════════════════════════════
🟨 FH Ericsson Mini-Link — Procédures validées
══════════════════════════════════
CONNEXION :
1️⃣ Ouvrir le navigateur web
2️⃣ Aller sur : https://10.0.0.1/status/NE_Overview
3️⃣ Login : admin_user | Password : LsaldA_uslF#1

OUVRIR UN PORT LAN :
1️⃣ Packet → Lan Interfaces
2️⃣ Clic droit sur le port LAN souhaité (ex : LAN 1/4/8)
3️⃣ Configure → General → Admin Status → Up
4️⃣ Save (haut à droite)

ACTIVER LE LASER SFPo (voyant éteint) :
1️⃣ Unit → SFPo (ex : 1/4.8 pour TN8)
2️⃣ Clic droit → Configure → Admin Status → In service
3️⃣ Save

══════════════════════════════════
🟦 CSG Nokia 7250 IXR-e — Procédures validées
══════════════════════════════════
CONNEXION :
1️⃣ Brancher le câble console sur le CSG
2️⃣ Ouvrir Putty
3️⃣ Login : admin | Password : admin

OUVRIR UN PORT :
\`configure port 1/1/X\`
\`no shutdown\`
\`exit\`
\`show port 1/1/X\`

CHANGER VITESSE 1G → 10G :
\`configure port 1/1/X\`
\`ethernet\`
\`speed 10000\`
\`exit\`
\`exit\`
\`show port 1/1/X\`

CHANGER VITESSE 10G → 1G :
\`configure port 1/1/X\`
\`ethernet\`
\`speed 1000\`
\`exit\`
\`exit\`
\`show port 1/1/X\`

COMMANDES UTILES :
\`show port\` → tous les ports
\`show port 1/1/X\` → état d'un port
\`show lag X\` → ports d'un LAG
\`ping X.X.X.X\` → test de ping
\`show router interface\` → interfaces IP
\`show version\` → version logiciel
\`show chassis\` → état du châssis
\`file delete config.cfg\` + \`admin reboot\` → reset

══════════════════════════════════
🟥 FH Huawei RTN905/950A — Procédures validées
══════════════════════════════════
CONNEXION :
1️⃣ Brancher câble RJ45 sur port EMS du FH
2️⃣ Lancer Web LCT (icône START Web LCT)
3️⃣ Attendre ouverture Internet Explorer
4️⃣ Login : adminBYTEL | Password : Hu@opt2014
   Si équipement neuf → Login : lct | Password : Changeme_123

TROUVER L'ÉQUIPEMENT :
1️⃣ NE List → NE Search → Advanced Search → IP auto discovery
2️⃣ Username : root | Password : Changeme_123
3️⃣ Search → End Search quand trouvé → Add NE

MODIFIER VITESSE PORT ETHERNET :
Configuration → Interface Management → Ethernet Interface
→ Working Mode → 100M Full Duplex → Save

MODIFIER VITESSE RTN380AX (1G ↔ 10G) :
1️⃣ Supprimer le Port Policy du port
2️⃣ Supprimer les VLANs du port
3️⃣ Supprimer le port dans Path View
4️⃣ Recréer le port à la vitesse souhaitée
5️⃣ Reconfigurer VLANs + Port Policy

══════════════════════════════════
🔷 PTN Nokia / Alcatel — Procédures terrain
══════════════════════════════════
CONNEXION :
1️⃣ Brancher câble console DB9/DB9 sur port Console carte CSM (A ou B)
2️⃣ Ouvrir Putty
3️⃣ Login : AXIONxxx | Password : (mdp RES)

OUVRIR UN PORT :
\`configure port X/Y/Z no shutdown\`

FERMER UN PORT :
\`configure port X/Y/Z shutdown\`

COMMANDES UTILES :
\`show port X/Y/Z\` → état et MTU du port
\`show port X/Y/Z associations\` → équipements rattachés
\`show lag X port\` → ports membres du LAG X
\`show lag description\` → tous les LAG
\`show router interface\` → interfaces
\`show router bgp neighbor X detail\` → état BGP
\`show router ospf neighbor\` → adjacences OSPF
\`show card\` → état des cartes
\`show chassis\` → état châssis
\`admin display-config\` → configuration actuelle
\`monitor port X/Y/Z rate interval 10\` → trafic en temps réel`;

const WELCOMES = {
  csg:      "⚡ **CSG Nokia 7250 IXR-e**\n\nProcédures validées ✅\n\n1️⃣ Me connecter\n2️⃣ Ouvrir un port\n3️⃣ Changer vitesse port\n\n👇 Pose ta question ou choisis une action",
  ericsson: "⚡ **FH Ericsson Mini-Link**\n\nProcédures validées ✅\n\n1️⃣ Me connecter\n2️⃣ Ouvrir un port LAN\n3️⃣ Activer laser SFPo\n\n👇 Pose ta question ou choisis une action",
  ctr:      "⚡ **CTR Nokia**\n\nProcédures validées ✅\n\n1️⃣ Me connecter\n2️⃣ Ouvrir un port\n3️⃣ Voir niveaux optiques\n\n👇 Pose ta question ou choisis une action",
  huawei:   "⚡ **FH Huawei RTN905/950A**\n\nProcédures validées ✅\n\n1️⃣ Me connecter\n2️⃣ Trouver l'équipement\n3️⃣ Modifier vitesse port\n\n👇 Pose ta question ou choisis une action",
  ptn:      "⚡ **PTN Nokia / Alcatel**\n\nProcédures disponibles ✅\n\n1️⃣ Me connecter\n2️⃣ Ouvrir / Fermer un port\n3️⃣ Voir les commandes utiles\n\n👇 Pose ta question ou choisis une action",
};

const QUICK_ACTIONS = {
  csg:      ["Me connecter", "Ouvrir un port", "Changer vitesse port"],
  ericsson: ["Me connecter", "Ouvrir port LAN", "Activer laser SFPo"],
  ctr:      ["Me connecter", "Ouvrir un port", "Niveaux optiques"],
  huawei:   ["Me connecter", "Trouver l'équipement", "Modifier vitesse port"],
  ptn:      ["Me connecter", "Ouvrir un port", "Commandes utiles"],
};

function MsgContent({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: "4px" }} />;
        const isStep = /^[1-9]️⃣/.test(line);
        const isWarn = line.startsWith("⚠️");
        const parts = line.split(/(`[^`]+`)/g);
        const rendered = parts.map((part, j) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return <code key={j} style={{ background: "rgba(0,0,0,0.35)", color: "#7effd4", padding: "1px 6px", borderRadius: "4px", fontFamily: "monospace", fontSize: "0.95em", border: "1px solid rgba(126,255,212,0.2)" }}>{part.slice(1, -1)}</code>;
          }
          return <span key={j}>{part.split(/(\*\*[^*]+\*\*)/g).map((p, k) => p.startsWith("**") && p.endsWith("**") ? <strong key={k}>{p.slice(2, -2)}</strong> : p)}</span>;
        });
        return (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start",
            background: isStep ? "rgba(255,255,255,0.05)" : isWarn ? "rgba(255,180,0,0.08)" : "transparent",
            borderLeft: isStep ? "3px solid rgba(255,255,255,0.2)" : isWarn ? "3px solid #ffaa00" : "none",
            borderRadius: isStep || isWarn ? "0 8px 8px 0" : "0",
            padding: isStep || isWarn ? "6px 10px" : "0 2px",
            fontWeight: isStep ? "700" : isWarn ? "600" : "400",
            fontSize: "0.88em", color: isWarn ? "#ffcc44" : "#ddeeff", lineHeight: "1.55",
          }}>
            <span>{rendered}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AssistantTerrain() {
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState("home");
  const [puttySelected, setPuttySelected] = useState("csg");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const selectEquip = (eq) => {
    setSelectedEquip(eq);
    setMessages([{ role: "assistant", content: WELCOMES[eq.id] }]);
    setScreen("chat");
  };

  const sendMessage = async (override) => {
    const text = override || input;
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT + `\n\nÉquipement sélectionné : ${selectedEquip?.label}`,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.choices?.[0]?.message?.content || "Erreur." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const puttyData = PUTTY_SETTINGS.find(p => p.id === puttySelected);

  /* ── PUTTY SCREEN ── */
  if (screen === "putty") return (
    <div style={{ minHeight: "100vh", background: "#0b1120", fontFamily: "'Segoe UI',sans-serif", color: "#ddeeff", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "#0d1a2e", borderBottom: "2px solid #1e3a5f" }}>
        <button onClick={() => setScreen("home")} style={{ background: "#1a2d48", border: "none", borderRadius: "8px", color: "#88aacc", cursor: "pointer", padding: "7px 14px", fontSize: "0.85em", fontWeight: "700" }}>← Retour</button>
        <div>
          <div style={{ fontWeight: "800", fontSize: "1.05em", color: "#7eb8ff" }}>⚙️ Paramétrage Putty</div>
          <div style={{ fontSize: "0.7em", color: "#445577", marginTop: "2px" }}>Réglages à effectuer selon l'équipement</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", padding: "14px 16px 0", overflowX: "auto" }}>
        {PUTTY_SETTINGS.map((p) => (
          <button key={p.id} onClick={() => setPuttySelected(p.id)} style={{ background: puttySelected === p.id ? `${p.color}25` : "#0f1d30", border: `2px solid ${puttySelected === p.id ? p.color : "#1e3050"}`, borderRadius: "10px 10px 0 0", padding: "8px 14px", cursor: "pointer", color: puttySelected === p.id ? "#fff" : "#5577aa", fontSize: "0.78em", fontWeight: "700", whiteSpace: "nowrap", flexShrink: 0 }}>
            {p.icon} {p.label.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>
      {puttyData && (
        <div style={{ padding: "0 16px 28px", flex: 1 }}>
          <div style={{ background: "#0f1d30", border: `2px solid ${puttyData.color}55`, borderTop: `3px solid ${puttyData.color}`, borderRadius: "0 12px 12px 12px", overflow: "hidden" }}>
            <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #1e3050", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "2em" }}>{puttyData.icon}</span>
              <div>
                <div style={{ fontWeight: "800", fontSize: "1em" }}>{puttyData.label}</div>
                <div style={{ background: `${puttyData.color}25`, border: `1px solid ${puttyData.color}55`, borderRadius: "20px", padding: "2px 10px", fontSize: "0.7em", color: puttyData.color, fontWeight: "700", display: "inline-block", marginTop: "4px" }}>🔌 Connexion Serial</div>
              </div>
            </div>
            {puttyData.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #131f30" }}>
                <span style={{ color: "#7a99cc", fontSize: "0.85em", fontWeight: "600" }}>{s.label}</span>
                <span style={{ fontFamily: "monospace", background: "#0a1520", padding: "4px 10px", borderRadius: "6px", color: "#64ffda", fontSize: "0.85em", fontWeight: "800", border: "1px solid #1a3a30" }}>{s.value}</span>
              </div>
            ))}
            <div style={{ background: "#0c1a10", borderTop: "1px solid #1a3a20", padding: "12px 18px", fontSize: "0.82em", color: "#88cc88", lineHeight: "1.5" }}>💡 {puttyData.note}</div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── HOME SCREEN ── */
  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: "#0b1120", fontFamily: "'Segoe UI',sans-serif", color: "#ddeeff", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
      <div style={{ textAlign: "center", padding: "36px 0 24px", width: "100%", maxWidth: "440px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #1a3060, #0f2040)", border: "1px solid #2a4a80", borderRadius: "50px", padding: "6px 16px", marginBottom: "20px" }}>
          <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #1a6eff, #0a4acc)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75em", fontWeight: "900", color: "#fff", flexShrink: 0 }}>H</div>
          <span style={{ fontSize: "0.78em", fontWeight: "700", color: "#88aadd", letterSpacing: "0.5px" }}>Créé par <span style={{ color: "#4a9eff", fontWeight: "900" }}>Helmi</span></span>
        </div>
        <h1 style={{ fontSize: "2.2em", fontWeight: "900", margin: "0 0 4px", color: "#ffffff", lineHeight: "1.1", letterSpacing: "-0.5px" }}>
          Assistant<br /><span style={{ color: "#4a9eff" }}>Terrain</span>
        </h1>
        <p style={{ color: "#445566", fontSize: "0.82em", margin: "8px 0 0", fontWeight: "500" }}>Télécoms Radio · Procédures Terrain</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
          <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, #1a3a6a)" }} />
          <span style={{ fontSize: "0.72em", color: "#2a4a6a", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>by Helmi</span>
          <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, #1a3a6a, transparent)" }} />
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <button onClick={() => setScreen("putty")} style={{ background: "#111e35", border: "2px solid #2244aa", borderRadius: "12px", padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.15s", color: "#ddeeff", textAlign: "left" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#162340"; e.currentTarget.style.borderColor = "#4466cc"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#111e35"; e.currentTarget.style.borderColor = "#2244aa"; }}>
          <div style={{ width: "40px", height: "40px", background: "#1a3060", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3em", flexShrink: 0 }}>⚙️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "800", fontSize: "0.92em", color: "#88aaff" }}>Paramétrage Putty</div>
            <div style={{ fontSize: "0.72em", color: "#3a5070", marginTop: "2px" }}>CSG Nokia · CTR Nokia · PTN</div>
          </div>
          <span style={{ color: "#334466", fontSize: "1.3em" }}>›</span>
        </button>

        <div style={{ borderBottom: "1px solid #142030", margin: "4px 0" }} />

        {EQUIPMENTS.map((eq) => (
          <button key={eq.id} onClick={() => selectEquip(eq)} style={{ background: "#0e1a2a", border: "2px solid #1a2a3a", borderLeft: `4px solid ${eq.color}`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.15s", color: "#ddeeff", textAlign: "left" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#132030"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#0e1a2a"; }}>
            <div style={{ width: "42px", height: "42px", background: eq.color + "20", border: `1px solid ${eq.color}44`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4em", flexShrink: 0 }}>{eq.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "800", fontSize: "0.9em", color: "#eef4ff" }}>{eq.label}</div>
              <div style={{ fontSize: "0.72em", marginTop: "3px", color: "#3a9a6a", fontWeight: "600" }}>✅ Procédures disponibles</div>
            </div>
            <span style={{ color: "#223344", fontSize: "1.3em" }}>›</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "24px", paddingBottom: "28px", textAlign: "center" }}>
        <div style={{ fontSize: "0.72em", color: "#1e3050", fontWeight: "600" }}>
          📡 Assistant IA Terrain · <span style={{ color: "#2a4a70" }}>Helmi</span> · v5.0
        </div>
      </div>
    </div>
  );

  /* ── CHAT SCREEN ── */
  const actions = QUICK_ACTIONS[selectedEquip?.id] || [];
  return (
    <div style={{ height: "100vh", background: "#0b1120", fontFamily: "'Segoe UI',sans-serif", color: "#ddeeff", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#0d1a2e", borderBottom: `3px solid ${selectedEquip?.color}`, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")} style={{ background: "#1a2d48", border: "none", borderRadius: "8px", color: "#88aacc", cursor: "pointer", padding: "7px 12px", fontSize: "0.82em", fontWeight: "700" }}>← Retour</button>
        <div style={{ flex: 1, background: selectedEquip?.color + "18", border: `1px solid ${selectedEquip?.color}44`, borderRadius: "8px", padding: "6px 12px" }}>
          <div style={{ fontSize: "0.62em", color: "#445566", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "700" }}>ÉQUIPEMENT ACTIF</div>
          <div style={{ fontSize: "0.88em", fontWeight: "800", color: selectedEquip?.color, marginTop: "1px" }}>{selectedEquip?.icon} {selectedEquip?.label}</div>
        </div>
        <div style={{ fontSize: "0.65em", color: "#2a4a6a", fontWeight: "700" }}>by Helmi</div>
      </div>

      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: "28px", height: "28px", background: selectedEquip?.color + "33", border: `1px solid ${selectedEquip?.color}55`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75em", flexShrink: 0, marginRight: "8px", marginTop: "4px" }}>🤖</div>
            )}
            <div style={{ maxWidth: "82%", background: msg.role === "user" ? selectedEquip?.color : "#0f1d30", border: msg.role === "user" ? "none" : "1px solid #1e3050", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", padding: "12px 14px" }}>
              {msg.role === "assistant" ? <MsgContent text={msg.content} /> : <span style={{ fontSize: "0.88em", fontWeight: "700", color: "#fff" }}>{msg.content}</span>}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: selectedEquip?.color + "33", border: `1px solid ${selectedEquip?.color}55`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75em" }}>🤖</div>
            <div style={{ background: "#0f1d30", border: "1px solid #1e3050", borderRadius: "4px 16px 16px 16px", padding: "12px 18px", display: "flex", gap: "5px", alignItems: "center" }}>
              {[0, 1, 2].map(j => (<div key={j} style={{ width: "7px", height: "7px", borderRadius: "50%", background: selectedEquip?.color, animation: "pulse 1.2s infinite", animationDelay: `${j * 0.2}s` }} />))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "6px 14px 4px", display: "flex", gap: "7px", overflowX: "auto", flexShrink: 0 }}>
        {actions.map((q) => (
          <button key={q} onClick={() => sendMessage(q)} style={{ background: "#0f1d30", border: `1px solid ${selectedEquip?.color}44`, borderRadius: "20px", padding: "6px 14px", cursor: "pointer", color: selectedEquip?.color, fontSize: "0.78em", fontWeight: "700", whiteSpace: "nowrap", flexShrink: 0 }}>{q}</button>
        ))}
      </div>

      <div style={{ padding: "6px 14px 14px", display: "flex", gap: "8px", flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Décris ton problème..."
          style={{ flex: 1, background: "#0f1d30", border: "1px solid #1e3050", borderRadius: "12px", padding: "12px 14px", color: "#ddeeff", fontSize: "0.9em", outline: "none", fontWeight: "500" }}
        />
        <button onClick={() => sendMessage()} disabled={loading} style={{ background: loading ? "#1a2a40" : selectedEquip?.color, border: "none", borderRadius: "12px", padding: "12px 18px", cursor: loading ? "not-allowed" : "pointer", color: "white", fontSize: "1.1em", flexShrink: 0, fontWeight: "800" }}>➤</button>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{transform:scale(0.9);opacity:.5}50%{transform:scale(1.2);opacity:1}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1e3050;border-radius:2px}
        input::placeholder{color:#2a4060;font-weight:400}
      `}</style>
    </div>
  );
}
