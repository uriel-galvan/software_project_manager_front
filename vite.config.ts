import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * El hub declara `CORS_ALLOW_ALL_ORIGINS = DEBUG` pero no monta `corsheaders`,
 * así que no emite cabeceras CORS. En desarrollo se evita por completo el
 * problema sirviendo el API por el mismo origen: Vite hace de proxy y el
 * navegador nunca ve una petición cruzada. En producción el front va detrás
 * del mismo reverse proxy que el backend, que es el caso equivalente.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const target = env.VITE_API_PROXY_TARGET || 'http://localhost:8001';

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5174,
      proxy: {
        '/services/apis': { target, changeOrigin: true },
        '/healthz': { target, changeOrigin: true },
      },
    },
  };
});
