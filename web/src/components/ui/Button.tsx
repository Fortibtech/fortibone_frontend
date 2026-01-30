import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className = '',
        variant = 'primary',
        size = 'md',
        isLoading = false,
        fullWidth = false,
        leftIcon,
        rightIcon,
        children,
        disabled,
        ...props
    }, ref) => {
        const rootClassName = [
            styles.button,
            styles[variant],
            styles[size],
            fullWidth ? styles.fullWidth : '',
            (!children && (leftIcon || rightIcon)) ? styles.iconOnly : '',
            className
        ].filter(Boolean).join(' ');

        return (
            <button
                ref={ref}
                className={rootClassName}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <div className={styles.spinner} />}

                <span style={{ opacity: isLoading ? 0 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </span>
            </button>
        );
    }
);

Button.displayName = 'Button';
