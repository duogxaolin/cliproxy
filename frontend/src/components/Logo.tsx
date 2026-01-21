import { Link } from 'react-router-dom';

interface LogoProps {
  to?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ to = '/', showText = true, size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: { container: 'w-6 h-6', text: 'text-base' },
    md: { container: 'w-8 h-8', text: 'text-lg' },
    lg: { container: 'w-10 h-10', text: 'text-xl' },
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Augment Code inspired logo */}
      <div className={`${sizeClasses[size].container} relative flex items-center justify-center`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle cx="16" cy="16" r="15" fill="url(#logoGradient)" />
          {/* Letter C stylized */}
          <path
            d="M20 10C18.5 8.5 16.5 8 14.5 8C10.5 8 7 11.5 7 16C7 20.5 10.5 24 14.5 24C16.5 24 18.5 23.5 20 22"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* API symbol - angle brackets */}
          <path
            d="M18 12L22 16L18 20"
            stroke="url(#logoGradient2)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M25 12L21 16L25 20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.7"
          />
        </svg>
      </div>
      {showText && (
        <span className={`${sizeClasses[size].text} font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-500 bg-clip-text text-transparent`}>
          CheapAPI
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{logoContent}</Link>;
  }

  return logoContent;
}

