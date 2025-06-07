/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },  // Performance optimizations
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  // Optimize compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
 
export default nextConfig;
