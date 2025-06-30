import axiosInstance from '@/lib/axiosInstance';

export const uploadChatFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/api/uploads/chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Không thể tải lên file',
    };
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/api/uploads/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Không thể tải lên avatar',
    };
  }
};

export const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt'];
  const archiveTypes = ['zip', 'rar'];
  const excelTypes = ['xls', 'xlsx'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (excelTypes.includes(extension)) return 'excel';
  if (archiveTypes.includes(extension)) return 'archive';
  
  return 'other';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
