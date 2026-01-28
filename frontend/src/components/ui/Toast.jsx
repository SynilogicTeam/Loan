import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ id, message, type, onClose }) {
    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
    };

    return (
        <div
            className={`${styles[type]} px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}
        >
            <span className="flex-1">{message}</span>
            <button
                onClick={onClose}
                className="text-white hover:text-gray-200 font-bold"
            >
                ×
            </button>
        </div>
    );
}

// Simple Toast component for direct use
export default function SimpleToast({ type, message, onClose }) {
    if (!message) return null;

    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div
                className={`${styles[type]} px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
            >
                <span className="flex-1">{message}</span>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 font-bold"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

// Helper functions for easy use
export const toast = {
    success: (message) => {
        if (window.__toastContext) {
            window.__toastContext.addToast(message, 'success');
        }
    },
    error: (message) => {
        if (window.__toastContext) {
            window.__toastContext.addToast(message, 'error');
        }
    },
    warning: (message) => {
        if (window.__toastContext) {
            window.__toastContext.addToast(message, 'warning');
        }
    },
    info: (message) => {
        if (window.__toastContext) {
            window.__toastContext.addToast(message, 'info');
        }
    },
};
