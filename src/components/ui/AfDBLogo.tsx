interface AfDBLogoProps {
  size?: number;
  width?: number;
  className?: string;
  light?: boolean;
}

export default function AfDBLogo({ size = 48, width, className, light = false }: AfDBLogoProps) {
  return (
    <img
      src="/images/afbd-main-logo.png"
      alt="African Development Bank"
      height={size}
      width={width || size}
      style={light ? { filter: 'brightness(0) invert(1)' } : undefined}
      className={`object-contain ${className || ''}`}
    />
  );
}
