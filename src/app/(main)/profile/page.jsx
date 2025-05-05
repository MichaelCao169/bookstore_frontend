// src/app/(main)/profile/page.jsx
'use client'; // Cần client component cho fetch và form

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiLoader, FiAlertCircle, FiSave } from 'react-icons/fi'; // Icons

// Component để hiển thị loading hoặc lỗi
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <FiLoader className="animate-spin text-orange-500 text-4xl" />
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center text-red-600">
    <FiAlertCircle size={40} className="mb-2" />
    <p>Lỗi khi tải profile:</p>
    <p className="text-sm">{message}</p>
    <button
      onClick={() => window.location.reload()} // Đơn giản là tải lại trang
      className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
    >
      Thử lại
    </button>
  </div>
);


const ProfilePage = () => {
  // State cho thông tin profile
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // State cho form đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Auth state và router
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const isAuthLoading = useAuthStore((state) => state.isLoading);
const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // ---- Fetch Profile Data ----
  const fetchProfile = useCallback(async () => {
    console.log('Fetching profile data...');
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const response = await axiosInstance.get('/profile');
      console.log('Profile data received:', response.data);
      setProfile(response.data); // Lưu UserProfileDTO
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (err.response?.status === 401) {
         toast.error("Phiên đăng nhập hết hạn.");
         logout(); // Logout client state
         router.push('/login?redirect=/profile');
      } else {
          setProfileError(err.response?.data?.message || err.message || 'Không thể tải thông tin tài khoản.');
      }
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [router, logout]); // Thêm logout và router

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchProfile();
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?redirect=/profile');
    }
  }, [isAuthenticated, isAuthLoading, fetchProfile, router]); // Thêm router


  // ---- Change Password Logic ----
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (newPassword.length < 6) {
         setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
         return;
    }
    if (!currentPassword) {
        setPasswordError('Vui lòng nhập mật khẩu hiện tại.');
        return;
    }


    setIsChangingPassword(true);

    try {
      const response = await axiosInstance.put('/profile/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success(response.data || 'Đổi mật khẩu thành công!');
      // Xóa các trường input sau khi thành công
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
       console.error('Failed to change password:', err.response?.data || err.message);
       const errorMessage = err.response?.data || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
       setPasswordError(errorMessage.startsWith('Error:') ? errorMessage.substring(7) : errorMessage); // Bỏ chữ "Error:" nếu có
       toast.error(`Lỗi: ${passwordError || 'Không thể đổi mật khẩu.'}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // --- Render Logic ---
   if (isAuthLoading || isLoadingProfile) {
     return <LoadingSpinner />;
   }

    if (!isAuthenticated) {
       // useEffect đã xử lý redirect, nhưng thêm fallback
       return <div className="text-center py-10">Đang chuyển hướng đến trang đăng nhập...</div>;
   }


   if (profileError) {
     return <ErrorMessage message={profileError} onRetry={fetchProfile} />;
   }

   if (!profile) {
        return <div className="text-center py-10">Không thể tải thông tin tài khoản.</div>
   }


  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl"> {/* Giới hạn chiều rộng */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-dark-text border-b pb-3">Thông tin Tài khoản</h1>

      {/* Phần hiển thị thông tin */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow border dark:border-gray-700 mb-8">
        <div className="flex items-center mb-4">
           <FiUser className="text-orange-500 mr-3" size={24} />
           <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
           {/* Optional: Nút sửa thông tin (nếu implement updateProfile) */}
           {/* <button className="ml-auto text-sm text-orange-600 hover:underline">Chỉnh sửa</button> */}
        </div>
        <div className="space-y-3 text-sm">
          <p><strong>ID:</strong> {profile.id}</p>
          <p><strong>Tên:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      </div>

      {/* Phần đổi mật khẩu */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow border dark:border-gray-700">
        <div className="flex items-center mb-6">
            <FiLock className="text-orange-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-1"
            >
              Mật khẩu hiện tại
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-orange-500"
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-1"
            >
              Mật khẩu mới (Ít nhất 6 ký tự)
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-orange-500"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-1"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-orange-500"
            />
          </div>

           {/* Hiển thị lỗi đổi mật khẩu */}
          {passwordError && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{passwordError}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                 <>
                    <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"/>
                    Đang lưu...
                 </>
              ) : (
                 <>
                    <FiSave className="mr-2 h-5 w-5"/>
                    Lưu thay đổi mật khẩu
                 </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;