/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['uploads-ssl.webflow.com', 'assets.website-files.com'],
  },
}

module.exports = nextConfig
