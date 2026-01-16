import LoadingSpinner from './LoadingSpinner';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
        secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400',
        outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
        ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" color={variant === 'primary' || variant === 'danger' || variant === 'success' ? 'white' : 'indigo'} />}
            {children}
        </button>
    );
}
