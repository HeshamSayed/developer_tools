interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Logo */}
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="logo-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="logo-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="logo-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background Circle */}
        <circle cx="100" cy="100" r="95" fill="url(#logo-gradient-1)" opacity="0.1" />

        {/* Main Hexagon Shape */}
        <path
          d="M100 20 L165 55 L165 125 L100 160 L35 125 L35 55 Z"
          fill="url(#logo-gradient-1)"
          opacity="0.2"
          stroke="url(#logo-gradient-1)"
          strokeWidth="2"
        />

        {/* Code Brackets < > */}
        <g filter="url(#glow)">
          {/* Left Bracket < */}
          <path
            d="M70 70 L50 90 L70 110"
            stroke="url(#logo-gradient-2)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Right Bracket > */}
          <path
            d="M130 70 L150 90 L130 110"
            stroke="url(#logo-gradient-2)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Forward Slash / */}
        <path
          d="M105 60 L95 120"
          stroke="url(#logo-gradient-3)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Tool Wrench */}
        <g transform="translate(100, 130)" filter="url(#glow)">
          <path
            d="M-10 0 L-5 10 L5 10 L10 0 L8 -5 L-8 -5 Z"
            fill="url(#logo-gradient-1)"
            stroke="url(#logo-gradient-1)"
            strokeWidth="1"
          />
          <circle cx="0" cy="-8" r="5" fill="url(#logo-gradient-2)" />
        </g>

        {/* Decorative Dots */}
        <circle cx="40" cy="40" r="3" fill="url(#logo-gradient-2)" opacity="0.6" />
        <circle cx="160" cy="40" r="3" fill="url(#logo-gradient-3)" opacity="0.6" />
        <circle cx="40" cy="160" r="3" fill="url(#logo-gradient-3)" opacity="0.6" />
        <circle cx="160" cy="160" r="3" fill="url(#logo-gradient-1)" opacity="0.6" />

        {/* Connecting Lines */}
        <path
          d="M100 20 L100 40"
          stroke="url(#logo-gradient-1)"
          strokeWidth="2"
          opacity="0.3"
          strokeDasharray="5,5"
        />
        <path
          d="M100 140 L100 160"
          stroke="url(#logo-gradient-1)"
          strokeWidth="2"
          opacity="0.3"
          strokeDasharray="5,5"
        />
      </svg>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
            DevTools
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Pro Suite
          </span>
        </div>
      )}
    </div>
  )
}
