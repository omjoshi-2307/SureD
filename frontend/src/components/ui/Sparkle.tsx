/** Sparkle / 4-pointed star decorative icon */
const Sparkle = ({
  size = 18,
  color = '#E8734A',
  className = '',
}: {
  size?: number;
  color?: string;
  className?: string;
}) => (
  <svg
    className={`sparkle ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    aria-hidden="true"
  >
    <path d="M12 0 C12 0 13.5 8.5 16 12 C13.5 15.5 12 24 12 24 C12 24 10.5 15.5 8 12 C10.5 8.5 12 0 12 0Z" />
    <path d="M0 12 C0 12 8.5 13.5 12 16 C15.5 13.5 24 12 24 12 C24 12 15.5 10.5 12 8 C8.5 10.5 0 12 0 12Z" />
  </svg>
);

export default Sparkle;
