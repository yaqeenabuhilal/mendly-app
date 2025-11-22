// react-app/src/pages/GuidedVisualizationBreathingPage.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const GuidedVisualizationBreathingPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const PURPLE = "#5B5FEF";

  // scroll-to-practice + scroll-to-top
  const practiceRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const practiceButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrolled = target.scrollTop;

    let buttonVisible = false;
    if (practiceButtonRef.current && contentRef.current) {
      const btnRect = practiceButtonRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      buttonVisible =
        btnRect.top < contentRect.bottom && btnRect.bottom > contentRect.top;
    }

    setShowScrollTop(scrolled > 20 && !buttonVisible);
  };

  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.open(
      "https://youtu.be/enJyOTvEn4M?si=ZmUn15oTAaIHE_gh",
      "_blank",
      "noopener,noreferrer"
    );
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
    fontSize: 20,
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

  // arrow just under the nav to jump to practice
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

  // practice card
  const practiceCardStyle: React.CSSProperties = {
    ...textCardStyle,
    textAlign: "center",
  };

  const practiceButtonStyle: React.CSSProperties = {
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

  // little Mendly AI integration hint card
  const aiHintCardStyle: React.CSSProperties = {
    ...textCardStyle,
    fontSize: 13,
    background:
      "linear-gradient(135deg, rgba(244,197,143,0.25), rgba(91,95,239,0.08))",
  };

  // bottom nav
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
            <span style={headerTitleStyle}>Guided Visualization Breathing</span>
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
          {/* jump-to-practice arrow */}
          <div style={scrollArrowWrapperStyle}>
            <button
              type="button"
              style={scrollArrowButtonStyle}
              onClick={handleScrollToPractice}
              aria-label="Scroll to practice section"
              title="Go to practice"
            >
              ⬇ Go to practice section ⬇
            </button>
          </div>

          {/* Purpose & Benefits */}
          <div>
            <div style={sectionTitleStyle}>Purpose &amp; benefits</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Guided visualization breathing combines slow, steady breathing
              with mental imagery. You&apos;re not just breathing—you&apos;re
              picturing calm entering and stress leaving.
            </p>
            <p>
              It&apos;s excellent for emotional grounding and anxiety reduction,
              especially when you feel mentally overloaded or stuck in strong
              emotions. This style also fits perfectly with Mendly&apos;s AI
              chat, where the companion can gently guide you step by step.
            </p>
          </div>

          {/* How to do it */}
          <div>
            <div style={sectionTitleStyle}>How to do it</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0, fontWeight: 600 }}>
              Try this simple visualization:
            </p>
            <ul style={tipsListStyle}>
              <li>Find a comfortable position, either sitting or lying down.</li>
              <li>Close your eyes gently and take a deep breath in.</li>
              <li>
                As you inhale, imagine drawing in a calm blue light or a sense
                of peace into your chest.
              </li>
              <li>
                As you exhale slowly, picture dark smoke or cloudy air leaving
                your body—representing stress, tension, or worries.
              </li>
              <li>
                Continue this for about 2–3 minutes with slow, rhythmic
                breathing.
              </li>
            </ul>
            <p>
              You don&apos;t need to force big breaths—keep them smooth and
              steady, just long enough to feel the shift between calm and
              release.
            </p>
          </div>

          {/* Tips */}
          <div>
            <div style={sectionTitleStyle}>Tips for deeper effect</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Visualization becomes more powerful when you add a few details:
            </p>
            <ul style={tipsListStyle}>
              <li>
                Use calm background sounds or gentle music—this can be part of a
                &quot;Calm Space&quot; mode in the app.
              </li>
              <li>
                Try to feel the blue light spreading from your chest to your
                shoulders, arms, and head as you breathe in.
              </li>
              <li>
                On the exhale, imagine the dark smoke leaving through your mouth
                or even dissolving into thin air.
              </li>
              <li>
                Avoid doing this in a very noisy or distracting environment—it
                works best when you can give it a few undisturbed minutes.
              </li>
            </ul>
          </div>

          {/* When can it help? */}
          <div>
            <div style={sectionTitleStyle}>When can it help?</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Guided visualization breathing is especially useful when emotions
              feel intense, heavy, or hard to name:
            </p>
            <ul style={tipsListStyle}>
              <li>
                After a stressful day, to release tension before going to sleep.
              </li>
              <li>
                Before or after a difficult conversation to ground yourself.
              </li>
              <li>
                During waves of anxiety, when you need something more immersive
                than simple counting or box breathing.
              </li>
              <li>
                As a &quot;reset&quot; ritual before studying, training, or
                focusing on something important.
              </li>
            </ul>
          </div>

          {/* Mendly AI hint */}
          <div style={aiHintCardStyle}>
            <strong>💬 How Mendly can guide you</strong>
            <p style={{ marginTop: 6, fontWeight:300 }}>
              In future versions, your Mendly companion could guide this
              exercise step-by-step in real time—either by text or voice.
              Imagine the AI saying:{" "}
              <em>&quot;Breathe in and picture that calm blue light filling
              your chest… now breathe out and watch the stress leave as dark
              smoke.&quot;</em>
            </p>
            <p style={{ marginBottom: 0, fontWeight:300 }}>
              You could trigger this from the chat whenever you type something
              like &quot;I feel anxious&quot; or &quot;I need to calm down.&quot;
            </p>
          </div>

          {/* Video */}
          <div style={videoCardStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Watch a guided visualization breathing video
            </div>
            <a
              href="https://youtu.be/enJyOTvEn4M?si=ZmUn15oTAaIHE_gh"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              onClick={handleVideoClick}
            >
              <div style={videoThumbStyle}>
                <div style={playCircleStyle}>▶</div>
                <div style={videoTitleStyle}>
                  Guided Breathing &amp; Visualization – Calm practice
                </div>
              </div>
            </a>
          </div>

          {/* Practice section */}
          <div ref={practiceRef}>
            <div style={practiceCardStyle}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Try it now (2–3 minutes)
              </div>
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Use this as a short &quot;Calm Space&quot; break:
              </div>
              <ul style={{ ...tipsListStyle, textAlign: "left" }}>
                <li>Close your eyes and take a slow, deep breath in.</li>
                <li>
                  Imagine a calm blue light entering your chest and spreading
                  through your body.
                </li>
                <li>
                  Exhale slowly, picturing dark smoke or stress leaving your
                  body.
                </li>
                <li>
                  Repeat this visualization for 8–12 breaths (around 2–3
                  minutes), then let your breath return to normal.
                </li>
                <li>
                  If you feel dizzy or spaced out, open your eyes, breathe
                  normally, and re-orient yourself in the room.
                </li>
              </ul>
              <button
                type="button"
                style={practiceButtonStyle}
                onClick={handleScrollTop}
                ref={practiceButtonRef}
              >
                Finished a round? Back to top ↑
              </button>
            </div>
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
      </div>
    </div>
  );
};

export default GuidedVisualizationBreathingPage;
