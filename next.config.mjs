/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['image.tmdb.org'],
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.themoviedb.org/3/:path*',
        },
      ]
    },
  };
  
  export default nextConfig;