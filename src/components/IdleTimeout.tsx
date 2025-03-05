"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function IdleTimeout() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, IDLE_TIMEOUT);
    };

    // Reset timer on user activity
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keypress", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);

    // Start the timer initially
    resetIdleTimer();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keypress", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
    };
  }, []);

  return null; // This component doesn't render anything
}