// react-app/src/pages/Breathing874Page.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

type PhaseKey = "inhale" | "hold" | "exhale";

interface Phase {
  key: PhaseKey;
  label: string;
  seconds: number;
}

const PHASES: Phase[] = [
  { key: "inhale", label: "Inhale quietly through your nose", seconds: 4 },
  { key: "hold", label: "Hold your breath", seconds: 7 },
  {
    key: "exhale",
    label: 'Exhale through your mouth while making a "whoooosh" sound',
    seconds: 8,
  },
];

const TOTAL_CYCLES = 4;

const Breathing874Page: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const PURPLE = "#5B5FEF";

  // ===== TIMER STATE =====
  const [running, setRunning] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASES[0].seconds);
  const [cyclesLeft, setCyclesLeft] = useState<number>(TOTAL_CYCLES);

  // modal visibility for the counter
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);

  // 🔼 scroll-to-top state + content ref
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const currentPhase = PHASES[phaseIndex];
  const currentCycle =
    cyclesLeft <= 0 ? TOTAL_CYCLES : TOTAL_CYCLES - cyclesLeft + 1;

  // ref for scrolling to the "start breathing" section
  const timerRef = useRef<HTMLDivElement | null>(null);

  // ===== TICKING LOGIC =====
  useEffect(() => {
    if (!running) return;
    if (cyclesLeft <= 0) {
      setRunning(false);
      return;
    }

    if (secondsLeft <= 0) {
      if (phaseIndex === PHASES.length - 1) {
        // end of exhale → end of cycle
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
        // next phase in same cycle
        const nextPhase = phaseIndex + 1;
        setPhaseIndex(nextPhase);
        setSecondsLeft(PHASES[nextPhase].seconds);
        return;
      }
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [running, secondsLeft, phaseIndex, cyclesLeft]);

  // Toggle start / stop
  const handleToggleRunning = () => {
    if (running) {
      // stop / pause
      setRunning(false);
    } else {
      // if already finished all cycles → reset for a new run
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

  // 🔼 scroll-to-top handler
  const handleScrollTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // scroll arrow click handler
  const handleScrollToTimer = () => {
    timerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // open YouTube video
  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.open(
      "https://youtu.be/1Dv-ldGLnIY?si=nokLOOPtBlNbcb-9",
      "_blank",
      "noopener,noreferrer"
    );
  };

  // primary button label inside the modal
  const primaryTimerButtonLabel = running
    ? "Stop"
    : cyclesLeft === 0
    ? "Restart"
    : "Start";

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
    position: "relative", // needed for modal overlay
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

  // arrow just under the nav, always visible while scrolling
  const scrollArrowWrapperStyle: React.CSSProperties = {
    //position: "sticky",
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

  // 🔼 scroll-to-top button style
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

  // "Start breathing" button section
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
            <span style={headerTitleStyle}>4-7-8 Breathing</span>
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
          onScroll={(e) => {
            setShowScrollTop(e.currentTarget.scrollTop > 60);
          }}
        >
          {/* scroll arrow to "start breathing" section */}
          <div style={scrollArrowWrapperStyle}>
            <button
              type="button"
              style={scrollArrowButtonStyle}
              onClick={handleScrollToTimer}
              aria-label="Scroll to breathing counter"
              title="Go to counter"
            >
              ⬇ Go to 4-7-8 counter ⬇
            </button>
          </div>

          {/* What is 4-7-8 breathing? */}
          <div>
            <div style={sectionTitleStyle}>What is 4-7-8 breathing?</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              The 4-7-8 breathing technique was conceived by Dr. Andrew Weil, a
              world-renowned Harvard trained doctor with a focus on holistic
              health. Deep, relaxing breathing has been used to soothe the mind
              for thousands of years, and is a key element of meditation and
              yoga. The actual process of the Dr Weil 4-7-8 breathing method is
              very simple, making it a good choice for the end of a busy day.
            </p>
          </div>

          {/* How does it work? */}
          <div>
            <div style={sectionTitleStyle}>How does 4-7-8 breathing work?</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              4-7-8 breathing works in three ways. It focuses and calms the
              mind, by helping to quieten other thoughts, similar to meditation.
              Some people also benefit from the sense of control they get from
              this breathing technique. Feeling in control of your breathing and
              body helps to soothe anxiety and improve mindset.
            </p>
            <p>
              It also has a physiological effect on the body because the deep
              breathing and increased oxygen makes the body think that your mind
              is relaxed, and encourages a resting heart rate. It is basically a
              command to your body to slow down all its functions. Dr Weil
              refers to the method as a &lsquo;natural tranquilizer for the
              nervous system&rsquo;. It is a handy sleep tool but it can also be
              used to ease anxiety, stress and even pain during the day.
            </p>
          </div>

          {/* How to do it */}
          <div>
            <div style={sectionTitleStyle}>How to do 4-7-8 breathing</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Sit or lay with your back straight to allow your lungs to fill
              properly. Make sure you are comfortable and (if possible) won&rsquo;t
              be disturbed. Keep the tip of the tongue resting lightly behind
              the front upper teeth throughout the entire exercise. Exhale all
              the air from the lungs before starting the following steps.
            </p>
            <ul style={tipsListStyle}>
              <li>Inhale quietly through your nose to the count of 4.</li>
              <li>Hold your breath for the count of 7.</li>
              <li>
                Exhale through your mouth to the count of 8, while making an
                audible &lsquo;whoooosh&rsquo; sound.
              </li>
            </ul>
            <p>Repeat this cycle a total of 4 times.</p>

            <p style={{ fontWeight: 600, marginTop: 10 }}>⚠️ Tips</p>
            <ul style={tipsListStyle}>
              <li>Practice in a comfortable seated position.</li>
              <li>
                If holding for 7 seconds feels too long, start shorter (e.g.,
                4-4-6).
              </li>
              <li>Use once or twice daily for long-term benefits.</li>
            </ul>
          </div>

          {/* Things you should know */}
          <div>
            <div style={sectionTitleStyle}>
              Things you should know about 4-7-8 breathing
            </div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              The 4-7-8 breathing technique may make some people feel
              light-headed, especially at first, which is why it should be
              practiced in a safe place. Dr Weil describes it as &lsquo;a very
              pleasant altered state of consciousness&rsquo;. Most people find
              they need to start this method with shorter timings. If you are
              feeling light-headed or out of breath simply make the times for
              the three phases shorter. Try to keep the ratio similar to 4-7-8
              though. Your inhale should always be about half as long as your
              exhale.
            </p>
            <p>
              This method needs to be done twice a day for two months to get the
              result of falling asleep in one minute, according to Dr Weil.
              However, you can practice 4-7-8 breathing as many time as you like
              throughout the day. The beauty of this technique is that, unlike
              sleeping pills, that lose their efficacy over time, 4-7-8
              breathing actually gets more powerful with repetition and
              practise.
            </p>
            <p>
              There are apps available that can help with the timing of your
              breathing, but don&rsquo;t get too hung up on the precise timings.
              Your focus should be on the process and relaxing your body.
            </p>
            <p>
              Children can also practice this technique at night to get to
              sleep. Adjust the number of seconds for each phase to your
              child&rsquo;s lung capacity. Your child should not be holding
              their breath for too long or be out of breath after using this
              technique. The timings are not as important as getting your child
              to concentrate on their breathing.
            </p>
          </div>

          {/* YouTube link */}
          <div style={videoCardStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Watch a guided 4-7-8 breathing video
            </div>
            <a
              href="https://youtu.be/1Dv-ldGLnIY?si=nokLOOPtBlNbcb-9"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              onClick={handleVideoClick}
            >
              <div style={videoThumbStyle}>
                <div style={playCircleStyle}>▶</div>
                <div style={videoTitleStyle}>
                  4-7-8 Breathing Exercise – Guided practice
                </div>
              </div>
            </a>
          </div>

          {/* Start breathing section (the arrow scrolls here) */}
          <div ref={timerRef}>
            <div style={startSectionCardStyle}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Ready to practice?
              </div>
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Tap the button below to open a small window with a guided
                4-7-8 counter.
              </div>
              <button
                type="button"
                style={startBreathingButtonStyle}
                onClick={() => setShowTimerModal(true)}
              >
                Start 4-7-8 breathing
              </button>
            </div>
          </div>
        </div>

        {/* 🔼 SCROLL TO TOP BUTTON */}
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
                onClick={() => setShowTimerModal(false)}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
              <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16 }}>
                Guided 4-7-8 counter
              </h3>
              <p style={{ marginTop: 0, fontSize: 12, color: "#4b5563" }}>
                Follow the circle: inhale, hold, and exhale with the timer.
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Breathing874Page;
