// react-app/src/pages/Phq9Page.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import thankYouImg from "../assets/thank-you.png";

type PhqAnswer = 0 | 1 | 2 | 3;

const SCALE_OPTIONS = [
  { value: 0 as PhqAnswer, label: "Not at all" },
  { value: 1 as PhqAnswer, label: "Several days" },
  { value: 2 as PhqAnswer, label: "More than half the days" },
  { value: 3 as PhqAnswer, label: "Nearly every day" },
];

const QUESTIONS_PHQ9 = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed, or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const Phq9Page: React.FC = () => {
  const [answers, setAnswers] = useState<(PhqAnswer | null)[]>(
    Array(9).fill(null)
  );
  const [error, setError] = useState<string | null>(null);

  const [showThanks, setShowThanks] = useState(false);
  const [needsSupportPopup, setNeedsSupportPopup] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);

  const navigate = useNavigate();

  const handleChange = (index: number, value: PhqAnswer) => {
    const copy = [...answers];
    copy[index] = value;
    setAnswers(copy);
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) {
      setError("Please answer all questions.");
      return;
    }

    const castAnswers = answers as PhqAnswer[];

    const total = castAnswers.reduce<number>((sum, v) => sum + v, 0);
    const q9 = castAnswers[8];

    const severity =
      total >= 20
        ? "severe"
        : total >= 15
        ? "moderately severe"
        : total >= 10
        ? "moderate"
        : total >= 5
        ? "mild"
        : "minimal";

    const suicideRisk = q9 > 0;

    await fetch("/api/screenings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "PHQ-9",
        totalScore: total,
        answers,
        severity,
        suicideRisk,
      }),
    });

    // decide if we should show the “your mood needs attention” popup
    const needsSupport = suicideRisk || total > 6; // tweak threshold if you want
    setNeedsSupportPopup(needsSupport);

    setShowThanks(true);
    setError(null);
  };

  // after the thank-you image
  useEffect(() => {
    if (!showThanks) return;

    const id = window.setTimeout(() => {
      setShowThanks(false);
      if (needsSupportPopup) {
        setShowSupportPopup(true);
      } else {
        navigate("/journey");
      }
    }, 3000);

    return () => window.clearTimeout(id);
  }, [showThanks, needsSupportPopup, navigate]);

  // ===== STYLES =====
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#e5e7eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    marginTop: 24,
    marginBottom: 32,
    width: "100%",
    maxWidth: 960,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
    padding: "24px 24px 20px 24px",
    boxSizing: "border-box",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 26,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 8,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 1.5,
    marginBottom: 16,
  };

  const bulletListStyle: React.CSSProperties = {
    margin: "0 0 18px 18px",
    padding: 0,
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 1.5,
  };

  const headerBarStyle: React.CSSProperties = {
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 12px",
    display: "grid",
    gridTemplateColumns: "2.4fr repeat(4, 1fr)",
    alignItems: "center",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  };

  const headerCellStyle: React.CSSProperties = {
    textAlign: "center",
  };

  const questionRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2.4fr repeat(4, 1fr)",
    alignItems: "stretch",
    borderBottom: "1px solid #e5e7eb",
  };

  const questionTextCell: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 14,
    color: "#111827",
  };

  const optionCellBase: React.CSSProperties = {
    padding: "8px 8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const optionPillBase: React.CSSProperties = {
    width: "100%",
    maxWidth: 80,
    borderRadius: 999,
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    padding: "6px 0",
    fontSize: 13,
    fontWeight: 500,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  };

  const optionPillSelected: React.CSSProperties = {
    ...optionPillBase,
    borderColor: "#facc15",
    backgroundColor: "#fef9c3",
  };

  const scoreBarOuter: React.CSSProperties = {
    marginTop: 18,
    marginBottom: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    height: 10,
    overflow: "hidden",
  };

  const scoreBarInner: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: "#fbbf24",
  };

  const interpretationCard: React.CSSProperties = {
    marginTop: 12,
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 13,
    color: "#0f172a",
  };

  const interpretationTitle: React.CSSProperties = {
    fontWeight: 700,
    marginBottom: 4,
  };

  const thankWrapper: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "#6BA7E6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  };

  const thankInner: React.CSSProperties = {
    width: "100%",
    maxWidth: 450,
    height: "100%",
    maxHeight: 900,
    backgroundColor: "#6BA7E6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  };

  const dotsWrapperStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
  };

  const dotBaseStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#0744ecff",
    opacity: 0.3,
    animationName: "dotPulse",
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  };

  // support popup
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  };

  const modalStyle: React.CSSProperties = {
    width: "88%",
    maxWidth: 360,
    backgroundColor: "#f9fafb",
    borderRadius: 24,
    padding: "20px 18px 18px 18px",
    boxShadow: "0 18px 40px rgba(15,23,42,0.35)",
    color: "#111827",
    boxSizing: "border-box",
    textAlign: "left",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  };

  const modalBodyStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 10,
  };

  const modalNoteStyle: React.CSSProperties = {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 14,
  };

  const modalBtnStyle: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 20,
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  };

  // ===== thank-you screen =====
  if (showThanks) {
    return (
      <div style={thankWrapper}>
        <div style={thankInner}>
          <img
            src={thankYouImg}
            alt="Thank you"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div style={dotsWrapperStyle}>
            <span style={{ ...dotBaseStyle, animationDelay: "0s" }} />
            <span style={{ ...dotBaseStyle, animationDelay: "0.2s" }} />
            <span style={{ ...dotBaseStyle, animationDelay: "0.4s" }} />
          </div>
          <style>
            {`
              @keyframes dotPulse {
                0%, 80%, 100% {
                  transform: scale(0.6);
                  opacity: 0.3;
                }
                40% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Patient Health Questionnaire-9 (PHQ-9)</h1>

          <p style={subtitleStyle}>
            The PHQ-9 is a multipurpose instrument for screening, monitoring,
            and measuring the severity of depression over the last two weeks.
          </p>

          <ul style={bulletListStyle}>
            <li>
              It contains the nine diagnostic criteria for major depressive
              disorder.
            </li>
            <li>
              It can be used to monitor severity over time or response to
              treatment.
            </li>
          </ul>

          <div style={subtitleStyle}>
            <strong>Over the last 2 weeks</strong>, how often have you been
            bothered by the following problems?
          </div>

          {/* header row */}
          <div style={headerBarStyle}>
            <div />
            {SCALE_OPTIONS.map((opt) => (
              <div key={opt.value} style={headerCellStyle}>
                {opt.label}
              </div>
            ))}
          </div>

          {/* questions */}
          {QUESTIONS_PHQ9.map((q, i) => (
            <div key={i} style={questionRowStyle}>
              <div style={questionTextCell}>
                <strong>{i + 1}.</strong> {q}
              </div>
              {SCALE_OPTIONS.map((opt) => {
                const isSelected = answers[i] === opt.value;
                const label =
                  opt.value === 0 ? "0" : `+${opt.value as number | string}`;
                return (
                  <div key={opt.value} style={optionCellBase}>
                    <div
                      style={isSelected ? optionPillSelected : optionPillBase}
                      onClick={() => handleChange(i, opt.value)}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {error && (
            <p style={{ color: "#b91c1c", marginTop: 10, fontSize: 13 }}>
              {error}
            </p>
          )}

          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>

          {/* yellow score bar */}
          <div style={scoreBarOuter}>
            <div style={scoreBarInner} />
          </div>

          {/* interpretation box */}
          <div style={interpretationCard}>
            <div style={interpretationTitle}>Interpretation</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                Total scores of <strong>5, 10, 15, and 20</strong> represent
                cutpoints for mild, moderate, moderately severe, and severe
                depression.
              </li>
              <li>
                Question 9 is a single screening question on suicide risk. Any
                score &gt; 0 on this item should be followed by a more detailed
                risk assessment by a qualified professional.
              </li>
              <li>
                These scores are for screening only and do not replace a
                clinical evaluation.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* gentle support popup when score is high */}
      {showSupportPopup && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalTitleStyle}>Thank you for sharing</div>
            <div style={modalBodyStyle}>
              Your answers suggest that you might be going through a difficult
              time right now. You deserve support and you don&apos;t have to
              handle everything alone.
            </div>
            <div style={modalNoteStyle}>
              This app can&apos;t provide emergency help or replace professional
              care. If you ever feel at risk of harming yourself or others,
              please contact local emergency services or a trusted person right
              away.
            </div>
            <button
              type="button"
              style={modalBtnStyle}
              onClick={() => {
                setShowSupportPopup(false);
                navigate("/journey");
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Phq9Page;
