import { defineConfig } from 'vite';

/**
 * During local dev the integration's API is origin-locked, so requests from
 * localhost will be rejected by the backend. Set `VITE_API_BASE` to point at
 * the deployed integration if you want to exercise the endpoints directly.
 *
 *   VITE_API_BASE=https://stripe-ghosts-custome-checkout.vercel.app npm run dev
 */
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://stripe-ghosts-custome-checkout.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
