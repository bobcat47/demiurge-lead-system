/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const workerUrl = process.env.WORKER_URL;
    if (!workerUrl) {
      return [];
    }
    return [
      {
        source: '/api/worker/:path*',
        destination: `${workerUrl}/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
