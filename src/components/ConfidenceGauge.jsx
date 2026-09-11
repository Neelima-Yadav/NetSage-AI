import React, { useEffect, useState } from "react";

export default function ConfidenceGauge({ confidence = 85, size = 120, strokeWidth = 10 }) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const progressOffset = circumference - (confidence / 100) * circumference;
    setOffset(progressOffset);
  }, [confidence, circumference]);

  // Color helper based on confidence
  const getGaugeColor = () => {
    if (confidence >= 90) return "stroke-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]";
    if (confidence >= 75) return "stroke-brand-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]";
    return "stroke-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]";
  };

  const getTextColor = () => {
    if (confidence >= 90) return "text-emerald-400";
    if (confidence >= 75) return "text-brand-cyan";
    return "text-amber-400";
  };

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative" style={{ width: size, height: size }}>
        
        {/* SVG Circle Container */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Circle */}
          <circle
            className="circle-bg"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          
          {/* Foreground Circle */}
          <circle
            className={`circle-progress transition-all duration-1000 ${getGaugeColor()}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-extrabold font-mono tracking-tighter ${getTextColor()}`}>
            {confidence}%
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
            Confidence
          </span>
        </div>

      </div>
    </div>
  );
}
