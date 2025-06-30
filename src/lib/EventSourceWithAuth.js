
export default class EventSourceWithAuth {
    constructor(url, options = {}) {
        this.url = url;
        this.options = options;
        this.listeners = {
            message: [],
            error: [],
            open: [],
            connection: [],
            'keep-alive': []
        };
        
        this.readyState = 0; // 0 = ĐANG KẾT NỐI
        this.reconnectDelay = 5000;
        this.maxReconnectDelay = 30000;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // Kiểm tra tính khả dụng của server trước khi kết nối
        this._checkServerAvailability()
            .then(isAvailable => {
                if (isAvailable) {
                    // Tạo EventSource thực tế
                    this._createEventSource();
                } else {
                    console.error('Server is not available, will retry connection later');
                    this._handleReconnect();
                }
            })
            .catch(() => {
                // Nếu việc kiểm tra thất bại, vẫn thử kết nối
                this._createEventSource();
            });
    }
    
    // Kiểm tra xem server có khả dụng bằng cách tạo request HEAD
    async _checkServerAvailability() {
        try {
            // Sử dụng API_BASE_URL giống trong apiRoutes.js thay vì lấy từ this.url
            const { API_BASE_URL } = require('./apiRoutes');
            const serverUrl = `${API_BASE_URL}/api/test/hello-public`;
            
            console.log(`Checking server availability at ${serverUrl}`);
            
            // Sử dụng fetch với timeout ngắn
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(serverUrl, {
                method: 'HEAD',
                credentials: 'include',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log('Server is available');
                return true;
            } else {
                console.warn(`Server check failed with status: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.error('Server availability check failed:', error.message);
            return false;
        }
    }
    
    // Phương thức để tạo EventSource cơ bản
    _createEventSource() {
        try {
            console.log(`Creating EventSource connection to ${this.url}`);
            
            // Thêm timestamp vào URL để tránh vấn đề caching
            const urlWithNoCaching = new URL(this.url);
            urlWithNoCaching.searchParams.append('_t', Date.now());
            
            this.eventSource = new EventSource(urlWithNoCaching.toString(), this.options);
            
            // Chuyển tiếp readyState
            this.readyState = this.eventSource.readyState;
            
            // Thiết lập các event listener cốt lõi
            this.eventSource.onopen = (event) => {
                console.log('EventSource connection opened');
                this.readyState = this.eventSource.readyState;
                this.reconnectAttempts = 0; // Đặt lại số lần thử kết nối khi kết nối thành công
                this._dispatchEvent('open', event);
            };
            
            this.eventSource.onmessage = (event) => {
                this._dispatchEvent('message', event);
            };
            
            this.eventSource.onerror = (event) => {
                const readyStateText = ['CONNECTING', 'OPEN', 'CLOSED'][this.eventSource.readyState] || this.eventSource.readyState;
                console.error(`EventSource error - ReadyState: ${readyStateText}(${this.eventSource.readyState})`);
                
                // Kiểm tra xem có đang gặp lỗi CORS không
                if (this.eventSource.readyState === 2) { // ĐÓNG
                    console.error('Connection closed due to an error. This might be due to CORS issues or server unavailability.');
                    // Ghi log thông tin chẩn đoán
                    console.log('URL:', this.url);
                    console.log('Options:', JSON.stringify(this.options));
                    console.log('Browser:', navigator.userAgent);
                    
                    // Thử sử dụng polling fallback sau các lần thất bại liên tiếp
                    if (this.reconnectAttempts >= 2) {
                        console.log('Multiple reconnect failures, switching to polling fallback');
                        this.close();
                        this._startPollingFallback();
                        return;
                    }
                }
                
                this.readyState = this.eventSource.readyState;
                this._dispatchEvent('error', event);
                
                // Xử lý kết nối lại tự động
                if (this.eventSource.readyState === 2) { // ĐÓNG
                    this._handleReconnect();
                }
            };
            
            // Thiết lập các event listener tùy chỉnh
            ['connection', 'keep-alive'].forEach(eventName => {
                this.eventSource.addEventListener(eventName, (event) => {
                    this._dispatchEvent(eventName, event);
                });
            });
        } catch (error) {
            console.error('Error creating EventSource:', error);
            this._handleReconnect();
        }
    }
    
    // Xử lý logic kết nối lại
    _handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn(`Max reconnection attempts (${this.maxReconnectAttempts}) reached, giving up`);
            return;
        }
        
        // Đóng kết nối hiện tại nếu có
        this.close();
        
        // Tính toán độ trễ exponential backoff
        const delay = Math.min(
            this.maxReconnectDelay,
            this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts)
        );
        
        console.log(`Attempting to reconnect in ${delay/1000} seconds (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
        
        // Đặt timeout cho việc kết nối lại
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this._createEventSource();
        }, delay);
    }
    
    // Helper để gửi events cho các listeners đã đăng ký
    _dispatchEvent(type, event) {
        if (this.listeners[type]) {
            this.listeners[type].forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error(`Error in ${type} event listener:`, error);
                }
            });
        }
    }
    
    // Các phương thức API công khai
    addEventListener(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
        
        // Nếu đây là cho custom event, thêm vào EventSource cơ bản cũng
        if (this.eventSource && type !== 'message' && type !== 'error' && type !== 'open') {
            this.eventSource.addEventListener(type, callback);
        }
        
        return this;
    }
    
    removeEventListener(type, callback) {
        if (this.listeners[type]) {
            this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
        }
        
        // Cũng xóa khỏi EventSource cơ bản nếu tồn tại
        if (this.eventSource && type !== 'message' && type !== 'error' && type !== 'open') {
            this.eventSource.removeEventListener(type, callback);
        }
        
        return this;
    }
    
    // Fallback sang sử dụng polling với fetch khi EventSource thất bại
    _startPollingFallback() {
        console.log('Starting polling fallback for SSE');
        
        // Tạo một open event giả lập
        this._dispatchEvent('open', { data: 'Polling fallback connected' });
        
        // Hàm để polling messages
        const poll = async () => {
            if (this.readyState === 2) return; // Dừng nếu đã đóng
            
            try {
                // Sử dụng API_BASE_URL cho polling endpoint
                const { API_BASE_URL } = require('./apiRoutes');
                
                // Trích xuất path và parameters từ URL SSE gốc
                const originalUrl = new URL(this.url);
                const pollUrl = new URL(`${API_BASE_URL}/api/poll/messages`);
                
                // Thêm các parameters giống như SSE URL
                originalUrl.searchParams.forEach((value, key) => {
                    if (key !== '_t') { // Bỏ qua timestamp
                        pollUrl.searchParams.append(key, value);
                    }
                });
                
                // Thêm timestamp để tránh caching
                pollUrl.searchParams.append('_t', Date.now());
                
                const response = await fetch(pollUrl.toString(), {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${originalUrl.searchParams.get('token') || ''}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Xử lý bất kỳ messages nào
                    if (data && data.messages && Array.isArray(data.messages)) {
                        data.messages.forEach(msg => {
                            this._dispatchEvent('message', { 
                                data: JSON.stringify(msg) 
                            });
                        });
                    }
                    
                    // Gửi keep-alive event
                    this._dispatchEvent('keep-alive', { data: '' });
                    
                    // Đặt lại số lần thử kết nối khi thành công
                    this.reconnectAttempts = 0;
                } else {
                    throw new Error(`Polling failed with status: ${response.status}`);
                }
            } catch (error) {
                console.error('Polling error:', error);
                this.reconnectAttempts++;
                
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('Max polling attempts reached, giving up');
                    this.close();
                    return;
                }
            }
            
            // Lên lịch poll tiếp theo với exponential backoff
            const delay = Math.min(
                this.maxReconnectDelay,
                1000 * Math.pow(1.5, Math.min(3, this.reconnectAttempts))
            );
            
            this.pollTimeout = setTimeout(poll, delay);
        };
        
        // Bắt đầu polling
        poll();
    }
    
    close() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        
        if (this.pollTimeout) {
            clearTimeout(this.pollTimeout);
            this.pollTimeout = null;
        }
        
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        
        this.readyState = 2; // ĐÓNG
    }
} 