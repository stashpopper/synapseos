interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const paddingMap: Record<string, string> = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-6 sm:px-8 lg:px-12',
  lg: 'px-8 sm:px-10 lg:px-16',
  xl: 'px-10 sm:px-12 lg:px-20',
};

const maxWidthMap: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export default function Container({
  children,
  className = '',
  padding = 'lg',
  maxWidth = '7xl',
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full ${paddingMap[padding]} ${maxWidthMap[maxWidth]} ${className}`}
    >
      {children}
    </div>
  );
}
