interface AfDBLogoProps {
  size?: number;
  className?: string;
  light?: boolean;
}

export default function AfDBLogo({ size = 48, className, light = false }: AfDBLogoProps) {
  return (
    <img
      src={light ? '/images/afdb-logo-light.svg' : '/images/afdb-logo.svg'}
      alt="African Development Bank"
      height={size}
      className={`object-contain ${className || ''}`}
      style={{ width: 'auto' }}
    />
  );
}
