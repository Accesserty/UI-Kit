import '../vendor/accesserty-ui-kit.js' // defines the au-* elements
import { createApp } from 'vue'
import { AccessertyVue } from '../vendor/accesserty-ui-kit-vue.js'
import App from './App.vue'

window.vm = createApp(App).use(AccessertyVue).mount('#app')
