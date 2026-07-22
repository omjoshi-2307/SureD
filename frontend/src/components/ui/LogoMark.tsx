import React, { useId } from 'react';

interface LogoMarkProps {
  /** Rendered height/width in px. */
  size?: number;
  /** Ghost mode: faint white outline only. */
  ghost?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Redesigned SureDeposit brand logo mark.
 * Features a slanted left parallelogram and a stylized right peak,
 * with rounded corners and a vibrant violet/purple neon gradient glow.
 */
const LogoMark: React.FC<LogoMarkProps> = ({ size = 32, ghost = false, className, style }) => {
  const uid = useId().replace(/:/g, '');
  const width = size; // 1:1 square aspect ratio

  // Paths representing the emblem from the provided design
  const pathLeft = "M 15 41 L 39 41 L 29 59 L 5 59 Z";
  const pathRight = "M 31 73 L 63 25 L 82 55 L 62 55 L 48 73 Z";

  if (ghost) {
    return (
      <svg
        width={width}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        style={style}
        aria-hidden="true"
      >
        <g stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path d={pathLeft} />
          <path d={pathRight} />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      style={{
        filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.75))',
        ...style
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C084FC" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <g 
        fill={`url(#${uid}-grad)`} 
        stroke={`url(#${uid}-grad)`} 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
        strokeLinecap="round"
      >
        <path d={pathLeft} />
        <path d={pathRight} />
      </g>
    </svg>
  );
};

export default LogoMark;
