import React, { forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className={`${styles.container} ${className}`}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}

                <div className={styles.inputWrapper}>
                    {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}

                    <input
                        id={inputId}
                        ref={ref}
                        className={`
                            ${styles.input} 
                            ${error ? styles.error : ''} 
                            ${leftIcon ? styles.hasLeftIcon : ''} 
                            ${rightIcon ? styles.hasRightIcon : ''}
                        `}
                        {...props}
                    />

                    {rightIcon && <div className={styles.rightIcon}>{rightIcon}</div>}
                </div>

                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
