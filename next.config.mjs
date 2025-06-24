/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },  // Performance optimizations
  experimental: {
    optimizePackageImports: ['react-icons', '@tiptap/react', '@tiptap/starter-kit'],
  },
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  // Optimize compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in development
    if (dev) {
      // Disable source maps in development for faster builds
      config.devtool = false;
      
      // Optimize module resolution
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      config.externals = config.externals || [];
      if (isServer) {
        config.externals.push('canvas');
      }
    }

    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
          tiptap: {
            test: /[\\/]node_modules[\\/]@tiptap[\\/]/,
            name: 'tiptap',
            chunks: 'all',
            priority: 20,
          },
          icons: {
            test: /[\\/]node_modules[\\/]react-icons[\\/]/,
            name: 'icons',
            chunks: 'all',
            priority: 15,
          },
        },
      },
    };

    return config;
  },
  // Reduce memory usage
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
};
 
export default nextConfig;
