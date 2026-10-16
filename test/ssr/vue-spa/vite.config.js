// Consumer setup exactly as the README documents it.
import vue from '@vitejs/plugin-vue'
import { isCustomElement } from './vendor/accesserty-ui-kit-vue.js'

export default {
  plugins: [vue({ template: { compilerOptions: { isCustomElement } } })]
}
