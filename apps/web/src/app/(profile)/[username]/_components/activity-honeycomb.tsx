'use client';
import { cn } from '@repo/ui/cn';
import { format } from 'date-fns';
import { useState } from 'react';

interface DayActivity {
  date: Date;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  comments: number;
  badges: number;
  submissions: number;
  activity: number;
}

const HEX_R = 11;
const HEX_W = HEX_R * 1.5;
const HEX_H = HEX_R * Math.sqrt(3);
const PADDING = 4;

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

function getColorClass(count: number) {
  if (count < 1) return 'fill-muted stroke-border';
  if (count < 3) return 'fill-sky-600/30 stroke-sky-600/40';
  if (count < 5) return 'fill-sky-600/60 stroke-sky-600/70';
  if (count < 7) return 'fill-sky-600/85 stroke-sky-600';
  return 'fill-sky-500 stroke-sky-400';
}

export function ActivityHoneycomb(props: { data: DayActivity[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const columns = Math.max(1, Math.ceil(props.data.length / 7));
  const width = columns * HEX_W + HEX_R * 2 + PADDING * 2;
  const height = 7 * HEX_H + HEX_H / 2 + HEX_R * 2 + PADDING * 2;
  const hoveredDay = hovered === null ? null : props.data[hovered];

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto block"
        >
          {props.data.map((d, i) => {
            const col = Math.floor(i / 7);
            const cx = col * HEX_W + HEX_R + PADDING;
            const cy = d.day * HEX_H + (col % 2 === 0 ? 0 : HEX_H / 2) + HEX_R + PADDING;
            return (
              <polygon
                key={d.date.toISOString()}
                points={hexPoints(cx, cy, HEX_R - 1.5)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  'cursor-pointer stroke-[1.5] transition-all',
                  getColorClass(d.activity),
                  hovered === i && 'stroke-primary stroke-2',
                )}
              />
            );
          })}
        </svg>
      </div>
      <p className="text-muted-foreground mt-1 h-4 text-center text-xs">
        {hoveredDay
          ? `${format(hoveredDay.date, 'dd MMM')} — ${hoveredDay.activity} активности`
          : ''}
      </p>
    </div>
  );
}
