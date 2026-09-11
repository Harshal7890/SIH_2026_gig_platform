import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  Eye,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Phone,
  Mail,
  Award,
  Star,
  RefreshCw,
  Search,
  Plus,
  UserPlus
} from "lucide-react";

export default function FederationDashboard({ cooperative, onRefreshCoops, onStartNewOnboarding }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview | workers | verification | workerView
  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: cooperative?.name || "",
    registrationNumber: cooperative?.registrationNumber || "",
    city: cooperative?.address?.city || "",
    state: cooperative?.address?.state || "",
    pinCode: cooperative?.address?.pinCode || ""
  });

  // Add Worker State
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [submittingWorker, setSubmittingWorker] = useState(false);
  const [workerFormData, setWorkerFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "Password123!",
    skills: "Plumbing, Electrical",
    experience: 3,
    certifications: "ITI Plumbing",
    address: cooperative?.address?.city || "",
    verification: "verified"
  });

  const userId = cooperative?.userId?._id || cooperative?.userId;

  const fetchWorkers = async () => {
    if (!userId) return;
    setLoadingWorkers(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:8000/worker", {
        headers: {
          "user-id": typeof userId === "object" ? userId._id : userId
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setWorkers(data.workers || []);
      } else {
        setWorkers([]);
      }
    } catch (err) {
      console.error("Error fetching workers:", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    if (cooperative) {
      setEditFormData({
        name: cooperative.name || "",
        registrationNumber: cooperative.registrationNumber || "",
        city: cooperative.address?.city || "",
        state: cooperative.address?.state || "",
        pinCode: cooperative.address?.pinCode || ""
      });
      setWorkerFormData((prev) => ({
        ...prev,
        address: `${cooperative.address?.city || ""}, ${cooperative.address?.state || ""}`
      }));
    }
  }, [cooperative]);

  const handleUpdateStatus = async (workerId, newStatus) => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`http://localhost:8000/worker/${workerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "user-id": typeof userId === "object" ? userId._id : userId
        },
        body: JSON.stringify({ verification: newStatus })
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update status");
      }

      setSuccessMsg(`Worker status updated to '${newStatus}'`);
      fetchWorkers();
    } catch (err) {
      setErrorMsg(err.message || "Failed to update worker verification status.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        name: editFormData.name,
        registrationNumber: editFormData.registrationNumber,
        address: {
          city: editFormData.city,
          state: editFormData.state,
          pinCode: editFormData.pinCode
        }
      };

      const response = await fetch("http://localhost:8000/cooperative/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": typeof userId === "object" ? userId._id : userId
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccessMsg("Federation profile updated successfully!");
      setIsEditing(false);
      if (onRefreshCoops) onRefreshCoops();
    } catch (err) {
      setErrorMsg(err.message || "Error updating federation profile.");
    }
  };

  const handleAddWorkerSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmittingWorker(true);

    try {
      const skillsArray = workerFormData.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const certsArray = workerFormData.certifications.split(",").map((c) => c.trim()).filter(Boolean);

      const payload = {
        name: workerFormData.name,
        email: workerFormData.email,
        mobileNumber: workerFormData.mobileNumber,
        password: workerFormData.password,
        cooperativeId: cooperative._id,
        skills: skillsArray,
        experience: Number(workerFormData.experience) || 0,
        certifications: certsArray,
        address: workerFormData.address,
        verification: workerFormData.verification
      };

      const response = await fetch("http://localhost:8000/worker/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to register worker");
      }

      setSuccessMsg(`Worker '${workerFormData.name}' registered & added to ${cooperative.name} successfully!`);
      setIsAddingWorker(false);
      setWorkerFormData({
        name: "",
        email: "",
        mobileNumber: "",
        password: "Password123!",
        skills: "Plumbing, Electrical",
        experience: 3,
        certifications: "ITI Plumbing",
        address: `${cooperative.address?.city || ""}, ${cooperative.address?.state || ""}`,
        verification: "verified"
      });
      fetchWorkers(); // Refresh live table!
    } catch (err) {
      setErrorMsg(err.message || "Failed to add worker directly.");
    } finally {
      setSubmittingWorker(false);
    }
  };

  const totalWorkers = workers.length;
  const verifiedWorkers = workers.filter((w) => w.verification === "verified").length;
  const pendingWorkers = workers.filter((w) => w.verification === "pending").length;

  const filteredWorkers = workers.filter((w) => {
    const name = w.userId?.name?.toLowerCase() || "";
    const email = w.userId?.email?.toLowerCase() || "";
    const skills = w.skills?.join(" ")?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || skills.includes(query);
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px 64px 16px" }}>
      
      {/* Alerts */}
      {successMsg && (
        <div
          className="animate-fade-in"
          style={{
            background: "var(--emerald-bg)",
            border: "1px solid var(--emerald-border)",
            borderRadius: "var(--radius-md)",
            padding: "12px 20px",
            marginBottom: "20px",
            color: "var(--emerald-text)",
            fontSize: "0.88rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={17} /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg("")} style={{ background: "none", border: "none", color: "var(--emerald-text)", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            background: "var(--rose-bg)",
            border: "1px solid var(--rose-border)",
            borderRadius: "var(--radius-md)",
            padding: "12px 20px",
            marginBottom: "20px",
            color: "var(--rose-text)",
            fontSize: "0.88rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>{errorMsg}</div>
          <button onClick={() => setErrorMsg("")} style={{ background: "none", border: "none", color: "var(--rose-text)", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Minimal Header Card */}
      <div className="glass-card" style={{ padding: "28px 32px", marginBottom: "24px", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          
          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-color-hover)",
                flexShrink: 0
              }}
            >
              <Building2 size={28} color="var(--primary)" />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>
                  {cooperative?.name}
                </h1>
                <span className="badge badge-primary">
                  {cooperative?.registrationNumber}
                </span>
                <span className="badge badge-emerald">
                  <ShieldCheck size={13} /> Verified Federation
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px", flexWrap: "wrap", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={14} color="var(--primary)" /> {cooperative?.address?.city}, {cooperative?.address?.state} - {cooperative?.address?.pinCode}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Mail size={14} color="var(--primary)" /> {cooperative?.userId?.email || "coop@federation.org"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Phone size={14} color="var(--primary)" /> {cooperative?.userId?.mobileNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setIsAddingWorker(!isAddingWorker);
                setIsEditing(false);
              }}
              className="btn btn-primary"
              style={{ fontSize: "0.85rem", padding: "8px 14px" }}
            >
              <UserPlus size={15} /> {isAddingWorker ? "Close Add Worker" : "+ Add Worker Directly"}
            </button>

            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setIsAddingWorker(false);
              }}
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "8px 14px" }}
            >
              <Edit3 size={14} /> {isEditing ? "Close Edit" : "Edit Details"}
            </button>

            <button
              onClick={onStartNewOnboarding}
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "8px 14px" }}
            >
              <Plus size={14} /> Onboard Another
            </button>
          </div>
        </div>

        {/* Minimal Top Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginTop: "24px" }}>
          
          <div className="glass-card" style={{ padding: "16px 20px", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Total Workers</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={16} color="var(--primary)" />
              </div>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>
              {totalWorkers}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>Affiliated Members</div>
          </div>

          <div className="glass-card" style={{ padding: "16px 20px", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Active Verified</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--emerald-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={16} color="var(--emerald-text)" />
              </div>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>
              {verifiedWorkers}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--emerald-text)", marginTop: "2px" }}>Verified Credentials</div>
          </div>

          <div className="glass-card" style={{ padding: "16px 20px", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Pending Approvals</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--amber-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={16} color="var(--amber-text)" />
              </div>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>
              {pendingWorkers}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--amber-text)", marginTop: "2px" }}>Requires Review</div>
          </div>

          <div className="glass-card" style={{ padding: "16px 20px", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Trust Score</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--purple-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={16} color="var(--purple-text)" />
              </div>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>
              4.9 / 5
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>High Satisfaction</div>
          </div>

        </div>
      </div>

      {/* Drawer Add Worker Form */}
      {isAddingWorker && (
        <div className="glass-card animate-fade-in" style={{ padding: "24px", marginBottom: "24px", background: "#ffffff", border: "1px solid var(--primary)" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <UserPlus size={18} /> Register & Add Worker Directly to {cooperative?.name}
          </h3>
          <form onSubmit={handleAddWorkerSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            
            <div className="input-group">
              <label className="input-label">Worker Full Name <span className="req">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={workerFormData.name}
                onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address <span className="req">*</span></label>
              <input
                type="email"
                required
                placeholder="ramesh@gmail.com"
                value={workerFormData.email}
                onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mobile Number <span className="req">*</span></label>
              <input
                type="text"
                required
                placeholder="9876543210"
                value={workerFormData.mobileNumber}
                onChange={(e) => setWorkerFormData({ ...workerFormData, mobileNumber: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Skills (Comma-separated)</label>
              <input
                type="text"
                placeholder="Plumbing, Pipe Fitting, Electrical"
                value={workerFormData.skills}
                onChange={(e) => setWorkerFormData({ ...workerFormData, skills: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Years of Experience</label>
              <input
                type="number"
                min="0"
                placeholder="5"
                value={workerFormData.experience}
                onChange={(e) => setWorkerFormData({ ...workerFormData, experience: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Certifications (Comma-separated)</label>
              <input
                type="text"
                placeholder="ITI Certified, Safety Standard"
                value={workerFormData.certifications}
                onChange={(e) => setWorkerFormData({ ...workerFormData, certifications: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Address / Location</label>
              <input
                type="text"
                placeholder="Kolhapur, Maharashtra"
                value={workerFormData.address}
                onChange={(e) => setWorkerFormData({ ...workerFormData, address: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Default Password</label>
              <input
                type="password"
                value={workerFormData.password}
                onChange={(e) => setWorkerFormData({ ...workerFormData, password: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Initial Verification Status</label>
              <select
                value={workerFormData.verification}
                onChange={(e) => setWorkerFormData({ ...workerFormData, verification: e.target.value })}
                className="custom-select"
              >
                <option value="verified">Verified (Approved Immediately)</option>
                <option value="pending">Pending (Move to Verification Inbox)</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsAddingWorker(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={submittingWorker} className="btn btn-primary">
                {submittingWorker ? "Registering Worker..." : "Add Worker Live"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drawer Edit Profile Form */}
      {isEditing && (
        <div className="glass-card animate-fade-in" style={{ padding: "24px", marginBottom: "24px", background: "#ffffff", border: "1px solid var(--primary)" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Edit3 size={16} /> Edit Federation Mandatory Details
          </h3>
          <form onSubmit={handleSaveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div className="input-group" style={{ gridColumn: "1 / 3" }}>
              <label className="input-label">Federation Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="custom-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Registration Number</label>
              <input
                type="text"
                value={editFormData.registrationNumber}
                onChange={(e) => setEditFormData({ ...editFormData, registrationNumber: e.target.value })}
                className="custom-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">City</label>
              <input
                type="text"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                className="custom-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">State</label>
              <input
                type="text"
                value={editFormData.state}
                onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                className="custom-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Pin Code</label>
              <input
                type="text"
                value={editFormData.pinCode}
                onChange={(e) => setEditFormData({ ...editFormData, pinCode: e.target.value })}
                className="custom-input"
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs Pill Bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { id: "overview", label: "Mandatory Overview", icon: Building2 },
          { id: "workers", label: `Affiliated Workers (${totalWorkers})`, icon: Users },
          { id: "verification", label: `Verification Inbox (${pendingWorkers})`, icon: ShieldCheck, badge: pendingWorkers > 0 ? pendingWorkers : null },
          { id: "workerView", label: "Worker-Facing Preview", icon: Eye }
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn"
              style={{
                fontSize: "0.86rem",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                background: isActive ? "var(--primary-light)" : "#ffffff",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                border: isActive ? "1px solid var(--border-color-hover)" : "1px solid var(--border-color)",
                fontWeight: isActive ? 700 : 500
              }}
            >
              <IconComponent size={15} />
              {tab.label}
              {tab.badge && (
                <span
                  style={{
                    background: "var(--amber-bg)",
                    color: "var(--amber-text)",
                    border: "1px solid var(--amber-border)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    borderRadius: "999px",
                    padding: "1px 6px",
                    marginLeft: "4px"
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          
          <div className="glass-card" style={{ padding: "24px", background: "#ffffff" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "18px", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} color="var(--primary)" /> Mandatory Federation Registration Record
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              
              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Legal Federation Name</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>{cooperative?.name}</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Registration Number</div>
                <div style={{ marginTop: "2px" }}>
                  <span className="badge badge-primary">{cooperative?.registrationNumber}</span>
                </div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Jurisdiction City</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)", marginTop: "2px" }}>{cooperative?.address?.city}</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>State & Pin Code</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)", marginTop: "2px" }}>{cooperative?.address?.state} ({cooperative?.address?.pinCode})</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Admin User Account ID & Role</div>
                <div style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "var(--primary)", marginTop: "2px" }}>
                  User Object ID: {typeof cooperative?.userId === "object" ? cooperative?.userId?._id : cooperative?.userId} | Role: Cooperative Admin
                </div>
              </div>

            </div>

            <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "10px" }}>
                Statutory Compliance & Worker Protection Status
              </h4>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <span className="badge badge-emerald">✓ Registered under State Cooperative Act</span>
                <span className="badge badge-emerald">✓ Worker Guild Identity Verified</span>
                <span className="badge badge-primary">✓ Live Skill Verification Active</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="glass-card" style={{ padding: "20px", background: "#ffffff" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={16} color="var(--primary)" /> Worker Trust Criteria
              </h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Workers searching for cooperatives look for clear mandatory details including <strong>Registration #</strong>, <strong>Physical City Address</strong>, and <strong>Active Worker Count</strong>.
              </p>
              <div style={{ marginTop: "14px", fontSize: "0.8rem", color: "var(--emerald-text)", background: "var(--emerald-bg)", padding: "8px 12px", borderRadius: "var(--radius-md)" }}>
                ✓ This Federation meets all mandatory display criteria.
              </div>
            </div>

            <div className="glass-card" style={{ padding: "20px", background: "#ffffff" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="var(--primary)" /> Database Audit Log
              </h4>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div>Created At: {new Date(cooperative?.createdAt).toLocaleString()}</div>
                <div>Updated At: {new Date(cooperative?.updatedAt).toLocaleString()}</div>
                <div>Doc ID: <span style={{ fontFamily: "monospace", color: "var(--text-dim)" }}>{cooperative?._id}</span></div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: WORKERS DIRECTORY */}
      {activeTab === "workers" && (
        <div className="animate-fade-in">
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ position: "relative", minWidth: "280px" }}>
              <Search size={15} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search workers by name, skill, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="custom-input"
                style={{ paddingLeft: "36px", fontSize: "0.86rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setIsAddingWorker(true)}
                className="btn btn-primary"
                style={{ fontSize: "0.85rem", padding: "7px 14px" }}
              >
                <UserPlus size={14} /> + Add Worker
              </button>

              <button onClick={fetchWorkers} className="btn btn-secondary" style={{ fontSize: "0.85rem", padding: "7px 14px" }}>
                <RefreshCw size={13} className={loadingWorkers ? "spin" : ""} /> Refresh List
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ overflow: "hidden", background: "#ffffff" }}>
            {loadingWorkers ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Loading workers from MongoDB...
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <Users size={36} color="var(--text-dim)" style={{ marginBottom: "10px" }} />
                <h4 style={{ fontSize: "1rem", color: "var(--text-main)", fontWeight: 700 }}>No Workers Found</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 16px 0" }}>
                  {workers.length === 0
                    ? "No workers are currently registered under this federation in MongoDB."
                    : "No workers matched your search query."}
                </p>
                <button onClick={() => setIsAddingWorker(true)} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                  <UserPlus size={14} /> Add Worker Directly Now
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ background: "#f5f7f4", borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                      <th style={{ padding: "14px 18px" }}>Worker Name & Contact</th>
                      <th style={{ padding: "14px 18px" }}>Skills & Certifications</th>
                      <th style={{ padding: "14px 18px" }}>Experience</th>
                      <th style={{ padding: "14px 18px" }}>Location</th>
                      <th style={{ padding: "14px 18px" }}>Verification</th>
                      <th style={{ padding: "14px 18px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map((worker) => (
                      <tr key={worker._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.92rem" }}>
                            {worker.userId?.name || "Unnamed Worker"}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {worker.userId?.email} | 📞 {worker.userId?.mobileNumber}
                          </div>
                        </td>

                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "4px" }}>
                            {worker.skills?.map((skill, i) => (
                              <span key={i} className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "2px 7px" }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                            📜 {worker.certifications?.join(", ") || "No Certifications"}
                          </div>
                        </td>

                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{worker.experience || 0} Yrs</div>
                          <div style={{ fontSize: "0.74rem", color: "var(--amber-text)", display: "flex", alignItems: "center", gap: "2px" }}>
                            <Star size={11} fill="var(--amber-text)" /> {worker.rating || "0.0"}
                          </div>
                        </td>

                        <td style={{ padding: "14px 18px", color: "var(--text-muted)" }}>
                          {worker.address || "N/A"}
                        </td>

                        <td style={{ padding: "14px 18px" }}>
                          {worker.verification === "verified" ? (
                            <span className="badge badge-emerald"><CheckCircle2 size={11} /> Verified</span>
                          ) : worker.verification === "rejected" ? (
                            <span className="badge badge-rose"><XCircle size={11} /> Rejected</span>
                          ) : (
                            <span className="badge badge-amber"><Clock size={11} /> Pending</span>
                          )}
                        </td>

                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {worker.verification !== "verified" && (
                              <button
                                onClick={() => handleUpdateStatus(worker._id, "verified")}
                                className="btn btn-primary"
                                style={{ padding: "3px 8px", fontSize: "0.74rem" }}
                              >
                                Approve
                              </button>
                            )}
                            {worker.verification !== "rejected" && (
                              <button
                                onClick={() => handleUpdateStatus(worker._id, "rejected")}
                                className="btn btn-secondary"
                                style={{ padding: "3px 8px", fontSize: "0.74rem", color: "var(--rose-text)" }}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION INBOX */}
      {activeTab === "verification" && (
        <div className="animate-fade-in">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} color="var(--amber-text)" /> Pending Worker Verification Inbox
          </h3>

          {pendingWorkers === 0 ? (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center", background: "#ffffff" }}>
              <CheckCircle2 size={40} color="var(--emerald-text)" style={{ marginBottom: "10px" }} />
              <h4 style={{ fontSize: "1.1rem", color: "var(--text-main)", fontWeight: 700 }}>All Applications Verified!</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px" }}>
                There are no pending worker verification requests for {cooperative?.name}.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
              {workers
                .filter((w) => w.verification === "pending")
                .map((worker) => (
                  <div key={worker._id} className="glass-card" style={{ padding: "20px", background: "#ffffff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                          {worker.userId?.name}
                        </h4>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          ✉️ {worker.userId?.email} | 📞 {worker.userId?.mobileNumber}
                        </div>
                      </div>
                      <span className="badge badge-amber"><Clock size={11} /> Pending</span>
                    </div>

                    <div style={{ margin: "14px 0", fontSize: "0.84rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div><strong>Skills:</strong> {worker.skills?.join(", ")}</div>
                      <div><strong>Experience:</strong> {worker.experience} Years</div>
                      <div><strong>Certifications:</strong> {worker.certifications?.join(", ") || "None"}</div>
                      <div><strong>Address:</strong> {worker.address}</div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                      <button
                        onClick={() => handleUpdateStatus(worker._id, "verified")}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: "0.82rem", padding: "8px" }}
                      >
                        <CheckCircle2 size={15} /> Approve Member
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(worker._id, "rejected")}
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: "0.82rem", padding: "8px", color: "var(--rose-text)" }}
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WORKER-FACING PREVIEW */}
      {activeTab === "workerView" && (
        <div className="animate-fade-in">
          <div
            style={{
              background: "var(--primary-light)",
              border: "1px solid var(--border-color-hover)",
              borderRadius: "var(--radius-md)",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--primary)",
              fontSize: "0.86rem"
            }}
          >
            <Eye size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Worker View Mode:</strong> This preview shows how gig workers view this Federation's mandatory details (Name, Registration #, Address, Verification Status) when choosing a cooperative to join.
            </div>
          </div>

          <div
            className="glass-card"
            style={{
              padding: "32px",
              background: "#ffffff",
              border: "1px solid var(--border-color-hover)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "18px", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={24} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-main)" }}>{cooperative?.name}</h2>
                  <div style={{ fontSize: "0.82rem", color: "var(--emerald-text)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <ShieldCheck size={14} /> Official Verified Guild Federation
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                Apply to Join Federation
              </button>
            </div>

            <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "12px" }}>
              MANDATORY FEDERATION SPECIFICATIONS
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Registration Number</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>{cooperative?.registrationNumber}</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Regional Office / City</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>{cooperative?.address?.city}, {cooperative?.address?.state}</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Postal Code</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>{cooperative?.address?.pinCode}</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Active Registered Members</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--emerald-text)", marginTop: "2px" }}>{totalWorkers} Skilled Workers</div>
              </div>
            </div>

            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "10px" }}>
              Federation Member Directory Preview ({workers.length})
            </h4>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {workers.map((w) => (
                <div key={w._id} style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", padding: "8px 14px", borderRadius: "var(--radius-md)", fontSize: "0.82rem" }}>
                  <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{w.userId?.name}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{w.skills?.join(", ")}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
