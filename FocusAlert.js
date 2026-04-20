import React, { useEffect } from "react";

export default function FocusAlert() {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        // friendly non-intrusive toast
        console.log("Focus alert: switched away");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div className="page-card">
      <h3>Focus Alerts</h3>
      <p className="muted">Focus detection is active (tab visibility).</p>
    </div>
  );
}
