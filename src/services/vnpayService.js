import axiosInstance from '@/lib/axiosInstance';

export const vnpayService = {
  /**
   * Tạo URL thanh toán VNPay cho đơn hàng
   * @param {string} orderId - ID của đơn hàng
   * @param {Object} paymentData - Thông tin thanh toán
   * @returns {Promise} Promise chứa response với paymentUrl
   */
  createPayment: async (orderId, paymentData) => {
    try {
      const response = await axiosInstance.post(`/payments/vnpay/create-payment/${orderId}`, {
        amount: paymentData.amount,
        orderInfo: paymentData.orderInfo || `Thanh toán đơn hàng ${orderId}`,
        returnUrl: paymentData.returnUrl || `${window.location.origin}/payment/result`,
        locale: paymentData.locale || 'vn'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating VNPay payment:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra kết quả thanh toán từ VNPay
   * @param {string} txnRef - Transaction reference
   * @param {string} responseCode - Response code từ VNPay
   * @returns {Promise} Promise chứa kết quả thanh toán
   */
  checkPaymentResult: async (txnRef, responseCode) => {
    try {
      const response = await axiosInstance.get(`/payments/vnpay/payment-result`, {
        params: {
          vnp_TxnRef: txnRef,
          vnp_ResponseCode: responseCode
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error checking payment result:', error);
      throw error;
    }
  },

  /**
   * Query trạng thái thanh toán từ VNPay
   * @param {string} transactionRef - Transaction reference
   * @returns {Promise} Promise chứa trạng thái thanh toán
   */
  queryPaymentStatus: async (transactionRef) => {
    try {
      const response = await axiosInstance.get(`/payments/vnpay/query-status/${transactionRef}`);
      return response.data;
    } catch (error) {
      console.error('Error querying payment status:', error);
      throw error;
    }
  },

  /**
   * Redirect user to VNPay payment page
   * @param {string} paymentUrl - URL thanh toán từ VNPay
   */
  redirectToPayment: (paymentUrl) => {
    if (typeof window !== 'undefined') {
      window.location.href = paymentUrl;
    }
  },

  /**
   * Parse VNPay callback URL parameters
   * @param {string} url - URL callback từ VNPay
   * @returns {Object} Object chứa các parameters từ VNPay
   */
  parseCallbackParams: (url) => {
    const urlObj = new URL(url);
    const params = {};
    
    for (const [key, value] of urlObj.searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  },

  /**
   * Validate VNPay response code
   * @param {string} responseCode - Response code từ VNPay
   * @returns {Object} Object chứa thông tin về kết quả thanh toán
   */
  validateResponseCode: (responseCode) => {
    const responseCodes = {
      '00': { success: true, message: 'Giao dịch thành công' },
      '07': { success: false, message: 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).' },
      '09': { success: false, message: 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.' },
      '10': { success: false, message: 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần' },
      '11': { success: false, message: 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.' },
      '12': { success: false, message: 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.' },
      '13': { success: false, message: 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.' },
      '24': { success: false, message: 'Giao dịch không thành công do: Khách hàng hủy giao dịch' },
      '51': { success: false, message: 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.' },
      '65': { success: false, message: 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.' },
      '75': { success: false, message: 'Ngân hàng thanh toán đang bảo trì.' },
      '79': { success: false, message: 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch' },
      '99': { success: false, message: 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)' }
    };
    
    return responseCodes[responseCode] || { 
      success: false, 
      message: `Lỗi không xác định (Mã lỗi: ${responseCode})` 
    };
  }
}; 