/**
 * Custom EventSource wrapper that properly handles authentication and CORS
 * This implementation helps solve issues with SSE connections across browsers
 */
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
        
        this.readyState = 0; // 0 = CONNECTING
        this.reconnectDelay = 5000;
        this.maxReconnectDelay = 30000;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // Check server availability before connecting
        this._checkServerAvailability()
            .then(isAvailable => {
                if (isAvailable) {
                    // Create the actual EventSource
                    this._createEventSource();
                } else {
                    console.error('Server is not available, will retry connection later');
                    this._handleReconnect();
                }
            })
            .catch(() => {
                // If the check fails, try to connect anyway
                this._createEventSource();
            });
    }
    
    // Check if the server is available by making a HEAD request
    async _checkServerAvailability() {
        try {
            // Use the same API_BASE_URL from apiRoutes.js instead of deriving from this.url
            const { API_BASE_URL } = require('./apiRoutes');
            const serverUrl = `${API_BASE_URL}/api/test/hello-public`;
            
            console.log(`Checking server availability at ${serverUrl}`);
            
            // Use fetch with a short timeout
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
    
    // Method to create the underlying EventSource
    _createEventSource() {
        try {
            console.log(`Creating EventSource connection to ${this.url}`);
            
            // Add timestamp to URL to prevent caching issues
            const urlWithNoCaching = new URL(this.url);
            urlWithNoCaching.searchParams.append('_t', Date.now());
            
            this.eventSource = new EventSource(urlWithNoCaching.toString(), this.options);
            
            // Forward the readyState
            this.readyState = this.eventSource.readyState;
            
            // Set up core event listeners
            this.eventSource.onopen = (event) => {
                console.log('EventSource connection opened');
                this.readyState = this.eventSource.readyState;
                this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
                this._dispatchEvent('open', event);
            };
            
            this.eventSource.onmessage = (event) => {
                this._dispatchEvent('message', event);
            };
            
            this.eventSource.onerror = (event) => {
                const readyStateText = ['CONNECTING', 'OPEN', 'CLOSED'][this.eventSource.readyState] || this.eventSource.readyState;
                console.error(`EventSource error - ReadyState: ${readyStateText}(${this.eventSource.readyState})`);
                
                // Check if we're in a CORS error situation
                if (this.eventSource.readyState === 2) { // CLOSED
                    console.error('Connection closed due to an error. This might be due to CORS issues or server unavailability.');
                    // Log diagnostic information
                    console.log('URL:', this.url);
                    console.log('Options:', JSON.stringify(this.options));
                    console.log('Browser:', navigator.userAgent);
                    
                    // Try to use polling fallback after consecutive failures
                    if (this.reconnectAttempts >= 2) {
                        console.log('Multiple reconnect failures, switching to polling fallback');
                        this.close();
                        this._startPollingFallback();
                        return;
                    }
                }
                
                this.readyState = this.eventSource.readyState;
                this._dispatchEvent('error', event);
                
                // Handle automatic reconnection
                if (this.eventSource.readyState === 2) { // CLOSED
                    this._handleReconnect();
                }
            };
            
            // Set up custom event listeners
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
    
    // Handle reconnection logic
    _handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn(`Max reconnection attempts (${this.maxReconnectAttempts}) reached, giving up`);
            return;
        }
        
        // Close existing connection if any
        this.close();
        
        // Calculate exponential backoff delay
        const delay = Math.min(
            this.maxReconnectDelay,
            this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts)
        );
        
        console.log(`Attempting to reconnect in ${delay/1000} seconds (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
        
        // Set timeout for reconnection
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this._createEventSource();
        }, delay);
    }
    
    // Helper to dispatch events to registered listeners
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
    
    // Public API methods
    addEventListener(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
        
        // If this is for a custom event, add it to the underlying EventSource too
        if (this.eventSource && type !== 'message' && type !== 'error' && type !== 'open') {
            this.eventSource.addEventListener(type, callback);
        }
        
        return this;
    }
    
    removeEventListener(type, callback) {
        if (this.listeners[type]) {
            this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
        }
        
        // Also remove from underlying EventSource if it exists
        if (this.eventSource && type !== 'message' && type !== 'error' && type !== 'open') {
            this.eventSource.removeEventListener(type, callback);
        }
        
        return this;
    }
    
    // Fallback to using polling with fetch when EventSource fails
    _startPollingFallback() {
        console.log('Starting polling fallback for SSE');
        
        // Create a synthetic open event
        this._dispatchEvent('open', { data: 'Polling fallback connected' });
        
        // Function to poll for messages
        const poll = async () => {
            if (this.readyState === 2) return; // Stop if closed
            
            try {
                // Use API_BASE_URL for polling endpoint
                const { API_BASE_URL } = require('./apiRoutes');
                
                // Extract path and parameters from original SSE URL
                const originalUrl = new URL(this.url);
                const pollUrl = new URL(`${API_BASE_URL}/api/poll/messages`);
                
                // Add the same parameters as the SSE URL
                originalUrl.searchParams.forEach((value, key) => {
                    if (key !== '_t') { // Skip timestamp
                        pollUrl.searchParams.append(key, value);
                    }
                });
                
                // Add timestamp to prevent caching
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
                    
                    // Process any messages
                    if (data && data.messages && Array.isArray(data.messages)) {
                        data.messages.forEach(msg => {
                            this._dispatchEvent('message', { 
                                data: JSON.stringify(msg) 
                            });
                        });
                    }
                    
                    // Send keep-alive event
                    this._dispatchEvent('keep-alive', { data: '' });
                    
                    // Reset reconnect attempts on success
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
            
            // Schedule next poll with exponential backoff
            const delay = Math.min(
                this.maxReconnectDelay,
                1000 * Math.pow(1.5, Math.min(3, this.reconnectAttempts))
            );
            
            this.pollTimeout = setTimeout(poll, delay);
        };
        
        // Start polling
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
        
        this.readyState = 2; // CLOSED
    }
} 