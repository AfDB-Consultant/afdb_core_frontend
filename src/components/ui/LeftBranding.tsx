import Link from 'next/link';
import AfDBLogo from './AfDBLogo';

export default function LeftBranding() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 lg:p-28 text-white relative overflow-hidden">
      {/* Radial gradient background */}
      <div
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_65%_60%,_rgb(0,60,30)_0%,_rgb(0,20,10)_50%)] dark:bg-[radial-gradient(120%_100%_at_-20%_60%,_rgb(0,60,30)_0%,_black_60%),radial-gradient(120%_100%_at_120%_60%,_rgb(0,60,30)_0%,_black_60%)]"
        style={{ minHeight: '100vh' }}
      />
      {/* Decorative circles overlay */}
      <div className="absolute inset-0 opacity-10" style={{ minHeight: '100vh' }}>
        <svg viewBox="0 0 800 800" className="w-full h-full">
          <circle cx="400" cy="400" r="350" fill="none" stroke="#009A44" strokeWidth="1.5" />
          <circle cx="400" cy="400" r="250" fill="none" stroke="#F5A623" strokeWidth="1" />
          <circle cx="400" cy="400" r="150" fill="none" stroke="#009A44" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4 relative z-10">
        <Link href="/login" className="cursor-pointer hover:opacity-90 transition-opacity">
          <AfDBLogo size={100} width={200} light />
        </Link>
      </div>

      {/* Hero Text */}
      <div className="max-w-md relative z-10">
        <h2
          className="font-bold mb-4 leading-tight"
          style={{ fontFamily: 'Afacad, sans-serif' }}
        >
          <span className="text-7xl lg:text-8xl block">Secure</span>
          <span className="text-5xl lg:text-6xl block mt-1" style={{ color: 'rgb(245, 166, 35)' }}>
            Access Portal
          </span>
        </h2>
        <p
          className="text-lg font-medium leading-relaxed"
          style={{ color: 'rgb(200, 210, 220)', fontFamily: 'Afacad, sans-serif' }}
        >
          Enterprise-grade authentication with multi-factor security,
          role-based access, and OWASP-compliant protection.
        </p>
      </div>

      {/* Footer features */}
      <div className="relative z-10">
        <div className="flex items-center gap-5 flex-wrap">
          {[
            { color: 'rgb(0, 154, 68)', label: 'MFA-Protected Access' },
            { color: 'rgb(245, 166, 35)', label: 'SSO-IDP Federation' },
            { color: 'rgb(255, 255, 255)', label: 'OWASP Top 10 Compliant' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm" style={{ color: 'rgb(160, 175, 190)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span style={{ fontFamily: 'Afacad, sans-serif' }}>{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm pt-4" style={{ color: 'rgb(130, 145, 160)', fontFamily: 'Afacad, sans-serif' }}>
          &copy; {new Date().getFullYear()} African Development Bank Group
        </p>
      </div>
    </div>
  );
}
