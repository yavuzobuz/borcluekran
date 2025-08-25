import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Configure for containerized environment
  serverExternalPackages: ['whatsapp-web.js'],
  
  // Webpack configuration for WhatsApp Web.js
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('whatsapp-web.js');
    }
    return config;
  },
};

export default nextConfig;
