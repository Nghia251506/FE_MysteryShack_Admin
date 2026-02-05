import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Hàm khởi tạo socket
export const createSocketClient = (onMessageReceived: (payload: any) => void) => {
  
  // 1. Tự động nhận diện HTTP/HTTPS để tránh lỗi Security trên Vercel
  const socketUrl = `${(import.meta as any).env.VITE_API_URL}/ws`; 
  
  const client = new Client({
    // Cấu hình dùng SockJS (vì Spring Boot thường dùng thằng này)
    webSocketFactory: () => new SockJS(socketUrl),
    
    // Debug để soi log dưới console
    debug: (str) => {
      console.log('STOMP: ' + str);
    },
    
    reconnectDelay: 5000, // Tự động kết nối lại sau 5s nếu mất mạng
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = (frame) => {
    console.log('Đã kết nối Socket thành công: ' + frame);
    
    // Đăng ký kênh nhận thông báo (ví dụ thông báo cho Admin)
    client.subscribe('/topic/admin/notifications', (message) => {
      if (message.body) {
        onMessageReceived(JSON.parse(message.body));
      }
    });
  };

  client.onStompError = (frame) => {
    console.error('Lỗi Stomp: ' + frame.headers['message']);
  };

  return client;
};