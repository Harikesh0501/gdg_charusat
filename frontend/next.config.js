/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    webpackBuildWorker: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Suppress Webpack cache serialization warnings
    config.infrastructureLogging = { level: 'error' }

    // Persistent filesystem cache — subsequent restarts are instant (~0.5s)
    if (dev) {
      config.cache = {
        type: 'filesystem',
        compression: false,
        buildDependencies: {
          config: [__filename],
        },
      }
    }

    return config
  },
}

module.exports = nextConfig
