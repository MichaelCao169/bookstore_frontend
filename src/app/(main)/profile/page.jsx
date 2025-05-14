// src/app/(main)/profile/page.jsx
'use client'; // Cần client component cho fetch và form

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiLoader, FiAlertCircle, FiSave, FiMail, FiShield, FiInfo, FiCalendar, FiCamera, FiUpload, FiRefreshCw, FiEdit, FiCheckCircle, FiSettings, FiEye, FiEyeOff } from 'react-icons/fi'; // Thêm icons

// Component để hiển thị loading hoặc lỗi
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-16">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 rounded-full border-t-4 border-orange-500 animate-spin"></div>
      <div className="absolute inset-2 rounded-full border-2 border-gray-100 dark:border-gray-700"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <FiLoader className="text-orange-500 text-2xl animate-pulse" />
      </div>
    </div>
    <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tải thông tin...</p>
  </div>
);

const ErrorMessage = ({ message, onRetry = () => window.location.reload() }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
      <FiAlertCircle size={40} className="text-red-600 dark:text-red-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Có lỗi xảy ra</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">{message}</p>
    <button
      onClick={onRetry}
      className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 font-medium shadow-sm"
    >
      <FiRefreshCw />
      Thử lại
    </button>
  </div>
);

// Thêm hàm formatImageUrl bên ngoài component
const formatImageUrl = (url) => {
  if (!url) return '/default-avatar.png';

  // Log để debug
  console.log("Original URL received in formatImageUrl:", url);

  // Nếu đã là URL tương đối không cần xử lý
  if (url.startsWith('/') && !url.startsWith('/api')) {
    return url;
  }

  // Xử lý URL đầy đủ từ backend (http://localhost:8080/...)
  if (url.includes('localhost:8080') && url.includes('/avatars/')) {
    // Trả về URL đầy đủ đến backend - không dùng api-proxy nữa
    return url;
  }

  // Xử lý URL tương đối từ backend (/api/uploads/...)
  if (url.includes('/uploads/avatars/')) {
    // Chuyển đổi thành URL đầy đủ đến backend
    return `http://localhost:8080${url.startsWith('/api') ? '' : '/api'}${url}`;
  }

  // Trường hợp khác, giữ nguyên URL
  return url;
};

// Hàm kiểm tra độ mạnh mật khẩu
const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, text: "", color: "" };

  let score = 0;

  // Kiểm tra độ dài
  if (password.length > 6) score += 1;
  if (password.length > 10) score += 1;

  // Kiểm tra hỗn hợp chữ và số
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score += 1;

  // Kiểm tra ký tự đặc biệt
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  // Kiểm tra chữ hoa và chữ thường
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;

  const strengths = [
    { text: "Rất yếu", color: "text-red-500 dark:text-red-400", bgColor: "bg-red-500" },
    { text: "Yếu", color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-500" },
    { text: "Trung bình", color: "text-yellow-500 dark:text-yellow-400", bgColor: "bg-yellow-500" },
    { text: "Mạnh", color: "text-green-500 dark:text-green-400", bgColor: "bg-green-500" },
    { text: "Rất mạnh", color: "text-green-600 dark:text-green-500", bgColor: "bg-green-600" }
  ];

  return {
    score,
    ...strengths[score < strengths.length ? score : strengths.length - 1],
    percent: (score / 4) * 100
  };
};

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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "", color: "", bgColor: "", percent: 0 });

  // State hiển thị mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State cho form cập nhật profile
  const [name, setName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState(null);

  // State cho upload ảnh đại diện
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const fileInputRef = useRef(null);

  // Auth state và router
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // ---- Fetch Profile Data ----
  const fetchProfile = useCallback(async () => {
    console.log('Đang tải thông tin tài khoản...');
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const response = await axiosInstance.get('/profile');
      console.log('Đã nhận thông tin tài khoản:', response.data);

      // Đảm bảo avatarUrl được sử dụng từ response hoặc từ user store nếu không có trong response
      const profileData = {
        ...response.data,
        avatarUrl: response.data.avatarUrl || (user && user.avatarUrl) || '/default-avatar.png'
      };

      console.log('Processed profile data:', profileData);
      setProfile(profileData);

      // Đặt tên vào form cập nhật
      setName(profileData.name || '');
    } catch (err) {
      console.error('Không thể tải thông tin tài khoản:', err);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        logout();
        router.push('/login?redirect=/profile');
      } else {
        setProfileError(err.response?.data?.message || err.message || 'Không thể tải thông tin tài khoản.');
      }
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [router, logout, user]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchProfile();
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?redirect=/profile');
    }
  }, [isAuthenticated, isAuthLoading, fetchProfile, router]);

  // ---- Update Profile Logic ----
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileUpdateError(null);

    if (!name.trim()) {
      setProfileUpdateError('Tên không được để trống.');
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const response = await axiosInstance.put('/profile', { name });
      setProfile(response.data);
      // Cập nhật user trong authStore
      if (user) {
        updateUser({ ...user, name: response.data.name });
      }
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      setProfileUpdateError(err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
      toast.error('Lỗi: Không thể cập nhật thông tin.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

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
      console.error("Lỗi đổi mật khẩu:", err);

      // Lấy thông báo lỗi từ response
      const originalErrorMessage = (err.response?.data?.message || err.response?.data || err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.').toString();
      console.log("Original error message:", originalErrorMessage);

      // Dịch thông báo lỗi tiếng Anh sang tiếng Việt
      let translatedErrorMessage = originalErrorMessage;

      // Kiểm tra chuỗi lỗi (không phân biệt hoa thường)
      const errorLowerCase = originalErrorMessage.toLowerCase();

      if (errorLowerCase.includes('incorrect current password') ||
        errorLowerCase.includes('incorrect password') ||
        errorLowerCase.includes('current password is incorrect') ||
        errorLowerCase.includes('wrong password')) {
        translatedErrorMessage = 'Mật khẩu hiện tại không chính xác.';
      }
      else if (errorLowerCase.includes('password') && errorLowerCase.includes('match')) {
        translatedErrorMessage = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
      }
      else if (errorLowerCase.includes('must be at least 6 characters') ||
        errorLowerCase.includes('at least 6 character')) {
        translatedErrorMessage = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      }
      else if (errorLowerCase.includes('error:')) {
        translatedErrorMessage = originalErrorMessage.substring(originalErrorMessage.indexOf(':') + 1).trim();
      }
      else if (errorLowerCase.includes('password cannot be empty') ||
        errorLowerCase.includes('is empty') ||
        errorLowerCase.includes('empty password')) {
        translatedErrorMessage = 'Mật khẩu không được để trống.';
      }
      else if (errorLowerCase.includes('failed to change password')) {
        translatedErrorMessage = 'Không thể đổi mật khẩu. Vui lòng thử lại sau.';
      }
      else if (errorLowerCase.includes('invalid credentials')) {
        translatedErrorMessage = 'Thông tin đăng nhập không hợp lệ.';
      }
      else if (errorLowerCase.includes('user not found')) {
        translatedErrorMessage = 'Không tìm thấy người dùng.';
      }

      console.log("Translated error message:", translatedErrorMessage);
      setPasswordError(translatedErrorMessage);
      toast.error(`Lỗi: ${translatedErrorMessage}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Cập nhật đánh giá độ mạnh mật khẩu khi mật khẩu mới thay đổi
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(newPassword));
  }, [newPassword]);

  // ---- Avatar Upload Logic ----
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file quá lớn. Tối đa 5MB.');
        return;
      }

      // Kiểm tra định dạng file
      if (!file.type.match('image.*')) {
        toast.error('Chỉ chấp nhận file hình ảnh.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleAvatarClick = () => {
    // Kích hoạt click vào input file ẩn
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file ảnh đại diện.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // 1. Upload file ảnh 
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await axiosInstance.post('/uploads/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const avatarUrl = uploadResponse.data.url;
      console.log("Uploaded avatar URL:", avatarUrl);

      // 2. Cập nhật URL avatar trong profile
      const updateResponse = await axiosInstance.put('/profile/avatar', {
        avatarUrl
      });

      console.log("Profile after avatar update:", updateResponse.data);

      // 3. Cập nhật profile trong state
      setProfile(updateResponse.data);
      setAvatarTimestamp(Date.now());

      // 4. Cập nhật avatar trong authStore để hiển thị ngay trên navbar
      if (user) {
        const updatedUser = {
          ...user,
          avatarUrl: avatarUrl
        };
        console.log("Updating user in authStore:", updatedUser);
        updateUser(updatedUser);
      }

      setSelectedFile(null);

      toast.success('Cập nhật ảnh đại diện thành công!');

      // 5. Làm mới trang sau khi upload thành công để đảm bảo hiển thị ảnh mới
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Không thể tải lên ảnh đại diện:', err);
      toast.error(err.response?.data?.error || 'Không thể tải lên ảnh đại diện.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Debug để kiểm tra thông tin profile
  useEffect(() => {
    // Debug để kiểm tra thông tin profile
    if (profile) {
      console.log("Current profile:", profile);
      console.log("Avatar URL in profile:", profile.avatarUrl);
      const formattedUrl = formatImageUrl(profile.avatarUrl);
      console.log("Formatted avatar URL:", formattedUrl);
      console.log("Final avatar URL with timestamp:", `${formattedUrl}${avatarTimestamp ? `&v=${avatarTimestamp}` : ''}`);
    }

    // Debug để kiểm tra thông tin user trong auth store
    if (user) {
      console.log("Current user in auth store:", user);
      console.log("Avatar URL in auth store user:", user.avatarUrl);
      console.log("Formatted avatar URL from auth store:", formatImageUrl(user.avatarUrl));
    }
  }, [profile, user, avatarTimestamp]);

  // Force rerender khi thông tin user thay đổi, như khi đăng nhập lại
  useEffect(() => {
    if (user && user.avatarUrl) {
      console.log("User info changed, updating avatar timestamp");
      setAvatarTimestamp(Date.now());
    }
  }, [user]);

  // Cập nhật timestamp khi component mount lần đầu
  useEffect(() => {
    // Update timestamp khi component load lần đầu
    setAvatarTimestamp(Date.now());
    console.log("Profile component mounted, timestamp reset");
  }, []);

  // Thêm useEffect để đảm bảo CSS focus color cho tất cả input
  useEffect(() => {
    // Thêm style global
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      input:focus, textarea:focus, select:focus {
        --tw-ring-color: rgb(249, 115, 22, 0.5) !important;
        border-color: rgb(249, 115, 22) !important;
        outline: none !important;
        box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25) !important;
      }
      .border-orange-hover:hover {
        border-color: rgb(249, 115, 22, 0.5) !important;
      }
      .border-orange {
        border-color: rgb(249, 115, 22) !important;
      }
      .ring-orange {
        --tw-ring-color: rgb(249, 115, 22, 0.5) !important;
      }
      /* Style bổ sung cho input */
      .bg-gray-50, .bg-gray-700 {
        border-color: rgb(229, 231, 235) !important;
      }
      .bg-gray-50:hover, .bg-gray-700:hover {
        border-color: rgb(249, 115, 22, 0.5) !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // --- Render Logic ---
  if (isAuthLoading || isLoadingProfile) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <div className="text-center py-10 text-gray-700 dark:text-gray-300">Đang chuyển hướng đến trang đăng nhập...</div>;
  }

  if (profileError) {
    return <ErrorMessage message={profileError} onRetry={fetchProfile} />;
  }

  if (!profile) {
    return <div className="text-center py-10 text-gray-700 dark:text-gray-300">Không thể tải thông tin tài khoản.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-gradient-to-r from-orange-100 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <span className="bg-orange-500 text-white p-2 rounded-lg"><FiUser size={24} /></span>
          Thông tin tài khoản
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Avatar and Basic Info */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="mb-6 relative">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg relative">
              <img
                src={`${formatImageUrl(profile?.avatarUrl)}?v=${avatarTimestamp}`}
                alt="Profile avatar"
                onClick={handleAvatarClick}
                className="object-cover cursor-pointer w-full h-full transition-transform hover:scale-105"
                onError={(e) => {
                  console.log("Image failed to load:", e.target.src);
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div
                className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 flex justify-center items-center transition-all duration-300 cursor-pointer"
                onClick={handleAvatarClick}
              >
                <div className="bg-white bg-opacity-80 p-2 rounded-full">
                  <FiCamera className="text-gray-800 text-xl" />
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Upload button */}
          {selectedFile && (
            <div className="w-full mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3 flex items-center overflow-hidden">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full mr-3 flex-shrink-0">
                  <FiUpload className="text-blue-500 dark:text-blue-300" />
                </div>
                <div className="flex flex-col min-w-0 flex-grow">
                  <span className="text-xs text-gray-500 dark:text-gray-400">File được chọn</span>
                  <span className="font-medium truncate">{selectedFile.name}</span>
                </div>
              </div>
              <button
                onClick={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white w-full py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-3 font-medium shadow-sm hover:shadow"
              >
                {isUploadingAvatar ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <FiUpload />
                    <span>Cập nhật ảnh đại diện</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Basic Info */}
          <div className="w-full mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg group relative">
                <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-full mr-3">
                  <FiUser className="text-orange-500 dark:text-orange-300" />
                </div>
                <div className="flex flex-col min-w-0 flex-grow">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Tên</span>
                  <span className="font-medium truncate">{profile?.name || "Chưa cập nhật"}</span>
                </div>
                {/* Tooltip hiển thị khi hover */}
                <div className="absolute left-0 bottom-full mb-2 bg-gray-800 text-white text-sm py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {profile?.name || "Chưa cập nhật"}
                </div>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg group relative">
                <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-full mr-3 flex-shrink-0">
                  <FiMail className="text-orange-500 dark:text-orange-300" />
                </div>
                <div className="flex flex-col min-w-0 flex-grow">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
                  <span className="font-medium truncate">{profile?.email}</span>
                </div>
                {/* Tooltip hiển thị khi hover */}
                <div className="absolute left-0 bottom-full mb-2 bg-gray-800 text-white text-sm py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {profile?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Update Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-5 flex items-center text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-lg mr-3">
                <FiUser className="text-orange-500 dark:text-orange-300" />
              </div>
              Cập nhật thông tin
            </h2>
            <form onSubmit={handleUpdateProfile}>
              {profileUpdateError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <FiAlertCircle className="mr-2 flex-shrink-0" />
                  <span>{profileUpdateError}</span>
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Tên hiển thị
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-orange-500 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Nhập tên hiển thị của bạn"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-3 font-medium shadow-sm hover:shadow"
              >
                {isUpdatingProfile ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <FiSave />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <h2 className="text-xl font-semibold mb-5 flex items-center text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-lg mr-3">
                <FiLock className="text-orange-500 dark:text-orange-300" />
              </div>
              Đổi mật khẩu
            </h2>
            <form onSubmit={handleChangePassword}>
              {passwordError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <FiAlertCircle className="mr-2 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="currentPassword" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-orange-500 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <FiEyeOff className="text-gray-500 hover:text-orange-500 transition-colors" />
                    ) : (
                      <FiEye className="text-gray-500 hover:text-orange-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-orange-500 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="text-gray-500 hover:text-orange-500 transition-colors" />
                    ) : (
                      <FiEye className="text-gray-500 hover:text-orange-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Độ mạnh mật khẩu:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.text}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${passwordStrength.bgColor}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span>Tối thiểu 6 ký tự</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span>Có ít nhất 1 chữ hoa</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span>Có ít nhất 1 chữ số</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span>Có ít nhất 1 ký tự đặc biệt</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-orange-500 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Xác nhận lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="text-gray-500 hover:text-orange-500 transition-colors" />
                    ) : (
                      <FiEye className="text-gray-500 hover:text-orange-500 transition-colors" />
                    )}
                  </button>
                </div>
                {/* Password match indicator */}
                {newPassword && confirmPassword && (
                  <div className="mt-2 flex items-center">
                    {newPassword === confirmPassword ? (
                      <>
                        <FiCheckCircle className="text-green-500 mr-2" />
                        <span className="text-xs text-green-500">Mật khẩu khớp</span>
                      </>
                    ) : (
                      <>
                        <FiAlertCircle className="text-red-500 mr-2" />
                        <span className="text-xs text-red-500">Mật khẩu không khớp</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-3 font-medium shadow-sm hover:shadow"
              >
                {isChangingPassword ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FiLock />
                    <span>Đổi mật khẩu</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;