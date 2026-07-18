import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// 版本+建置日期注入檔頭（/*! */ 讓 terser 保留），部署後才能追溯 vendors 裡是哪一版。
const banner = `/*! Accesserty UI Kit v${pkg.version} | built ${new Date().toISOString().slice(0, 10)} */`;

export default defineConfig({
  build: {
    // esbuild minify 會剝掉所有註解(包含 /*! banner),改由第二個 output 的 terser 負責壓縮
    minify: false,
    rollupOptions: {
      input: './src/accesserty-ui-kit.js',
      output: [
        {
          dir: './dist',
          entryFileNames: '[name].js',
          format: 'es',
          banner
        },
        {
          dir: './dist',
          entryFileNames: '[name].min.js',
          format: 'es',
          banner,
          plugins: [terser()]
        }
      ]
    }
  }
});