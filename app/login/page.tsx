"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

type TabType = 'login' | 'register';

export default function AuthPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [registerErr, setRegisterErr] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Login function
  async function login() {
    setLoginErr("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginErr(data.error || t('auth.login_failed'));
        return;
      }

      if (data.user.role === "admin" || data.user.role === "superadmin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (e) {
      setLoginErr("Something went wrong");
    } finally {
      setLoginLoading(false);
    }
  }

  // Send OTP
  async function sendOTP() {
    setRegisterErr("");
    setOtpLoading(true);
    
    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerEmail }),
      });
      
      const json = await res.json();

      if (!res.ok) {
        setRegisterErr(json.error || "Failed to send OTP");
        return;
      }

      setCountdown(60); // 1 minute countdown
      toast.success(t('auth.otp_sent') || "OTP sent to your email");
    } catch (e: any) {
      setRegisterErr(e.message || "Something went wrong");
    } finally {
      setOtpLoading(false);
    }
  }

  // Final Registration
  async function handleRegister() {
    setRegisterErr("");
    
    // Basic validation
    if (!registerEmail || !otpCode || !registerPassword || !confirmPassword) {
      setRegisterErr(t('auth.fill_all_fields') || "Please fill in all required fields");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterErr(t('auth.passwords_not_match') || "Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setRegisterErr(t('auth.accept_terms') || "Please accept the terms and conditions");
      return;
    }

    setRegisterLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: registerEmail, 
          password: registerPassword,
          otpCode,
          referralCode 
        }),
      });
      
      const json = await res.json();

      if (!res.ok) {
        setRegisterErr(json.error || "Registration failed");
        return;
      }

      toast.success(`✅ ${t('auth.success_reg')}`);
      // Switch to login tab and prefill email
      setActiveTab('login');
      setLoginEmail(registerEmail);
      // Reset form
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setOtpCode("");
      setReferralCode("");
    } catch (e: any) {
      setRegisterErr(e.message || "Something went wrong");
    } finally {
      setRegisterLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background text-foreground p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        
        {/* Tabs Header */}
        <div className="flex border-b border-border">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginErr("");
            }}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'login'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegisterErr("");
            }}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'register'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t('auth.register_tab')}
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t('auth.welcome_back')}</h2>
                <p className="text-muted-foreground text-sm">{t('auth.login_subtitle')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
                <input
                  className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder={t('auth.email_placeholder')}
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && login()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    className="w-full p-3 pr-10 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder={t('auth.password_placeholder')}
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && login()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showLoginPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    {t('auth.remember_me')}
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t('auth.forgot_password')}
                </a>
              </div>

              {loginErr && (
                <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                  {loginErr}
                </div>
              )}

              <button
                className="bg-primary w-full py-3 rounded-lg font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                onClick={login}
                disabled={loginLoading || !loginEmail || !loginPassword}
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    {t('auth.logging_in')}
                  </span>
                ) : (
                  t('auth.login')
                )}
              </button>
            </div>
          )}


          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t('auth.create_account')}</h2>
                <p className="text-muted-foreground text-sm">{t('auth.register_subtitle')}</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.email_label')}</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder={t('auth.email_placeholder')}
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Verification Code */}
               <div>
                <label className="block text-sm font-medium mb-2">{t('auth.otp_code') || "Verification Code"}</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition font-mono tracking-widest text-center"
                    placeholder="000000"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <button 
                     type="button"
                     className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 min-w-[100px]"
                     onClick={sendOTP}
                     disabled={otpLoading || !registerEmail || countdown > 0}
                  >
                     {otpLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                     ) : countdown > 0 ? (
                        `${countdown}s`
                     ) : (
                        t('auth.send_code') || "Send Code"
                     )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    className="w-full p-3 pr-10 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder={t('auth.password_min_chars')}
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showRegisterPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Retype Password */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.retype_password') || "Retype Password"}</label>
                <div className="relative">
                  <input
                    className="w-full p-3 pr-10 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder={t('auth.retype_password_placeholder') || "Confirm your password"}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                     {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Invitation Code */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.invitation_code') || "Invitation Code (Optional)"}</label>
                <input
                  className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder={t('auth.invitation_placeholder') || "Enter invitation code"}
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>

              {/* Terms & Privacy Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  {t('auth.terms_agree')}{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    {t('auth.terms_service')}
                  </a>
                  {" "}{t('auth.and')}{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    {t('auth.privacy_policy')}
                  </a>
                </label>
              </div>

              {registerErr && (
                <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                  {registerErr}
                </div>
              )}

              <button
                className="bg-primary w-full py-3 rounded-lg font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRegister}
                disabled={registerLoading || !registerEmail || !otpCode || !registerPassword || !confirmPassword || !termsAccepted}
              >
                {registerLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    {t('auth.registering') || "Registering..."}
                  </span>
                ) : (
                  t('auth.register') || "Register"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
