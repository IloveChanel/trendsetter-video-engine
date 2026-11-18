import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const SPRING_CONFIG = { damping: 16, stiffness: 140, mass: 0.8 } as const;

export type ChartPoint = { year: string; amount: number; label: string };

/** Default/fallback data: U.S. fraud losses growing from $5.8B to $15.9B. */
export const DEFAULT_FRAUD_POINTS: ChartPoint[] = [
  { year: "2021", amount: 5.8, label: "$5.8B" },
  { year: "2023", amount: 10.0, label: "$10.0B" },
  { year: "2024", amount: 12.5, label: "$12.5B" },
  { year: "2025", amount: 15.9, label: "$15.9B" },
];

type Colors = { primary: string; accent: string; danger: string; warning?: string; text: string; muted: string; background: string };

export const AnimatedChart: React.FC<{
  points?: ChartPoint[];
  colors: Colors;
  width?: number;
  height?: number;
  delay?: number;
}> = ({ points, colors, width = 760, height = 480, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const data = points && points.length > 0 ? points : DEFAULT_FRAUD_POINTS;

  const padX = 40;
  const padTop = 64;
  const padBottom = 56;
  const chartH = height - padTop - padBottom;
  const slot = (width - padX * 2) / data.length;
  const barW = slot * 0.58;
  const max = Math.max(...data.map((d) => d.amount)) || 1;
  const stagger = 6;

  // Trend line drawn after the bars grow.
  const lineProgress = interpolate(frame - delay, [stagger * data.length, stagger * data.length + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tops = data.map((d, i) => ({
    x: padX + slot * i + slot / 2,
    y: padTop + chartH - (d.amount / max) * chartH,
  }));
  const pathD = tops.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  let pathLen = 0;
  for (let i = 1; i < tops.length; i++) pathLen += Math.hypot(tops[i].x - tops[i - 1].x, tops[i].y - tops[i - 1].y);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: "100%", height: "auto" }}>
      <line x1={padX} x2={width - padX} y1={padTop + chartH} y2={padTop + chartH} stroke={colors.muted} strokeWidth={2} />
      {data.map((d, i) => {
        const p = spring({ frame: frame - delay - i * stagger, fps, config: SPRING_CONFIG });
        const h = interpolate(p, [0, 1], [0, (d.amount / max) * chartH], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x = padX + slot * i + (slot - barW) / 2;
        const isLast = i === data.length - 1;
        return (
          <g key={`${d.year}-${i}`}>
            <rect x={x} y={padTop + chartH - h} width={barW} height={h} rx={10} fill={isLast ? colors.danger : colors.accent} />
            <text x={x + barW / 2} y={padTop + chartH - h - 14} textAnchor="middle" fontSize={30} fontWeight={700} fill={colors.text} fontFamily="sans-serif" opacity={p}>
              {d.label}
            </text>
            <text x={x + barW / 2} y={padTop + chartH + 38} textAnchor="middle" fontSize={26} fill={colors.muted} fontFamily="sans-serif">
              {d.year}
            </text>
          </g>
        );
      })}
      <path d={pathD} fill="none" stroke={colors.warning ?? colors.primary} strokeWidth={4} strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - lineProgress)} strokeLinecap="round" />
    </svg>
  );
};
