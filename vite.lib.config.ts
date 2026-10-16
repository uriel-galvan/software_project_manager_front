import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/** Build de librería para /design-sync: dist-lib/index.es.js + styles.css + types. */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 1_000_000,
    lib: {
      entry: 'src/design-system.ts',
      formats: ['es'],
      fileName: () => 'index.es.js',
      cssFileName: 'styles',
    },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] },
  },
});
