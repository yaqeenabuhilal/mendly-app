// react-app/src/pages/BoxBreathingPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import boxImg from "../assets/box.png";

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

const TOTAL_CYCLES = 6;

const BoxBreathingPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const PURPLE = "#5B5FEF";

  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [cyclesLeft, setCyclesLeft] = useState(TOTAL_CYCLES);

  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const currentPhase = PHASES[phaseIndex];
  const currentCycle =
    cyclesLeft <= 0 ? TOTAL_CYCLES : TOTAL_CYCLES - cyclesLeft + 1;

  const timerRef = useRef<HTMLDivElement | null>(null);
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
      if (phaseIndex === PHASES.length - 1) {
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

    const id = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearTimeout(id);
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

  // open video in modal (YouTube)
  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    setShowVideoModal(true);
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
    setShowScrollTop(e.currentTarget.scrollTop > 60);
  };

  // ===== STYLES (same vibe as 4-7-8 page) =====
  const BLUE_BG = BLUE;

  const screenStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: BLUE_BG,
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: 450,
    margin: "0 auto",
    backgroundColor: BLUE_BG,
    borderRadius: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    position: "relative",
  };

  const topSectionStyle: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 6,
    paddingBottom: 6,
    paddingInline: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const iconBtn: React.CSSProperties = {
    position: "absolute",
    top: 8,
    width: 35,
    height: 35,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3970aa",
    color: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  };

  const homeBtnStyle: React.CSSProperties = { ...iconBtn, left: 16 };
  const logoutBtnStyle: React.CSSProperties = { ...iconBtn, right: 16 };

  const logoBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  };

  const logoCircleStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  };

  const logoImgStyle: React.CSSProperties = {
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };

  const appNameStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#5F8DD0",
    letterSpacing: 0.5,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: BLUE_BG,
    padding: "18px 24px 16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    color: "#f9fafb",
    overflowY: "auto",
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 6,
  };

  const heroImageWrapperStyle: React.CSSProperties = {
        marginTop: 4,
        marginBottom: 10,
        display: "flex",
        justifyContent: "center",
        backgroundColor: BLUE,      // same as page
        borderRadius: 0,
        overflow: "hidden",
      };
    
      const heroImageStyle: React.CSSProperties = {
        width: "100%",
        height: 150,
        maxWidth: 580,
        display: "block",
        mixBlendMode: "multiply",   // white turns into background color
      };

  const dividerStyle: React.CSSProperties = {
    textAlign: "center",
    letterSpacing: 4,
    margin: "12px 0 4px 0",
  };

  const scrollArrowWrapperStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 4,
  };

  const scrollArrowButtonStyle: React.CSSProperties = {
    borderRadius: 999,
    border: "none",
    backgroundColor: "#F4C58F",
    color: "#3565AF",
    cursor: "pointer",
    padding: "6px 14px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.35)",
    fontSize: 14,
    fontWeight: 600,
  };

  const scrollTopBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 40,
    height: 40,
    borderRadius: 999,
    border: "none",
    backgroundColor: "#3970aa",
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
    fontSize: 20,
    fontWeight: 700,
    color: "#ffffff",
  };

  const textBlockStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#f9fafb",
  };

  const tipsListStyle: React.CSSProperties = {
    paddingLeft: 18,
    marginTop: 8,
    marginBottom: 4,
  };

  const videoCardStyle: React.CSSProperties = {
    ...textBlockStyle,
  };

  const videoThumbStyle: React.CSSProperties = {
    marginTop: 8,
    borderRadius: 24,
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

  const startSectionStyle: React.CSSProperties = {
    textAlign: "center",
    marginTop: 10,
  };

  const startBreathingButtonStyle: React.CSSProperties = {
    marginTop: 14,
    width: "80%",
    maxWidth: 260,
    borderRadius: 999,
    border: "none",
    padding: "12px 18px",
    backgroundColor: CREAM,
    color: BLUE_BG,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(15,23,42,0.35)",
  };

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

  const videoFrameWrapperStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  };

  const videoIframeStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "none",
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

          <div style={logoBlockStyle}>
            <div style={logoCircleStyle}>
              <img src={logo} alt="Mendly logo" style={logoImgStyle} />
            </div>
            <div style={appNameStyle}>
              <strong>Mendly App</strong>
            </div>
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
          {/* Title + illustration */}
          <div>
            <div style={heroTitleStyle}>Box Breathing</div>
            <div style={heroImageWrapperStyle}>
              <img
                src={boxImg}
                alt="Illustration of box breathing"
                style={heroImageStyle}
              />
            </div>
          </div>

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

          <div style={dividerStyle}>••••••••••••••••••••••••</div>

          {/* Purpose & benefits */}
          <div>
            <div style={sectionTitleStyle}>Purpose &amp; benefits</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4 }}>
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
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4, fontWeight: 600 }}>
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
          <div style={textBlockStyle}>
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

          {/* When can it help? */}
          <div>
            <div style={sectionTitleStyle}>When can it help?</div>
          </div>
          <div style={textBlockStyle}>
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

          {/* Video (YouTube) */}
          <div style={videoCardStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Watch a guided box breathing video
            </div>
            <a
              href="https://www.youtube.com/watch?v=tEmt1Znux58"
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
          <div ref={timerRef} style={startSectionStyle}>
            <div style={dividerStyle}>••••••••••••••••••••••••</div>
            <button
              type="button"
              style={startBreathingButtonStyle}
              onClick={() => setShowTimerModal(true)}
            >
              Breath with me
            </button>
          </div>
        </div>

        {/* SCROLL TO TOP BUTTON */}
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

        {/* VIDEO MODAL */}
        {showVideoModal && (
          <div style={modalOverlayStyle}>
            <div style={modalCardStyle}>
              <button
                type="button"
                style={modalCloseBtnStyle}
                onClick={() => setShowVideoModal(false)}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
              <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16 }}>
                Box breathing – Guided video
              </h3>
              <p style={{ marginTop: 0, fontSize: 12, color: "#4b5563" }}>
                Watch and follow along with this short guided practice.
              </p>
              <div style={videoFrameWrapperStyle}>
                <iframe
                  src="https://www.youtube.com/embed/tEmt1Znux58"
                  title="Box Breathing – Guided demo"
                  style={videoIframeStyle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxBreathingPage;
