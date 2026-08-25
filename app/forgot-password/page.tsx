"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

type StepType = 'email' | 'otp' | 'password';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<StepType>('email');
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Request OTP
  async function requestOTP() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep('otp');
      setCountdown(300); // 5 minutes
      setOtpCode("");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function verifyOTP() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }

      setStep('password');
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Reset Password
  async function resetPassword() {
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      toast.success(`✅ ${t('auth.reset_success')}`);
      window.location.href = "/login";
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background text-foreground p-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-lg">
        
        {/* STEP 1: Enter Email */}
        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('auth.forgot_password')}</h2>
              <p className="text-muted-foreground text-sm">
                Enter your email address and we'll send you an OTP to reset your password
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.email_label')}</label>
              <input
                className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                placeholder={t('auth.email_placeholder')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && requestOTP()}
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              className="bg-primary w-full py-3 rounded-lg font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={requestOTP}
              disabled={loading || !email}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {t('auth.sending_otp')}
                </span>
              ) : (
                t('auth.send_otp')
              )}
            </button>

            <div className="text-center pt-4">
              <Link href="/login" className="text-sm text-primary hover:underline">
                ← {t('auth.back_to_login')}
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('auth.verify_email')}</h2>
              <p className="text-muted-foreground text-sm">{t('auth.enter_otp')}</p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t('auth.otp_sent_to')}</p>
              <p className="font-semibold text-foreground">{email}</p>
              {countdown > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  ⏱️ {t('option.remaining')}: <span className="font-mono">{formatTime(countdown)}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.otp_code')}</label>
              <input
                className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                onKeyPress={(e) => e.key === 'Enter' && otpCode.length === 6 && verifyOTP()}
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              className="bg-primary w-full py-3 rounded-lg font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={verifyOTP}
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {t('auth.verifying')}
                </span>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep('email')}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                ← {t('auth.change_email')}
              </button>

              {countdown === 0 ? (
                <button
                  onClick={requestOTP}
                  disabled={loading}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                  {t('auth.resend_otp')}
                </button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t('auth.resend_in')} {formatTime(countdown)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Set New Password */}
        {step === 'password' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('auth.set_new_password')}</h2>
              <p className="text-muted-foreground text-sm">{t('auth.choose_strong')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.new_password')}</label>
              <div className="relative">
                <input
                  className="w-full p-3 pr-10 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder={t('auth.password_min_chars')}
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? (
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

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.confirm_password')}</label>
              <div className="relative">
                <input
                  className="w-full p-3 pr-10 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder={t('auth.re_enter_password')}
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && resetPassword()}
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

            {error && (
              <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              className="bg-primary w-full py-3 rounded-lg font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={resetPassword}
              disabled={loading || !newPassword || !confirmPassword || newPassword.length < 6}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {t('auth.resetting')}
                </span>
              ) : (
                t('auth.reset_password')
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
