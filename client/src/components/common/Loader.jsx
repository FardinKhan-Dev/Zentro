import React from 'react';
import { FiLoader } from '@react-icons/all-files/fi/FiLoader';

const Loader = ({ fullScreen = true, size = 'medium', text }) => {
    const sizeClasses = {
        small: 'w-5 h-5',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    const containerClasses = fullScreen
        ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50'
        : 'flex items-center justify-center p-4';

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-3">
                <FiLoader className={`${sizeClasses[size]} animate-spin text-green-600 dark:text-green-400`} />
                {text && (
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Loader;
