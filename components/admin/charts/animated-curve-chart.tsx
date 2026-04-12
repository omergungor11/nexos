"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnimatedCurveChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, unknown>>;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: number;
  showAverage?: boolean;
  averageLabel?: string;
  unit?: string;
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({
  active,
  payload,
  label,
  unit,
  color,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit?: string;
  color: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border bg-background/95 px-4 py-3 shadow-xl backdrop-blur">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ color }}>
        {payload[0].value.toLocaleString("tr-TR")}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animated dot for active point
// ---------------------------------------------------------------------------

function AnimatedDot(props: Record<string, unknown>) {
  const { cx, cy, stroke } = props as { cx: number; cy: number; stroke: string };
  if (cx == null || cy == null) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={stroke} fillOpacity={0.2}>
        <animate
          attributeName="r"
          values="6;10;6"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          values="0.2;0.05;0.2"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={cx} cy={cy} r={4} fill="white" stroke={stroke} strokeWidth={2} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnimatedCurveChart({
  title,
  description,
  data,
  dataKey,
  xAxisKey,
  color = "#3b82f6",
  gradientFrom,
  gradientTo,
  height = 320,
  showAverage = true,
  averageLabel = "Ortalama",
  unit,
}: AnimatedCurveChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const gFrom = gradientFrom ?? color;
  const gTo = gradientTo ?? `${color}05`;
  const gradientId = `gradient-${dataKey}-${color.replace("#", "")}`;

  // Calculate average
  const values = data.map((d) => Number(d[dataKey] ?? 0)).filter((v) => !isNaN(v));
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {/* Summary stats */}
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Toplam</p>
              <p className="text-sm font-bold tabular-nums">{total.toLocaleString("tr-TR")}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Maks</p>
              <p className="text-sm font-bold tabular-nums">{max.toLocaleString("tr-TR")}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ort</p>
              <p className="text-sm font-bold tabular-nums">{Math.round(avg).toLocaleString("tr-TR")}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {data.length === 0 ? (
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ height }}
          >
            Veri bulunamadı
          </div>
        ) : (
          <div
            className="transition-opacity duration-700"
            style={{ opacity: mounted ? 1 : 0 }}
          >
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gFrom} stopOpacity={0.3} />
                    <stop offset="50%" stopColor={gFrom} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={gTo} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted/50"
                  vertical={false}
                />

                <XAxis
                  dataKey={xAxisKey}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  width={45}
                />

                <Tooltip
                  content={<CustomTooltip unit={unit} color={color} />}
                  cursor={{
                    stroke: color,
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                    strokeOpacity: 0.4,
                  }}
                />

                {/* Average reference line */}
                {showAverage && avg > 0 && (
                  <ReferenceLine
                    y={avg}
                    stroke={color}
                    strokeDasharray="6 4"
                    strokeOpacity={0.4}
                    label={{
                      value: `${averageLabel}: ${Math.round(avg)}`,
                      position: "insideTopRight",
                      fill: color,
                      fontSize: 10,
                      fontWeight: 600,
                      opacity: 0.7,
                    }}
                  />
                )}

                <Area
                  type="natural"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={true}
                  animationDuration={1800}
                  animationEasing="ease-in-out"
                  activeDot={<AnimatedDot />}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
