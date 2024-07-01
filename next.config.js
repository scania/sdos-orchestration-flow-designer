/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")(["@scania/tegel-react"]);

module.exports = withTM({
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias["@scania/tegel/loader"] = require.resolve(
        "@scania/tegel/loader"
      );
    }
    return config;
  },
});
