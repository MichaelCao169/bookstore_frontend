'use client';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "warning", 
    isLoading = false
}) => {
    if (!isOpen) return null;

    const iconMap = {
        warning: { icon: FaExclamationTriangle, color: "text-yellow-500" },
        success: { icon: FaCheck, color: "text-green-500" },
        danger: { icon: FaTimes, color: "text-red-500" }
    };

    const buttonMap = {
        warning: "bg-yellow-500 hover:bg-yellow-600",
        success: "bg-green-500 hover:bg-green-600",
        danger: "bg-red-500 hover:bg-red-600"
    };

    const { icon: Icon, color } = iconMap[type];
    const buttonClass = buttonMap[type];
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 transform transition-all scale-100 opacity-100">
                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center">
                        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                                type === 'success' ? 'bg-green-100 dark:bg-green-900' :
                                    'bg-red-100 dark:bg-red-900'
                            } sm:mx-0 sm:h-10 sm:w-10`}>
                            <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
                        </div>
                        <div className="ml-3 w-full">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-3 justify-end">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <FaTimes className="mr-2" />
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`inline-flex items-center justify-center rounded-md border border-transparent ${buttonClass} px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang xử lý...
                                </div>
                            ) : (
                                <>
                                    <FaCheck className="mr-2" />
                                    {confirmText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
