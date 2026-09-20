"use client";
/**
 * ProfileSettings
 * ---------------
 * Shared account-management component used by:
 *  - the Admin/Operator dashboard "My Profile" tab
 *  - the Customer dashboard "Settings" tab
 *
 * Handles: view/edit name, email, phone + change (or set) password.
 */
import { useEffect, useState } from "react";
import { useAuthApi } from "../hooks";
import type { MyProfile } from "../hooks/useAuthApi";
import { toNigerianDisplayPhoneNumber } from "../utils/phoneValidation";

const dm = "var(--font-dm-sans), sans-serif";
const navy = "#07152f";
const blue = "#003DB4";

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  padding: "1.5rem 1.75rem",
  border: "1px solid #e8edf5",
  fontFamily: dm,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#6c7890",
  margin: "0 0 0.35rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  border: "1px solid #dde8f8",
  borderRadius: 10,
  fontSize: "0.92rem",
  fontFamily: dm,
  color: navy,
  background: "#fff",
  boxSizing: "border-box",
};

function SaveButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        padding: "0.65rem 1.4rem",
        background: blue,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: "0.9rem",
        fontFamily: dm,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Feedback({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <p style={{
      margin: "0.75rem 0 0",
      fontSize: "0.85rem",
      fontWeight: 600,
      color: ok ? "#19a56b" : "#dc2626",
    }}>
      {msg}
    </p>
  );
}

export default function ProfileSettings() {
  const { fetchMe, updateMe, changePassword } = useAuthApi();

  // Profile state
  const [profile, setProfile]   = useState<MyProfile | null>(null);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ msg: string; ok: boolean } | null>(null);

  // Password state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdMsg, setPwdMsg]         = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((me) => {
        if (cancelled || !me) return;
        setProfile(me);
        setName(me.name ?? "");
        setEmail(me.email ?? "");
        setPhone(me.phoneNumber ?? "");
      })
      .catch(() => { /* token invalid → page-level guards handle redirect */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchMe]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setSaving(true);
    try {
      const updated = await updateMe({
        name:        name.trim(),
        email:       email.trim(),
        phoneNumber: phone.trim(),
      });
      setProfile(updated);
      setName(updated.name ?? "");
      setEmail(updated.email ?? "");
      setPhone(updated.phoneNumber ?? "");
      setProfileMsg({ msg: "Profile updated.", ok: true });
    } catch (err) {
      setProfileMsg({ msg: err instanceof Error ? err.message : "Failed to update profile", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd.length < 6) {
      setPwdMsg({ msg: "New password must be at least 6 characters.", ok: false });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ msg: "Passwords do not match.", ok: false });
      return;
    }
    setChangingPwd(true);
    try {
      await changePassword(currentPwd, newPwd);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setPwdMsg({ msg: "Password updated.", ok: true });
    } catch (err) {
      setPwdMsg({ msg: err instanceof Error ? err.message : "Failed to change password", ok: false });
    } finally {
      setChangingPwd(false);
    }
  }

  if (loading) {
    return <div style={{ ...cardStyle, maxWidth: 560 }}><p style={{ margin: 0, color: "#9ca3af", fontSize: "0.9rem" }}>Loading profile…</p></div>;
  }

  return (
    <div className="lrr-profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start", maxWidth: 1140 }}>
      <style>{`
        @media (max-width: 900px) {
          .lrr-profile-grid { grid-template-columns: 1fr !important; max-width: 560px !important; }
        }
      `}</style>

      {/* ── Personal details ── */}
      <form onSubmit={handleSaveProfile} style={cardStyle}>
        <h3 style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "1.05rem", color: navy }}>
          Personal details
        </h3>
        <p style={{ margin: "0 0 1.25rem", color: "#6c7890", fontSize: "0.85rem" }}>
          Your phone number is how we identify you on WhatsApp — keep it current.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div>
            <label htmlFor="ps-name" style={labelStyle}>Full name</label>
            <input id="ps-name" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="ps-email" style={labelStyle}>Email</label>
            <input id="ps-email" type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="ps-phone" style={labelStyle}>Phone (WhatsApp)</label>
            <input
              id="ps-phone"
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(toNigerianDisplayPhoneNumber(e.target.value))}
              placeholder="08012345678"
            />
          </div>
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <SaveButton disabled={saving}>{saving ? "Saving…" : "Save changes"}</SaveButton>
        </div>
        {profileMsg && <Feedback msg={profileMsg.msg} ok={profileMsg.ok} />}
      </form>

      {/* ── Password ── */}
      <form onSubmit={handleChangePassword} style={cardStyle}>
        <h3 style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "1.05rem", color: navy }}>
          Password
        </h3>
        <p style={{ margin: "0 0 1.25rem", color: "#6c7890", fontSize: "0.85rem" }}>
          {profile?.email ? "Used to log in to the dashboard with your email." : "Set a password to log in to the dashboard."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div>
            <label htmlFor="ps-current" style={labelStyle}>Current password</label>
            <input
              id="ps-current" type="password" style={inputStyle}
              value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)}
              autoComplete="current-password"
              placeholder="Leave blank if you never set one"
            />
          </div>
          <div>
            <label htmlFor="ps-new" style={labelStyle}>New password</label>
            <input
              id="ps-new" type="password" style={inputStyle}
              value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
              autoComplete="new-password" placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label htmlFor="ps-confirm" style={labelStyle}>Confirm new password</label>
            <input
              id="ps-confirm" type="password" style={inputStyle}
              value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
              autoComplete="new-password" placeholder="Repeat new password"
            />
          </div>
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <SaveButton disabled={changingPwd}>{changingPwd ? "Updating…" : "Update password"}</SaveButton>
        </div>
        {pwdMsg && <Feedback msg={pwdMsg.msg} ok={pwdMsg.ok} />}
      </form>
    </div>
  );
}
