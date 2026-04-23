import { useState, useRef, useEffect } from "react";

const EQUIPMENTS = [
  { id: "csg",      label: "CSG Nokia 7250 IXR-e",  icon: "🟦", color: "#3d8bff", ready: true  },
  { id: "ericsson", label: "FH Ericsson Mini-Link",  icon: "🟨", color: "#ffaa00", ready: true  },
  { id: "ctr",      label: "CTR Nokia",              icon: "🟩", color: "#00dd77", ready: true  },
  { id: "huawei",   label: "FH Huawei RTN905/950A",  icon: "🟥", color: "#ff5252", ready: true  },
  { id: "ptn",      label: "PTN Nokia / Alcatel",    icon: "🔷", color: "#aa88ff", ready: true  },
];

const PUTTY_SETTINGS = [
  {
    id: "csg", label: "CSG Nokia 7250 IXR-e", icon: "🟦", color: "#3d8bff",
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
    id: "ctr", label: "CTR Nokia", icon: "🟩", color: "#00dd77",
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
    id: "ptn", label: "PTN Nokia / Alcatel", icon: "🔷", color: "#aa88ff",
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

const SYSTEM_PROMPT = `Tu t'appelles Didier. Tu es un assistant technique terrain pour techniciens télécoms sur site radio.
Tu parles en tutoiement, comme un technicien expérimenté et sympa.
Si quelqu'un est stressé ou bloqué : "Calme-toi, on y va étape par étape."

TES 6 DOMAINES : CSG Nokia | FH Ericsson | FH Huawei | CTR | PTN | Putty

HORS SUJET : "Je suis spécialisé équipements télécoms terrain, je peux pas t'aider sur ce sujet."
Salutation : réponds naturellement comme un collègue.

FORMAT :
- Toujours numéroté 1️⃣ 2️⃣ 3️⃣ étape par étape
- Maximum 5 étapes par message — si plus, demande confirmation
- 🔧 devant les actions techniques
- ⚠️ devant les avertissements
- 💡 pour les conseils
- ✅ pour confirmer une étape réussie
- Commandes CLI entre backticks : \`commande\`
- Terminer par ✅ "Dis-moi quand c'est fait" ou ❓ "Qu'est-ce que tu vois ?"
- Langage direct, simple, tutoiement obligatoire

GESTION DES BLOCAGES :
Si "ça marche pas" / "j'y arrive pas" :
→ Ne JAMAIS répéter la même réponse
→ Demander : "Tu bloques à quelle étape ?"
→ Proposer une approche différente et plus simple
→ Après 2 tentatives : "Contacte ton support N+1, note l'erreur exacte."

RÈGLE ABSOLUE : Tu n'inventes jamais une commande.
Si pas sûr → "Je préfère pas te donner une commande dont je suis pas certain. Vérifie avec la doc ou ton N+1."

══════════════════════════════════
🟦 CSG Nokia 7250 IXR-e
══════════════════════════════════
CONNEXION :
1️⃣ Raccorder le câble console adapté entre le CSG et le PC
2️⃣ Ouvrir Putty → Serial | COM4 | Baud 115200 | Data 8 | Parity None | Stop 1
3️⃣ Login : admin | Password : admin

OUVRIR UN PORT :
\`configure port 1/1/X\`
\`no shutdown\`
\`exit\`
\`show port 1/1/X\`

CHANGER VITESSE 1G → 10G :
\`configure port 1/1/X\`
\`shutdown\`
\`ethernet\`
\`speed 10000\`
\`no shutdown\`
\`exit / exit\`

CHANGER VITESSE 10G → 1G :
\`configure port 1/1/X\`
\`shutdown\`
\`ethernet\`
\`speed 1000\`
\`no shutdown\`
\`exit / exit\`

COMMANDES UTILES :
\`show port\` → tous les ports
\`show port 1/1/X\` → état d'un port
\`show lag X\` → ports d'un LAG
\`ping X.X.X.X\` → test de ping
\`show router interface\` → interfaces IP
\`show version\` → version logiciel
\`show chassis\` → état du châssis

══════════════════════════════════
🟨 FH Ericsson Mini-Link
══════════════════════════════════
CONNEXION :
1️⃣ Connecter le PC au port Mini USB de l'IDU
2️⃣ Ouvrir navigateur → https://10.0.0.1/NE_Overview
3️⃣ Forcer la navigation (ignorer avertissement certificat) — c'est normal ⚠️
4️⃣ Login : admin_admin | Password : LsaldA_uslF#1

OUVRIR UN PORT :
1️⃣ 🔧 Packet → Lan Interfaces
2️⃣ 🔧 Clic droit sur le port souhaité → Configure → General
3️⃣ 🔧 Admin Status → Up → Save

ACTIVER LASER SFPo (voyant éteint) :
1️⃣ 🔧 Unit → SFPo (ex : 1/4.8 pour TN8)
2️⃣ 🔧 Clic droit → Configure → Admin Status → In service → Save

CHANGER VITESSE PORT :
⚠️ Vérifier que le SFP inséré est adapté à la vitesse souhaitée
1️⃣ 🔧 Packet → sélectionner le port
2️⃣ 🔧 Clic droit → Configure → General → Speed → choisir la vitesse
3️⃣ 🔧 Save

══════════════════════════════════
🟥 FH Huawei RTN905/950A
══════════════════════════════════
CONNEXION :
1️⃣ Vérifier que l'IP du PC est dans la même plage que le FH, même masque
2️⃣ Lancer Web LCT → double-cliquer START Web LCT → attendre ouverture IE
3️⃣ Forcer l'accès : "Poursuivre avec ce site Web (non recommandé)" ⚠️ c'est normal
4️⃣ Login : admin | Password : $Bytel13 → Login
5️⃣ NE Search → NE Search by NMS → Local IP = IP PC / NE IP = IP FH → OK

TROUVER ET SE CONNECTER À L'ÉQUIPEMENT :
1️⃣ L'équipement apparaît : Communication Status = Normal / Login Status = Not Logged In
2️⃣ 🔧 Clic droit → NE Login → adminBYTEL | Hu@opt2014 → OK
3️⃣ ✅ Login Status = Logged In → Clic droit → NE Explorer → Vue FH ouverte

MODIFIER VITESSE PORT ETHERNET :
1️⃣ 🔧 Configuration → Interface Management → Ethernet Interface
2️⃣ 🔧 Sélectionner le port → Working Mode → choisir vitesse → Save

MODIFIER VITESSE RTN380AX (1G ↔ 10G) :
1️⃣ Supprimer le Port Policy du port
2️⃣ Supprimer les VLANs du port
3️⃣ Supprimer le port dans Path View
4️⃣ Recréer le port à la vitesse souhaitée
5️⃣ Reconfigurer VLANs + Port Policy

══════════════════════════════════
🟩 CTR Nokia
══════════════════════════════════
CONNEXION :
1️⃣ Câble série DB9-RJ45 (câble bleu Cisco) → port CONSOLE du CTR
2️⃣ Ouvrir Putty → Serial
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
\`sh running-config\` → toute la config

══════════════════════════════════
🔷 PTN Nokia / Alcatel
══════════════════════════════════
CONNEXION :
1️⃣ Câble console DB9/DB9 → port Console carte CSM (A ou B)
2️⃣ Ouvrir Putty → Serial
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
  csg:      "🟦 **CSG Nokia 7250 IXR-e**\n\nProcédures disponibles ✅\n\n1️⃣ Me connecter\n2️⃣ Ouvrir un port\n3️⃣ Changer vitesse port\n4️⃣ Commandes utiles\n\n👇 Pose ta question ou choisis une action",
  ericsson: "🟨 **FH Ericsson Mini-Link**\n\nProcédures disponibles ✅\n\n1️⃣ Me connecter\n2️⃣ Ouvrir un port\n3️⃣ Changer vitesse port\n4️⃣ Activer laser SFPo\n\n👇 Pose ta question ou choisis une action",
  ctr:      "🟩 **CTR Nokia**\n\nProcédures disponibles ✅\n\n1️⃣ Me connecter\n2️⃣ Ouvrir un port\n3️⃣ Niveaux optiques\n4️⃣ Commandes utiles\n\n👇 Pose ta question ou choisis une action",
  huawei:   "🟥 **FH Huawei RTN905/950A**\n\nProcédures disponibles ✅\n\n1️⃣ Me connecter\n2️⃣ Trouver l'équipement\n3️⃣ Modifier vitesse port\n\n👇 Pose ta question ou choisis une action",
  ptn:      "🔷 **PTN Nokia / Alcatel**\n\nProcédures disponibles ✅\n\n1️⃣ Me connecter\n2️⃣ Ouvrir un port\n3️⃣ Fermer un port\n4️⃣ Commandes utiles\n\n👇 Pose ta question ou choisis une action",
};

const QUICK_ACTIONS = {
  csg:      ["Me connecter", "Ouvrir un port", "Changer vitesse", "Commandes utiles"],
  ericsson: ["Me connecter", "Ouvrir un port", "Changer vitesse", "Activer laser SFPo"],
  ctr:      ["Me connecter", "Ouvrir un port", "Niveaux optiques", "Commandes utiles"],
  huawei:   ["Me connecter", "Trouver équipement", "Modifier vitesse port"],
  ptn:      ["Me connecter", "Ouvrir un port", "Fermer un port", "Commandes utiles"],
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
            return <code key={j} style={{ background: "rgba(0,0,0,0.55)", color: "#ffc060", padding: "1px 6px", borderRadius: "4px", fontFamily: "monospace", fontSize: "0.95em", border: "1px solid rgba(126,255,212,0.2)" }}>{part.slice(1, -1)}</code>;
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
            fontSize: "0.88em", color: isWarn ? "#ffcc44" : "#f5ede4", lineHeight: "1.55",
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + `\n\nÉquipement sélectionné : ${selectedEquip?.label}`,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Erreur." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Erreur réseau." }]);
    } finally {
      setLoading(false);
    }
  };

  const puttyData = PUTTY_SETTINGS.find(p => p.id === puttySelected);

  /* ── PUTTY SCREEN ── */
  if (screen === "putty") return (
    <div style={{ minHeight: "100vh", background: "#1a1210", fontFamily: "'Segoe UI',sans-serif", color: "#f5ede4", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "#221810", borderBottom: "2px solid #2a4a70" }}>
        <button onClick={() => setScreen("home")} style={{ background: "#261810", border: "none", borderRadius: "8px", color: "#b09a84", cursor: "pointer", padding: "7px 14px", fontSize: "0.85em", fontWeight: "700" }}>← Retour</button>
        <div>
          <div style={{ fontWeight: "800", fontSize: "1.05em", color: "#e89040" }}>⚙️ Paramétrage Putty</div>
          <div style={{ fontSize: "0.7em", color: "#9a7e68", marginTop: "2px" }}>Réglages à effectuer selon l'équipement</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", padding: "14px 16px 0", overflowX: "auto" }}>
        {PUTTY_SETTINGS.map((p) => (
          <button key={p.id} onClick={() => setPuttySelected(p.id)} style={{ background: puttySelected === p.id ? `${p.color}25` : "#2a1e14", border: `2px solid ${puttySelected === p.id ? p.color : "#34261c"}`, borderRadius: "10px 10px 0 0", padding: "8px 14px", cursor: "pointer", color: puttySelected === p.id ? "#fff" : "#5577aa", fontSize: "0.78em", fontWeight: "700", whiteSpace: "nowrap", flexShrink: 0 }}>
            {p.icon} {p.label.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>
      {puttyData && (
        <div style={{ padding: "0 16px 28px", flex: 1 }}>
          <div style={{ background: "#2a1e14", border: `2px solid ${puttyData.color}55`, borderTop: `3px solid ${puttyData.color}`, borderRadius: "0 12px 12px 12px", overflow: "hidden" }}>
            <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #2a4060", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "2em" }}>{puttyData.icon}</span>
              <div>
                <div style={{ fontWeight: "800", fontSize: "1em" }}>{puttyData.label}</div>
                <div style={{ background: `${puttyData.color}25`, border: `1px solid ${puttyData.color}55`, borderRadius: "20px", padding: "2px 10px", fontSize: "0.7em", color: puttyData.color, fontWeight: "700", display: "inline-block", marginTop: "4px" }}>🔌 Connexion Serial</div>
              </div>
            </div>
            {puttyData.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #243448" }}>
                <span style={{ color: "#a08878", fontSize: "0.85em", fontWeight: "600" }}>{s.label}</span>
                <span style={{ fontFamily: "monospace", background: "#18100c", padding: "4px 10px", borderRadius: "6px", color: "#ffc060", fontSize: "0.85em", fontWeight: "800", border: "1px solid #1a3a30" }}>{s.value}</span>
              </div>
            ))}
            <div style={{ background: "#181008", borderTop: "1px solid #1a3a20", padding: "12px 18px", fontSize: "0.82em", color: "#60d888", lineHeight: "1.5" }}>💡 {puttyData.note}</div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── HOME SCREEN ── */
  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: "#1a1210", fontFamily: "'Segoe UI',sans-serif", color: "#f5ede4", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
      
      {/* HERO HEADER */}
      <div style={{ textAlign: "center", padding: "36px 0 24px", width: "100%", maxWidth: "440px" }}>
        
        {/* Badge auteur */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #2e1e10, #1e1008)", border: "1px solid #2a4a80", borderRadius: "50px", padding: "6px 16px", marginBottom: "20px" }}>
          <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #e88030, #c05010)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75em", fontWeight: "900", color: "#fff", flexShrink: 0 }}>H</div>
          <span style={{ fontSize: "0.78em", fontWeight: "700", color: "#c8b09a", letterSpacing: "0.5px" }}>Créé par <span style={{ color: "#f0a840", fontWeight: "900" }}>Helmi</span></span>
        </div>

        {/* Titre */}
        <h1 style={{ fontSize: "2.2em", fontWeight: "900", margin: "0 0 4px", color: "#ffffff", lineHeight: "1.1", letterSpacing: "-0.5px" }}>
          Assistant<br /><span style={{ color: "#e89040" }}>Terrain</span>
        </h1>
        <p style={{ color: "#9a7e68", fontSize: "0.82em", margin: "8px 0 0", fontWeight: "500" }}>
          Télécoms Radio · Procédures Terrain
        </p>

        {/* Signature barre */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
          <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, #4a3020)" }} />
          <span style={{ fontSize: "0.72em", color: "#7a6050", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>by Helmi</span>
          <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, #4a3020, transparent)" }} />
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Putty */}
        <button onClick={() => setScreen("putty")} style={{ background: "#2c2016", border: "2px solid #4a3020", borderRadius: "12px", padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.15s", color: "#f5ede4", textAlign: "left" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#342518"; e.currentTarget.style.borderColor = "#4466cc"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#2c2016"; e.currentTarget.style.borderColor = "#2244aa"; }}>
          <div style={{ width: "40px", height: "40px", background: "#2a1808", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3em", flexShrink: 0 }}>⚙️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "800", fontSize: "0.92em", color: "#e8a060" }}>Paramétrage Putty</div>
            <div style={{ fontSize: "0.72em", color: "#8a6e58", marginTop: "2px" }}>CSG Nokia · CTR Nokia · PTN</div>
          </div>
          <span style={{ color: "#7a6050", fontSize: "1.3em" }}>›</span>
        </button>

        <div style={{ borderBottom: "1px solid #142030", margin: "4px 0" }} />

        {EQUIPMENTS.map((eq) => (
          <button key={eq.id} onClick={() => selectEquip(eq)} style={{ background: "#251a12", border: "2px solid #1a2a3a", borderLeft: `4px solid ${eq.color}`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.15s", color: "#f5ede4", textAlign: "left" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#32221a"; e.currentTarget.style.borderLeftColor = eq.color; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#251a12"; }}>
            <div style={{ width: "42px", height: "42px", background: eq.color + "20", border: `1px solid ${eq.color}44`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4em", flexShrink: 0 }}>{eq.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "800", fontSize: "0.9em", color: "#f5ede4" }}>{eq.label}</div>
              <div style={{ fontSize: "0.72em", marginTop: "3px", color: "#3a9a6a", fontWeight: "600" }}>✅ Procédures disponibles</div>
            </div>
            <span style={{ color: "#6a5040", fontSize: "1.3em" }}>›</span>
          </button>
        ))}
      </div>

      {/* Footer signature */}
      <div style={{ marginTop: "24px", paddingBottom: "28px", textAlign: "center" }}>
        <div style={{ fontSize: "0.72em", color: "#34261c", fontWeight: "600" }}>
          📡 Assistant Terrain · <span style={{ color: "#7a6050" }}>Helmi</span> · v5.0
        </div>
      </div>
    </div>
  );

  /* ── CHAT SCREEN ── */
  const actions = QUICK_ACTIONS[selectedEquip?.id] || [];
  return (
    <div style={{ height: "100vh", background: "#1a1210", fontFamily: "'Segoe UI',sans-serif", color: "#f5ede4", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#221810", borderBottom: `3px solid ${selectedEquip?.color}`, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")} style={{ background: "#261810", border: "none", borderRadius: "8px", color: "#b09a84", cursor: "pointer", padding: "7px 12px", fontSize: "0.82em", fontWeight: "700" }}>← Retour</button>
        <div style={{ flex: 1, background: selectedEquip?.color + "18", border: `1px solid ${selectedEquip?.color}44`, borderRadius: "8px", padding: "6px 12px" }}>
          <div style={{ fontSize: "0.62em", color: "#9a7e68", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "700" }}>ÉQUIPEMENT ACTIF</div>
          <div style={{ fontSize: "0.88em", fontWeight: "800", color: selectedEquip?.color, marginTop: "1px" }}>{selectedEquip?.icon} {selectedEquip?.label}</div>
        </div>
        <div style={{ fontSize: "0.65em", color: "#7a6050", fontWeight: "700" }}>by Helmi</div>
      </div>

      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: "28px", height: "28px", background: selectedEquip?.color + "33", border: `1px solid ${selectedEquip?.color}55`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75em", flexShrink: 0, marginRight: "8px", marginTop: "4px" }}>🤖</div>
            )}
            <div style={{ maxWidth: "82%", background: msg.role === "user" ? selectedEquip?.color : "#302018", border: msg.role === "user" ? "none" : "1px solid #2a4060", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", padding: "12px 14px" }}>
              {msg.role === "assistant" ? <MsgContent text={msg.content} /> : <span style={{ fontSize: "0.88em", fontWeight: "700", color: "#fff" }}>{msg.content}</span>}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: selectedEquip?.color + "33", border: `1px solid ${selectedEquip?.color}55`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75em" }}>🤖</div>
            <div style={{ background: "#2a1e14", border: "1px solid #2a4060", borderRadius: "4px 16px 16px 16px", padding: "12px 18px", display: "flex", gap: "5px", alignItems: "center" }}>
              {[0, 1, 2].map(j => (<div key={j} style={{ width: "7px", height: "7px", borderRadius: "50%", background: selectedEquip?.color, animation: "pulse 1.2s infinite", animationDelay: `${j * 0.2}s` }} />))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "8px 14px 6px", display: "flex", gap: "8px", overflowX: "auto", flexShrink: 0, background: "#150e0a", borderTop: "1px solid #1a3050" }}>
        {actions.map((q) => (
          <button key={q} onClick={() => sendMessage(q)} style={{ background: `${selectedEquip?.color}22`, border: `1.5px solid ${selectedEquip?.color}`, borderRadius: "20px", padding: "7px 16px", cursor: "pointer", color: "#ffffff", fontSize: "0.8em", fontWeight: "700", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.2px" }}>{q}</button>
        ))}
      </div>

      <div style={{ padding: "8px 14px 16px", display: "flex", gap: "8px", flexShrink: 0, background: "#150e0a" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Décris ton problème..."
          style={{ flex: 1, background: "#132840", border: "1.5px solid #2a5078", borderRadius: "24px", padding: "12px 18px", color: "#f5ede4", fontSize: "0.9em", outline: "none", fontWeight: "500" }}
        />
        <button onClick={() => sendMessage()} disabled={loading} style={{ background: loading ? "#30201a" : selectedEquip?.color, border: "none", borderRadius: "12px", padding: "12px 18px", cursor: loading ? "not-allowed" : "pointer", color: "white", fontSize: "1.1em", flexShrink: 0, fontWeight: "800" }}>➤</button>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{transform:scale(0.9);opacity:.5}50%{transform:scale(1.2);opacity:1}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#303038;border-radius:2px}
        input::placeholder{color:#505060;font-weight:400}
      `}</style>
    </div>
  );
}
