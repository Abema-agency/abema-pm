"use client"
import { useState, useEffect, useRef } from "react"

type Step = 1 | 2 | 3 | 4

const TYPEWRITER_TEXT = `Charte projet générée pour ERP Manufacturing Toulouse :

• Objectif : Intégrer le module production en 6 mois, budget 185 000 €
• Sponsor : Jean-Marc D. (DG)
• Approche recommandée : Hybride (PMBOK 8)
• Jalons clés : M0 cadrage · M2 déploiement pilote · M6 go-live
• Risques identifiés : 3 (1 critique)

Artefact sauvegardé dans votre projet.`

function Step1() {
  const [selected, setSelected] = useState(1)
  const options = [
    "Bien définis dès le départ",
    "Partiellement définis, évolutifs",
    "Très incertains, à explorer",
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
        <div style={{ fontSize: "11px", color: "#F59E0B", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "4px" }}>
          TAILORING ENGINE PMBOK 8
        </div>
        <div style={{ fontSize: "13px", color: "#C4BAA6" }}>
          5 questions pour calibrer votre approche projet
        </div>
      </div>
      <div style={{ background: "#0D0D16", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "8px", padding: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#F59E0B", flexShrink: 0 }}>
            3
          </div>
          <span style={{ fontSize: "13px", color: "#F0EBE0", fontWeight: 600 }}>
            Niveau d&apos;incertitude sur les livrables ?
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {options.map((opt, i) => {
            const active = selected === i
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 10px", borderRadius: "6px", cursor: "pointer",
                  border: active ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  background: active ? "rgba(245,158,11,0.06)" : "transparent",
                  textAlign: "left", width: "100%",
                }}
              >
                <div style={{
                  width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0,
                  border: active ? "1px solid #F59E0B" : "1px solid rgba(255,255,255,0.2)",
                  background: active ? "#F59E0B" : "transparent",
                }} />
                <span style={{ fontSize: "12px", color: active ? "#F0EBE0" : "#C4BAA6" }}>{opt}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "12px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#22c55e", marginBottom: "4px" }}>
          Recommandation : Approche Hybride
        </div>
        <div style={{ fontSize: "11px", color: "#C4BAA6", lineHeight: "1.6" }}>
          PMBOK 8 recommande une approche hybride — prédictif pour la charte et la gestion des risques, agile pour les livrables évolutifs. Score d&apos;incertitude : 0.62
        </div>
      </div>
    </div>
  )
}

function Step2() {
  const [widths, setWidths] = useState([0, 0, 0])
  const targetWidths = [78, 44, 21]
  const colors = ["#22c55e", "#F59E0B", "#EF4444"]
  const ragColors = ["#22c55e", "#F59E0B", "#EF4444"]
  const projects = [
    "Rénovation bureaux Lyon",
    "ERP Manufacturing Toulouse",
    "Expansion réseau Lille",
  ]

  useEffect(() => {
    const t = setTimeout(() => setWidths(targetWidths), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "11px", color: "#F59E0B", letterSpacing: "0.05em", fontWeight: 700 }}>
        DASHBOARD EXÉCUTIF
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
        {[
          { val: "0.91", sub: "-9% retard", color: "#F59E0B" },
          { val: "1.04", sub: "+4% économie", color: "#22c55e" },
          { val: "3", sub: "1 critique", color: "#EF4444" },
          { val: "AMBER", sub: "SPI sous seuil", color: "#F59E0B" },
        ].map((kpi, i) => (
          <div key={i} style={{ background: "#0D0D16", borderRadius: "8px", padding: "12px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 900, color: kpi.color, fontFamily: "'Big Shoulders Display', sans-serif" }}>{kpi.val}</div>
            <div style={{ fontSize: "10px", color: "#8A8070", marginTop: "2px" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {projects.map((name, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ragColors[i], flexShrink: 0 }} />
            <div style={{ fontSize: "12px", color: "#C4BAA6", width: "180px", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${widths[i]}%`, background: colors[i], borderRadius: "4px", transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#8A8070", width: "30px", textAlign: "right", flexShrink: 0 }}>{targetWidths[i]}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step3() {
  const risks = [
    { score: 16, name: "Dépassement budget phase 2", detail: "Probabilité: Élevée · Impact: Élevé · Stratégie: Atténuer", badge: "Critique" },
    { score: 9, name: "Retard livraison fournisseur clé", detail: "Probabilité: Moyenne · Impact: Élevé · Stratégie: Transférer", badge: "Modéré" },
    { score: 6, name: "Turnover ressource critique", detail: "Probabilité: Faible · Impact: Élevé · Stratégie: Accepter", badge: "Modéré" },
  ]
  const scoreStyle = (s: number) => s >= 12
    ? { background: "rgba(239,68,68,0.15)", color: "#EF4444" }
    : s >= 6
      ? { background: "rgba(245,158,11,0.15)", color: "#F59E0B" }
      : { background: "rgba(34,197,94,0.12)", color: "#22c55e" }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "11px", color: "#F59E0B", letterSpacing: "0.05em", fontWeight: 700 }}>
        REGISTRE RISQUES — MATRICE P×I
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {risks.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#0D0D16", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ ...scoreStyle(r.score), borderRadius: "6px", padding: "4px 8px", fontSize: "13px", fontWeight: 900, fontFamily: "'Big Shoulders Display', sans-serif", flexShrink: 0, minWidth: "32px", textAlign: "center" }}>
              {r.score}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", color: "#F0EBE0", fontWeight: 600, marginBottom: "2px" }}>{r.name}</div>
              <div style={{ fontSize: "10px", color: "#8A8070" }}>{r.detail}</div>
            </div>
            <div style={{ ...scoreStyle(r.score), borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
              {r.badge}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#0D0D16", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "8px", padding: "10px 12px" }}>
        <div style={{ fontSize: "11px", color: "#F59E0B", fontWeight: 600, marginBottom: "3px" }}>
          Alerte N8N — envoyée ce matin 7h00
        </div>
        <div style={{ fontSize: "11px", color: "#8A8070", lineHeight: "1.5" }}>
          Risque R-001 a franchi le seuil critique (score 16). Plan de réponse requis sous 48h.
        </div>
      </div>
    </div>
  )
}

function Step4({ active }: { active: boolean }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!active) return
    setDisplayed("")
    setDone(false)
    indexRef.current = 0

    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      setDisplayed(TYPEWRITER_TEXT.slice(0, indexRef.current))
      if (indexRef.current >= TYPEWRITER_TEXT.length) {
        clearInterval(intervalRef.current!)
        setDone(true)
      }
    }, 22)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "11px", color: "#F59E0B", letterSpacing: "0.05em", fontWeight: 700 }}>
        COPILOTE IA PMBOK 8
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ maxWidth: "75%", background: "#1a2244", color: "#93b4f0", borderRadius: "8px 8px 2px 8px", padding: "10px 14px", fontSize: "12px", lineHeight: "1.6" }}>
          Génère la charte projet pour ERP Manufacturing Toulouse
        </div>
      </div>
      <div style={{ background: "#0D0D16", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px 8px 8px 2px", padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", color: "#F0EBE0", fontWeight: 700 }}>Copilote Abema PM</span>
          <span style={{ fontSize: "10px", background: "rgba(245,158,11,0.12)", color: "#F59E0B", borderRadius: "4px", padding: "1px 6px", fontWeight: 600 }}>
            Claude Opus · Plan Pro
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#C4BAA6", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
          {displayed}
          {!done && (
            <span style={{
              display: "inline-block", width: "2px", height: "13px",
              background: "#F59E0B", marginLeft: "1px", verticalAlign: "text-bottom",
              animation: "blink 1s step-end infinite",
            }} />
          )}
        </div>
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}

export function DemoSection() {
  const [activeStep, setActiveStep] = useState<Step>(1)

  const steps: { id: Step; label: string }[] = [
    { id: 1, label: "01 · Tailoring engine" },
    { id: 2, label: "02 · Dashboard KPIs" },
    { id: 3, label: "03 · Registre risques" },
    { id: 4, label: "04 · Copilote IA" },
  ]

  return (
    <div>
      <div style={{ background: "#0A0A0F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden" }}>
        {/* Fausse barre navigateur */}
        <div style={{ background: "#0D0D16", borderBottom: "1px solid rgba(255,255,255,0.07)", height: "40px", display: "flex", alignItems: "center", padding: "0 14px", gap: "6px" }}>
          <div style={{ display: "flex", gap: "5px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
          </div>
          <div style={{ flex: 1, textAlign: "center", fontSize: "11px", color: "#8A8070" }}>
            pm.abemaagency.com — Espace projet
          </div>
        </div>

        {/* Zone contenu */}
        <div style={{ minHeight: "380px", padding: "20px" }}>
          {activeStep === 1 && <Step1 />}
          {activeStep === 2 && <Step2 />}
          {activeStep === 3 && <Step3 />}
          {activeStep === 4 && <Step4 active={activeStep === 4} />}
        </div>

        {/* Barre navigation steps */}
        <div style={{ background: "#0D0D16", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex" }}>
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              style={{
                flex: 1, padding: "10px 4px", fontSize: "11px", fontWeight: 600,
                color: activeStep === s.id ? "#F59E0B" : "#8A8070",
                background: activeStep === s.id ? "rgba(245,158,11,0.06)" : "transparent",
                borderTop: activeStep === s.id ? "2px solid #F59E0B" : "2px solid transparent",
                border: "none", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Légende + CTA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", padding: "0 4px" }}>
        <span style={{ fontSize: "12px", color: "#8A8070" }}>
          Naviguez entre les étapes pour explorer le produit
        </span>
        <a href="/signup" style={{ fontSize: "12px", color: "#93b4f0" }}>
          Essayer gratuitement →
        </a>
      </div>
    </div>
  )
}
