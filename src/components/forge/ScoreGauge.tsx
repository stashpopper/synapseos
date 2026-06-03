import { useState, useEffect } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function ScoreGauge({ score, size = 'lg', animated = true }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [color, setColor] = useState('text-slate-400');

  useEffect(() => {
    if (animated) {
      let start = 0;
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = Math.round(eased * score);
        setDisplayScore(start);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayScore(score);
    }

    // Determine color based on score
    if (score >= 80) setColor('text-emerald-400');
    else if (score >= 60) setColor('text-amber-400');
    else if (score >= 40) setColor('text-orange-400');
    else setColor('text-red-400');
  }, [score, animated]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const ringSize = size === 'sm' ? 100 : size === 'md' ? 120 : 140;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={ringSize}
        height={ringSize}
        className={`${sizeClasses[size]} transform -rotate-90`}
      >
        {/* Background ring */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={45}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-surface-elevated"
        />
        {/* Progress ring */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={45}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className={`${color} transition-all duration-300`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${textSizeClasses[size]} font-bold ${color}`}>
          {displayScore}
        </span>
        <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
          score
        </span>
      </div>
    </div>
  );
}
