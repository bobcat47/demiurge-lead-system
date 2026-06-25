/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true
  },
  env: {
    PORT: process.env.PORT || '3000'
  }
};

module.exports = nextConfig;
