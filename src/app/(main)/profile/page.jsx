'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCamera, FaCheck, FaTimes, FaEdit, FaSave } from 'react-icons/fa';
import { MdEmail, MdPhone, MdPerson, MdSecurity, MdAccountCircle } from 'react-icons/md';
import { HiUpload, HiRefresh, HiInformationCircle } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axiosInstance';
import { cities, getDistrictsByCity } from '@/data/vietnamLocations';
import Link from 'next/link';

// Dynamic imports for heavy components
const BrandSpinner = dynamic(() => import('@/components/ui/BrandSpinner'), { ssr: false });
const UserAvatar = dynamic(() => import('@/components/ui/UserAvatar'), { ssr: false });

const ProfilePage = () => {
  const router = useRouter();
  const { user, accessToken, logout, updateUser } = useAuthStore();  // Profile states
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    avatar: null,
    // Địa chỉ mặc định
    street: '',
    district: '',
    city: '',
    country: 'Việt Nam'
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });    // Avatar states
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  // Password strength
  // Location states removed - now using memoized value

  // File input ref
  const fileInputRef = useRef(null);
  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }

    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || null,
        // Địa chỉ mặc định từ defaultAddress nếu có
        street: user.defaultAddress?.street === 'N/A' ? '' : user.defaultAddress?.street || '',
        district: user.defaultAddress?.district === 'N/A' ? '' : user.defaultAddress?.district || '',
        city: user.defaultAddress?.city === 'N/A' ? '' : user.defaultAddress?.city || '',
        country: user.defaultAddress?.country === 'N/A' ? 'Việt Nam' : user.defaultAddress?.country || 'Việt Nam'
      });
    }
  }, [user, accessToken, router]);
  // Memoize expensive calculations
  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, []);

  const passwordStrength = useMemo(() =>
    calculatePasswordStrength(passwordData.newPassword),
    [passwordData.newPassword, calculatePasswordStrength]
  );

  // Memoize available districts
  const availableDistricts = useMemo(() => {
    const userCity = user?.defaultAddress?.city === 'N/A' ? '' : user?.defaultAddress?.city || '';
    return userCity ? getDistrictsByCity(userCity) : [];
  }, [user?.defaultAddress?.city]); const handleProfileUpdate = useCallback(async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      // Format data according to backend DTO structure
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        defaultAddress: {
          street: profileData.street || 'N/A',
          district: profileData.district || 'N/A',
          city: profileData.city || 'N/A',
          country: profileData.country || 'N/A',
          phone: profileData.phone || 'N/A',
          recipientName: profileData.name || 'N/A'
        }
      };

      const response = await axiosInstance.put('/profile', updateData);
      updateUser(response.data);
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
      console.error('Profile update error:', error);
    } finally {
      setIsProfileLoading(false);
    }
  }, [profileData, updateUser]);
  const handlePasswordChange = useCallback(async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsPasswordLoading(true);

    try {
      await axiosInstance.put('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      toast.error(errorMessage);
    } finally {
      setIsPasswordLoading(false);
    }
  }, [passwordData]); const handleAvatarUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); // Backend expects 'file' parameter

    setIsAvatarLoading(true);

    try {
      // Step 1: Upload the file to get the URL
      const uploadResponse = await axiosInstance.post('/uploads/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const avatarUrl = uploadResponse.data.url;

      // Step 2: Update user profile with the new avatar URL
      const updateResponse = await axiosInstance.put('/profile/avatar', {
        avatarUrl: avatarUrl
      });      // Update user state with new avatar
      updateUser({ ...user, avatar: avatarUrl, avatarUrl: avatarUrl });
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra khi tải lên ảnh đại diện';
      toast.error(errorMessage);
    } finally {
      setIsAvatarLoading(false);
      setPendingAvatarFile(null);
      setPreviewAvatar(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewAvatar(e.target.result);
    };
    reader.readAsDataURL(file);

    // Store file
    setPendingAvatarFile(file);
  };

  const handleAvatarConfirm = () => {
    if (pendingAvatarFile) {
      handleAvatarUpload(pendingAvatarFile);
    }
  }; const handleAvatarCancel = () => {
    setPendingAvatarFile(null);
    setPreviewAvatar(null);

    // Reset file input value để có thể chọn lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 1) return 'Rất yếu';
    if (strength <= 2) return 'Yếu';
    if (strength <= 3) return 'Trung bình';
    if (strength <= 4) return 'Mạnh';
    return 'Rất mạnh';
  };

  // Xử lý khi thay đổi thành phố
  const handleCityChange = (newCity) => {
    setProfileData(prev => ({
      ...prev,
      city: newCity,
      district: '' // Reset district khi đổi city
    }));
    setAvailableDistricts(getDistrictsByCity(newCity));
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandSpinner text="Đang chuyển hướng..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6 shadow-lg">
            <MdAccountCircle className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Thông tin tài khoản
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="text-center">                                {/* Avatar */}
                <div className={`relative inline-block ${previewAvatar ? 'mb-12' : 'mb-6'}`}>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 p-1 shadow-lg">
                    {previewAvatar ? (
                      <img
                        src={previewAvatar}
                        alt="Preview"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserAvatar
                        name={user?.name || user?.displayName || `${user?.firstName} ${user?.lastName}`.trim() || 'User'}
                        avatarUrl={(user?.avatar || user?.avatarUrl) && !(user?.avatar || user?.avatarUrl).includes('default-avatar') ? (user?.avatar || user?.avatarUrl) : null}
                        size="2xl"
                        className="w-full h-full"
                      />
                    )}
                  </div>

                  {/* Upload Button */}
                  <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                    <FaCamera className="text-sm" />                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  {/* Preview and Confirmation Buttons */}
                  {previewAvatar && (
                    <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 border border-gray-200 dark:border-gray-600">
                      <button
                        onClick={handleAvatarCancel}
                        className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                        title="Hủy"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                      <button
                        onClick={handleAvatarConfirm}
                        className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isAvatarLoading}
                        title="Xác nhận"
                      >
                        {isAvatarLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FaCheck className="text-sm" />
                        )}
                      </button>
                    </div>
                  )}

                  {isAvatarLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <BrandSpinner size="text-2xl" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 flex items-center justify-center">
                  <MdEmail className="mr-2" />
                  {user?.email}
                </p>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-1">
                      {user?.ordersCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Đơn hàng
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-1">
                      {user?.wishlistCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Yêu thích
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <MdPerson className="mr-3 text-orange-500" />
                    Thông tin cá nhân
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <FaEdit className="mr-2" />
                    {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                  </button>
                </div>                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tên đầy đủ
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="Nhập tên đầy đủ của bạn"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="Nhập số điện thoại của bạn" />
                  </div>

                  {/* Địa chỉ mặc định */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Địa chỉ mặc định
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Địa chỉ này sẽ được sử dụng làm mặc định khi checkout. Bạn có thể thay đổi khi đặt hàng.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Địa chỉ (Số nhà, tên đường)
                        </label>
                        <input
                          type="text"
                          value={profileData.street}
                          onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Ví dụ: 123 Nguyễn Văn A"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tỉnh / Thành phố
                          </label>
                          <select
                            value={profileData.city}
                            onChange={(e) => handleCityChange(e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <option value="">Chọn tỉnh/thành phố</option>
                            {cities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quận / Huyện
                          </label>
                          <select
                            value={profileData.district}
                            onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                            disabled={!isEditing || !profileData.city}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <option value="">
                              {!profileData.city ? 'Chọn tỉnh/thành phố trước' : 'Chọn quận/huyện'}
                            </option>
                            {availableDistricts.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quốc gia
                        </label>
                        <input
                          type="text"
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Việt Nam"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Email không thể thay đổi
                    </p>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isProfileLoading}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProfileLoading ? (
                          <>
                            <BrandSpinner size="text-sm" className="mr-2" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" />
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-6">
                  <MdSecurity className="mr-3 text-orange-500" />
                  Đổi mật khẩu
                </h3>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Độ mạnh mật khẩu:
                          </span>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="Xác nhận mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {passwordData.newPassword && passwordData.confirmPassword && (
                      <div className="mt-2 flex items-center">
                        {passwordData.newPassword === passwordData.confirmPassword ? (
                          <>
                            <FaCheck className="text-green-500 mr-2" />
                            <span className="text-sm text-green-500">Mật khẩu khớp</span>
                          </>
                        ) : (
                          <>
                            <FaTimes className="text-red-500 mr-2" />
                            <span className="text-sm text-red-500">Mật khẩu không khớp</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isPasswordLoading}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPasswordLoading ? (
                        <>
                          <BrandSpinner size="text-sm" className="mr-2" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <FaLock className="mr-2" />
                          Đổi mật khẩu
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ProfilePage;
