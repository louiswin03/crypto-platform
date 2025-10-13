import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration de sécurité
  poweredByHeader: false, // Masquer le header X-Powered-By pour éviter la détection de version

  async headers() {
    return [
      {
        // Appliquer les headers de sécurité à toutes les routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ],
      },
    ]
  },
};

export default nextConfig;
