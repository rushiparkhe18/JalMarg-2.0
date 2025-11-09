/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Suppress hydration warnings caused by browser extensions
  // (bis_skin_checked from Avast/AVG, Kaspersky, etc.)
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
}

module.exports = nextConfig
