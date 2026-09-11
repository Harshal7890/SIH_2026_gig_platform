import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import FederationOnboarding from "./components/FederationOnboarding";
import FederationDashboard from "./components/FederationDashboard";
import { Building2, Server, AlertTriangle, RefreshCw, Plus } from "lucide-react";

export default function App() {
  const [cooperatives, setCooperatives] = useState([]);
  const [selectedCoopId, setSelectedCoopId] = useState(null);
  const [viewMode, setViewMode] = useState("DASHBOARD"); // DASHBOARD | ONBOARDING
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState("checking"); // checking | online | offline
  const [errorMsg, setErrorMsg] = useState("");

  // Check health and fetch all cooperatives from MongoDB backend
  const fetchCooperatives = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Health check
      const healthRes = await fetch("http://localhost:8000/health").catch(() => null);
      if (!healthRes || !healthRes.ok) {
        setBackendStatus("offline");
        throw new Error("Express backend is not running on http://localhost:8000. Please start the server using 'npm run dev' inside backend/.");
      }
      setBackendStatus("online");

      // 2. Fetch cooperatives
      const res = await fetch("http://localhost:8000/cooperative");
      const data = await res.json();

      if (res.ok && data.success && data.cooperatives?.length > 0) {
        setCooperatives(data.cooperatives);
        // Default to first coop if none selected or invalid
        if (!selectedCoopId || !data.cooperatives.find(c => c._id === selectedCoopId)) {
          setSelectedCoopId(data.cooperatives[0]._id);
        }
      } else {
        setCooperatives([]);
        // If no cooperatives exist in DB, default to Onboarding mode
        setViewMode("ONBOARDING");
      }
    } catch (err) {
      console.error("Error connecting to backend:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooperatives();
  }, []);

  const selectedCooperative = cooperatives.find((c) => c._id === selectedCoopId);

  const handleOnboardingComplete = (newCooperative) => {
    fetchCooperatives();
    if (newCooperative && newCooperative._id) {
      setSelectedCoopId(newCooperative._id);
    }
    setViewMode("DASHBOARD");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      
      {/* Navigation Header */}
      <Navbar
        cooperatives={cooperatives}
        selectedCoopId={selectedCoopId}
        onSelectCoop={(id) => {
          setSelectedCoopId(id);
          setViewMode("DASHBOARD");
        }}
        onStartOnboarding={() => setViewMode("ONBOARDING")}
        onRefresh={fetchCooperatives}
        loading={loading}
      />

      {/* Main Content Area */}
      <main>
        
        {/* Offline / Connection Warning */}
        {backendStatus === "offline" && (
          <div
            className="animate-fade-in"
            style={{
              maxWidth: "1000px",
              margin: "0 auto 32px auto",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 28px",
              color: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <AlertTriangle size={26} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: "1rem", color: "#ffffff" }}>Backend Server Offline</strong>
                <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>
                  Could not reach Express server on <code>http://localhost:8000</code>. Run <code>npm run dev</code> inside <code>backend/</code>.
                </div>
              </div>
            </div>
            <button onClick={fetchCooperatives} className="btn btn-secondary" style={{ fontSize: "0.85rem", borderColor: "rgba(245, 158, 11, 0.4)" }}>
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        )}

        {/* View Mode Switching */}
        {viewMode === "ONBOARDING" ? (
          <FederationOnboarding
            onComplete={handleOnboardingComplete}
            onCancel={cooperatives.length > 0 ? () => setViewMode("DASHBOARD") : null}
          />
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
            <Building2 size={44} className="spin" style={{ marginBottom: "16px", color: "var(--primary)" }} />
            <h3 style={{ color: "#ffffff", fontWeight: 700 }}>Connecting to MongoDB & Loading Federations...</h3>
          </div>
        ) : selectedCooperative ? (
          <FederationDashboard
            cooperative={selectedCooperative}
            onRefreshCoops={fetchCooperatives}
            onStartNewOnboarding={() => setViewMode("ONBOARDING")}
          />
        ) : (
          <div className="glass-card" style={{ maxWidth: "600px", margin: "40px auto", padding: "48px", textAlign: "center" }}>
            <Building2 size={48} color="var(--primary)" style={{ marginBottom: "16px" }} />
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ffffff" }}>No Federation Selected</h2>
            <p style={{ color: "var(--text-muted)", margin: "12px 0 24px 0", fontSize: "0.92rem" }}>
              Get started by establishing a new Federation & Cooperative.
            </p>
            <button onClick={() => setViewMode("ONBOARDING")} className="btn btn-primary">
              <Plus size={18} /> Establish New Federation
            </button>
          </div>
        )}
      </main>

    </div>
  );
}
