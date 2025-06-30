import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketManager {
  constructor() {
    this.client = null;
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnectTimeoutId = null;
    this.subscriptions = new Map();
    this.messageQueue = [];
    this.currentUser = null;
    this.token = null;
    this.messageListeners = new Map(); 
    this.statusChangeCallbacks = new Set(); 
  }

  connect(token, user) {
    if (this.isConnecting || (this.client && this.client.connected)) {
      console.log('WebSocketManager: Already connecting or connected');
      return Promise.resolve();
    }

    this.token = token;
    this.currentUser = user;

    return new Promise((resolve, reject) => {
      this.cleanup();
      
      this.isConnecting = true;
      this.notifyStatusChange();
      console.log('WebSocketManager: Connecting...');

      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        reconnectDelay: 0,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log('WebSocketManager: Connected');
        this.isConnecting = false;
        this.isConnected = true;
        this.notifyStatusChange();
        
        this.setupSubscriptions();
        this.processMessageQueue();
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('WebSocketManager: STOMP error:', frame);
        this.isConnecting = false;
        this.isConnected = false;
        this.notifyStatusChange();
        
        this.scheduleReconnect();
        reject(new Error('STOMP connection failed'));
      };

      this.client.onWebSocketError = (error) => {
        console.error('WebSocketManager: WebSocket error:', error);
        this.isConnecting = false;
        this.isConnected = false;
        this.notifyStatusChange();
        
        this.scheduleReconnect();
        reject(error);
      };

      this.client.onWebSocketClose = (event) => {
        console.log('WebSocketManager: Connection closed:', event);
        this.isConnecting = false;
        this.isConnected = false;
        this.notifyStatusChange();
        
        if (event.code !== 1000) { 
          this.scheduleReconnect();
        }
      };

      try {
        this.client.activate();
      } catch (error) {
        console.error('WebSocketManager: Failed to activate:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  setupSubscriptions() {
    if (!this.client || !this.currentUser) return;

    console.log('WebSocketManager: Setting up subscriptions for user:', this.currentUser.email);
    console.log('WebSocketManager: User roles:', this.currentUser.roles);

    // Subscribe to customer messages if user is a customer
    if (this.currentUser.roles?.includes('ROLE_CUSTOMER')) {
      // Handle both id and userId fields for robustness
      const userId = this.currentUser.id || this.currentUser.userId;
      if (!userId) {
        console.error('WebSocketManager: No user ID found for customer subscription');
        return;
      }
      const customerTopic = `/topic/customer/${userId}/messages`;
      console.log('WebSocketManager: Subscribing to customer topic:', customerTopic);
      this.subscribe(customerTopic, 'customer');
    }

    // Subscribe to admin messages if user is an admin
    if (this.currentUser.roles?.includes('ROLE_ADMIN')) {
      const adminTopic = '/topic/admin/messages';
      console.log('WebSocketManager: Subscribing to admin topic:', adminTopic);
      this.subscribe(adminTopic, 'admin');
    }
  }

  subscribe(topic, type) {
    if (!this.client || !this.client.connected) {
      console.log(`WebSocketManager: Cannot subscribe to ${topic}, not connected`);
      return;
    }

    console.log(`WebSocketManager: Subscribing to ${topic} for type ${type}`);
    
    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const messageData = JSON.parse(message.body);
        console.log(`WebSocketManager: Received ${type} message:`, {
          id: messageData.id,
          conversationId: messageData.conversationId,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          content: messageData.content?.substring(0, 50) + '...',
          isFromAdmin: messageData.isFromAdmin
        });
        
        this.notifySubscribers(type, messageData);
      } catch (error) {
        console.error(`WebSocketManager: Error processing ${type} message:`, error);
      }
    });

    this.subscriptions.set(topic, subscription);
    console.log(`WebSocketManager: Successfully subscribed to ${topic}`);
  }

  // Message listener management
  addMessageListener(type, callback) {
    if (!this.messageListeners) {
      this.messageListeners = new Map();
    }
    
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, []);
    }
    
    this.messageListeners.get(type).push(callback);
  }

  removeMessageListener(type, callback) {
    if (!this.messageListeners || !this.messageListeners.has(type)) return;
    
    const listeners = this.messageListeners.get(type);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  notifySubscribers(type, messageData) {
    console.log(`WebSocketManager: Notifying ${type} subscribers with message:`, {
      id: messageData.id,
      conversationId: messageData.conversationId,
      listenersCount: this.messageListeners?.get(type)?.length || 0
    });
    
    if (!this.messageListeners || !this.messageListeners.has(type)) {
      console.log(`WebSocketManager: No listeners for type ${type}`);
      return;
    }
    
    this.messageListeners.get(type).forEach((callback, index) => {
      try {
        console.log(`WebSocketManager: Calling listener ${index} for type ${type}`);
        callback(messageData);
      } catch (error) {
        console.error(`WebSocketManager: Error in message listener ${index}:`, error);
      }
    });
  }

  // Status change callback management
  addStatusChangeListener(callback) {
    this.statusChangeCallbacks.add(callback);
  }

  removeStatusChangeListener(callback) {
    this.statusChangeCallbacks.delete(callback);
  }

  notifyStatusChange() {
    const status = {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting
    };
    
    this.statusChangeCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('WebSocketManager: Error in status change listener:', error);
      }
    });
  }

  // Send message
  send(destination, body) {
    if (!this.client || !this.client.connected) {
      console.log('WebSocketManager: Queueing message, not connected');
      this.messageQueue.push({ destination, body });
      return null;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
      
      return 'sent';
    } catch (error) {
      console.error('WebSocketManager: Error sending message:', error);
      return null;
    }
  }

  processMessageQueue() {
    console.log(`WebSocketManager: Processing ${this.messageQueue.length} queued messages`);
    
    while (this.messageQueue.length > 0) {
      const { destination, body } = this.messageQueue.shift();
      this.send(destination, body);
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeoutId) return;

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;
      if (this.token && this.currentUser) {
        console.log('WebSocketManager: Attempting to reconnect...');
        this.connect(this.token, this.currentUser);
      }
    }, 10000);
  }

  disconnect() {
    console.log('WebSocketManager: Disconnecting...');
    this.cleanup();
  }

  cleanup() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.client) {
      try {
        // Unsubscribe from all topics
        this.subscriptions.forEach((subscription, topic) => {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.warn('WebSocketManager: Error unsubscribing:', error);
          }
        });
        this.subscriptions.clear();

        this.client.deactivate();
      } catch (error) {
        console.warn('WebSocketManager: Error during cleanup:', error);
      }
      this.client = null;
    }

    this.isConnecting = false;
    this.isConnected = false;
    this.messageQueue = [];
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting
    };
  }
}

// Tạo singleton instance
const webSocketManager = new WebSocketManager();

export default webSocketManager;