import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const API_BASE = "http://localhost:8000";

type Q = { key: string; label: string; placeholder?: string };

const IntakeChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: psychologistId } = useParams();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  const questions: Q[] = useMemo(
    () => [
      { key: "main_issue", label: "What brings you here today?", placeholder: "Describe briefly…" },
      { key: "goals", label: "What do you want to achieve in therapy?", placeholder: "Your goals…" },
      { key: "sleep", label: "How is your sleep lately?", placeholder: "Good / average / poor…" },
      { key: "stress", label: "Current stress level (0-10)?", placeholder: "0-10" },
      { key: "history", label: "Have you tried therapy before?", placeholder: "Yes/No + details…" },
      { key: "notes", label: "Anything important the psychologist should know?", placeholder: "Optional…" },
    ],
    []
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ===== Styles (matching your pages) =====
  const screenStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: BLUE,
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: 450,
    backgroundColor: BLUE,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const headerWrap: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 14,
    paddingBottom: 14,
    paddingInline: 16,
    boxSizing: "border-box",
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 44,
  };

  const roundBtn: React.CSSProperties = {
    position: "absolute",
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: BLUE,
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
    fontSize: 20,
  };

  const titleTiny: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#3565AF",
    fontWeight: 900,
    fontSize: 18,
  };

  const logoCircle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const logoImg: React.CSSProperties = {
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };

  const pageTitle: React.CSSProperties = {
    margin: "10px 0 0",
    textAlign: "center",
    fontSize: 22,
    fontWeight: 900,
    color: "#3565AF",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
    boxSizing: "border-box",
  };

  const card: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 18,
    padding: 14,
    boxSizing: "border-box",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
    color: "#111827",
  };

  const qStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 15,
    fontWeight: 900,
    color: "#1f2937",
    lineHeight: 1.35,
  };

  const hintStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 800,
    color: "#3565AF",
  };

  const inputWrap: React.CSSProperties = {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.65)",
    padding: 12,
    boxSizing: "border-box",
    border: "1px solid rgba(53,101,175,0.12)",
    marginTop: 10,
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 90,
    border: "none",
    outline: "none",
    background: "transparent",
    resize: "vertical",
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.4,
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 10,
  };

  const primaryBtn: React.CSSProperties = {
    flex: 1,
    border: "none",
    borderRadius: 999,
    backgroundColor: "#2a5f97",
    color: CREAM,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  };

  const secondaryBtn: React.CSSProperties = {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "transparent",
    border: "2px solid rgba(42,95,151,0.35)",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 900,
    color: "#3565AF",
    cursor: "pointer",
  };

  const errorStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 900,
    color: "#7f1d1d",
    textAlign: "center",
  };

  const progressStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    color: "#3565AF",
    textAlign: "center",
    marginTop: 6,
  };

  const q = questions[step];

  const handleNext = () => {
    setErr(null);
    const v = current.trim();
    if (!v && q.key !== "notes") {
      setErr("Please answer before continuing.");
      return;
    }
    setAnswers((prev) => ({ ...prev, [q.key]: v }));
    setCurrent("");
    setStep((s) => Math.min(s + 1, questions.length - 1));
  };

  const handleBackStep = () => {
    setErr(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleFinish = async () => {
    if (!psychologistId) {
      setErr("Missing psychologist id.");
      return;
    }

    // save last answer too
    const lastQ = questions[step];
    const finalAnswers = { ...answers, [lastQ.key]: current.trim() };

    // validate required
    for (const qq of questions) {
      if (qq.key === "notes") continue;
      if (!String(finalAnswers[qq.key] ?? "").trim()) {
        setErr("Please answer all required questions.");
        return;
      }
    }

    try {
      setSaving(true);
      setErr(null);

      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/login", { replace: true });

      const res = await fetch(`${API_BASE}/appointments/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          psychologist_user_id: psychologistId,
          answers: finalAnswers,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to create intake.");
      }

      const data = await res.json();
      // go choose time
      navigate(`/psychologists/${psychologistId}/choose-time`, {
        replace: true,
        state: { intake_id: data.intake_id },
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        <div style={headerWrap}>
          <div style={headerRow}>
            <button
              type="button"
              style={{ ...roundBtn, left: 0 }}
              onClick={() => navigate(-1)}
              aria-label="Back"
              title="Back"
            >
              ←
            </button>

            <div style={titleTiny}>
              <span style={logoCircle}>
                <img src={logo} alt="Mendly logo" style={logoImg} />
              </span>
              Mendly App
            </div>

            <button
              type="button"
              style={{ ...roundBtn, right: 0 }}
              onClick={() => navigate("/profile")}
              aria-label="Profile"
              title="Profile"
            >
              👤
            </button>
          </div>

          <div style={pageTitle}>Quick Intake Questions</div>
        </div>

        <div style={contentStyle}>
          <div style={card}>
            <p style={qStyle}>{q.label}</p>
            {q.placeholder ? <div style={hintStyle}>{q.placeholder}</div> : null}

            <div style={inputWrap}>
              <textarea
                style={textareaStyle}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder={q.placeholder || "Type here..."}
              />
            </div>

            <div style={progressStyle}>
              Step {step + 1} / {questions.length}
            </div>

            {err ? <div style={errorStyle}>{err}</div> : null}

            <div style={btnRow}>
              <button
                type="button"
                style={secondaryBtn}
                onClick={handleBackStep}
                disabled={saving || step === 0}
              >
                Back
              </button>

              {step < questions.length - 1 ? (
                <button type="button" style={primaryBtn} onClick={handleNext} disabled={saving}>
                  Next
                </button>
              ) : (
                <button type="button" style={primaryBtn} onClick={handleFinish} disabled={saving}>
                  {saving ? "Submitting..." : "Finish & Choose Time"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeChatPage;
