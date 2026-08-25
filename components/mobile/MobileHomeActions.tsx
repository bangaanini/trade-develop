"use client";

import { useState, useEffect } from "react";
import MobileServiceButtons from "./MobileServiceButtons";
import MobileQuickActions from "./MobileQuickActions";
import MobileGuestButtons from "./MobileGuestButtons";

export default function MobileHomeActions() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to check auth", error);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return <div className="h-40 animate-pulse bg-muted/20 m-4 rounded-lg"></div>;
  }

  if (!user) {
    return <MobileGuestButtons />;
  }

  return (
    <>
      <MobileServiceButtons user={user} />
      <MobileQuickActions />
    </>
  );
}
