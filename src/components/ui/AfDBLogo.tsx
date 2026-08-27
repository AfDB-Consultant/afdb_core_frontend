export default function AfDBLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Africa continent silhouette */}
      <circle cx="100" cy="100" r="96" fill="#009A44" stroke="#007A35" strokeWidth="4"/>
      <path d="M100 30 C85 30, 65 45, 60 65 C55 85, 50 95, 55 115 C60 135, 65 145, 75 155 C85 165, 90 170, 100 170 C110 170, 115 165, 120 155 C125 145, 135 135, 140 115 C145 95, 140 85, 135 65 C130 45, 115 30, 100 30Z" fill="#F5A623" opacity="0.9"/>
      {/* Inner detail */}
      <path d="M90 55 C85 60, 80 70, 82 85 C84 100, 88 110, 92 120 C96 130, 98 135, 100 140 C102 135, 104 130, 108 120 C112 110, 116 100, 118 85 C120 70, 115 60, 110 55 C105 50, 95 50, 90 55Z" fill="#009A44" opacity="0.6"/>
      {/* Text arc */}
      <text x="100" y="192" textAnchor="middle" fill="#002B5C" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">AfDB</text>
    </svg>
  );
}
