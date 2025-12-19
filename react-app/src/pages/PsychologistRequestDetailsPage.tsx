import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const API_BASE = "http://localhost:8000";

type Appointment = {
  appointment_id: string;
  client_user_id: string;
  psychologist_user_id: string;
  intake_id?: string | null;
  start_at: string;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
};

const PsychologistRequestDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  const [item, setItem] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState("");

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

  const label: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    color: "#3565AF",
    marginBottom: 6,
  };

  const rowBox: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(53,101,175,0.12)",
  };

  const btn: React.CSSProperties = {
    marginTop: 12,
    width: "100%",
    border: "none",
    borderRadius: 12,
    padding: "10px 12px",
    cursor: "pointer",
    backgroundColor: "#2a5f97",
    color: "#f5e9d9",
    fontWeight: 900,
    fontSize: 14,
    boxShadow: "0 10px 20px rgba(0,0,0,0.14)",
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 12,
  };

  const approveBtn: React.CSSProperties = {
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

  const rejectBtn: React.CSSProperties = {
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

  useEffect(() => {
    const run = async () => {
      if (!appointmentId) {
        setErr("Missing appointment id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErr(null);

        const token = localStorage.getItem("access_token");
        if (!token) return navigate("/login", { replace: true });

        // NOTE: this loads all, then finds one (ok for now)
        const res = await fetch(`${API_BASE}/appointments/psy`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Failed to load.");
        }

        const data = await res.json();
        const found = Array.isArray(data)
          ? (data as Appointment[]).find((x) => x.appointment_id === appointmentId)
          : null;

        if (!found) throw new Error("Request not found");
        setItem(found);
        setNote(found.notes || "");
      } catch (e: any) {
        setErr(e?.message || "Failed to load request");
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [appointmentId, navigate]);

  const updateStatus = async (status: "approved" | "rejected") => {
    if (!item) return;

    try {
      setSaving(true);
      setErr(null);

      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/login", { replace: true });

      const res = await fetch(
        `${API_BASE}/appointments/${item.appointment_id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            notes: note.trim() ? note.trim() : null,
          }),
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to update status.");
      }

      // ✅ after success: go back to list and remove this request
      navigate("/psy/requests", {
        replace: true,
        state: { removeId: item.appointment_id, movedTo: status },
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to update status.");
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
              onClick={() => navigate("/psy/requests")}
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
              onClick={() => navigate("/psy/profile")}
            >
              👤
            </button>
          </div>

          <div style={pageTitle}>Request Details</div>
        </div>

        <div style={contentStyle}>
          {loading ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>Loading...</div>
          ) : err ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>{err}</div>
          ) : !item ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>Not found.</div>
          ) : (
            <div style={card}>
              <div style={label}>Requested Time</div>
              <div style={rowBox}>{item.start_at}</div>

              <div style={{ ...label, marginTop: 12 }}>Status</div>
              <div style={rowBox}>{item.status}</div>

              <div style={{ ...label, marginTop: 12 }}>Intake</div>
              <div style={rowBox}>{item.intake_id ? "Available" : "Missing"}</div>

              {item.intake_id ? (
                <button
                  type="button"
                  style={btn}
                  onClick={() => navigate(`/psy/intakes/${item.intake_id}`)}
                >
                  View Intake Answers
                </button>
              ) : null}

              <div style={{ ...label, marginTop: 12 }}>Notes (optional)</div>
              <div style={rowBox}>
                <textarea
                  style={{
                    width: "100%",
                    minHeight: 70,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    resize: "vertical",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a message to the client..."
                />
              </div>

              <div style={btnRow}>
                <button
                  type="button"
                  style={rejectBtn}
                  onClick={() => updateStatus("rejected")}
                  disabled={saving}
                >
                  {saving ? "..." : "Reject"}
                </button>

                <button
                  type="button"
                  style={approveBtn}
                  onClick={() => updateStatus("approved")}
                  disabled={saving}
                >
                  {saving ? "..." : "Approve"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologistRequestDetailsPage;
