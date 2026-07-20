import React, { useId } from 'react';

interface LogoMarkProps {
  /** Rendered height in px (width scales automatically). */
  size?: number;
  /** Ghost mode: faint white outline only (used behind the hero vault). */
  ghost?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* Two interlocking isometric prisms, sheared into an "S" bolt.
   Top prism: left face + right face. Bottom prism: left face + right face. */
const FACES = {
  topLeft: 'M11 0 L0 6 L0 21 L11 27 Z',
  topRight: 'M11 0 L22 6 L22 21 L11 27 Z',
  bottomLeft: 'M20.5 23.5 L10 29.5 L10 40 L20.5 46 Z',
  bottomRight: 'M20.5 23.5 L31 29.5 L31 40 L20.5 46 Z',
};

/** Skew that gives the mark its lightning lean. */
const SKEW = 'skewX(16)';

/**
 * DepositSafe brand mark — isometric double-prism "S" bolt,
 * deep indigo → violet → magenta. Pure SVG, no raster assets.
 */
const LogoMark: React.FC<LogoMarkProps> = ({ size = 32, ghost = false, className, style }) => {
  const uid = useId().replace(/:/g, '');
  const width = (size * 44) / 46;

  if (ghost) {
    return (
      <svg
        width={width}
        height={size}
        viewBox="0 0 44 46"
        fill="none"
        className={className}
        style={style}
        aria-hidden="true"
      >
        <g transform={SKEW} stroke="#FFFFFF" strokeWidth="1">
          <path d={FACES.topLeft} />
          <path d={FACES.topRight} />
          <path d={FACES.bottomLeft} />
          <path d={FACES.bottomRight} />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 44 46"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-tl`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#1E12A0" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id={`${uid}-tr`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#A855F7" />
          <stop offset="1" stopColor="#E961F5" />
        </linearGradient>
        <linearGradient id={`${uid}-bl`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#5B21B6" />
          <stop offset="1" stopColor="#C026D3" />
        </linearGradient>
        <linearGradient id={`${uid}-br`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#D946EF" />
          <stop offset="1" stopColor="#FF9AF5" />
        </linearGradient>
      </defs>
      <g transform={SKEW}>
        {/* Top prism */}
        <path d={FACES.topLeft} fill={`url(#${uid}-tl)`} />
        <path d={FACES.topRight} fill={`url(#${uid}-tr)`} />
        {/* Bottom prism */}
        <path d={FACES.bottomLeft} fill={`url(#${uid}-bl)`} />
        <path d={FACES.bottomRight} fill={`url(#${uid}-br)`} />
      </g>
    </svg>
  );
};

export default LogoMark;
