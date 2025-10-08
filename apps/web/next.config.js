/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Support multi-tenant subdomains
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\\.localhost:3000',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig