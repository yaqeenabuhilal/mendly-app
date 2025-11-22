// react-app/src/pages/BoxBreathingPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

type PhaseKey = "inhale" | "hold1" | "exhale" | "hold2";

interface Phase {
  key: PhaseKey;
  label: string;
  seconds: number;
}

const PHASES: Phase[] = [
  { key: "inhale", label: "Inhale (4 seconds)", seconds: 4 },
  { key: "hold1", label: "Hold (4 seconds)", seconds: 4 },
  { key: "exhale", label: "Exhale (4 seconds)", seconds: 4 },
  { key: "hold2", label: "Hold (4 seconds)", seconds: 4 },
];

// recommended 4–6 cycles → we’ll default to 6
const TOTAL_CYCLES = 6;

const BoxBreathingPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const PURPLE = "#5B5FEF";

  // ===== TIMER STATE =====
  const [running, setRunning] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASES[0].seconds);
  const [cyclesLeft, setCyclesLeft] = useState<number>(TOTAL_CYCLES);

  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);

  const currentPhase = PHASES[phaseIndex];
  const currentCycle =
    cyclesLeft <= 0 ? TOTAL_CYCLES : TOTAL_CYCLES - cyclesLeft + 1;

  const timerRef = useRef<HTMLDivElement | null>(null);

  // scroll container + upper arrow
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ===== TICKING LOGIC =====
  useEffect(() => {
    if (!running) return;
    if (cyclesLeft <= 0) {
      setRunning(false);
      return;
    }

    if (secondsLeft <= 0) {
      // move to next phase or next cycle
      if (phaseIndex === PHASES.length - 1) {
        // end of "hold2" → end of square
        if (cyclesLeft === 1) {
          setRunning(false);
          setCyclesLeft(0);
          return;
        } else {
          setCyclesLeft((prev) => prev - 1);
          setPhaseIndex(0);
          setSecondsLeft(PHASES[0].seconds);
          return;
        }
      } else {
        const nextPhase = phaseIndex + 1;
        setPhaseIndex(nextPhase);
        setSecondsLeft(PHASES[nextPhase].seconds);
        return;
      }
    }

    const timerId = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [running, secondsLeft, phaseIndex, cyclesLeft]);

  const handleToggleRunning = () => {
    if (running) {
      setRunning(false);
    } else {
      if (cyclesLeft === 0) {
        setPhaseIndex(0);
        setSecondsLeft(PHASES[0].seconds);
        setCyclesLeft(TOTAL_CYCLES);
      }
      setRunning(true);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].seconds);
    setCyclesLeft(TOTAL_CYCLES);
  };

  const handleScrollToTimer = () => {
    timerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.open(
      "https://cdn.jwplayer.com/previews/8uIZay18",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const primaryTimerButtonLabel = running
    ? "Stop"
    : cyclesLeft === 0
    ? "Restart"
    : "Start";

  const handleScrollTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrolled = e.currentTarget.scrollTop;
    setShowScrollTop(scrolled > 60);
  };

  // ===== STYLES =====
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
    margin: "0 auto",
    backgroundColor: BLUE,
    borderRadius: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    position: "relative",
  };

  const topSectionStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 20,
    paddingBottom: 16,
    paddingInline: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 50,
  };

  const iconBtn: React.CSSProperties = {
    position: "absolute",
    top: 14,
    width: 42,
    height: 42,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3970aaff",
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  };

  const homeBtnStyle: React.CSSProperties = { ...iconBtn, left: 12 };
  const logoutBtnStyle: React.CSSProperties = { ...iconBtn, right: 12 };

  const titleBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    alignItems: "center",
  };

  const smallLabelStyle: React.CSSProperties = {
    color: "#5F8DD0",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const tinyLogoStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const tinyLogoImgStyle: React.CSSProperties = {
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };

  const headerTitleStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 22,
    color: "#5F8DD0",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: BLUE,
    padding: "10px 20px 16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    color: "#111827",
    overflowY: "auto",
  };

  // Scroll arrow to timer
  const scrollArrowWrapperStyle: React.CSSProperties = {
    top: 0,
    zIndex: 10,
    display: "flex",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: BLUE,
  };

  const scrollArrowButtonStyle: React.CSSProperties = {
    width: "100%",
    height: 30,
    borderRadius: "40%",
    border: "none",
    backgroundColor: "#F4C58F",
    color: "#3565AF",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15,23,42,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  };

  // scroll-to-top button (upper arrow)
  const scrollTopBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 40,
    height: 40,
    borderRadius: 999,
    border: "none",
    backgroundColor: "#3970aaff",
    color: CREAM,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    zIndex: 10,
  };

  const sectionTitleStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "#f9fafb",
  };

  const textCardStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    borderRadius: 20,
    padding: "14px 14px 16px 14px",
    boxShadow: "0 8px 20px rgba(15,23,42,0.18)",
    fontSize: 14,
    lineHeight: 1.5,
    color: "#111827",
  };

  const tipsListStyle: React.CSSProperties = {
    paddingLeft: 18,
    marginTop: 8,
    marginBottom: 4,
  };

  const videoCardStyle: React.CSSProperties = {
    ...textCardStyle,
    padding: "12px 12px 14px 12px",
  };

  const videoThumbStyle: React.CSSProperties = {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #111827, #1f2937 40%, #2563eb 70%, #60a5fa)",
    height: 160,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  };

  const playCircleStyle: React.CSSProperties = {
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "3px solid white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
  };

  const videoTitleStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
    fontSize: 14,
    fontWeight: 600,
    textShadow: "0 2px 6px rgba(0,0,0,0.6)",
  };

  const startSectionCardStyle: React.CSSProperties = {
    ...textCardStyle,
    textAlign: "center",
  };

  const startBreathingButtonStyle: React.CSSProperties = {
    marginTop: 10,
    width: "100%",
    borderRadius: 999,
    border: "none",
    padding: "10px 14px",
    backgroundColor: PURPLE,
    color: "#f9fafb",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  };

  // Modal styles
  const modalOverlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 30,
  };

  const modalCardStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    borderRadius: 24,
    padding: "16px 16px 18px 16px",
    width: "100%",
    maxWidth: 360,
    boxShadow: "0 10px 30px rgba(15,23,42,0.4)",
    textAlign: "center",
    position: "relative",
  };

  const modalCloseBtnStyle: React.CSSProperties = {
    position: "absolute",
    top: 10,
    right: 10,
    border: "none",
    borderRadius: "999px",
    width: 30,
    height: 30,
    cursor: "pointer",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    fontWeight: 700,
  };

  const timerCircleStyle: React.CSSProperties = {
    width: 160,
    height: 160,
    borderRadius: "50%",
    border: "4px solid #5F8DD0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    margin: "8px auto 12px auto",
    background: "radial-gradient(circle at 30% 20%, #ffffff, #dbeafe)",
  };

  const timerPhaseLabelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "#4b5563",
    textAlign: "center",
    paddingInline: 10,
  };

  const timerSecondsStyle: React.CSSProperties = {
    fontSize: 32,
    fontWeight: 700,
    color: "#1f2937",
  };

  const timerCycleTextStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#6b7280",
  };

  const timerButtonsRow: React.CSSProperties = {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 6,
  };

  const timerBtn: React.CSSProperties = {
    minWidth: 90,
    borderRadius: 999,
    border: "none",
    padding: "8px 14px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  const startBtnStyle: React.CSSProperties = {
    ...timerBtn,
    backgroundColor: PURPLE,
    color: "#f9fafb",
  };

  const resetBtnStyle: React.CSSProperties = {
    ...timerBtn,
    backgroundColor: "#e5e7eb",
    color: "#374151",
  };

  const bottomNavStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 0,
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
    boxShadow: "0 -2px 10px rgba(15,23,42,0.15)",
    height: 50,
  };

  const navItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#3565AF",
    fontWeight: 600,
  };

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        {/* HEADER */}
        <div style={topSectionStyle}>
          <button
            type="button"
            style={homeBtnStyle}
            onClick={() => navigate("/breath")}
            aria-label="Back"
            title="Back"
          >
            ⬅
          </button>

          <div style={titleBlockStyle}>
            <div style={smallLabelStyle}>
              <span style={tinyLogoStyle}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImgStyle} />
              </span>
              Mendly App
            </div>
            <span style={headerTitleStyle}>Box Breathing</span>
          </div>

          <button
            type="button"
            style={logoutBtnStyle}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("access_token");
              navigate("/login", { replace: true });
            }}
            aria-label="Logout"
            title="Log out"
          >
            🚪
          </button>
        </div>

        {/* CONTENT */}
        <div
          style={contentStyle}
          ref={contentRef}
          onScroll={handleContentScroll}
        >
          {/* Scroll to counter button */}
          <div style={scrollArrowWrapperStyle}>
            <button
              type="button"
              style={scrollArrowButtonStyle}
              onClick={handleScrollToTimer}
              aria-label="Scroll to box breathing counter"
              title="Go to counter"
            >
              ⬇ Go to box breathing counter ⬇
            </button>
          </div>

          {/* Purpose & Benefits */}
          <div>
            <div style={sectionTitleStyle}>Purpose &amp; benefits</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Box breathing is ideal for focus and emotional control. It’s used
              by athletes, performers, and even in some military training
              programs to regulate oxygen and create a calm-but-alert state in
              the brain.
            </p>
            <p>
              It’s perfect before exams, matches, meetings, or any difficult
              conversation where you want to stay steady and clear-headed rather
              than overwhelmed.
            </p>
          </div>

          {/* How to do it */}
          <div>
            <div style={sectionTitleStyle}>How to do it</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0, fontWeight: 600 }}>
              Use the simple 4–4–4–4 rhythm:
            </p>
            <ul style={tipsListStyle}>
              <li>Inhale gently through your nose for 4 seconds.</li>
              <li>Hold your breath for 4 seconds.</li>
              <li>Exhale slowly through your mouth for 4 seconds.</li>
              <li>Hold again for 4 seconds.</li>
            </ul>
            <p>Repeat this for about 4–6 cycles at your own pace.</p>
            <p>
              If 4 seconds feels too long at first, you can start with 3–3–3–3
              and gradually lengthen the count as your comfort improves.
            </p>
          </div>

          {/* Tips */}
          <div>
            <div style={sectionTitleStyle}>Tips for box breathing</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              These details make the exercise more effective:
            </p>
            <ul style={tipsListStyle}>
              <li>
                Imagine tracing a square: up (inhale) → across (hold) → down
                (exhale) → across (hold).
              </li>
              <li>Keep your shoulders relaxed and avoid straining.</li>
              <li>
                Let the breath be smooth and silent rather than forced or loud.
              </li>
              <li>
                Practice for 2–3 minutes whenever you need to reset focus or
                calm nerves.
              </li>
            </ul>
          </div>

          {/* When to use it */}
          <div>
            <div style={sectionTitleStyle}>When can it help?</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Box breathing is especially useful when you feel mentally busy but
              still need to perform:
            </p>
            <ul style={tipsListStyle}>
              <li>Right before an exam, interview, or meeting.</li>
              <li>On the bench or sidelines before going into a game.</li>
              <li>
                Between study or work blocks to clear the mental &quot;noise&quot;.
              </li>
              <li>
                When you notice you’re overthinking, scrolling, or stuck in
                stress loops.
              </li>
            </ul>
          </div>

          {/* Video */}
          <div style={videoCardStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Watch a guided box breathing video
            </div>
            <a
              href="https://cdn.jwplayer.com/previews/8uIZay18"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              onClick={handleVideoClick}
            >
              <div style={videoThumbStyle}>
                <div style={playCircleStyle}>▶</div>
                <div style={videoTitleStyle}>
                  Box (Square) Breathing – Guided demo
                </div>
              </div>
            </a>
          </div>

          {/* Practice / counter section */}
          <div ref={timerRef}>
            <div style={startSectionCardStyle}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Ready to practice box breathing?
              </div>
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Tap the button below to open a simple counter that guides you
                through the 4–4–4–4 box.
              </div>
              <button
                type="button"
                style={startBreathingButtonStyle}
                onClick={() => setShowTimerModal(true)}
              >
                Start box breathing counter
              </button>
            </div>
          </div>
        </div>

        {/* UPPER ARROW (scroll to top) */}
        {showScrollTop && (
          <button
            type="button"
            style={scrollTopBtnStyle}
            onClick={handleScrollTop}
            aria-label="Back to top"
            title="Back to top"
          >
            ↑
          </button>
        )}

        {/* BOTTOM NAV */}
        <div style={bottomNavStyle}>
          <button
            type="button"
            style={navItemStyle}
            onClick={() => navigate("/profile")}
            aria-label="Profile"
          >
            <div style={{ fontSize: 22 }}>👤</div>
            <div>Profile</div>
          </button>

          <button
            type="button"
            style={navItemStyle}
            onClick={() => navigate("/journey")}
            aria-label="Home"
            title="Home"
          >
            <div style={{ fontSize: 22 }}>🏠</div>
          </button>

          <button
            type="button"
            style={navItemStyle}
            onClick={() => navigate("/chat")}
            aria-label="AI Chat"
          >
            <div style={{ fontSize: 22 }}>💬</div>
            <div>Ai Chat</div>
          </button>
        </div>

        {/* TIMER MODAL */}
        {showTimerModal && (
          <div style={modalOverlayStyle}>
            <div style={modalCardStyle}>
              <button
                type="button"
                style={modalCloseBtnStyle}
                onClick={() => {
                  setShowTimerModal(false);
                  setRunning(false);
                }}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
              <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16 }}>
                Box breathing counter
              </h3>
              <p style={{ marginTop: 0, fontSize: 12, color: "#4b5563" }}>
                Follow the circle and the text: breathe in, hold, breathe out,
                hold — like tracing a square.
              </p>
              <div style={timerCircleStyle}>
                <div style={timerPhaseLabelStyle}>{currentPhase.label}</div>
                <div style={timerSecondsStyle}>{secondsLeft}</div>
                <div style={timerCycleTextStyle}>
                  Cycle {currentCycle} of {TOTAL_CYCLES}
                </div>
              </div>
              <div style={timerButtonsRow}>
                <button
                  type="button"
                  style={startBtnStyle}
                  onClick={handleToggleRunning}
                >
                  {primaryTimerButtonLabel}
                </button>
                <button
                  type="button"
                  style={resetBtnStyle}
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
              <p
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  color: "#6b7280",
                  lineHeight: 1.4,
                }}
              >
                If you feel dizzy or uncomfortable, stop, breathe normally, and
                try a shorter count (like 3–3–3–3) next time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxBreathingPage;
