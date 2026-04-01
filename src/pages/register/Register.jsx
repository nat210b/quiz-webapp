import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInUser, registerUser } from "../../services/userService";
import "./RegisterStyle.css";

// ── Password rules ───────────────────────────────────────────
const PASSWORD_RULES = [
  { id: "length",    label: "At least 6 characters",       test: (p) => p.length >= 6 },
  { id: "uppercase", label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number",    label: "At least 1 number",           test: (p) => /[0-9]/.test(p) },
];

export default function Register() {
  const [isLogin, setIsLogin] = useState(
    localStorage.getItem("isLogin") === "true"
  );

  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [message, setMessage]                 = useState(null); // { type, text, suggestLogin? }
  const [showRules, setShowRules]             = useState(false);

  const navigate = useNavigate();

  // Derived validation
  const rulesStatus   = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const passwordValid = rulesStatus.every((r) => r.passed);
  const confirmMatch  = confirmPassword === password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const email       = e.target.email.value.trim();
    const displayName = !isLogin ? e.target.displayName.value.trim() : null;

    // Client-side validation (Sign Up only)
    if (!isLogin) {
      if (!passwordValid) {
        setMessage({ type: "error", text: "Password does not meet the requirements." });
        return;
      }
      if (!confirmMatch) {
        setMessage({ type: "error", text: "Passwords do not match." });
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signInUser(email, password);
        if (error) throw error;
        setMessage({ type: "success", text: "Logged in successfully! 🎉" });
        setTimeout(() => navigate("/"), 800);
      } else {
        await registerUser(email, password, displayName);
        setMessage({
          type: "success",
          text: "Account created! Please check your email to verify. 📬",
        });
      }
    } catch (err) {
      const text = err?.message ?? "Something went wrong. Please try again.";

      // เช็คว่าเป็น email ซ้ำหรือไม่
      const isDuplicate =
        text.includes("already registered") ||
        text.includes("User already registered") ||
        text.includes("already been registered");

      setMessage({ type: "error", text, suggestLogin: isDuplicate });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setMessage(null);
    setPassword("");
    setConfirmPassword("");
    setShowRules(false);
    localStorage.setItem("isLogin", loginMode ? "true" : "false");
  };

  return (
    <div className="register-page">
      <div className="register-card">

        {/* Logo */}
        <div className="register-logo">📚</div>

        {/* Header */}
        <div className="register-header">
          <h1 className="register-title">TOEIC Vocab Quiz</h1>
          <p className="register-sub">
            {isLogin ? "Welcome back!" : "Create an account to start practicing"}
          </p>
        </div>

        {/* Tab */}
        <div className="register-tab">
          <button
            type="button"
            className={`register-tab-btn ${isLogin ? "active" : ""}`}
            onClick={() => switchMode(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={`register-tab-btn ${!isLogin ? "active" : ""}`}
            onClick={() => switchMode(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`register-msg ${message.type}`}>
            <span>{message.text}</span>
            {/* ถ้า email ซ้ำ → เสนอให้ switch ไป Login */}
            {message.suggestLogin && (
              <button
                type="button"
                className="register-msg-action"
                onClick={() => switchMode(true)}
              >
                Go to Login →
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form className="register-form" onSubmit={handleSubmit}>

          {/* Display Name — Sign Up only */}
          {!isLogin && (
            <div className="register-field">
              <label className="register-label" htmlFor="displayName">
                Display Name
              </label>
              <input
                className="register-input"
                type="text"
                id="displayName"
                name="displayName"
                placeholder="How should we call you?"
                required
                autoComplete="nickname"
                maxLength={32}
              />
            </div>
          )}

          {/* Email */}
          <div className="register-field">
            <label className="register-label" htmlFor="email">Email</label>
            <input
              className="register-input"
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="register-field">
            <label className="register-label" htmlFor="password">Password</label>
            <input
              className={`register-input ${
                !isLogin && password && !passwordValid ? "input-error" : ""
              }`}
              type="password"
              id="password"
              name="password"
              placeholder={isLogin ? "Your password" : "Min 6 chars, 1 uppercase, 1 number"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => !isLogin && setShowRules(true)}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            {/* Password rules checklist — Sign Up only */}
            {!isLogin && showRules && (
              <ul className="register-rules">
                {rulesStatus.map((r) => (
                  <li key={r.id} className={`register-rule ${r.passed ? "passed" : ""}`}>
                    <span className="register-rule-icon">{r.passed ? "✓" : "○"}</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password — Sign Up only */}
          {!isLogin && (
            <div className="register-field">
              <label className="register-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className={`register-input ${
                  confirmPassword && !confirmMatch ? "input-error" : ""
                } ${
                  confirmPassword && confirmMatch ? "input-success" : ""
                }`}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {confirmPassword && !confirmMatch && (
                <span className="register-field-hint error">Passwords do not match</span>
              )}
              {confirmPassword && confirmMatch && (
                <span className="register-field-hint success">Passwords match ✓</span>
              )}
            </div>
          )}

          <button
            className="register-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Login →" : "Sign Up →"}
          </button>
        </form>

        {/* Divider */}
        <div className="register-divider">or</div>

        {/* Back */}
        <button
          className="register-back"
          type="button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
}
