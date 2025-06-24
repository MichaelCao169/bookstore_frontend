import { lazy, Suspense } from 'react';
import BrandSpinner from './BrandSpinner';

// Lazy load các component nặng để giảm bundle size
const RichTextEditorComponent = lazy(() => import('./RichTextEditor'));
const ChatWindowComponent = lazy(() => import('../chat/ChatWindow'));
const AiChatWindowComponent = lazy(() => import('../chat/AiChatWindow'));
const ReviewListComponent = lazy(() => import('../review/ReviewList'));

// Wrapper components với loading fallback
export const LazyRichTextEditor = (props) => (
    <Suspense fallback={<BrandSpinner text="Đang tải editor..." />}>
        <RichTextEditorComponent {...props} />
    </Suspense>
);

export const RichTextEditor = (props) => (
    <Suspense fallback={<BrandSpinner text="Đang tải editor..." />}>
        <RichTextEditorComponent {...props} />
    </Suspense>
);

export const LazyReviewList = (props) => (
    <Suspense fallback={<BrandSpinner text="Đang tải đánh giá..." />}>
        <ReviewListComponent {...props} />
    </Suspense>
);

export const ChatWindow = (props) => (
    <Suspense fallback={<BrandSpinner text="Đang kết nối chat..." />}>
        <ChatWindowComponent {...props} />
    </Suspense>
);

export const AiChatWindow = (props) => (
    <Suspense fallback={<BrandSpinner text="Đang khởi tạo AI..." />}>
        <AiChatWindowComponent {...props} />
    </Suspense>
);

// Lazy load admin components (chỉ load khi cần)
export const LazyAdminDashboard = lazy(() => import('../../app/(admin)/admin/dashboard/page'));
export const LazyProductManagement = lazy(() => import('../../app/(admin)/admin/products/page'));
export const LazyUserManagement = lazy(() => import('../../app/(admin)/admin/users/page'));

export const AdminDashboard = (props) => (
    <Suspense fallback={<BrandSpinner text="Đang tải dashboard..." />}>
        <LazyAdminDashboard {...props} />
    </Suspense>
);

export const ProductManagement = (props) => (
    <Suspense fallback={<BrandSpinner text="Đang tải quản lý sản phẩm..." />}>
        <LazyProductManagement {...props} />
    </Suspense>
);

export const UserManagement = (props) => (
    <Suspense fallback={<BrandSpinner text="Đang tải quản lý người dùng..." />}>
        <LazyUserManagement {...props} />
    </Suspense>
); 