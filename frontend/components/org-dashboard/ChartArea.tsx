"use client";
import * as React from "react";

const data = Array.from({ length: 24 }).map((_, i) => ({ x: i, y: Math.round(50 + 40 * Math.sin(i / 3) + Math.random() * 20) }));

export function ChartArea() {
  const width = 640;
  const height = 160;
  const padding = 24;
  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const scaleX = (x: number) => padding + (x / (data.length - 1)) * (width - padding * 2);
  const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY)) * (height - padding * 2);

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(d.x)},${scaleY(d.y)}`)
    .join(" ");

  const area = `${data.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(d.x)},${scaleY(d.y)}`).join(" ")} L${scaleX(data[data.length - 1].x)},${height - padding} L${scaleX(data[0].x)},${height - padding} Z`;

  return (
    <div className="px-4 lg:px-6">
      <svg width={width} height={height} role="img" aria-label="Статистика посещаемости">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} rx={12} className="fill-muted" />
        <path d={area} fill="url(#g)" />
        <path d={path} stroke="hsl(var(--chart-1))" strokeWidth={2} fill="none" />
      </svg>
    </div>
  );
}


