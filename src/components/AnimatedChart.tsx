import React from "react";

// PLACEHOLDER: Animated SVG upward trend chart component
export const AnimatedChart: React.FC<{ points: { year: string; amount: number; label: string }[] }> = ({ points }) => (
  <div style={{ padding: 24, border: "2px solid #1E3D2F", borderRadius: 20, backgroundColor: "#EFECE2" }}>
    <strong>Fraud Trend Chart Placeholder ({points.length} data points)</strong>
  </div>
);
