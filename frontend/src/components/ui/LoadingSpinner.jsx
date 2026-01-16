export default function LoadingSpinner({ size = 'md', color = 'indigo' }) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    const colors = {
        indigo: 'border-indigo-600 border-t-transparent',
        white: 'border-white border-t-transparent',
        gray: 'border-gray-600 border-t-transparent',
    };

    return (
        <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`} />
    );
}
