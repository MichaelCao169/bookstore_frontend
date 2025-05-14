/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cho phép tải hình ảnh từ tất cả các domain bằng cách tắt tối ưu hóa hình ảnh của Next.js
    unoptimized: true,
    
    // Dưới đây là danh sách các domain được phép nếu muốn bật lại tối ưu hóa
    // Giữ lại danh sách để tham khảo nhưng không áp dụng khi unoptimized: true
    /* 
    domains: [
      'm.media-amazon.com', 
      'images-na.ssl-images-amazon.com',
      'img.freepik.com',
      'covers.openlibrary.org',
      'books.google.com',
      'storage.googleapis.com',
      'picsum.photos',
      'loremflickr.com',
      'placeimg.com',
      'via.placeholder.com',
      'dummyimage.com',
      'placekitten.com',
      'localhost',
      'localhost:8080',
      'bizweb.dktcdn.net',
      'cdn0.fahasa.com'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/uploads/**',
      }
    ]
    */
  },
};
 
export default nextConfig;
