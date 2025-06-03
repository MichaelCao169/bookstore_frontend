'use client';
import React from 'react';
import { LiaAtomSolid } from 'react-icons/lia';

/**
 * Brand spinner component that displays the app's logo (atom) with a spinning animation
 * 
 * @param {Object} props Component props
 * @param {string} [props.size='4xl'] - Size of the icon (text-sm, text-lg, text-xl, etc.)
 * @param {string} [props.color='text-orange-500 dark:text-orange-400'] - Color of the icon
 * @param {string} [props.className=''] - Additional classes
 * @param {string} [props.text=''] - Optional text to display below the spinner
 * @param {string} [props.textSize='text-xl'] - Size of the text
 * @param {string} [props.textColor='text-gray-800 dark:text-gray-200'] - Color of the text
 */
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