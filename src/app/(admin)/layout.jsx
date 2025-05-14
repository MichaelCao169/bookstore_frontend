'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';

/**
 * Administrative area layout
 * Wraps all admin pages with authentication, authorization and layout
 */
export default function AdminLayout({ children }) {
    return (
        <ProtectedRoute requiredRoles={['ADMIN', 'ROLE_ADMIN']}>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <AdminSidebar />
                <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
} 