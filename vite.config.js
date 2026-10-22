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

// Rolldown may print renderChunk results again. Run the existing Terser
// plugin after code generation so string contents and compact output survive.
function minifyFinalOutput() {
  const { renderChunk, ...plugin } = terser();
  return {
    ...plugin,
    name: 'terser-final-output',
    async generateBundle(output, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        const result = await renderChunk.call(this, chunk.code, chunk, output);
        chunk.code = typeof result === 'string' ? result : result.code;
      }
    },
  };
}

export default defineConfig({
  build: {
    // 元件原本就用到 ES2022（static 欄位、Object.hasOwn），不需降轉。
    // 保留原生 class 欄位，避免降轉輔助函式改變單檔載入的邊界。
    target: 'es2022',
    // 停用 Vite 的預設壓縮；只有第二組輸出交給 Terser，保留版本註記。
    minify: false,
    rolldownOptions: {
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
          minify: false,
          plugins: [minifyFinalOutput()]
        }
      ]
    }
  }
});
