import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: [
        'favicon.svg',
        'icons.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'worklets/noise-processor.js',
        'fonts/figtree-latin.woff2',
        'fonts/figtree-latin-ext.woff2',
        'fonts/fraunces-latin.woff2',
        'fonts/fraunces-latin-ext.woff2',
      ],
      manifest: {
        name: 'MeditateIt',
        short_name: 'MeditateIt',
        description:
          'Generative meditation soundscapes — noise, solfeggio, and beats you shape in real time.',
        theme_color: '#e4efe9',
        background_color: '#e4efe9',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['health', 'lifestyle', 'wellness'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell + hashed assets (incl. noise AudioWorklet via ?url).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // No third-party runtime caches — fonts ship from /fonts (self-hosted).
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
