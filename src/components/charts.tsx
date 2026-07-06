"use client";

// Lightweight dependency-free SVG charts for time series.

type Point = { label: string; value: number };

export function LineChart({ data, height = 160, fmt = (v: number) => String(v), area = true }: {
  data: Point[]; height?: number; fmt?: (v: number) => string; area?: boolean;
}) {
  if (data.length < 2) return null;
  const W = 600, H = height, padX = 8, padY = 16;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const x = (i: number) => padX + (i / (data.length - 1)) * (W - padX * 2);
  const y = (v: number) => padY + (1 - (v - min) / span) * (H - padY * 2);
  const line = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const up = data[data.length - 1].value >= data[0].value;
  const stroke = up ? "#2563eb" : "#ef4444";
  const areaPath = `M${x(0)},${H - padY} L${data.map((d, i) => `${x(i)},${y(d.value)}`).join(" L")} L${x(data.length - 1)},${H - padY} Z`;
  const labelStep = Math.ceil(data.length / 6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {[0, 0.5, 1].map((f) => (
        <line key={f} x1={padX} x2={W - padX} y1={padY + f * (H - padY * 2)} y2={padY + f * (H - padY * 2)} stroke="var(--border)" strokeWidth="0.5" />
      ))}
      {area && <path d={areaPath} fill={stroke} opacity="0.08" />}
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {data.map((d, i) => (i % labelStep === 0 || i === data.length - 1 ? (
        <text key={i} x={x(i)} y={H - 3} textAnchor="middle" className="fill-muted" style={{ fontSize: 9 }}>{d.label}</text>
      ) : null))}
      <text x={padX} y={y(max) - 3} className="fill-muted" style={{ fontSize: 9 }}>{fmt(max)}</text>
      <text x={padX} y={y(min) + 9} className="fill-muted" style={{ fontSize: 9 }}>{fmt(min)}</text>
    </svg>
  );
}

export function BarChart({ data, height = 160, fmt = (v: number) => String(v) }: {
  data: Point[]; height?: number; fmt?: (v: number) => string;
}) {
  if (!data.length) return null;
  const W = 600, H = height, padY = 18;
  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = (W / data.length) * 0.6;
  const gap = (W / data.length) * 0.4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const bh = (d.value / max) * (H - padY * 2);
        const bx = i * (bw + gap) + gap / 2;
        return (
          <g key={i}>
            <rect x={bx} y={H - padY - bh} width={bw} height={bh} rx="2" className="fill-primary" opacity="0.85" />
            <text x={bx + bw / 2} y={H - padY - bh - 3} textAnchor="middle" className="fill-foreground" style={{ fontSize: 9 }}>{fmt(d.value)}</text>
            <text x={bx + bw / 2} y={H - 4} textAnchor="middle" className="fill-muted" style={{ fontSize: 9 }}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
