import { defineConfig } from 'vite';
import { terser } from 'rollup-plugin-terser'; // 使用 import 而不是 require

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'accesserty-ui-kit.js',
      output: [
        {
          dir: './dist',
          entryFileNames: '[name].js',
          format: 'es'
        },
        {
          dir: './dist',
          entryFileNames: '[name].min.js',
          format: 'es',
          plugins: [terser()]
        }
      ]
    }
  }
});