import { defineConfig } from 'vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.glsl'],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});