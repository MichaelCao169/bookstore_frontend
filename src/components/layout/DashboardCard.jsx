import { useState, useEffect } from 'react';

export default function DashboardCard({ title, value, icon, iconComponent, color = 'bg-orange-100', darkColor = 'bg-orange-900/30' }) {
    const [displayValue, setDisplayValue] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Only animate numeric values
        if (typeof value === 'number') {
            setIsAnimating(true);
            let startValue = 0;
            const endValue = value;
            const duration = 1000; // Animation duration in ms
            const frameDuration = 1000 / 60; // 60fps
            const totalFrames = Math.round(duration / frameDuration);
            const valueIncrement = endValue / totalFrames;

            let currentFrame = 0;
            const counter = setInterval(() => {
                currentFrame++;
                const newValue = Math.min(startValue + valueIncrement * currentFrame, endValue);
                setDisplayValue(Math.round(newValue));

                if (currentFrame === totalFrames) {
                    clearInterval(counter);
                    setIsAnimating(false);
                }
            }, frameDuration);

            return () => clearInterval(counter);
        } else {
            // If not a number, just set it directly
            setDisplayValue(value);
        }
    }, [value]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <div className={`flex items-center ${iconComponent || icon ? 'space-x-4' : ''}`}>
                {(iconComponent || icon) && (
                    <div className={`w-14 h-14 ${color} dark:${darkColor || color} rounded-full flex items-center justify-center text-2xl shadow-sm`}>
                        {iconComponent || icon}
                    </div>
                )}
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {typeof value === 'number' ? (
                            <span className={isAnimating ? 'transition-all duration-75' : ''}>
                                {typeof value === 'number' && !value.toString().includes('₫')
                                    ? displayValue.toLocaleString('vi-VN')
                                    : displayValue}
                            </span>
                        ) : value}
                    </p>
                </div>
            </div>
        </div>
    );
} 