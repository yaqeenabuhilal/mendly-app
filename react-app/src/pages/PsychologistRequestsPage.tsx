// react-app/src/pages/PsychologistRequestsPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mendly-logo.jpg";

const API_BASE = "http://localhost:8000";

type Appointment = {
  appointment_id: string;
  client_user_id: string;
  client_username?: string | null;   
  client_email?: string | null; 
  psychologist_user_id: string;
  intake_id?: string | null;
  start_at: string;
  status: string;
  notes?: string | null;
  created_at: string;
    updated_at?: string | null;       

};

const PsychologistRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const BLUE = "#6BA7E6";
  const CREAM = "#f5e9d9";

  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  const metaStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 900,
    color: "#3565AF",
  };

  const btn: React.CSSProperties = {
    marginTop: 10,
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

  const rowBtns: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 10,
  };

  const approveBtn: React.CSSProperties = { ...btn, marginTop: 0, backgroundColor: "#1f7a4a" };
  const rejectBtn: React.CSSProperties = { ...btn, marginTop: 0, backgroundColor: "#b42318" };

  const updateStatus = async (
    appointmentId: string,
    status: "approved" | "rejected",
    notes?: string | null
  ) => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/login", { replace: true });

    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, notes: notes ?? null }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || "Failed to update appointment status.");
    }

    setItems((prev) => prev.filter((x) => x.appointment_id !== appointmentId));
  };

  const openEmailDraft = (toEmail: string, subject: string, body: string) => {
    const url =
      `mailto:${encodeURIComponent(toEmail)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr(null);

        const token = localStorage.getItem("access_token");
        if (!token) return navigate("/login", { replace: true });

        const res = await fetch(
          `${API_BASE}/appointments/psy?status_filter=requested`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Failed to load requests.");
        }

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load requests.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate]);

  return (
    <div style={screenStyle}>
      <div style={phoneStyle}>
        <div style={headerWrap}>
          <div style={headerRow}>
            <button
              type="button"
              style={{ ...roundBtn, left: 0 }}
              onClick={() => navigate("/psy/profile")}
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
          <div style={pageTitle}>Appointment Requests</div>
        </div>

        <div style={contentStyle}>
          {loading ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>Loading...</div>
          ) : err ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>{err}</div>
          ) : items.length === 0 ? (
            <div style={{ color: CREAM, fontWeight: 900 }}>No requests.</div>
          ) : (
            items.map((a) => (
              <div key={a.appointment_id} style={card}>
                <div style={{ fontWeight: 900, color: "#1f2937" }}>
                  Requested time: {new Date(a.start_at).toLocaleString()}
                </div>

                <div style={{ fontWeight: 900, color: "#1f2937" }}>
                  Client: {a.client_username || "Unknown"}
                </div>

                {a.client_email ? (
                  <div style={metaStyle}>Email: {a.client_email}</div>
                ) : null}


                <div style={metaStyle}>Status: {a.status}</div>
                <div style={metaStyle}>
                  Intake: {a.intake_id ? "available" : "missing"}
                </div>

                <button
                  type="button"
                  style={btn}
                  onClick={() => navigate(`/psy/requests/${a.appointment_id}`)}
                >
                  View Intake (details)
                </button>

                <div style={rowBtns}>
                  <button
                    type="button"
                    style={approveBtn}
                    onClick={async () => {
                      try {
                        await updateStatus(a.appointment_id, "approved");
                      } catch (e: any) {
                        setErr(e?.message || "Approve failed.");
                      }
                    }}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    style={rejectBtn}
                    onClick={async () => {
                      try {
                        await updateStatus(a.appointment_id, "rejected");
                      } catch (e: any) {
                        setErr(e?.message || "Reject failed.");
                      }
                    }}
                  >
                    Reject
                  </button>
                </div>

                {/* <button
                  type="button"
                  style={btn}
                  onClick={() =>
                    openEmailDraft(
                      "client@example.com",
                      "Mendly appointment update",
                      `Your appointment request (${a.start_at}) was updated.`
                    )
                  }
                >
                  Send email
                </button> */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologistRequestsPage;
