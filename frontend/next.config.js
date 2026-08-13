/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    // webpackBuildWorker is intentionally disabled: on Windows it causes a
    // ~45s cold-start delay and a spurious "Could not find or load main class
    // Forge" Java error due to worker-process spawning overhead.
  },
  webpack: (config, { dev }) => {
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
