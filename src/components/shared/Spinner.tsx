import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

const Spinner: FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <span
      className={cn(
        'animate-spin rounded-full border-white border-t-transparent',
        sizeMap[size],
        className,
      )}
    />
  );
};

export default Spinner;
