// react-app/src/pages/CountingBreathsPage.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const CountingBreathsPage: React.FC = () => {
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
      // visible if overlapping with visible scroll area
      buttonVisible =
        btnRect.top < contentRect.bottom && btnRect.bottom > contentRect.top;
    }

    // show arrow only when user scrolled down AND button is NOT visible
    setShowScrollTop(scrolled > 20 && !buttonVisible);
  };

  const handleVideoClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.open(
      "https://www.youtube.com/watch?v=wzDB1IgU5RE",
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
            <span style={headerTitleStyle}>Counting Breaths</span>
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

          {/* Section: Purpose & Benefits */}
          <div>
            <div style={sectionTitleStyle}>Purpose &amp; benefits</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Counting breaths is a simple but powerful way to train
              mindfulness and concentration. By gently tracking numbers in your
              mind, you give your brain something steady to rest on instead of
              getting pulled into rumination or overthinking.
            </p>
            <p>
              It helps you become aware of your natural breathing rhythm and
              anchors you back into the present moment—one inhale, one exhale,
              one count at a time.
            </p>
          </div>

          {/* Section: How to do it */}
          <div>
            <div style={sectionTitleStyle}>How to do it</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0, fontWeight: 600 }}>
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
              1–3 on the inhale and 1–5 on the exhale) and gradually build up
              as it becomes easier.
            </p>
          </div>

          {/* Section: Tips */}
          <div>
            <div style={sectionTitleStyle}>Tips for better focus</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
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
                <em>&quot;In…&quot;</em> on the inhale and{" "}
                <em>&quot;Out…&quot;</em> on the exhale together with the
                numbers.
              </li>
              <li>
                Great as a quick mini-break during stressful study or work
                periods (1–3 minutes is enough).
              </li>
            </ul>
          </div>

          {/* Section: When can it help? */}
          <div>
            <div style={sectionTitleStyle}>When can it help?</div>
          </div>
          <div style={textCardStyle}>
            <p style={{ marginTop: 0 }}>
              Counting breaths is especially useful when your thoughts feel
              busy, loud, or stuck on the same loop:
            </p>
            <ul style={tipsListStyle}>
              <li>
                During study breaks to reset your focus instead of scrolling.
              </li>
              <li>
                When you notice you’re replaying a conversation or worrying
                about &quot;what if&quot; scenarios.
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

          {/* YouTube video */}
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

          {/* Practice section */}
          <div ref={practiceRef}>
            <div style={practiceCardStyle}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Try it now (5–10 rounds)
              </div>
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Sit comfortably, breathe quietly through your nose, and use the
                counting as your anchor:
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

export default CountingBreathsPage;
