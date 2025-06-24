'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// Component bảo vệ route
export default function ProtectedRoute({
    children,
    requiredRoles = [],
    redirectTo = '/login'
}) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, accessToken } = useAuthStore();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // Chỉ chạy trên client side
        if (typeof window === 'undefined') return;

        // Đầu tiên, check nếu đang loading
        if (isLoading) {
            console.log('Auth state is loading, waiting...');
            return;
        }

        setIsCheckingAuth(true);

        // Kiểm tra xác thực: Người dùng phải đang đăng nhập và có token hợp lệ
        if (!isAuthenticated || !accessToken) {
            console.log('User not authenticated, redirecting to login', { isAuthenticated, hasToken: !!accessToken });
            const redirectPath = `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`;
            router.replace(redirectPath);
            return;
        }

        // Kiểm tra quyền truy cập nếu cần
        if (requiredRoles.length > 0) {
            if (!user || !user.roles) {
                console.error('User object or roles missing', user);
                router.replace('/');
                return;
            }

            // Kiểm tra các vai trò
            const hasRequiredRole = user.roles.some(role =>
                requiredRoles.includes(role) ||
                requiredRoles.includes(role.replace('ROLE_', ''))
            );

            if (!hasRequiredRole) {
                console.log('User does not have required roles:', {
                    userRoles: user.roles,
                    requiredRoles: requiredRoles
                });
                router.replace('/');
                alert('Bạn không có quyền truy cập vào khu vực này.');
                return;
            }
        }

        // Người dùng đã xác thực và được ủy quyền
        console.log('User is authenticated and authorized');
        setIsAuthorized(true);
        setIsCheckingAuth(false);
    }, [isAuthenticated, isLoading, user, router, redirectTo, requiredRoles, accessToken]);

    // Hiển thị trạng thái loading trong khi kiểm tra xác thực
    if (isLoading || isCheckingAuth) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
        );
    }

    // Hiển thị nội dung khi đã được ủy quyền
    return isAuthorized ? children : null;
} 