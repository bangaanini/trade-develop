/**
 * Shared OTP store for forgot password flow
 * In production, use Redis or database instead of in-memory Map
 */

interface OTPData {
  code: string;
  expires: number;
}

class OTPStore {
  private store: Map<string, OTPData>;

  constructor() {
    this.store = new Map();
  }

  set(email: string, code: string, expiresInMs: number = 5 * 60 * 1000) {
    this.store.set(email, {
      code,
      expires: Date.now() + expiresInMs,
    });
  }

  get(email: string): OTPData | undefined {
    const data = this.store.get(email);
    
    // Auto-delete if expired
    if (data && Date.now() > data.expires) {
      this.store.delete(email);
      return undefined;
    }
    
    return data;
  }

  delete(email: string) {
    this.store.delete(email);
  }

  verify(email: string, code: string): boolean {
    const data = this.get(email);
    
    if (!data) {
      return false;
    }

    return data.code === code;
  }
}

// Export singleton instance
export const otpStore = new OTPStore();
