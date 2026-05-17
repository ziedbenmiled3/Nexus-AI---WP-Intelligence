import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function Sparkline({ data, width = 200, height = 60, color = "#3b82f6" }: SparklineProps) {
  if (!data || data.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-700 font-black uppercase tracking-widest">Calcul...</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Use a fixed virtual coordinate system for the path
  const vWidth = 1000;
  const vHeight = 200;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * vWidth;
    const y = vHeight - ((val - min) / range) * vHeight;
    return { x, y };
  });

  const pathData = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, "");

  const fillPath = `${pathData} L ${vWidth},${vHeight} L 0,${vHeight} Z`;

  return (
    <div className="w-full h-full min-h-[40px]">
      <svg 
        viewBox={`0 0 ${vWidth} ${vHeight}`} 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={fillPath}
          fill={`url(#grad-${color.replace('#','')})`}
        />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="15" // Increased stroke width for virtual coordinates
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
