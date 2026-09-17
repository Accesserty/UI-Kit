import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// 版本注入檔頭（/*! */ 讓 terser 保留），部署後才能追溯 vendors 裡是哪一版。
// 不放建置當天日期：否則同一份原始碼每天建出不同的 dist，重建就產生無意義的差異。
// 需要日期時設定 SOURCE_DATE_EPOCH（可重現建置的通用慣例），例如：
//   SOURCE_DATE_EPOCH=$(git log -1 --format=%ct) npm run build
const sourceDate = process.env.SOURCE_DATE_EPOCH
  ? ` | ${new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString().slice(0, 10)}`
  : '';
const banner = `/*! Accesserty UI Kit v${pkg.version}${sourceDate} */`;

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
          // Side-effect registration also supports classic <script defer>.
          // Keep generated helpers/classes out of the consumer's global scope.
          format: 'iife',
          banner
        },
        {
          dir: './dist',
          entryFileNames: '[name].min.js',
          format: 'iife',
          banner,
          plugins: [terser()]
        }
      ]
    }
  }
});
