import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
}

function resolveClasses(props: ButtonProps): string {
  const { variant = 'primary', size = 'md', fullWidth = false, glow = false } = props;

  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-primary to-primary-dim text-background font-semibold hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
    secondary:
      'bg-surface-elevated border border-border text-slate-200 hover:border-border-hover hover:bg-surface-elevated/80 hover:text-white hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0',
    outline:
      'bg-transparent border border-border text-slate-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 hover:-translate-y-0.5 active:translate-y-0',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  };

  const glowClass = glow
    ? 'glow-primary hover:glow-primary'
    : '';

  const widthClass = fullWidth ? 'w-full' : '';

  return twMerge(
    clsx(base, variants[variant], sizes[size], widthClass, glowClass),
    props.className
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  icon,
  iconPosition = 'left',
  glow = false,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={resolveClasses({ variant, size, fullWidth, glow, className })}
      {...rest}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
}
