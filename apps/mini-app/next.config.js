/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vercel.app', 'linka-mini-app.vercel.app'],
  },
  async headers() {
    return [
      {
        source: '/.well-known/farcaster.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

