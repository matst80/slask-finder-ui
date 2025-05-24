/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const destinationHost = "https://slask-finder.tornberg.me";
    return {
      beforeFiles: [
        { source: "/api/:path*", destination: `${destinationHost}/api/:path*` },
        {
          source: "/cart/:path*",
          destination: `${destinationHost}/cart/:path*`,
        },
        {
          source: "/checkout/:path*",
          destination: `${destinationHost}/checkout/:path*`,
        },
        {
          source: "/confirmation/:path*",
          destination: `${destinationHost}/confirmation/:path*`,
        },
        {
          source: "/tracking/:path*",
          destination: `${destinationHost}/tracking/:path*`,
        },
        {
          source: "/track/:path*",
          destination: `${destinationHost}/track/:path*`,
        },
      ],
      fallback: [
        // This rewrite will only apply if the request doesn't match a page or public file under /admin
        {
          source: "/admin/:path*",
          destination: `${destinationHost}/admin/:path*`,
        },
      ],
    };
  },
  // Add other Next.js configurations here if needed
};

export default nextConfig;
