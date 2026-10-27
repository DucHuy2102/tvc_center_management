import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireOwner?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireOwner = false,
}) => {
    const { user, profile, isLoading, isOwner, isActive } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-[#F4F6FA] p-4'>
                <div className='w-full max-w-sm bg-white border border-[#DFE4EC] rounded-[10px] p-6 space-y-4 animate-pulse'>
                    <div className='h-5 bg-[#ECEFF5] rounded-[4px] w-1/3' />
                    <div className='space-y-2'>
                        <div className='h-4 bg-[#ECEFF5] rounded-[4px] w-full' />
                        <div className='h-4 bg-[#ECEFF5] rounded-[4px] w-2/3' />
                    </div>
                    <div className='text-xs text-[#5A6478]'>Đang kiểm tra thông tin...</div>
                </div>
            </div>
        );
    }

    // Chưa đăng nhập
    if (!user) {
        return <Navigate to='/dang-nhap' state={{ from: location }} replace />;
    }

    // Chưa kích hoạt hoặc chưa có profile hợp lệ
    if (!profile || !isActive) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-background p-4'>
                <div className='max-w-md w-full bg-white border border-border rounded-[10px] p-6 text-center shadow-none'>
                    <div className='w-12 h-12 rounded-full bg-[#FBF0DC] text-[#A86A0B] flex items-center justify-center mx-auto mb-4 font-bold text-xl'>
                        !
                    </div>
                    <h2 className='text-lg font-semibold text-foreground mb-2'>
                        Tài khoản chưa được kích hoạt
                    </h2>
                    <p className='text-sm text-muted-foreground mb-6'>
                        Tài khoản của bạn đã được ghi nhận nhưng cần người quản trị (Chủ trung tâm)
                        bật kích hoạt trước khi bạn có thể truy cập hệ thống.
                    </p>
                    <button
                        onClick={() => (window.location.href = '/dang-nhap')}
                        className='w-full h-9 rounded-[6px] bg-primary text-white text-sm font-medium hover:bg-[#1E3A8A] transition-colors'
                    >
                        Quay lại trang Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    // Tuyến đường yêu cầu vai trò Chủ nhưng người dùng là Nhân viên
    if (requireOwner && !isOwner) {
        return (
            <div className='min-h-[60vh] flex items-center justify-center p-4'>
                <div className='max-w-md w-full bg-white border border-border rounded-[10px] p-6 text-center shadow-none'>
                    <div className='w-12 h-12 rounded-full bg-[#FBE8E5] text-[#B3382C] flex items-center justify-center mx-auto mb-4 font-bold text-xl'>
                        ✕
                    </div>
                    <h2 className='text-lg font-semibold text-foreground mb-2'>
                        Không có quyền truy cập
                    </h2>
                    <p className='text-sm text-muted-foreground mb-6'>
                        Chức năng này chỉ dành cho tài khoản quản lý (Chủ trung tâm). Tài khoản Nhân
                        viên không được phép xem nội dung này.
                    </p>
                    <Navigate to='/hoc-vien' replace />
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
