import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-wide uppercase';
    
    const variants = {
      primary: 'bg-[#FFC400] text-black hover:bg-[#e0ad00]',
      secondary: 'bg-[#1B1B1B] text-white hover:bg-[#262626] border border-[#2c2c2c]',
      outline: 'border border-[#1B1B1B] text-gray-300 hover:bg-[#1B1B1B]',
      ghost: 'text-gray-400 hover:text-white hover:bg-[#1B1B1B]',
      danger: 'bg-[#FF5E5E] text-white hover:bg-[#e04f4f]',
    };
    
    const sizes = {
      sm: 'px-3 py-2 text-[10px]',
      md: 'px-4 py-2.5 text-xs',
      lg: 'px-6 py-3.5 text-sm',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
