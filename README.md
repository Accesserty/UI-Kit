# Accesserty UI Kit

![image](https://badgen.net/badge/license/MIT/orange) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Accesserty/UI-Kit)  
  
Accesserty UI Kit focuses on making web components that comply with accessibility standards. We hope that web pages can be barrier-free, reduce engineers' dependence on various packages, lower entry barriers, and improve usage flexibility, so that they can be easy to use, understandable, and stable during development. In this way, in addition to making the web pages barrier-free, it can also reduce costs in various ways.  


## Challenge
  
- Shadow DOM Isolation: Ensure that assistive technologies can access and interact with the internal structure and elements within the component.  
- Keyboard Navigation and Focus Management: Ensure that components are operable via keyboard and that focus order is logical.  
- Semantic Correctness: Use HTML tags and ARIA roles correctly to ensure that information is accurately conveyed during both transmission and reception.  
- Real-Time Update Notifications: Ensure that users are aware of the current state of the web page when data is updated.  
- Cross-Browser and Device Compatibility: Ensure compatibility across desktops, mobile devices, and older systems.  
- Testing and Validation: Be aware that automated testing tools may not be able to detect all accessibility issues.  
- Usability Across Mainstream Frontend Frameworks: Accesserty UI Kit is developed with the principle of "copy and paste" usability to minimize the cost of creating accessible web pages, free from the pressures of version upgrades. Customization can be done independently if needed, though testing how to use Accesserty UI Kit across various mainstream frontend frameworks can be time-consuming.  


## Demo  

Please open html file found in each component folder to read more.  


## How to Use   

### HTML  

- Copy file (component.js or accesserty-ui-kit.js or accesserty-ui-kit.min.js)     
- Add JavaScript file to HTML <script src="accesserty-ui-kiy.min.js" defer>    
- Using <au-*> tag  
- Add CSS files  

### Nuxt    
  
- Copy file accesserty-ui-kit.min.js, move to public/vendors    
- Create plugins/accesserty.client.ts file    
```js  
import { defineNuxtPlugin } from '#app'    
  
export default defineNuxtPlugin(() => {    
  if (process.client) {    
    const s = document.createElement('script')    
    s.src   = '/vendors/accesserty-ui-kit.min.js'    
    s.defer = true    
    document.head.appendChild(s)    
  }  
})  
```  
- Setting nuxt.config.ts    
```js  
export default defineNuxtConfig({  
  vue: {  
    compilerOptions: {  
      isCustomElement: tag => tag.startsWith('au-')  
    }  
  },  
  
  plugins: [  
    { src: '~/plugins/accesserty.client.ts', mode: 'client' },  
  ]  
})  
```  
- Using <au-*> webcomponent in <client-only>  
- Add CSS Files  

### CSS  

CSS Cascade Layers, CSS Variables, CSS Nested and oklch color  

- au-style  
-- basic-variables (Basic CSS Variables)  
-- components (Native HTML Element Style)  
-- tokens-variables (Theme CSS Variables)  

## Developer  

Please use Node.js version 20 or higher.  

### Unit Test  

We use [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) for component testing.
Run `npm ci` and `npm run test` to test.  
All test files in test folder.

### Build  

We use [vite](https://vitejs.dev/guide/) to bundle all components into a single file, resulting in two outputs: Accesserty UI Kit.js and Accesserty UI Kit.min.js. This process involves using Rollup for the integration.
run `npm run build`
