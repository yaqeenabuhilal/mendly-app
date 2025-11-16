// react-app/src/pages/MoodAnalyzePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";
import { getMoodSeries, type SeriesPoint } from "../api/auth";

const MoodAnalyzePage: React.FC = () => {
  const navigate = useNavigate();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  // -------- layout --------
  const screen: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: BLUE,
    fontFamily:
      '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const phone: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: 450,
    margin: "0 auto",
    backgroundColor: BLUE,
    borderRadius: 0, // ⬅️ rectangle
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const top: React.CSSProperties = {
    backgroundColor: CREAM,
    paddingTop: 20,
    paddingBottom: 16,
    paddingInline: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height:40 // ⬅️ no rounded corners
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
  const homeBtn: React.CSSProperties = { ...iconBtn, left: 12 };
  const logoutBtn: React.CSSProperties = { ...iconBtn, right: 12 };

  const titleBlock: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    alignItems: "center",
  };
  const smallLabel: React.CSSProperties = {
    color: "#5F8DD0",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };
  const tinyLogo: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: CREAM,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const tinyLogoImg: React.CSSProperties = {
    width: "130%",
    height: "130%",
    objectFit: "cover",
  };
  const headerTitle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Georgia, serif',
    fontSize: 22,
    color: "#5F8DD0",
  };

  // BODY
  const body: React.CSSProperties = {
    flex: 1,
    padding: "14px 12px 16px 12px", // ⬅️ smaller bottom padding
    background: BLUE,
    color: "white",
    overflowY: "auto",
  };
  const inner: React.CSSProperties = {
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  };

  const card: React.CSSProperties = {
    width: "93%",
    backgroundColor: CREAM,
    borderRadius: 20,
    padding: "16px 14px",
    color: "#374151",
    boxShadow: "0 10px 25px rgba(15,23,42,0.18)",
  };

  const h1: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 800,
    color: "#1F2933",
    marginBottom: 8,
  };
  const sub: React.CSSProperties = {
    fontSize: 12,
    color: "#516686",
    marginBottom: 10,
  };
  const p: React.CSSProperties = {
    fontSize: 14,
    lineHeight: 1.55,
    marginBottom: 6,
  };

  const bullets: React.CSSProperties = {
    marginTop: 6,
    paddingLeft: 18,
    fontSize: 14,
    lineHeight: 1.5,
  };

  const ctaWrap: React.CSSProperties = {
    marginTop: 6,
    display: "flex",
    justifyContent: "center",
  };
  const ctaBtn: React.CSSProperties = {
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    backgroundColor: "#3970aa",
    color: CREAM,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
  };

  // bottom nav (rectangle)
  const bottomNav: React.CSSProperties = {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 0,
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
    boxShadow: "0 -2px 10px rgba(15,23,42,0.15)",
    height:50
  };
  const navItem: React.CSSProperties = {
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

  // -------- data / helpers --------
  const [s1, setS1] = useState<SeriesPoint[] | null>(null);
  const [s7, setS7] = useState<SeriesPoint[] | null>(null);
  const [s14, setS14] = useState<SeriesPoint[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const [a, b, c] = await Promise.all([
          getMoodSeries(1),
          getMoodSeries(7),
          getMoodSeries(14),
        ]);
        setS1(sortAsc(a));
        setS7(sortAsc(b));
        setS14(sortAsc(c));
      } catch (e: any) {
        setErr(e?.message || "Failed to load analysis");
      }
    })();
  }, []);

  function sortAsc(arr: SeriesPoint[]) {
    return [...arr].sort((x, y) =>
      x.date < y.date ? -1 : x.date > y.date ? 1 : 0
    );
  }
  function prettyDayUTC(iso: string) {
    return new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }
  function rangeLabel(series: SeriesPoint[] | null) {
    if (!series || !series.length) return "—";
    return `${prettyDayUTC(series[0].date)} — ${prettyDayUTC(
      series[series.length - 1].date
    )}`;
  }
  function avg(series: SeriesPoint[] | null) {
    if (!series || !series.length) return null;
    const nums = series
      .map((p) => p.avg_score)
      .filter((n) => typeof n === "number") as number[];
    if (!nums.length) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }
  function minMax(series: SeriesPoint[] | null) {
    if (!series || !series.length) return null;
    const pairs = series
      .filter((p) => typeof p.avg_score === "number")
      .map((p) => ({ date: p.date, v: p.avg_score as number }));
    if (!pairs.length) return null;
    let mn = pairs[0],
      mx = pairs[0];
    for (const row of pairs) {
      if (row.v < mn.v) mn = row;
      if (row.v > mx.v) mx = row;
    }
    return { min: mn, max: mx };
  }
  function trend(series: SeriesPoint[] | null) {
    if (!series || !series.length) return null;
    const vals = series.filter(
      (p) => typeof p.avg_score === "number"
    ) as { date: string; avg_score: number }[];
    if (vals.length < 2) return null;
    const first = vals[0].avg_score;
    const last = vals[vals.length - 1].avg_score;
    const diff = last - first;
    return { diff, first, last };
  }

  const a1 = useMemo(() => ({ avg: avg(s1) }), [s1]);
  const a7 = useMemo(
    () => ({ avg: avg(s7), mm: minMax(s7), tr: trend(s7), range: rangeLabel(s7) }),
    [s7]
  );
  const a14 = useMemo(
    () => ({
      avg: avg(s14),
      mm: minMax(s14),
      tr: trend(s14),
      range: rangeLabel(s14),
    }),
    [s14]
  );

  return (
    <div style={screen}>
      <div style={phone}>
        {/* HEADER */}
        <div style={top}>
          <button
            type="button"
            style={homeBtn}
            onClick={() => navigate("/journey")}
            aria-label="Home"
            title="Home"
          >
            🏠
          </button>

          <div style={titleBlock}>
            <div style={smallLabel}>
              <span style={tinyLogo}>
                <img src={logo} alt="Mendly logo" style={tinyLogoImg} />
              </span>
              Mendly App
            </div>
            <span style={headerTitle}>Analyze</span>
          </div>

          <button
            type="button"
            style={logoutBtn}
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

        {/* BODY */}
        <div style={body}>
          <div style={inner}>
            {err && (
              <div
                style={{
                  background: "#8b2b2b",
                  color: "#fde2e1",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                {err}
              </div>
            )}

            {/* Box 1: Today */}
            <div style={card}>
              <div style={h1}>Today’s Mood</div>
              <div style={sub}>
                {s1 && s1.length ? prettyDayUTC(s1[0].date) : "—"}
              </div>
              <p style={p}>
                Your average mood today is{" "}
                <strong>
                  {a1.avg != null ? a1.avg.toFixed(1) : "—"}/10
                </strong>
                . A single day can swing, so use it as a quick pulse—consistency
                over the week matters more.
              </p>
              <ul style={bullets}>
                <li>
                  If today &lt; 4, do one tiny win (5-min walk/breath) and plan
                  a calm evening.
                </li>
                <li>
                  If 7+, note what helped (sleep, social time, training) and
                  repeat it.
                </li>
              </ul>
            </div>

            {/* Box 2: Last 7 days */}
            <div style={card}>
              <div style={h1}>Last 7 Days</div>
              <div style={sub}>{a7.range}</div>
              <p style={p}>
                7-day average:{" "}
                <strong>
                  {a7.avg != null ? a7.avg.toFixed(1) : "—"}/10
                </strong>
                {a7.tr
                  ? ` • trend: ${
                      a7.tr.diff > 0 ? "up" : a7.tr.diff < 0 ? "down" : "flat"
                    } (${a7.tr.first.toFixed(1)} → ${a7.tr.last.toFixed(1)})`
                  : ""}
                .
              </p>
              {a7.mm && (
                <p style={p}>
                  Best: <strong>{prettyDayUTC(a7.mm.max.date)}</strong> (
                  {a7.mm.max.v.toFixed(1)}) • Lowest:{" "}
                  <strong>{prettyDayUTC(a7.mm.min.date)}</strong> (
                  {a7.mm.min.v.toFixed(1)}).
                </p>
              )}
              <ul style={bullets}>
                <li>
                  Watch for 2–3 “low” days clustering—check load, sleep, and
                  stress.
                </li>
                <li>Use labels (e.g., “stressed”, “calm”) to spot triggers.</li>
              </ul>
            </div>

            {/* Box 3: Last 14 days */}
            <div style={card}>
              <div style={h1}>Last 14 Days</div>
              <div style={sub}>{a14.range}</div>
              <p style={p}>
                14-day average:{" "}
                <strong>
                  {a14.avg != null ? a14.avg.toFixed(1) : "—"}/10
                </strong>
                {a14.tr
                  ? ` • trend: ${
                      a14.tr.diff > 0 ? "up" : a14.tr.diff < 0 ? "down" : "flat"
                    } (${a14.tr.first.toFixed(1)} → ${a14.tr.last.toFixed(1)})`
                  : ""}
                .
              </p>
              {a14.mm && (
                <p style={p}>
                  Highest: <strong>{prettyDayUTC(a14.mm.max.date)}</strong> (
                  {a14.mm.max.v.toFixed(1)}) • Lowest:{" "}
                  <strong>{prettyDayUTC(a14.mm.min.date)}</strong> (
                  {a14.mm.min.v.toFixed(1)}).
                </p>
              )}
              <ul style={bullets}>
                <li>
                  Compare weekdays vs. weekends—do routines shift mood?
                </li>
                <li>
                  If 3+ days &lt; 4, reduce training load and prioritize sleep &
                  protein.
                </li>
              </ul>
            </div>

            {/* Back to Mood Track */}
            <div style={ctaWrap}>
              <button
                type="button"
                style={ctaBtn}
                onClick={() => navigate("/mood-track")}
              >
                Go back to Mood Track page
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div style={bottomNav}>
          <button
            type="button"
            style={navItem}
            onClick={() => navigate("/profile")}
            aria-label="Profile"
          >
            <div style={{ fontSize: 22 }}>👤</div>
            <div>Profile</div>
          </button>

          <button
            type="button"
            style={navItem}
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

export default MoodAnalyzePage;
