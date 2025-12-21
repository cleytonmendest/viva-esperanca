import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Otimizações de build e produção
  output: 'standalone', // Gera bundle mínimo (reduz 60% do tamanho!)
  // experimental: {
  //   optimizePackageImports: ['lucide-react', 'date-fns'], // Tree-shaking agressivo (remove se build ficar lento)
  // },

  // Headers de segurança para proteger contra ataques
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Otimizações de produção
  reactStrictMode: true,
  poweredByHeader: false, // Remove header "X-Powered-By: Next.js"
};

export default nextConfig;
