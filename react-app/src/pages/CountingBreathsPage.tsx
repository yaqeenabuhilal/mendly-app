// react-app/src/pages/CountingBreathsPage.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import countingImg from "../assets/counting.png";

const CountingBreathsPage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";
  const PURPLE = "#5B5FEF";

  // scroll-to-practice + scroll-to-top
  const practiceRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // video modal
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleScrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 60);
  };

  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    setShowVideoModal(true); // ⬅ open internal modal instead of new tab
  };

  // ===== STYLES (same design language as 4-7-8 & Diaphragmatic) =====
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

  // thin cream top bar with centered logo
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
    backgroundColor: BLUE,
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

  // scroll-arrow button
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

  // scroll-to-top button
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

  // text directly on blue (no cream cards)
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

  // video card
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

  // iframe wrapper (inside modal)
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

  // practice card – same design as Diaphragmatic page
  const practiceCardStyle: React.CSSProperties = {
    textAlign: "center",
    backgroundColor: "rgba(249, 250, 251, 0.08)", // light, see-through panel on blue
    borderRadius: 16,
    padding: "14px 14px 16px 14px",
    boxShadow: "0 8px 20px rgba(15,23,42,0.18)",
    fontSize: 14,
    lineHeight: 1.5,
    color: "#f9fafb", // white text
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

  // bottom nav (same everywhere)
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

  // modal styles (same pattern as other pages)
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
          {/* Hero title + image */}
          <div>
            <div style={heroTitleStyle}>Counting Breaths</div>
            <div style={heroImageWrapperStyle}>
              <img
                src={countingImg}
                alt="Counting breaths illustration"
                style={heroImageStyle}
              />
            </div>
          </div>

          {/* scroll arrow to practice section */}
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

          <div style={dividerStyle}>••••••••••••••••••••••••</div>

          {/* Purpose & benefits */}
          <div>
            <div style={sectionTitleStyle}>Purpose &amp; benefits</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4 }}>
              Counting breaths is a simple but powerful way to train mindfulness
              and concentration. By gently tracking numbers in your mind, you
              give your brain something steady to rest on instead of getting
              pulled into rumination or overthinking.
            </p>
            <p>
              It helps you become aware of your natural breathing rhythm and
              anchors you back into the present moment—one inhale, one exhale,
              one count at a time.
            </p>
          </div>

          {/* How to do it */}
          <div>
            <div style={sectionTitleStyle}>How to do it</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4, fontWeight: 600 }}>
              Try this gentle 5–7 rhythm:
            </p>
            <ul style={tipsListStyle}>
              <li>Sit comfortably with your back supported if possible.</li>
              <li>
                Inhale through your nose while counting <strong>1–5</strong> in
                your head.
              </li>
              <li>
                Exhale through your mouth while counting{" "}
                <strong>1–7</strong>.
              </li>
              <li>Repeat slowly for about 5–10 rounds.</li>
            </ul>
            <p>
              If the counts feel too long at first, shorten them (for example
              1–3 on the inhale and 1–5 on the exhale) and gradually build up as
              it becomes easier.
            </p>
          </div>

          {/* Tips */}
          <div>
            <div style={sectionTitleStyle}>Tips for better focus</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4 }}>
              A few small adjustments can make this practice much more
              effective:
            </p>
            <ul style={tipsListStyle}>
              <li>Focus on the sound and rhythm of each breath.</li>
              <li>
                If your mind wanders (it will), gently bring your attention back
                to the counting without judging yourself.
              </li>
              <li>
                Let the breath stay soft and natural—no need to force big or
                noisy breaths.
              </li>
              <li>
                You can pair it with a soft mental phrase like{" "}
                <em>"In…"</em> on the inhale and <em>"Out…"</em> on the exhale
                together with the numbers.
              </li>
              <li>
                Great as a quick mini-break during stressful study or work
                periods (1–3 minutes is enough).
              </li>
            </ul>
          </div>

          {/* When can it help? */}
          <div>
            <div style={sectionTitleStyle}>When can it help?</div>
          </div>
          <div style={textBlockStyle}>
            <p style={{ marginTop: 4 }}>
              Counting breaths is especially useful when your thoughts feel
              busy, loud, or stuck on the same loop:
            </p>
            <ul style={tipsListStyle}>
              <li>
                During study breaks to reset your focus instead of scrolling.
              </li>
              <li>
                When you notice you’re replaying a conversation or worrying
                about "what if" scenarios.
              </li>
              <li>
                Before sleep, to help your mind shift out of overthinking mode.
              </li>
              <li>
                On public transport or in waiting rooms—no one can tell you’re
                doing it.
              </li>
            </ul>
          </div>

          {/* Video (same pattern as other pages) */}
          <div style={videoCardStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Watch a guided rhythmic breathing video
            </div>
            <a
              href="https://www.youtube.com/watch?v=wzDB1IgU5RE"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              onClick={handleVideoClick}
            >
              <div style={videoThumbStyle}>
                <div style={playCircleStyle}>▶</div>
                <div style={videoTitleStyle}>
                  5–7 Rhythmic Breathing – Guided practice
                </div>
              </div>
            </a>
          </div>

          {/* Practice section – same card style as Diaphragmatic page */}
          <div style={dividerStyle}>••••••••••••••••••••••••</div>
          <div ref={practiceRef}>
            <div style={practiceCardStyle}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Try it now (5–10 rounds)
              </div>
              <div style={{ fontSize: 13, color: "#e5e7eb" }}>
                Sit comfortably, count 1–5 on the inhale and 1–7 on the exhale.
                If you lose the count, just start again from 1 on the next
                breath.
              </div>
              <ul style={{ ...tipsListStyle, textAlign: "left" }}>
                <li>Inhale through your nose, counting 1–5 in your mind.</li>
                <li>Exhale through your mouth, counting 1–7.</li>
                <li>
                  If you lose the count, simply start again from 1 on the next
                  inhale.
                </li>
                <li>Repeat for 5–10 calm, unhurried breaths.</li>
              </ul>
              <button
                type="button"
                style={practiceButtonStyle}
                onClick={handleScrollTop}
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

        {/* VIDEO MODAL (same style as other pages) */}
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
                5–7 Rhythmic Breathing – Guided video
              </h3>
              <p style={{ marginTop: 0, fontSize: 12, color: "#4b5563" }}>
                Watch and follow along with this short guided practice.
              </p>
              <div style={videoFrameWrapperStyle}>
                <iframe
                  src="https://www.youtube.com/embed/wzDB1IgU5RE"
                  title="5–7 Rhythmic Breathing – Guided practice"
                  style={videoIframeStyle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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

export default CountingBreathsPage;
