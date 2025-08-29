/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@whiskeysockets/baileys'],
  
  // Docker CSS fix
  trailingSlash: false,
  generateEtags: false,
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
        'supports-color': 'commonjs supports-color'
      });
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false
    };

    return config;
  },
  
  async rewrites() {
    return [
      {
        source: '/api/whatsapp/:path*',
        destination: '/api/whatsapp/:path*'
      }
    ];
  }
};

module.exports = nextConfig;