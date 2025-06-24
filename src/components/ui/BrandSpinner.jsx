import React from 'react';
import { LiaAtomSolid } from 'react-icons/lia';


const BrandSpinner = ({
    size = 'text-4xl',
    color = 'text-orange-500 dark:text-orange-400',
    className = '',
    text = '',
    textSize = 'text-xl',
    textColor = 'text-gray-800 dark:text-gray-200'
}) => {
    return (
        <div className={`text-center ${className}`}>
            <div className="inline-block animate-spin">
                <LiaAtomSolid className={`${size} ${color}`} />
            </div>

            {text && (
                <div className={`font-semibold mt-4 ${textSize} ${textColor}`}>
                    {text}
                </div>
            )}
        </div>
    );
};

export default BrandSpinner;