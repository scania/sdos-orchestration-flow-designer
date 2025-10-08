/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Built-in replacement for next-transpile-modules
  transpilePackages: ["@scania/tegel-react", "@scania/tegel"],
};

module.exports = nextConfig;
