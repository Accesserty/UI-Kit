var L=Object.defineProperty;var R=(g,e,t)=>e in g?L(g,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):g[e]=t;var k=(g,e,t)=>R(g,typeof e!="symbol"?e+"":e,t);class z extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=document.createElement("div");e.setAttribute("class","au-accordion");const t=document.createElement("slot");e.appendChild(t),this.shadowRoot.appendChild(e)}}customElements.define("au-accordion",z);class I extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=this.generateId(),t=this.generateId(),a=document.createElement("div");a.setAttribute("class","au-accordion-item"),a.innerHTML=`
        <style>
          .au-accordion-item {
            margin-bottom: var(--au-accordion-item-margin-bottom, 1rem);
          }
          button {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: oklch(0 0 0 / 0);
            
            /* spacing */
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            word-break: break-word;
            width: 100%;
            text-align: left;
            padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-accordion-heading-text-color, oklch(0.1398 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family, 'Helvetica, Arial, sans-serif, system-ui');
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: var(--au-accordion-heading-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;

            .heading {
              flex: 1;
            }

            .info {
              display: flex;
              align-items: center;
              gap: 1rem;
              flex: 0 1 auto;
            }

            .icon {
              transition: transform 300ms ease-in;
              display: flex;
              align-items: middle;
            }

            &[aria-expanded="true"] {
              .icon {
                transform: rotate3d(0, 0, 1, 180deg);
                transform-origin: center;
              }
            }

            &:hover {
              background-color: var(--au-accordion-heading-hover-bg, oklch(0.9466 0 0));
              border-color: var(--au-accordion-heading-hover-border-color, oklch(0.7894 0 0));
            }
            
            &:active {
              background-color: var(--au-accordion-heading-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-accordion-heading-active-border-color, oklch(0.7894 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-accordion-heading-focus-shadow-width, 3px) var(--au-accordion-heading-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
            }
          }

          div[role="region"] {
            background-color: var(--au-accordion-content-bg, oklch(0.9731 0 0));
            color: var(--au-accordion-content-text-color, oklch(0.1398 0 0));
            padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);
            overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
            /* 這裡設定展開時的高度 */
            /* 注意：calc-size 目前支援度較低，確保你在支援的環境下使用 */
            height: calc-size(auto, size); 
            overflow: hidden; /* 確保內容縮放時不會溢出 */

            /* --- 2. 關鍵：Transition 必須寫在這裡 --- */
            transition-behavior: allow-discrete;
            transition: height 0.5s ease-in-out, display 0.5s step-end allow-discrete; 
            border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-accordion-content-border-radius, 0);
            @starting-style {
              height: 0;
            }

            &[hidden] {
              height: 0;
              display: none;
            }
          }
        </style>
        <button type="button" aria-expanded="false" aria-controls="${e}" part="button">
            <div class="heading" id="${t}"><slot name="heading"></slot></div>
            <div class="info">
              <div>
                <slot name="sub"></slot>
              </div>
              <div class="icon" aria-hidden="true">
                <slot name="icon"></slot>
              </div>
            </div>
        </button>
        <div role="region" id="${e}" aria-labelledby="${t}" hidden part="region">
            <slot name="content"></slot>
        </div>
      `,this.shadowRoot.append(a),this.button=this.shadowRoot.querySelector("button"),this.button.addEventListener("click",()=>this.toggleAccordion())}connectedCallback(){this.updateExpanded()}static get observedAttributes(){return["open"]}attributeChangedCallback(e,t,a){e==="open"&&this.updateExpanded()}updateExpanded(){const e=this.hasAttribute("open");this.button.setAttribute("aria-expanded",e);const t=this.shadowRoot.querySelector('div[role="region"]');e?t.removeAttribute("hidden"):t.setAttribute("hidden","")}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-accordion-item-${e[0].toString(36)}`}toggleAccordion(){this.hasAttribute("open")?this.removeAttribute("open"):this.setAttribute("open","")}}customElements.define("au-accordion-item",I);class N extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.attachInitialAttributes(),this.render()}attachInitialAttributes(){Array.from(this.attributes).forEach(e=>{e.name!=="style"&&!["class","label","items","separator"].includes(e.name)&&this.shadowRoot.host.setAttribute(e.name,e.value)})}static get observedAttributes(){return["id","class","aria-label","aria-labelledby","label","items","separator"]}attributeChangedCallback(e,t,a){t!==a&&this.render()}get items(){try{return JSON.parse(this.getAttribute("items")||"[]")}catch(e){return console.error("Error parsing 'items':",e),[]}}set items(e){try{JSON.parse(e),this.setAttribute("items",e),this.render()}catch{console.error("Invalid JSON provided for 'items':",e)}}render(){const e=this.getAttribute("id"),t=this.getAttribute("class"),a=this.getAttribute("aria-label"),i=this.getAttribute("aria-labelledby"),r=this.getAttribute("label"),n=this.items,o=this.getAttribute("separator")||"/",s=this.getAttribute("data-link-title-prefix")||"go to";let u="";a!==null?u=`aria-label="${a}"`:i!==null?u=`aria-labelledby="${i}"`:r!==null&&(u=`aria-label="${r}"`),this.shadowRoot.innerHTML=`
      <style>
        nav {
          background-color: var(--au-breadcrumbs-bg, transparent);
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          ol {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
            display: flex;
            align-items: center;
            li {
              &:last-child {
                a {
                  text-decoration: none;
                }
                >span {
                  padding-left: var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
                  font-size: var(--au-breadcrumbs-text-size, 1rem);
                  color: var(--au-breadcrumbs-link-currentpage-color, oklch(0.1398 0 0));
                }
              }
              a {
                display: inline-block;
                padding: var(--au-breadcrumbs-link-padding-vertical, 0.375rem) var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
                font-size: var(--au-breadcrumbs-text-size, 1rem);
                text-decoration: var(--au-breadcrumbs-text-deco, none);
                color: var(--au-breadcrumbs-link-color, oklch(0.429 0.2972777928415759 264.05202063805507));
                -webkit-tap-highlight-color: oklch(0 0 0 / 0);
                &:hover {
                  opacity: 0.7;
                }
                &:active {
                  opacity: 1;
                }
                &:visited {
                  color: var(--au-breadcrumbs-link-visited-color, oklch(0.3748 0.167 303.51));
                }
                &:focus-visible {
                  outline: none;
                  box-shadow: inset 0 0 0 var(--au-breadcrumbs-focus-shadow-width, 3px) var(--au-breadcrumbs-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
                }
                &+span {
                  font-size: var(--au-breadcrumbs-text-size, 1rem);
                }
              }
            }
          }
        }
      </style>
      <nav
        ${e!==null?'id="'+e+'"':""}
        ${t!==null?'class="'+t+'"':""}
        ${u}
      >
        <ol>
          ${n.map((h,p)=>`
                <li>
                  ${p===n.length-1?`<span aria-current="page"><slot name="icon-${p+1}"></slot><span>${h.text}</span></span>`:`<a href="${h.url||""}" title="${s} ${h.text}"><slot name="icon-${p+1}"></slot><span>${h.text}</span></a>`}
                  ${p!==n.length-1?'<span aria-hidden="true">'+o+"</span>":""}
                </li>
              `).join("")}
        </ol>
      </nav>
    `}}customElements.define("au-breadcrumbs",N);class T extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot.innerHTML=`
      <div class="au-card-container" part="au-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `}}customElements.define("au-card",T);class E extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const e=this.generateId(),t=document.createElement("style");t.textContent=`
      .au-checkbox {
        display: inline-block;
        vertical-align: middle;
        padding: var(--au-checkbox-padding, 0.25rem);
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--au-checkbox-content-gap, 0.375rem);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          width: var(--au-checkbox-input-width, 1.5rem);
          height: var(--au-checkbox-input-height, 1.5rem);
          border: var(--au-checkbox-input-border-width, 1px) var(--au-checkbox-input-border-style, solid) var(--au-checkbox-input-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-checkbox-input-border-radius, 0.25rem);
          background-color: var(--au-checkbox-input-bg, oklch(0.994 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-checkbox-input-checked-bg, oklch(0.1398 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--au-checkbox-input-checked-symbol, '✔︎');
              color: var(--au-checkbox-input-checked-text-color, oklch(0.994 0 0));
              font-size: var(--au-checkbox-input-checked-text-size, 1.125rem);
            }
          }
        }
        .text {
          flex: 1;
          color: var(--au-checkbox-label-text-color, oklch(0.1398 0 0));
          font-size: var(--au-checkbox-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-checkbox-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: var(--au-checkbox-label-active-text-color, oklch(0.537 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-checkbox-input-focus-shadow-width, 3px) var(--au-checkbox-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="checkbox"]:disabled) {
          cursor: not-allowed;
          input[type="checkbox"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: var(--au-checkbox-label-disabled-text-color, oklch(0.537 0 0));
          }
        }
      }
    `;const a=document.createElement("div");a.setAttribute("class","au-checkbox");const i=document.createElement("label");i.setAttribute("for",e);const r=document.createElement("input");r.type="checkbox",r.id=e,r.name=this.getAttribute("name")||"default-checkbox",r.value=this.getAttribute("value")||"default";const n=document.createElement("div");n.setAttribute("class","text");const o=document.createElement("slot");n.appendChild(o),i.append(r,n),a.appendChild(i),this.shadowRoot.append(t,a),r.addEventListener("change",s=>{this.checked=s.target.checked,this.dispatchEvent(new CustomEvent("change",{detail:s.target.checked})),this.updateFormValue()}),r.addEventListener("focus",()=>{this.dispatchEvent(new CustomEvent("focus"))}),r.addEventListener("blur",()=>{this.dispatchEvent(new CustomEvent("blur"))})}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-checkbox-${e[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","required"]}attributeChangedCallback(e,t,a){const i=this.shadowRoot.querySelector("input");if(i)switch(e){case"checked":i.checked=a!==null;break;case"disabled":i.disabled=a!==null;break;case"name":i.name=a;break;case"value":i.value=a;break;case"required":i.required=a!==null;break}}connectedCallback(){this.updateCheckedState(),this.updateFormValue()}updateCheckedState(){const e=this.shadowRoot.querySelector("input");e&&(e.checked=this.hasAttribute("checked"))}updateFormValue(){const e=this.shadowRoot.querySelector("input"),t=e.checked?this.getAttribute("value")||"on":null;this.internals.setFormValue(t),e.validity.valid?this.internals.setValidity({}):this.internals.setValidity(e.validity,e.validationMessage,e)}formDisabledCallback(e){const t=this.shadowRoot.querySelector("input");t&&(t.disabled=e)}formResetCallback(){const e=this.shadowRoot.querySelector("input");e&&(e.checked=!1,this.checked=!1,this.updateFormValue())}}k(E,"formAssociated",!0);customElements.define("au-checkbox",E);class $ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.triggerId=this.generateId("trigger"),this.menuId=this.generateId("menu"),this._focusIndex=null;const e=document.createElement("template");e.innerHTML=`
      <style>
        :host {
          display: inline-block;
        }
        :is(button) {
          anchor-name: --dropdown-anchor;
          /* behavior */
          cursor: pointer;
          -webkit-tap-highlight-color: oklch(0 0 0 / 0);

          /* spacing */
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          word-break: break-word;
          width: 100%;
          text-align: left;
          padding: var(--au-btn-padding-vertical, 0.625rem) var(--au-btn-padding-horizontal, 1rem);

          /* text */
          color: var(--au-btn-text-color, oklch(0.1398 0 0));
          font-size: var(--au-btn-text-size, 1rem);
          font-family: var(--au-btn-text-family, 'Helvetica, Arial, sans-serif, system-ui');
          line-height: var(--au-btn-text-line-height, 1.5);

          /* border */
          border: var(--au-btn-border-width, 1px) var(--au-btn-border-style, solid) var(--au-btn-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-btn-border-radius, 0);

          /* others decoration */
          background-color: var(--au-btn-bg, oklch(0.994 0 0));
          transition: background-color 160ms ease-in;

          &[data-size="small"] {
            padding: var(--au-btn-small-padding-vertical, 0.25rem) var(--au-btn-small-padding-horizontal, 0.375rem);
          }

          &[data-size="large"] {
            padding: var(--au-btn-large-padding-vertical, 1rem) var(--au-btn-large-padding-horizontal, 1.625rem);
            font-size: var(--au-btn-large-text-size, 1.25rem);
          }

          &:disabled {
            cursor: not-allowed;
            pointer-events: none;
            opacity: 0.4;
          }

          &:hover {
            background-color: var(--au-btn-hover-bg, oklch(0.9466 0 0));
            border-color: var(--au-btn-hover-border-color, oklch(0.7894 0 0));
          }

          &:active {
            background-color: var(--au-btn-active-bg, oklch(0.8689 0 0));
            border-color: var(--au-btn-active-border-color, oklch(0.7894 0 0));
          }

          &:focus-visible {
            outline: none;
            box-shadow: inset 0 0 0 var(--au-btn-focus-shadow-width, 3px) var(--au-btn-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
          }

          &.a11y {
            transition: none;
            text-shadow: var(--au-btn-a11y-text-shadow, none);
            background-image: var(--au-btn-a11y-bg-image, none);

            background-size: var(--au-btn-a11y-bg-size, 1.5rem 1.5rem);
            background-position: var(--au-btn-a11y-bg-position, center center);

            &:hover {
              background-image: var(--au-btn-a11y-hover-bg-image, none);
            }

            &:active {
              background-image: var(--au-btn-a11y-active-bg-image, none);
            }
          }
        }

        .dropdown-menu {
          position: fixed;
          inset: auto;
          position-anchor: --dropdown-anchor;
          top: anchor(--dropdown-anchor bottom);
          left: anchor(--dropdown-anchor left);
          z-index: 1000;
          min-width: anchor-size(--dropdown-anchor width);
          margin-top: 4px;
          background: var(--au-dropdown-menu-bg, oklch(1 0 0));
          border: var(--au-dropdown-menu-border-width, 1px) var(--au-dropdown-menu-border-style, solid) var(--au-dropdown-menu-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-dropdown-menu-border-radius, 0);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          padding: 0.5rem 0;
          margin: 0;
        }

        .dropdown-menu:popover-open {
          display: block;
        }

        ::slotted(au-dropdown-item) {
          display: block;
        }
      </style>
      <button 
        type="button" 
        role="button"
        id="${this.triggerId}" 
        popovertarget="${this.menuId}"
        aria-haspopup="menu" 
      >
        <slot name="trigger">Dropdown</slot>
        <svg class="icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      <div 
        id="${this.menuId}" 
        class="dropdown-menu" 
        role="menu" 
        popover="auto"
        aria-labelledby="${this.triggerId}"
      >
        <slot></slot>
      </div>
    `,this.shadowRoot.appendChild(e.content.cloneNode(!0)),this.trigger=this.shadowRoot.getElementById(this.triggerId),this.menu=this.shadowRoot.getElementById(this.menuId),this.handleKeyDown=this.handleKeyDown.bind(this),this.handleMenuKeyDown=this.handleMenuKeyDown.bind(this),this.handleToggle=this.handleToggle.bind(this)}connectedCallback(){this.trigger.addEventListener("keydown",this.handleKeyDown),this.menu.addEventListener("keydown",this.handleMenuKeyDown),this.menu.addEventListener("toggle",this.handleToggle)}disconnectedCallback(){this.trigger.removeEventListener("keydown",this.handleKeyDown),this.menu.removeEventListener("keydown",this.handleMenuKeyDown),this.menu.removeEventListener("toggle",this.handleToggle)}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-dropdown-${e[0].toString(36)}`}open(e=0){this.isOpen?this.focusItem(e):(this._focusIndex=e,this.menu.showPopover())}close(){this.menu.hidePopover()}handleToggle(e){var a;const t=e.newState==="open";this.trigger.setAttribute("aria-expanded",t),t?requestAnimationFrame(()=>{const i=this._focusIndex??0;this.focusItem(i),this._focusIndex=null}):(((a=document.activeElement)==null?void 0:a.closest("au-dropdown"))===this&&this.trigger.focus(),this._focusIndex=null)}get isOpen(){return this.menu.matches(":popover-open")}focusItem(e){const t=this.items;if(t.length>0){let a=e;a<0&&(a=t.length-1),a>=t.length&&(a=0),t[a].focus()}}get items(){return Array.from(this.querySelectorAll("au-dropdown-item"))}handleKeyDown(e){switch(e.key){case"Enter":case" ":case"Spacebar":case"ArrowDown":e.preventDefault(),this.open(0);break;case"ArrowUp":e.preventDefault(),this.open(this.items.length-1);break}}handleMenuKeyDown(e){const t=this.items,a=t.indexOf(document.activeElement);switch(e.key){case"ArrowDown":e.preventDefault(),this.focusItem(a+1);break;case"ArrowUp":e.preventDefault(),this.focusItem(a-1);break;case"Home":e.preventDefault(),this.focusItem(0);break;case"End":e.preventDefault(),this.focusItem(t.length-1);break;case"Tab":this.close();break;case"Escape":e.preventDefault(),this.close();break}}}class D extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=document.createElement("template");e.innerHTML=`
      <style>
        :host {
          display: block;
          outline: none;
        }
        
        .item {
          padding: var(--au-dropdown-item-padding, 0.5rem 1rem);
          cursor: pointer;
          color: var(--au-dropdown-item-color, oklch(0.2 0 0));
          font-family: inherit;
          white-space: nowrap;
          transition: background 150ms ease;
        }

        :host(:focus) .item,
        .item:hover {
          outline: none;
          background: var(--au-dropdown-item-hover-bg, oklch(0.95 0 0));
          color: var(--au-dropdown-item-hover-color, oklch(0.1 0 0));
          box-shadow: inset 0 0 0 var(--au-dropdown-focus-shadow-width, 3px) var(--au-dropdown-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        :host(:focus) {
          outline: none;
        }
      </style>
      <div class="item" role="menuitem" tabindex="-1">
        <slot></slot>
      </div>
    `,this.shadowRoot.appendChild(e.content.cloneNode(!0)),this.item=this.shadowRoot.querySelector(".item")}connectedCallback(){this.setAttribute("tabindex","-1"),this.setAttribute("role","none"),this.addEventListener("click",()=>{this.dispatchEvent(new CustomEvent("selected",{bubbles:!0,composed:!0,detail:{value:this.getAttribute("value")}}));const e=this.closest("au-dropdown");e&&e.close()}),this.item.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "||e.key==="Spacebar"){e.preventDefault();const t=this.querySelector("a");t?t.click():this.click()}})}focus(){this.item.focus()}}customElements.define("au-dropdown",$);customElements.define("au-dropdown-item",D);class C extends HTMLElement{constructor(){super();k(this,"_preventDefault",t=>t.preventDefault());this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this.files=[],this.previewUrls=new Map;const t=document.createElement("style");t.textContent=`
      .file-upload-container {
        position: relative;
        :is(ul, ol) {
          list-style: none;
          margin: 0;
          padding: 0;
        }
      }
      label {
        display: inline-block;
        padding: var(--au-file-upload-label-padding-vertical, 0.625rem) var(--au-file-upload-label-padding-horizontal, 0);
        color: var(--au-file-upload-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-file-upload-label-text-size, 1rem);
      }
      .upload-area {
        position: relative;
        display: grid;
        place-content: center;
        padding: 4rem;
        border: var(--au-file-upload-area-border-width, 1px) var(--au-file-upload-area-border-style, dashed) var(--au-file-upload-area-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-file-upload-area-border-radius, 0.25rem);
        transition: box-shadow 120ms ease-in;
        ::slotted([slot="trigger"]) {
          position: relative;
          z-index: 2;
        }
        .drop-zone {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: transparent;
        }
        &:hover {
          box-shadow: var(--box-shadow);
        }
      }
      .error-area {
        font-size: var(--au-file-upload-error-area-text-size, 0.875rem);
        color: var(--au-file-upload-error-area-text-color, oklch(0.4464 0 0));
      }
      .error-list {
        margin: 0;
        color: var(--au-file-upload-error-list-text-color, oklch(0.4747 0.193 29.04));
      }
      .file-list {
        display: flex;
        flex-direction: column;
        gap: var(--au-file-upload-file-list-gap, 0.625rem);
        [role="listitem"] {
          display: flex;
          justify-content: space-between;
          gap: var(--au-file-upload-file-list-item-gap, 0.625rem);
          word-break: break-word;
          align-items: center;
          >div {
            flex: 1;
            display: flex;
            align-items: center;
            gap: var(--au-file-upload-file-list-item-inner-gap, 0.625rem);
          }
          .preview {
            flex: 0 0 3rem;
            width: var(--au-file-upload-file-list-preview-width, 3rem);
            height: var(--au-file-upload-file-list-preview-height, 3rem);
            display: grid;
            place-content: center;
            object-fit: contain;
            border: var(--au-file-upload-file-list-preview-border-width, 1px) var(--au-file-upload-file-list-preview-border-style, solid) var(--au-file-upload-file-list-preview-border-color, oklch(0.7894 0 0));
          }
          .file-name  {
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: var(--au-file-upload-file-list-neme-ellipsis-line, 2);
            overflow: hidden;
            -webkit-box-orient: vertical;
          }
          .delete {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: var(--au-file-upload-delete-tap-highlight-color, oklch(0 0 0 / 0));
            
            /* spacing */
            padding: var(--au-file-upload-delete-padding-vertical, 0.625rem) var(--au-file-upload-delete-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-file-upload-delete-text-color, oklch(0.1398 0 0));
            font-size: var(--au-file-upload-delete-text-size, 1rem);
            line-height: var(--au-file-upload-delete-text-line-height, 1.5);
            
            /* border */
            border: var(--au-file-upload-delete-border-width, 1px) var(--au-file-upload-delete-border-style, solid) var(--au-file-upload-delete-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-file-upload-delete-border-radius, 0.25rem);
            
            /* others decoration */
            background-color: var(--au-file-upload-delete-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;
            
            &:hover {
              background-color: var(--au-file-upload-delete-hover-bg, oklch(0.9466 0 0));
              border-color: var(--au-file-upload-delete-hover-border-color, oklch(0.7894 0 0));
            }
            
            &:active {
              background-color: var(--au-file-upload-delete-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-file-upload-delete-active-border-color, oklch(0.7894 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-file-upload-delete-focus-shadow-width, 3px) var(--au-file-upload-delete-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
            }
          }
        }
        &+[aria-live] {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          z-index: -9999;
        }
      }
    `,this.wrapper=document.createElement("div"),this.wrapper.className="file-upload-wrapper",this.container=document.createElement("div"),this.container.className="file-upload-container",this._id=this.getAttribute("id")||this.generateId(),this.labelEl=document.createElement("label"),this.labelEl.textContent=this.getAttribute("label")||"Upload files",this.labelEl.setAttribute("for",this._id),this.fileInput=document.createElement("input"),this.fileInput.type="file",this.fileInput.hidden=!0,this.fileInput.id=this._id,["accept","multiple","name","disabled","required","form"].forEach(o=>{this.hasAttribute(o)&&this.fileInput.setAttribute(o,this.getAttribute(o))});const a=document.createElement("slot");a.name="trigger",a.addEventListener("click",()=>{this.hasAttribute("disabled")||this.fileInput.click()}),a.addEventListener("keydown",o=>{if(o.key==="Enter"||o.key===" "||o.key==="Spacebar"){if(o.preventDefault(),this.hasAttribute("disabled"))return;this.fileInput.click()}}),this.dropZone=document.createElement("div"),this.dropZone.className="drop-zone",this.dropZone.textContent=this.getAttribute("msg-drop-text")||"Drop files here",this.usageDisplay=document.createElement("div"),this.usageDisplay.className="usage",this.usageDisplay.setAttribute("aria-live","polite"),this.fileList=document.createElement("ul"),this.fileList.className="file-list",this.fileList.setAttribute("role","list"),this.fileList.setAttribute("aria-live","polite"),this.fileList.setAttribute("aria-atomic","true");const i=document.createElement("slot");i.name="hint",this.errorMessage=document.createElement("div"),this.errorMessage.className="error-area",this.errorList=document.createElement("ul"),this.errorList.className="error-list",this.errorMessage.append(i,this.usageDisplay,this.errorList),this.liveRegion=document.createElement("div"),this.liveRegion.setAttribute("aria-live","polite"),this.liveRegion.setAttribute("role","status"),this.liveRegion.setAttribute("aria-atomic","true"),this.fileInput.addEventListener("change",()=>this.handleFiles(this.fileInput.files)),this.dropZone.addEventListener("dragover",o=>{o.preventDefault(),!this.hasAttribute("disabled")&&this.dropZone.classList.add("dragover")}),this.dropZone.addEventListener("dragleave",()=>{this.hasAttribute("disabled")||this.dropZone.classList.remove("dragover")}),this.dropZone.addEventListener("drop",o=>{if(o.preventDefault(),this.hasAttribute("disabled"))return;this.dropZone.classList.remove("dragover");const s=o.dataTransfer;s!=null&&s.files&&this.handleFiles(s.files)});const r=document.createElement("div");r.className="actions";const n=document.createElement("div");n.className="upload-area",n.append(a,this.dropZone),r.append(n),this.container.append(this.labelEl,r,this.errorMessage,this.fileList,this.liveRegion,this.fileInput),this.wrapper.append(this.container),this.shadowRoot.append(t,this.wrapper)}connectedCallback(){document.addEventListener("dragover",this._preventDefault),document.addEventListener("drop",this._preventDefault)}disconnectedCallback(){document.removeEventListener("dragover",this._preventDefault),document.removeEventListener("drop",this._preventDefault),this.revokeAllPreviewUrls()}revokePreviewUrl(t){const a=this.previewUrls.get(t);a&&(URL.revokeObjectURL(a),this.previewUrls.delete(t))}revokeAllPreviewUrls(){this.previewUrls.forEach(t=>URL.revokeObjectURL(t)),this.previewUrls.clear()}handleFiles(t){if(this.hasAttribute("disabled"))return;const a=parseFloat(this.getAttribute("max-total-size-mb")||"20"),i=this.getAttribute("msg-total-size-error")||"Total file size exceeds limit of",r=this.getAttribute("msg-type-error")||"is not an accepted file type.",n=this.getAttribute("msg-size-error")||"exceeds the maximum size of",o=this.getAttribute("msg-count-error")||"You can only upload up to",s=parseInt(this.getAttribute("max-files")||"5",10),u=parseFloat(this.getAttribute("max-size-mb")||"5"),h=this.getAttribute("accept"),p=h?h.split(",").map(m=>m.trim()):[],d=Array.from(t),l=[],c=[];d.forEach(m=>{if(!(p.length===0||p.some(y=>y.endsWith("/*")?m.type.startsWith(y.replace("/*","")):m.type===y||m.name.endsWith(y)))){c.push(`${m.name} ${r}`);return}if(m.size>u*1024*1024){c.push(`${m.name} ${n} ${u}MB.`);return}l.push(m)});const v=l.filter(m=>!this.files.some(x=>x.name===m.name&&x.size===m.size)),b=s-this.files.length,f=v.slice(0,b);v.slice(b).forEach(m=>{c.push(`${m.name} ${o} ${s} files.`)}),this.files.reduce((m,x)=>m+x.size,0)+f.reduce((m,x)=>m+x.size,0)>a*1024*1024&&(c.push(`${i} ${a}MB.`),f.length=0),c.length>0&&this.showErrors(c),f.length!==0&&(this.files.push(...f),this.updateFileList(),this.updateUsage(),this.announce(`${f.length} file${f.length>1?"s":""} added.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new Event("change",{bubbles:!0})),this.fileInput.value="")}showErrors(t){this.errorList.innerHTML="",t.forEach(a=>{const i=document.createElement("li");i.textContent=a,this.errorList.appendChild(i)}),this.announce(t.join(" "))}announce(t){for(;this.liveRegion.firstChild;)this.liveRegion.removeChild(this.liveRegion.firstChild);requestAnimationFrame(()=>{const a=document.createElement("span");a.textContent=t,this.liveRegion.appendChild(a)})}updateFileList(){this.fileList.innerHTML="",this.files.forEach(t=>{const a=document.createElement("li");a.setAttribute("role","listitem");const i=document.createElement("div");if(t.type.startsWith("image/")){const o=document.createElement("img");o.className="preview";let s=this.previewUrls.get(t);s||(s=URL.createObjectURL(t),this.previewUrls.set(t,s)),o.src=s,o.alt=t.name,o.width=40,o.height=40,i.appendChild(o)}else{const o=document.createElement("span");o.className="preview",o.textContent="📄",o.setAttribute("aria-hidden","true"),i.appendChild(o)}const r=document.createElement("span");r.className="file-name",r.textContent=t.name,i.appendChild(r);const n=document.createElement("button");n.type="button",n.className="delete",n.textContent=this.getAttribute("msg-remove-text")||"Remove",n.setAttribute("aria-label",`Remove ${t.name}`),n.setAttribute("part","delete"),n.addEventListener("click",()=>{this.hasAttribute("disabled")||(this.revokePreviewUrl(t),this.files=this.files.filter(o=>o.name!==t.name||o.size!==t.size),this.updateFileList(),this.updateUsage(),this.announce(`${t.name} removed.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new CustomEvent("remove-file",{detail:t})))}),a.append(i,n),this.fileList.appendChild(a)})}removeFile(t){this.hasAttribute("disabled")||(this.revokePreviewUrl(t),this.files=this.files.filter(a=>a.name!==t.name||a.size!==t.size),this.updateFileList(),this.updateUsage(),this.announce(`${t.name} removed.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new CustomEvent("remove-file",{detail:t})))}updateUsage(){const t=parseFloat(this.getAttribute("max-total-size-mb")||"20"),a=this.files.reduce((i,r)=>i+r.size,0)/(1024*1024);this.usageDisplay.textContent=`${a.toFixed(1)}MB / ${t}MB`}syncFormValue(){const t=new DataTransfer;this.files.forEach(a=>t.items.add(a)),this.internals.setFormValue(t.files)}checkValidity(){return this.hasAttribute("required")&&this.files.length===0?(this.internals.setValidity({valueMissing:!0},this.getAttribute("msg-required")||"Please select at least one file.",this.fileInput),!1):(this.internals.setValidity({}),!0)}formResetCallback(){this.revokeAllPreviewUrls(),this.files=[],this.updateFileList(),this.updateUsage(),this.syncFormValue(),this.checkValidity()}get value(){return this.files}set value(t){Array.isArray(t)&&(this.revokeAllPreviewUrls(),this.files=t,this.updateFileList(),this.updateUsage(),this.syncFormValue(),this.checkValidity())}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-file-upload-${t[0].toString(36)}`}}k(C,"formAssociated",!0);customElements.define("au-file-upload",C);class _ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId();const e=document.createElement("style");e.textContent=`
    .input-wrapper {
      display: flex;
      align-items: center;
      background: var(--au-input-wrapper-bg, transparent);

      label {
        margin: 0;
        padding: var(--au-input-label-padding-vertical, 0.625rem) var(--au-input-label-padding-horizontal, 1rem);
        color: var(--au-input-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-input-label-text-size, 1rem);
        word-break: break-word;
      }
      input {
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        margin: 0;
        padding: var(--au-input-padding-vertical, 0.625rem) var(--au-input-padding-horizontal, 1rem);
        color: var(--au-input-text-color, oklch(0.1398 0 0));
        font-size: var(--au-input-text-size, 1rem);
        border: 0;
        border-radius: var(--au-input-border-radius, 0.25rem);
        outline: none;
        background-color: var(--au-input-bg, oklch(0.994 0 0));
        line-height: var(--au-input-text-line-height, 1.5);

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-input-invalid-shadow-width, 3px) var(--au-input-invalid-shadow-color, oklch(0.5722 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &[type="color"] {
         padding: 0;
        }
      }
      .input-container {
        display: flex;
        align-items: center;
        border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) var(--au-input-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-input-border-radius, 0.25rem);
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
        gap: var(--au-input-container-gap, 0.625rem);
      }
      .color-code {
        font-family: var(--au-input-font-family, monospace);
        font-size: var(--au-input-text-size, 1rem);
        color: var(--au-input-text-color, oklch(0.1398 0 0));
        user-select: text; /* Allow copying */
      }
      .clear-input {
        display: grid;
        place-content: center;

        /* behavior */
        cursor: pointer;
        background-color: var(--au-input-clear-bg, oklch(0.994 0 0));
        color: var(--au-input-clear-text-color, oklch(0.1398 0 0));

        width: 2rem;
        height: 2rem;
        
        /* border */
        border: 0;
        border-radius: var(--au-input-clear-border-radius, 0.25rem);

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &:hover {
          background-color: var(--au-input-clear-hover-bg, oklch(0.9466 0 0));
        }
        
        &:active {
          background-color: var(--au-input-clear-active-bg, oklch(0.8689 0 0));
        }

        &[hidden] {
          display: none;
        }
      }
      &[data-size="small"] {
        :is(label, input, .color-code) {
          padding: var(--au-input-small-padding-vertical, 0.25rem) var(--au-input-small-padding-horizontal, 0.375rem);
        }
      }
      &[data-size="large"] {
        :is(label, input, .color-code)  {
          padding: var(--au-input-large-padding-vertical, 1rem) var(--au-input-large-padding-horizontal, 1.625rem);
          font-size: var(--au-input-large-text-size, 1.25rem);
        }
      }
      &[data-layout="vertical"] {
        flex-direction: column;
        align-items: initial;
        label {
          padding-left: 0;
        }
        input {
          flex: 1;
        }
      }
    }
  `;const t=document.createElement("div");t.className="input-wrapper",this.wrapper=t,this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const a=document.createElement("div");a.className="input-container",this.prefixSlot=document.createElement("slot"),this.prefixSlot.name="prefix",this.prefixSpan=document.createElement("span"),this.prefixSpan.className="prefix",this.prefixSpan.appendChild(this.prefixSlot),this.prefixSpan.hidden=!0,this.input=document.createElement("input"),this.input.id=this._id,this.syncAttributes(),this.colorCodeSpan=document.createElement("span"),this.colorCodeSpan.className="color-code",this.colorCodeSpan.hidden=!0,this.clearButton=document.createElement("button"),this.clearButton.type="button",this.clearButton.className="clear-input",this.clearButton.textContent="✖",this.clearButton.hidden=!0,this.clearButton.setAttribute("part","clear"),this.clearButton.addEventListener("click",()=>{this.clear()}),this.affixSlot=document.createElement("slot"),this.affixSlot.name="affix",this.affixSpan=document.createElement("span"),this.affixSpan.className="affix",this.affixSpan.appendChild(this.affixSlot),this.affixSpan.hidden=!0,a.append(this.prefixSpan,this.input,this.colorCodeSpan,this.clearButton,this.affixSpan),t.append(this.labelEl,a),this.shadowRoot.append(e,t),this.input.addEventListener("input",()=>{this.value=this.input.value,this.dispatchEvent(new Event("input",{bubbles:!0})),this.internals.setFormValue(this.value),this._syncValidity(),this._updateClearButton(),this._updateColorCode()}),this.input.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0}))}),this.prefixSlot.addEventListener("slotchange",()=>{this.prefixSpan.hidden=this.prefixSlot.assignedNodes().length===0}),this.affixSlot.addEventListener("slotchange",()=>{this.affixSpan.hidden=this.affixSlot.assignedNodes().length===0})}static get observedAttributes(){return["type","name","value","placeholder","required","disabled","readonly","label","min","max","step","pattern","autocomplete","autofocus","inputmode","maxlength","minlength","list","data-size","data-layout","data-clear","data-clear-label"]}attributeChangedCallback(e,t,a){e==="label"&&this.labelEl?this.labelEl.textContent=a:(e==="data-size"||e==="data-layout")&&this.wrapper?a===null?this.wrapper.removeAttribute(e):this.wrapper.setAttribute(e,a):e==="data-clear"||e==="data-clear-label"?this._updateClearButton():e==="list"?this._handleListAttribute(a):this.input&&(a===null&&typeof this.input[e]=="boolean"?(this.input[e]=!1,this.input.removeAttribute(e)):(this.input.setAttribute(e,a),typeof this.input[e]=="boolean"&&(this.input[e]=!0)),this._syncValidity(),this._updateColorCode())}get validity(){return this.internals.validity}get validationMessage(){return this.internals.validationMessage}get willValidate(){return this.internals.willValidate}checkValidity(){return this.internals.checkValidity()}reportValidity(){return this.internals.reportValidity()}connectedCallback(){this._initialValueSet||(this._initialValue=this.input.value,this._initialValueSet=!0),this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton(),this._updateColorCode(),this.hasAttribute("list")&&requestAnimationFrame(()=>{this._handleListAttribute(this.getAttribute("list"))})}formResetCallback(){this.input.value=this._initialValue||"",this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton(),this._updateColorCode()}get value(){var e;return(e=this.input)==null?void 0:e.value}set value(e){this.input&&(this.input.value=e,this.setAttribute("value",e),this.internals.setFormValue(e),this._syncValidity(),this._updateClearButton(),this._updateColorCode())}clear(){this.input.value="",this.value="",this.internals.setFormValue(""),this.dispatchEvent(new Event("input",{bubbles:!0})),this.dispatchEvent(new Event("change",{bubbles:!0})),this._updateClearButton(),this._updateColorCode()}suggest(e=""){this.input.value=e,this.value=e,this.internals.setFormValue(e),this.dispatchEvent(new Event("input",{bubbles:!0})),this._updateClearButton(),this._updateColorCode()}focus(){var e;(e=this.input)==null||e.focus()}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-input-${e[0].toString(36)}`}syncAttributes(){Array.from(this.attributes).forEach(e=>{["data-size","data-layout","data-clear","data-clear-label"].includes(e.name)||(this.input.setAttribute(e.name,e.value),e.name==="value"&&(this.input.defaultValue=e.value))})}_syncValidity(){this.input&&(this.input.validity.valid?this.internals.setValidity({}):this.internals.setValidity(this.input.validity,this.input.validationMessage,this.input))}_updateClearButton(){const e=this.hasAttribute("data-clear"),t=this.input.value.length>0,a=this.getAttribute("data-clear-label")||"Clear input";this.clearButton.setAttribute("aria-label",a),this.clearButton.hidden=!(e&&t)}_updateColorCode(){this.input.type==="color"?(this.colorCodeSpan.textContent=this.input.value,this.colorCodeSpan.hidden=!1):this.colorCodeSpan.hidden=!0}_handleListAttribute(e){if(!this.shadowRoot||!this.input)return;const t=this.shadowRoot.querySelector("datalist");if(t&&t.remove(),!e){this.input.removeAttribute("list");return}const a=this.getRootNode(),i=a instanceof Document||a instanceof ShadowRoot?a.getElementById(e):document.getElementById(e);if(i&&i.tagName==="DATALIST"){const r=document.createElement("datalist");r.id=e,Array.from(i.options).forEach(n=>{r.appendChild(n.cloneNode(!0))}),this.shadowRoot.appendChild(r),this.input.setAttribute("list",e)}else this.input.setAttribute("list",e)}}k(_,"formAssociated",!0);customElements.define("au-input",_);class A extends HTMLElement{static get observedAttributes(){return["data-total","data-current-page","data-pager-count","data-page-size","data-page-size-options","data-layout","data-text-total-pages-prefix","data-text-page","data-text-total-items-suffix","data-text-per","data-text-first","data-text-prev","data-text-next","data-text-last","data-text-go","data-text-goto"]}static generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-pagination-${e[0].toString(36)}`}constructor(){super(),this.attachShadow({mode:"open"}),this._selectId=A.generateId(),this._jumpId=A.generateId(),this.liveRegion=document.createElement("div"),this.liveRegion.setAttribute("aria-live","polite"),this.liveRegion.setAttribute("role","status"),this.liveRegion.setAttribute("aria-atomic","true"),this._parseAttributes(),this._render()}attributeChangedCallback(){this._parseAttributes(),this._requestRender()}_requestRender(){this._updatePending||(this._updatePending=!0,requestAnimationFrame(()=>{this._render(),this._updatePending=!1}))}_parseAttributes(){this.total=parseInt(this.getAttribute("data-total"))||0,this.currentPage=parseInt(this.getAttribute("data-current-page"))||1,this.pagerCount=parseInt(this.getAttribute("data-pager-count"))||5,this.pageSize=parseInt(this.getAttribute("data-page-size"))||10;const e=this.getAttribute("data-page-size-options");if(e)try{this.pageSizeOptions=JSON.parse(e)}catch{this.pageSizeOptions=e.split(",").map(a=>parseInt(a.trim()))}else this.pageSizeOptions=[10,30,50,100];const t=this.getAttribute("data-layout");if(t)try{this.layout=JSON.parse(t)}catch{this.layout=t.replace(/[[\]' ]/g,"").split(",")}else this.layout=["total_page","total_items","page_size","first","prev","pages","next","last","jump"];this.texts={totalPagesPrefix:this.getAttribute("data-text-total-pages-prefix")||"Total",pageSuffix:this.getAttribute("data-text-page")||"page(s)",totalItemsSuffix:this.getAttribute("data-text-total-items-suffix")||"item(s)",perText:this.getAttribute("data-text-per")||"each page",firstText:this.getAttribute("data-text-first")||"First",prevText:this.getAttribute("data-text-prev")||"Prev",nextText:this.getAttribute("data-text-next")||"Next",lastText:this.getAttribute("data-text-last")||"Last",goText:this.getAttribute("data-text-go")||"go to",gotoText:this.getAttribute("data-text-goto")||"go to"}}get totalPages(){return Math.ceil(this.total/this.pageSize)||1}get pagers(){const t=Math.floor((this.currentPage-1)/this.pagerCount)*this.pagerCount+1,a=Math.min(t+this.pagerCount-1,this.totalPages),i=[];for(let r=t;r<=a;r++)i.push(r);return i}_render(){const e=this.texts,t=this.layout,a=this.totalPages,i=this.total;this.shadowRoot.innerHTML="";const r=document.createElement("style");r.textContent=`
      :is(ul, ol) {
        list-style: none;
        margin: 0;
        padding: 0;
      } 
      :is(button, select, input) {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);

        /* spacing */
        padding: var(--au-btn-padding-vertical, 0.625rem) var(--au-btn-padding-horizontal, 1rem);

        /* text */
        color: var(--au-btn-text-color, oklch(0.1398 0 0));
        font-size: var(--au-btn-text-size, 1rem);
        font-family: var(--au-btn-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-btn-text-line-height, 1.5);

        /* border */
        border: var(--au-btn-border-width, 1px) var(--au-btn-border-style, solid) var(--au-btn-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-btn-border-radius, 0);

        /* others decoration */
        background-color: var(--au-btn-bg, oklch(0.994 0 0));
        transition: background-color 160ms ease-in;

        &:disabled {
          cursor: not-allowed;
          pointer-events: none;
          opacity: 0.4;
        }

        &:hover {
          background-color: var(--au-btn-hover-bg, oklch(0.9466 0 0));
          border-color: var(--au-btn-hover-border-color, oklch(0.7894 0 0));
        }

        &:active {
          background-color: var(--au-btn-active-bg, oklch(0.8689 0 0));
          border-color: var(--au-btn-active-border-color, oklch(0.7894 0 0));
        }

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-btn-focus-shadow-width, 3px) var(--au-btn-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &[aria-current="page"] {
          cursor: not-allowed;
          pointer-events: none;
          background-color: var(--au-btn-current-bg, oklch(0.7894 0 0));
          color: var(--au-btn-current-text-color, oklch(0.1398 0 0));
          border-color: var(--au-btn-current-border-color, oklch(0.7894 0 0));
        }

        &.a11y {
          transition: none;
          text-shadow: var(--au-btn-a11y-text-shadow, none);
          background-image: var(--au-btn-a11y-bg-image, none);

          background-size: var(--au-btn-a11y-bg-size, 1.5rem 1.5rem);
          background-position: var(--au-btn-a11y-bg-position, center center);

          &:hover {
            background-image: var(--au-btn-a11y-hover-bg-image, none);
          }

          &:active {
            background-image: var(--au-btn-a11y-active-bg-image, none);
          }
        }
      }

      .visually-hidden { 
        position: absolute; 
        width: 1px; 
        height: 1px; 
        padding: 0; 
        margin: -1px; 
        overflow: hidden; 
        clip: rect(0,0,0,0); 
        border: 0;
      }

      .au-pagination {
        container-type: inline-size;
        position: relative;
      }

      .au-pagination + [aria-live] {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        z-index: -9999;
      }

      :is(.au-pagination-container, .au-pagination-group, .pagination-buttons) {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }

      .au-pagination-container {
        gap: 1rem;
        @container (width <= 640px) {
          flex-direction: column;
        }
      }

      :is(.au-pagination-group) {
        gap: 0.625rem;
        justify-content: center;
      }

      .pagination-buttons {
        gap: 0.625rem; 
        li {
          &:has(.pager:not([aria-current="page"])) {
            @container (width <= 640px) {
              display: none;
            }
          }
        }
      }
    `,this.shadowRoot.appendChild(r);const n=document.createElement("div");n.className="au-pagination";const o=document.createElement("div");o.className="au-pagination-container";const s=document.createElement("div");if(s.className="au-pagination-group",t.includes("total_page")){const d=document.createElement("span");d.textContent=`${e.totalPagesPrefix}${a}${e.pageSuffix}`,s.appendChild(d)}if(t.includes("total_items")){const d=document.createElement("span");d.textContent=`${i}${e.totalItemsSuffix}`,s.appendChild(d)}if(t.includes("page_size")){const d=document.createElement("span");d.className="visually-hidden",d.textContent="Page size",s.appendChild(d);const l=document.createElement("label");l.setAttribute("for",this._selectId),l.textContent=e.perText,s.appendChild(l);const c=document.createElement("select");c.id=this._selectId,this.pageSizeOptions.forEach(b=>{const f=document.createElement("option");f.value=b,f.textContent=b,b===this.pageSize&&(f.selected=!0),c.appendChild(f)}),c.addEventListener("change",b=>{this.pageSize=+b.target.value,this.setAttribute("data-page-size",this.pageSize),this.dispatchEvent(new CustomEvent("page-size-change",{detail:this.pageSize,bubbles:!0,composed:!0})),this.currentPage=1,this.setAttribute("data-current-page","1")}),s.appendChild(c);const v=document.createElement("span");v.textContent=e.totalItemsSuffix,s.appendChild(v)}o.appendChild(s);const u=document.createElement("div");u.className="au-pagination-group";const h=document.createElement("ul");if(h.className="pagination-buttons",t.includes("first")){const d=document.createElement("li"),l=document.createElement("button");l.textContent=e.firstText,l.disabled=this.currentPage===1,l.addEventListener("click",()=>this._goto(1)),d.appendChild(l),h.appendChild(d)}if(t.includes("prev")){const d=document.createElement("li"),l=document.createElement("button");l.textContent=e.prevText,l.disabled=this.currentPage===1,l.addEventListener("click",()=>this._goto(this.currentPage-1)),d.appendChild(l),h.appendChild(d)}if(t.includes("pages")&&this.pagers.forEach(d=>{const l=document.createElement("li"),c=document.createElement("button");c.className="pager",d===this.currentPage?(c.setAttribute("aria-current","page"),c.setAttribute("part","current-page")):(c.removeAttribute("aria-current"),c.removeAttribute("part")),c.textContent=d,c.addEventListener("click",()=>this._goto(d)),l.appendChild(c),h.appendChild(l)}),t.includes("next")){const d=document.createElement("li"),l=document.createElement("button");l.textContent=e.nextText,l.disabled=this.currentPage>=a,l.addEventListener("click",()=>this._goto(this.currentPage+1)),d.appendChild(l),h.appendChild(d)}if(t.includes("last")){const d=document.createElement("li"),l=document.createElement("button");l.textContent=e.lastText,l.disabled=this.currentPage>=a,l.addEventListener("click",()=>this._goto(a)),d.appendChild(l),h.appendChild(d)}const p=document.createElement("nav");if(p.setAttribute("aria-label","pagination"),p.appendChild(h),u.appendChild(p),o.appendChild(u),t.includes("jump")){const d=document.createElement("div");d.className="au-pagination-group";const l=document.createElement("label");l.setAttribute("for",this._jumpId),l.textContent=e.goText,d.appendChild(l);const c=document.createElement("input");c.type="number",c.id=this._jumpId,c.min="1",c.max=String(a),c.value=String(this.currentPage),c.addEventListener("keyup",f=>{f.key==="Enter"&&this._goto(+c.value)}),d.appendChild(c);const v=document.createElement("span");v.textContent=e.pageSuffix,d.appendChild(v);const b=document.createElement("button");b.type="button",b.textContent=e.gotoText,b.addEventListener("click",()=>this._goto(+c.value)),d.appendChild(b),o.appendChild(d)}n.appendChild(o),this.shadowRoot.append(n,this.liveRegion)}_goto(e){e<1&&(e=1),e>this.totalPages&&(e=this.totalPages),e!==this.currentPage&&(this.currentPage=e,this.setAttribute("data-current-page",String(e)),this.dispatchEvent(new CustomEvent("page-change",{detail:e,bubbles:!0,composed:!0})),this.announce(`Page ${e}`))}announce(e){for(;this.liveRegion.firstChild;)this.liveRegion.removeChild(this.liveRegion.firstChild);requestAnimationFrame(()=>{const t=document.createElement("span");t.textContent=e,this.liveRegion.appendChild(t)})}}customElements.define("au-pagination",A);class M extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=document.createElement("style");e.textContent=`
      .au-radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.625rem;
      }
      .au-radio-group--vertical {
        flex-direction: column;
        label {
          width: max-content;
        }
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--au-radio-content-gap, 0.375rem);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        padding: 0.25rem;
        input[type="radio"] {
          appearance: none;
          margin: 0;
          cursor: pointer;
          width: var(--au-radio-input-width, 1.5rem);
          height: var(--au-radio-input-height, 1.5rem);
          border: var(--au-radio-input-border-width, 1px) var(--au-radio-input-border-style, solid) var(--au-radio-input-border-color, oklch(0.7894 0 0));
          border-radius: 50%;
          background-color: var(--au-radio-input-bg, oklch(0.994 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-radio-input-checked-bg, oklch(0.1398 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: '';
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background-color: var(--au-radio-input-checked-circle-color, oklch(0.994 0 0));
            }
          }
        }
        .text {
          flex: 1;
          color: var(--au-radio-label-text-color, oklch(0.1398 0 0));
          font-size: var(--au-radio-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-radio-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: var(--au-radio-label-active-text-color, oklch(0.537 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-radio-input-focus-shadow-width, 3px) var(--au-radio-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="radio"]:disabled) {
          cursor: not-allowed;
          input[type="radio"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: var(--au-radio-label-disabled-text-color, oklch(0.537 0 0));
          }
        }
      }
    `;const t=document.createElement("div");t.setAttribute("class","au-radio-group"),t.setAttribute("role","radiogroup"),this.groupName="radio-group-name-"+this.generateId();const a=document.createElement("slot");a.style.display="none",this.shadowRoot.append(e,t,a)}connectedCallback(){this.shadowRoot.querySelector("slot").addEventListener("slotchange",()=>{this.renderRadios()}),this.renderRadios();const t=this.getAttribute("aria-label");t&&this.shadowRoot.querySelector(".au-radio-group").setAttribute("aria-label",t),this.getAttribute("direction")==="vertical"&&this.shadowRoot.querySelector(".au-radio-group").classList.add("au-radio-group--vertical")}renderRadios(){const e=this.shadowRoot.querySelector(".au-radio-group");e.innerHTML="";const a=this.shadowRoot.querySelector("slot").assignedElements(),i=this.hasAttribute("disabled");a.forEach((r,n)=>{const o=document.createElement("label"),s="radio-"+this.generateId();o.setAttribute("for",s);const u=document.createElement("input");u.type="radio",u.id=s,u.name=this.groupName,u.value=r.getAttribute("value")||`radio-${n+1}`,r.hasAttribute("checked")&&(u.checked=!0),(i||r.hasAttribute("disabled"))&&(u.disabled=!0);const h=document.createElement("div");h.setAttribute("class","text"),h.textContent=r.textContent.trim(),o.append(u,h),e.appendChild(o),u.addEventListener("change",p=>this.handleChange(p,u)),u.addEventListener("keydown",p=>this.handleKeyDown(p,n))})}handleChange(e,t){t.checked&&this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`).forEach(i=>{i!==t&&(i.checked=!1)})}handleKeyDown(e,t){const a=Array.from(this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`));let i;switch(e.key){case"ArrowRight":case"ArrowDown":for(e.preventDefault(),i=(t+1)%a.length;a[i].disabled;)i=(i+1)%a.length;a[i].focus(),a[i].click();break;case"ArrowLeft":case"ArrowUp":for(e.preventDefault(),i=(t-1+a.length)%a.length;a[i].disabled;)i=(i-1+a.length)%a.length;a[i].focus(),a[i].click();break}}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`${e[0].toString(36)}`}}customElements.define("au-radio-group",M);class V extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._groupName="rating-"+this.generateId(),this._skipRender=!1;const e=document.createElement("template");e.innerHTML=`
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: var(--au-rating-gap, 0.5rem);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
          cursor: not-allowed;
        }

        :host([readonly]) {
          cursor: default;
        }
        
        .au-rating {
          border: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: var(--au-rating-gap, 0.25rem);
        }

        .au-rating:focus-within {
          box-shadow: inset 0 0 0 var(--au-rating-focus-width, 3px) var(--au-rating-focus-color, oklch(0.8315 0.157 78));
          border-radius: 4px;
        }
        
        .rating-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
        }
        
        input[type="radio"] {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem;
          border-radius: 4px;
          transition: transform 150ms ease;
        }
        
        label:has(input:focus-visible) {
          outline: none;
          box-shadow: 0 0 0 var(--au-rating-focus-width, 3px) var(--au-rating-focus-color, oklch(0.8315 0.157 78));
        }
        
        .star-wrapper {
          position: relative;
          display: block;
          width: var(--au-rating-star-size, 2rem);
          height: var(--au-rating-star-size, 2rem);
        }
        
        .star {
          width: 100%;
          height: 100%;
          stroke: var(--au-rating-star-stroke-color, oklch(0.6 0 0));
          stroke-width: 1;
          transition: fill 150ms ease, transform 150ms ease;
        }
        
        .star-bg {
          fill: var(--au-rating-star-color, oklch(0.8 0 0));
        }
        
        .star-fill {
          position: absolute;
          top: 0;
          left: 0;
          fill: var(--au-rating-star-filled-color, oklch(0.75 0.15 85));
          clip-path: inset(0 var(--au-rating-clip, 100%) 0 0);
          transition: clip-path 150ms ease;
        }
        
        /* Animation for filled stars */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        
        .star-wrapper.animate {
          animation: pulse 200ms ease;
        }
        
        .label-text {
          color: var(--au-rating-label-color, oklch(0.1398 0 0));
          font-size: var(--au-rating-label-size, 0.75rem);
          text-align: center;
          min-height: 1.2em;
          word-break: break-word;
        }
        
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .score {
          color: var(--au-rating-score-color, oklch(0.1398 0 0));
          font-size: var(--au-rating-score-size, 1rem);
          font-weight: 500;
          white-space: nowrap;
        }
        
        .score:empty {
          display: none;
        }
      </style>
      <fieldset class="au-rating" role="radiogroup">
        <legend class="visually-hidden"></legend>
      </fieldset>
      <span class="score"></span>
    `,this.shadowRoot.appendChild(e.content.cloneNode(!0)),this._fieldset=this.shadowRoot.querySelector(".au-rating"),this._legend=this.shadowRoot.querySelector("legend"),this._scoreEl=this.shadowRoot.querySelector(".score"),this._internals=this.attachInternals()}static get formAssociated(){return!0}static get observedAttributes(){return["value","max","labels","aria-label","name","show-score","score-info","disabled","readonly"]}connectedCallback(){this.render(),this._fieldset.addEventListener("change",e=>this.handleChange(e)),this._fieldset.addEventListener("keydown",e=>this.handleKeyDown(e))}attributeChangedCallback(e,t,a){if(t!==a&&this.isConnected&&!this._skipRender)if(e==="value"){const i=parseFloat(a);this.updateStars(i),this.updateScoreDisplay(i),this._internals.setFormValue(a)}else this.render()}get max(){return parseInt(this.getAttribute("max"))||5}get value(){const e=this.getAttribute("value");return e?parseFloat(e):0}set value(e){this.setAttribute("value",e)}get labels(){const e=this.getAttribute("labels");return e?e.split(",").map(t=>t.trim()):[]}get name(){return this.getAttribute("name")||"rating"}get scoreInfo(){return this.getAttribute("score-info")||""}get showScore(){return this.hasAttribute("show-score")}get disabled(){return this.hasAttribute("disabled")}set disabled(e){e?this.setAttribute("disabled",""):this.removeAttribute("disabled")}get readonly(){return this.hasAttribute("readonly")}set readonly(e){e?this.setAttribute("readonly",""):this.removeAttribute("readonly")}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),e[0].toString(36)}getStarSVG(e=""){return`<svg class="star ${e}" viewBox="0 0 24 24" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`}render(){const e=this.getAttribute("aria-label")||"Rating";this._legend.textContent=e,this._fieldset.setAttribute("aria-label",e),this._fieldset.innerHTML='<legend class="visually-hidden"></legend>',this._legend=this._fieldset.querySelector("legend"),this._legend.textContent=e,this.readonly&&this._fieldset.setAttribute("aria-readonly","true"),this.disabled&&this._fieldset.setAttribute("aria-disabled","true");const t=this.labels,a=this.value,i=Math.round(a);for(let r=1;r<=this.max;r++){const n=document.createElement("div");n.className="rating-option";const o=`${this._groupName}-${r}`,s=document.createElement("input");s.type="radio",s.name=this._groupName,s.value=r,s.id=o,r===i&&(s.checked=!0),t[r-1]||s.setAttribute("aria-label",`${r} Star${r!==1?"s":""}`),(this.disabled||this.readonly)&&(s.disabled=!0);const h=document.createElement("label");h.setAttribute("for",o);const p=document.createElement("span");p.className="star-wrapper";const d=Math.floor(a),l=a-d;let c=100;r<=d?c=0:r===d+1&&l>0&&(c=100-l*100),p.style.setProperty("--au-rating-clip",`${c}%`),p.innerHTML=`
        ${this.getStarSVG("star-bg")}
        ${this.getStarSVG("star-fill")}
      `,h.appendChild(p);const v=document.createElement("span");v.className="label-text",v.textContent=t[r-1]||"",h.appendChild(v),n.appendChild(s),n.appendChild(h),this._fieldset.appendChild(n)}this.updateScoreDisplay(a),this._internals.setFormValue(a.toString())}updateScoreDisplay(e){this.showScore?this._scoreEl.textContent=`${e} / ${this.max} ${this.scoreInfo}`.trim():this._scoreEl.textContent=""}handleChange(e){if(e.target.type==="radio"){const t=parseInt(e.target.value);this.value=t,this.updateStars(t),this.updateScoreDisplay(t),this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:{value:t}}))}}updateStars(e){const t=this._fieldset.querySelectorAll(".star-wrapper"),a=Math.floor(e),i=e-a;t.forEach((r,n)=>{const o=n+1;r.classList.remove("animate");let s=100;o<=a?(s=0,o===a&&i===0&&r.classList.add("animate")):o===a+1&&i>0&&(s=100-i*100,r.classList.add("animate")),r.style.setProperty("--au-rating-clip",`${s}%`)})}handleKeyDown(e){const t=Array.from(this._fieldset.querySelectorAll('input[type="radio"]')),a=t.findIndex(r=>r===this.shadowRoot.activeElement||r.checked);let i;switch(e.key){case"ArrowRight":case"ArrowDown":e.preventDefault(),this.value===0&&a===0?i=0:i=(a+1)%t.length,t[i].focus(),t[i].click();break;case"ArrowLeft":case"ArrowUp":e.preventDefault(),i=(a-1+t.length)%t.length,t[i].focus(),t[i].click();break}}formResetCallback(){this.value=this.getAttribute("value")||0,this._internals.setFormValue(this.value?this.value.toString():null)}formStateRestoreCallback(e,t){e&&(this.value=e)}}customElements.define("au-rating",V);class q extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=this.generateId(),t=document.createElement("style");t.textContent=`
      .au-switch {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--au-switch-gap, 1rem);
        cursor: pointer;
        padding-top: var(--au-switch-padding-top, 0.625rem);
        padding-right: var(--au-switch-padding-right, 0.25rem);
        padding-bottom: var(--au-switch-padding-bottom, 0.625rem);
        padding-left: var(--au-switch-padding-left, 0);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        &:hover {
          text-decoration: underline;
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-switch-focus-shadow-width, 3px) var(--au-switch-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        } 
        &:has(input:disabled) {
          cursor: not-allowed;
          opacity: 0.5;
          text-decoration: none;
        } 
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--au-switch-container-gap, 0.625rem);
      }
      .input {
        position: relative;
        &:before {
          content: '';
          display: block;
          width: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          height: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          background-color: gray;
          position: absolute;
          top: var(--au-switch-inner-distance, 0.25rem);
          left: var(--au-switch-inner-distance, 0.25rem);
          border-radius: var(--au-switch-inner-border-radius, calc((var(--au-switch-input-width, 4rem) / 2 - var(--au-switch-inner-distance, 0.25rem)) / 2));
          transition: background-color 360ms ease-in, left 240ms ease-in;
        }
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          margin: 0;
          display: block;
          width: var(--au-switch-input-width, 4rem);
          height: calc(var(--au-switch-input-width, 4rem) / 2);
          border: var(--au-switch-input-border-width, 1px) var(--au-switch-input-border-style, solid) var(--au-switch-input-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-switch-input-border-radius, calc(var(--au-switch-input-width, 4rem) / 4));
          transition: background-color 360ms ease-in;
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
        }
        &:has(input[type="checkbox"]:checked) input[type="checkbox"] {
          background-color: var(--au-switch-input-checked-bg, oklch(0.1398 0 0));
        }
        &:has(input[type="checkbox"]:checked):before {
          background-color: var(--au-switch-inner-checked-bg, oklch(0.994 0 0));
          left: calc(100% - (var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem)) - var(--au-switch-inner-distance, 0.25rem));
        }
      }
     
    `;const a=document.createElement("label");a.classList.add("au-switch"),a.setAttribute("for",e);const i=document.createElement("div");i.classList.add("container");const r=document.createElement("span");r.classList.add("off-text"),r.setAttribute("aria-hidden","true");const n=document.createElement("div");n.classList.add("input"),this.inputElement=document.createElement("input"),this.inputElement.id=e,this.inputElement.type="checkbox",this.inputElement.setAttribute("role","switch"),this.inputElement.setAttribute("aria-checked","false"),n.appendChild(this.inputElement);const o=document.createElement("span");o.classList.add("on-text"),o.setAttribute("aria-hidden","true"),i.append(r,n,o),a.append(i),this.shadowRoot.append(t,a);const s=document.createElement("slot");a.prepend(s),this.inputElement.addEventListener("change",u=>{const h=u.target.checked;this.inputElement.setAttribute("aria-checked",h.toString()),this.dispatchEvent(new CustomEvent("change",{detail:h}))})}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-switch-${e[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","off","on"]}attributeChangedCallback(e,t,a){const i=this.shadowRoot.querySelector("input"),r=this.shadowRoot.querySelector(".off-text"),n=this.shadowRoot.querySelector(".on-text");if(!(!i||!r||!n))switch(e){case"checked":i.checked=a!==null,i.setAttribute("aria-checked",i.checked.toString());break;case"disabled":i.disabled=a!==null;break;case"off":r.textContent=a||"Off";break;case"on":n.textContent=a||"On";break;default:i.setAttribute(e,a);break}}connectedCallback(){const e=this.shadowRoot.querySelector("input"),t=this.shadowRoot.querySelector(".off-text"),a=this.shadowRoot.querySelector(".on-text");e.setAttribute("aria-checked",e.checked.toString()),this.hasAttribute("off")?t.textContent=this.getAttribute("off"):t.textContent="",this.hasAttribute("on")?a.textContent=this.getAttribute("on"):a.textContent=""}}customElements.define("au-switch",q);class F extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._tabs=[],this._panels=[],this._selectedIndex=0,this.container=document.createElement("div"),this.container.classList.add("au-tabs");const e=document.createElement("style");e.textContent=`
      .au-tablist {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        overflow: auto;
      }

      .au-tablist-item{
        &:first-of-type {
          [role="tab"] {
            border-top-left-radius: var(--au-tabs-border-radius, 0);
          }
        }
        &:last-of-type {
          [role="tab"] {
            border-right: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.7894 0 0));
            border-top-right-radius: var(--au-tabs-border-radius, 0);
          }
        }
      }

      button[role="tab"] {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);

        /* spacing */
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.25rem;
        padding: var(--au-tabs-padding-vertical, 0.625rem) var(--au-tabs-padding-horizontal, 1rem);

        /* border */
        border-top: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.7894 0 0));
        border-left: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.7894 0 0));
        border-right: 0;
        border-bottom: 0;

        /* text */
        color: var(--au-tabs-text-color, oklch(0.1398 0 0));
        font-size: var(--au-tabs-text-size, 1rem);
        font-family: var(--au-tabs-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-tabs-text-line-height, 1.5);
        white-space: nowrap;

        /* background */
        background-color: var(--au-tabs-bg, oklch(0.9731 0 0));
        transition: background-color 120ms ease-in;

        &:hover {
          background-color: var(--au-tabs-hover-bg, oklch(0.9466 0 0));
        }
        
        &:active {
          background-color: var(--au-tabs-active-bg, oklch(0.8689 0 0));
        }

        &[aria-selected="true"] {
          paint-order: stroke fill;
          -webkit-text-stroke: var(--au-tabs-selected-text-stroke-width, 0.5px) var(--au-tabs-selected-text-stroke-color, oklch(0.994 0 0));
          box-shadow: inset 0 0 0 var(--au-tabs-selected-shadow-width, 1px) var(--au-tabs-selected-shadow-color, oklch(0.7894 0 0));
          background-color: var(--au-tabs-selected-bg, oklch(0.1398 0 0));
          color: var(--au-tabs-selected-text-color, oklch(0.994 0 0));
        }

        /* focusd */
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }
      }

      .au-tabpanels {
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.7894 0 0));
      }

      .au-tab-panel {
        padding: var(--au-tab-panel-padding-vertical, 0.625rem) var(--au-tab-panel-padding-horizontal, 1rem);
      }

      .badge {
        background-color: var(--au-tab-badge-bg, oklch(0.8689 0 0));
        color: var(--au-tab-badge-text-color, oklch(0.1398 0 0));
        padding: var(--au-tab-badge-padding-vertical, 0) var(--au-tab-badge-padding-horizontal, 0.625rem);
        border-radius: var(--au-tab-badge-border-radius, 0.75rem);
      }

       ::slotted(.au-tab-panel) {
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
        display: none;
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.7894 0 0));
      }

      ::slotted(.au-tab-panel[aria-hidden="false"]) {
        display: block;
      }
    `,this.tabsList=document.createElement("ul"),this.tabsList.setAttribute("role","tablist"),this.tabsList.classList.add("au-tablist");const t=document.createElement("slot");t.name="panel",this.container.append(e,this.tabsList,t),this.shadowRoot.appendChild(this.container)}connectedCallback(){this.shadowRoot.querySelector('slot[name="panel"]').addEventListener("slotchange",()=>{this._renderTabs(),this._attachEvents()}),this._renderTabs(),this._attachEvents()}_renderTabs(){const t=this.shadowRoot.querySelector('slot[name="panel"]').assignedElements().filter(a=>a.classList.contains("au-tab-panel"));this._tabs=[],this._panels=[],this.tabsList.innerHTML="",t.forEach((a,i)=>{const r=a.getAttribute("label")||`Tab ${i+1}`,n=a.getAttribute("data-prefix")||"",o=a.getAttribute("data-badge")||"",s=a.getAttribute("data-affix")||"",u=a.id||this.generateId(),h=`tab-${u}`,p=`panel-${u}`;a.setAttribute("id",p),a.setAttribute("role","tabpanel"),a.setAttribute("aria-labelledby",h),a.setAttribute("aria-hidden",i===0?"false":"true");const d=document.createElement("li");d.setAttribute("role","presentation"),d.className="au-tablist-item"+(i===0?" au-tablist-item--selected":"");const l=document.createElement("button");l.setAttribute("role","tab"),l.setAttribute("id",h),l.setAttribute("aria-controls",p),l.setAttribute("aria-selected",i===0?"true":"false"),l.setAttribute("tabindex",i===0?"0":"-1");const c=document.createDocumentFragment();if(n){const b=document.createElement("span");b.className="prefix",b.textContent=n,c.appendChild(b)}const v=document.createElement("span");if(v.className="label",v.textContent=r,c.appendChild(v),o){const b=document.createElement("span");b.className="badge",b.setAttribute("aria-label",`補充資訊：${o}`),b.textContent=o,c.appendChild(b)}if(s){const b=document.createElement("span");b.className="affix",b.textContent=s,c.appendChild(b)}l.appendChild(c),d.appendChild(l),this.tabsList.appendChild(d),this._tabs.push(l),this._panels.push(a)})}_attachEvents(){this._tabs.forEach((e,t)=>{e.addEventListener("click",()=>this._selectTab(t)),e.addEventListener("keydown",a=>this._onKeydown(a,t))})}_selectTab(e){this._tabs.forEach((t,a)=>{const i=a===e;t.setAttribute("aria-selected",i),t.setAttribute("tabindex",i?"0":"-1"),t.parentElement.classList.toggle("au-tablist-item--selected",i),this._panels[a].setAttribute("aria-hidden",!i)}),this._tabs[e].focus(),this._selectedIndex=e}_onKeydown(e,t){const a=this._tabs.length-1;let i=t;switch(e.key){case"ArrowRight":case"ArrowDown":i=t===a?0:t+1;break;case"ArrowLeft":case"ArrowUp":i=t===0?a:t-1;break;case"Home":i=0;break;case"End":i=a;break;default:return}e.preventDefault(),this._selectTab(i)}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),e[0].toString(36)}}customElements.define("au-tabs",F);class S extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId();const e=document.createElement("style");e.textContent=`
      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      label {
        display: inline-block;
        word-break: break-word;
        margin: var(--au-textarea-label-margin-vertical, 0) var(--au-textarea-label-margin-horizontal, 0);
        padding: var(--au-textarea-label-padding-vertical, 0.625rem) var(--au-textarea-label-padding-horizontal, 0);
        color: var(--au-textarea-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-textarea-label-text-size, 1rem);
        font-family: var(--au-textarea-label-text-family, 'Helvetica, Arial, sans-serif, system-ui');
      }

      .textarea-container {
        display: flex;
        align-items: center;
        border: var(--au-textarea-border-width, 1px) var(--au-textarea-border-style, solid) var(--au-textarea-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        padding: var(--au-textarea-container-padding-vertical, 0.25rem) var(--au-textarea-container-padding-horizontal, 0.25rem);
      }

      textarea {
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        margin: 0;
        padding: var(--au-textarea-padding-vertical, 0.625rem) var(--au-textarea-padding-horizontal, 1rem);
        color: var(--au-textarea-text-color, oklch(0.1398 0 0));
        font-size: var(--au-textarea-text-size, 1rem);
        font-family: var(--au-textarea-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-textarea-text-line-height, 1.5);

        border: 0;
        outline: none;
        background-color: var(--au-textarea-bg, oklch(0.994 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        width: 100%;
        
        resize: none;
        field-sizing: content;

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-textarea-invalid-shadow-width, 3px) var(--au-textarea-invalid-shadow-color, oklch(0.5722 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-textarea-focus-shadow-width, 3px) var(--au-textarea-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &:read-only {
          color: var(--au-textarea-readonly-text-color, oklch(0.1398 0 0));
          background-color: var(--au-textarea-readonly-bg, oklch(0.95 0 0));
          cursor: default;
          pointer-events: none;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }        
      }
        
    `;const t=document.createElement("div");t.className="textarea-wrapper",this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const a=document.createElement("div");a.className="textarea-container",this.textarea=document.createElement("textarea"),this.textarea.id=this._id;const i=this.getAttribute("label");i&&!this.hasAttribute("aria-label")&&!this.hasAttribute("aria-labelledby")&&this.textarea.setAttribute("aria-label",i),this.textarea.addEventListener("input",()=>{this.value=this.textarea.value,this.dispatchEvent(new Event("input",{bubbles:!0})),this._syncValidity()}),this.textarea.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0}))}),a.append(this.textarea),t.append(this.labelEl,a),this.shadowRoot.append(e,t)}static get observedAttributes(){return["value","placeholder","name","rows","cols","disabled","readonly","required","maxlength","minlength","aria-label","aria-labelledby","label","id"]}get validity(){return this.internals.validity}get validationMessage(){return this.internals.validationMessage}get willValidate(){return this.internals.willValidate}checkValidity(){return this.internals.checkValidity()}reportValidity(){return this.internals.reportValidity()}attributeChangedCallback(e,t,a){var i;e==="label"&&this.labelEl?(this.labelEl.textContent=a,!this.hasAttribute("aria-label")&&!this.hasAttribute("aria-labelledby")&&this.textarea.setAttribute("aria-label",a)):e==="id"&&a?(this.textarea.id=a,(i=this.labelEl)==null||i.setAttribute("for",a)):e==="value"?this.value=a:a===null?this.textarea.removeAttribute(e):this.textarea.setAttribute(e,a),this._syncValidity()}connectedCallback(){this.internals.setFormValue(this.textarea.value),this._syncValidity()}get value(){return this.textarea.value}set value(e){this.textarea.value=e,this.internals.setFormValue(e),this._syncValidity()}formResetCallback(){this.value=this.getAttribute("value")||""}formStateRestoreCallback(e,t){this.value=e}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-textarea-${e[0].toString(36)}`}_syncValidity(){this.textarea&&(this.textarea.validity.valid?this.internals.setValidity({}):this.internals.setValidity(this.textarea.validity,this.textarea.validationMessage,this.textarea))}}k(S,"formAssociated",!0);customElements.define("au-textarea",S);class P extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._data=[],this._nodeRegistry=[],this._showCheckbox=!1,this.handleKeyDown=this.handleKeyDown.bind(this),this.handleNodeExpand=this.handleNodeExpand.bind(this),this.handleNodeCheckChange=this.handleNodeCheckChange.bind(this),this._toggleLabel=null}static get observedAttributes(){return["show-checkbox"]}attributeChangedCallback(e,t,a){e==="show-checkbox"&&(this._showCheckbox=a!==null,this.getAllNodes().forEach(i=>{this._showCheckbox?i.setAttribute("show-checkbox",""):i.removeAttribute("show-checkbox")}))}get toggleLabel(){return this._toggleLabel}set toggleLabel(e){this._toggleLabel=e,this.getAllNodes().forEach(t=>{t.toggleLabel=e})}get data(){return this._data}set data(e){this._data=e,this.render()}connectedCallback(){this._upgradeProperty("data"),this.shadowRoot.innerHTML===""&&this.render(),this.addEventListener("keydown",this.handleKeyDown),this.addEventListener("au-tree-node-expand",this.handleNodeExpand),this.addEventListener("au-tree-node-check-change",this.handleNodeCheckChange)}_upgradeProperty(e){if(this.hasOwnProperty(e)){let t=this[e];delete this[e],this[e]=t}}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-tree-${e[0].toString(36)}`}render(){const e=this.generateId();this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          font-family: var(--au-tree-font-family, system-ui, -apple-system, sans-serif);
          font-size: var(--au-tree-font-size, 1rem);
          color: var(--au-tree-color, oklch(0.1398 0 0));
        }
        /* 使用 div 代替 ul 以防止自定義元素產生無效的列表語義 */
        div[role="tree"] {
          margin: 0;
          padding: 0;
        }
      </style>
      <div role="tree" id="${e}"></div>
    `;const t=this.shadowRoot.getElementById(e);Array.isArray(this._data)&&this._data.forEach(a=>{const i=document.createElement("au-tree-node");i.data=a,i.toggleLabel=this._toggleLabel,this._showCheckbox&&i.setAttribute("show-checkbox",""),t.appendChild(i)}),requestAnimationFrame(()=>this.updateNodeRegistry())}getAllNodes(){return this.collectNodes(this.shadowRoot)}collectNodes(e,t=!1){let a=[];return Array.from(e.querySelectorAll("au-tree-node")).forEach(r=>{a.push(r),(!t||r.expanded)&&r.shadowRoot&&(a=a.concat(this.collectNodes(r.shadowRoot,t)))}),a}updateNodeRegistry(){this._nodeRegistry=this.collectNodes(this.shadowRoot,!0),this._nodeRegistry=this.collectNodes(this.shadowRoot,!0);const e=this.findActiveNode();this._nodeRegistry.forEach(t=>t.tabIndex=-1),e.activeNode&&this._nodeRegistry.includes(e.activeNode)?e.activeNode.tabIndex=0:this._nodeRegistry.length>0&&(this._nodeRegistry[0].tabIndex=0)}findActiveNode(){let e=this.shadowRoot.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;return{activeNode:e instanceof w?e:null}}handleKeyDown(e){const t=e.composedPath().find(r=>r instanceof w);if(!t)return;this.updateNodeRegistry();const a=this._nodeRegistry.indexOf(t);let i=null;switch(e.key){case"ArrowDown":e.preventDefault(),a<this._nodeRegistry.length-1&&(i=this._nodeRegistry[a+1]);break;case"ArrowUp":e.preventDefault(),a>0&&(i=this._nodeRegistry[a-1]);break;case"ArrowRight":e.preventDefault(),t.hasChildren&&(t.expanded?a<this._nodeRegistry.length-1&&(i=this._nodeRegistry[a+1]):(t.setExpanded(!0),this.updateNodeRegistry()));break;case"ArrowLeft":if(e.preventDefault(),t.hasChildren&&t.expanded)t.setExpanded(!1),this.updateNodeRegistry(),t.setExpanded(!1),this.updateNodeRegistry(),i=t;else{const n=t.getRootNode().host;n instanceof w&&(i=n)}break;case"Home":e.preventDefault(),this._nodeRegistry.length>0&&(i=this._nodeRegistry[0]);break;case"End":e.preventDefault(),this._nodeRegistry.length>0&&(i=this._nodeRegistry[this._nodeRegistry.length-1]);break;case"*":e.preventDefault();const r=t.getRootNode().host;r&&r instanceof w?r.expandAllChildren():this.expandAllChildren(),this.updateNodeRegistry();break;default:e.key.length===1&&e.key.match(/\S/)&&this.handleTypeAhead(e.key,a);break}i&&(this._nodeRegistry.forEach(r=>r.tabIndex=-1),i.tabIndex=0,i.focus())}handleTypeAhead(e,t){e=e.toLowerCase();const a=this._nodeRegistry.slice(t+1).find(r=>r.label.toLowerCase().startsWith(e));if(a){this.focusNode(a);return}const i=this._nodeRegistry.slice(0,t).find(r=>r.label.toLowerCase().startsWith(e));i&&this.focusNode(i)}focusNode(e){this._nodeRegistry.forEach(t=>t.tabIndex=-1),e.tabIndex=0,e.focus()}expandAllChildren(){Array.from(this.shadowRoot.querySelectorAll("au-tree-node")).forEach(e=>e.setExpanded(!0))}handleNodeExpand(){}handleNodeCheckChange(e){const t=this.getAllNodes().filter(a=>a.checked).map(a=>a.data);this.dispatchEvent(new CustomEvent("change",{detail:{checkedNodes:t}}))}}class w extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._data={},this.expanded=!1,this.checked=!1,this.indeterminate=!1,this._initialized=!1,this._uid=`au-tree-node-${Math.random().toString(36).substr(2,9)}`,this._toggleLabel=null}static get observedAttributes(){return["expanded","show-checkbox","checked","indeterminate"]}get toggleLabel(){return this._toggleLabel}set toggleLabel(e){this._toggleLabel=e,this.renderContent(),this.shadowRoot&&this.shadowRoot.querySelectorAll("au-tree-node").forEach(t=>t.toggleLabel=e)}get data(){return this._data}set data(e){this._data=e,this.render()}get label(){return this._data.label||""}get hasChildren(){return this._data.children&&this._data.children.length>0}connectedCallback(){this.shadowRoot.addEventListener("au-tree-node-check-change",this.handleChildCheckChange.bind(this)),this.addEventListener("click",e=>{e.stopPropagation()}),this.shadowRoot.addEventListener("click",e=>{e.stopPropagation();const t=e.target,a=t.closest(".toggle-btn");if(a&&!a.classList.contains("hidden")){this.setExpanded(!this.expanded),this.focus();return}t.closest(".node-content")}),this.shadowRoot.addEventListener("change",e=>{const t=e.target;t.tagName==="INPUT"&&t.type==="checkbox"&&(e.stopPropagation(),this.toggleCheck(t.checked))}),this.addEventListener("keydown",e=>{const t=e.composedPath()[0],a=t.tagName==="INPUT"||t.tagName==="BUTTON";a||(e.key===" "&&(e.preventDefault(),e.stopPropagation(),this.hasAttribute("show-checkbox")?a||this.toggleCheck():this.hasChildren&&this.setExpanded(!this.expanded)),e.key==="Enter"&&(e.preventDefault(),e.stopPropagation(),this.setExpanded(!this.expanded)))})}attributeChangedCallback(e,t,a){this._initialized&&e==="show-checkbox"&&(this.renderContent(),this.shadowRoot.querySelectorAll("au-tree-node").forEach(r=>{a!==null?r.setAttribute("show-checkbox",""):r.removeAttribute("show-checkbox")}))}setExpanded(e){if(e===this.expanded)return;this.expanded=e;const t=this.shadowRoot.querySelector('div[role="group"]'),a=this.shadowRoot.querySelector(".toggle-icon");this.expanded?(this.setAttribute("aria-expanded","true"),t&&(t.style.display="block"),a&&(a.style.transform="rotate(90deg)")):(this.setAttribute("aria-expanded","false"),t&&(t.style.display="none"),a&&(a.style.transform="rotate(0deg)")),this.dispatchEvent(new CustomEvent("au-tree-node-expand",{bubbles:!0,composed:!0}))}expandAllChildren(){this.setExpanded(!0),Array.from(this.shadowRoot.querySelectorAll("au-tree-node")).forEach(e=>e.expandAllChildren())}toggleCheck(e=null){const t=e!==null?e:!this.checked;this.setChecked(t),this.setChildrenChecked(t),this.dispatchEvent(new CustomEvent("au-tree-node-check-change",{bubbles:!0,composed:!0,detail:{checked:this.checked,node:this}}))}setChecked(e,t=!1){this.checked=e,this.indeterminate=t,this.indeterminate?this.setAttribute("aria-checked","mixed"):this.setAttribute("aria-checked",e?"true":"false");const a=this.shadowRoot.querySelector(`input#${this._uid}`);a&&(a.checked=e,a.indeterminate=t)}setChildrenChecked(e){if(!this.hasChildren)return;Array.from(this.shadowRoot.querySelectorAll("au-tree-node")).forEach(a=>{a.setChecked(e),a.setChildrenChecked(e)})}handleChildCheckChange(e){e.stopPropagation(),this.updateStateFromChildren(),this.dispatchEvent(new CustomEvent("au-tree-node-check-change",{bubbles:!0,composed:!0,detail:{checked:this.checked,node:this}}))}updateStateFromChildren(){const e=Array.from(this.shadowRoot.querySelectorAll("au-tree-node")),t=e.every(i=>i.checked&&!i.indeterminate),a=e.every(i=>!i.checked&&!i.indeterminate);t?this.setChecked(!0,!1):a?this.setChecked(!1,!1):this.setChecked(!1,!0)}render(){this._initialized=!0;const{children:e}=this._data,t=this.hasAttribute("show-checkbox");if(this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          outline: none;
        }
        .node-content {
          display: flex;
          align-items: center;
          gap: var(--au-tree-node-padding-horizontal, 0.25rem);
          padding: var(--au-tree-node-padding-vertical, 0.25rem) var(--au-tree-node-padding-horizontal, 0.25rem);
          .au-checkbox {
            display: flex;
            align-items: center;
            gap: var(--au-tree-node-checkbox-content-gap, 0.375rem);
          }
        }
        .node-content > * {
          vertical-align: middle;
        }
        /* 焦點樣式：當 host 聚焦或內部元素聚焦時框住內容 */
        :host(:focus) .node-content {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tree-focus-shadow-width, 3px) var(--au-tree-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }
        
        button {
          /* behavior */
          cursor: pointer;
          -webkit-tap-highlight-color: oklch(0 0 0 / 0);
          
          /* spacing */
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--au-tree-node-padding-horizontal, 1rem);
          word-break: break-word;
          width: 100%;
          text-align: left;
          padding: var(--au-tree-node-padding-vertical, 0.625rem) var(--au-tree-node-padding-horizontal, 1rem);
          
          /* text */
          color: var(--au-tree-node-text-color, oklch(0.1398 0 0));
          font-size: var(--au-tree-node-text-size, 1rem);
          font-family: var(--au-tree-node-text-family, 'Helvetica, Arial, sans-serif, system-ui');
          line-height: var(--au-tree-node-text-line-height, 1.5);
          
          /* border */
          border: var(--au-tree-node-border-width, 0) var(--au-tree-node-border-style, solid) var(--au-tree-node-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-tree-node-border-radius, 0);
          
          /* others decoration */
          background-color: var(--au-tree-node-bg, transparent);
          transition: background-color 160ms ease-in;

          .heading {
            flex: 1;
          }

          .info {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 0 1 auto;
          }

          .icon {
            transition: transform 300ms ease-in;
            display: flex;
            align-items: middle;
          }

          &[aria-expanded="true"] {
            .icon {
              transform: rotate3d(0, 0, 1, 180deg);
              transform-origin: center;
            }
          }

          &:hover {
            background-color: var(--au-tree-node-hover-bg, oklch(0.9466 0 0));
            border-color: var(--au-tree-node-hover-border-color, oklch(0.7894 0 0));
          }
          
          &:active {
            background-color: var(--au-tree-node-active-bg, oklch(0.8689 0 0));
            border-color: var(--au-accordion-heading-active-border-color, oklch(0.7894 0 0));
          }
          
          &:focus-visible {
            outline: none;
          }

          &.hidden {
            visibility: hidden;
            pointer-events: none;
          }
        }
         
        /* 切換按鈕 */
        .toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          width: var(--au-tree-node-toggle-btn-size, 2rem);
          height: var(--au-tree-node-toggle-btn-size, 2rem);
        }

        .toggle-icon {
          width: var(--au-tree-node-toggle-icon-size, 1rem);
          height: var(--au-tree-node-toggle-icon-size, 1rem);
          transition: transform 0.15s ease;
        }
        
        /* 核取方塊樣式 */
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          width: var(--au-tree-node-checkbox-input-width, 1.5rem);
          height: var(--au-tree-node-checkbox-input-height, 1.5rem);
          border: var(--au-tree-node-checkbox-input-border-width, 1px) var(--au-tree-node-checkbox-input-border-style, solid) var(--au-tree-node-checkbox-input-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-tree-node-checkbox-input-border-radius, 0.25rem);
          background-color: var(--au-tree-node-checkbox-input-bg, oklch(0.994 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-tree-node-checkbox-input-checked-bg, oklch(0.1398 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--au-tree-node-checkbox-input-checked-symbol, '✔');
              color: var(--au-tree-node-checkbox-input-checked-text-color, oklch(0.994 0 0));
              font-size: var(--au-tree-node-checkbox-input-checked-text-size, 1.125rem);
            }
          }
          &:indeterminate {
            background-color: var(--au-tree-node-checkbox-input-checked-bg, oklch(0.1398 0 0)); /* 建議背景色與 checked 一致 */
            border-color: transparent;
            display: grid;
            place-content: center;

            &:before {
              /* 使用 '−' (Minus Sign) 符號，比一般連字號 '-' 更寬更置中 */
              content: var(--au-tree-node-checkbox-input-indeterminate-symbol, '−'); 
              color: var(--au-tree-node-checkbox-input-checked-text-color, oklch(0.994 0 0));
              font-size: var(--au-tree-node-checkbox-input-checked-text-size, 1.125rem);
              
              /* 確保符號垂直置中 */
              line-height: 0; 
              font-weight: bold;
            }
          }
        }

         label {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--au-tree-node-checkbox-content-gap, 0.375rem);
          -webkit-tap-highlight-color: oklch(0 0 0 / 0);
          .text {
            flex: 1;
            font-size: var(--au-tree-node-checkbox-label-text-size, 1rem);
          }
          &:active {
            .text {
              color: var(--au-tree-node-checkbox-label-active-text-color, oklch(0.537 0 0));
            }
          }
          &:has(input:focus-visible) {
            box-shadow: inset 0 0 0 var(--au-tree-node-checkbox-input-focus-shadow-width, 3px) var(--au-tree-node-checkbox-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
          }
          &:has(input[type="checkbox"]:disabled) {
            cursor: not-allowed;
            input[type="checkbox"] {
              opacity: 0.5;
            }
            .text {
              pointer-events: none;
              text-decoration: none;
              color: var(--au-tree-node-checkbox-label-disabled-text-color, oklch(0.537 0 0));
            }
          }
        }
        
        div[role="group"] {
          padding-left: var(--au-tree-indent, 1.5rem);
          margin: 0;
          display: none;
        }

        .visually-hidden { 
          position: absolute; 
          width: 1px; 
          height: 1px; 
          padding: 0; 
          margin: -1px; 
          overflow: hidden; 
          clip: rect(0,0,0,0); 
          border: 0;
        }
      </style>
      <div class="node-content"></div>
      ${this.hasChildren?'<div role="group"></div>':""}
    `,this.renderContent(),this.hasChildren){const a=this.shadowRoot.querySelector('div[role="group"]');e.forEach(i=>{const r=document.createElement("au-tree-node");r.data=i,r.toggleLabel=this._toggleLabel,t&&r.setAttribute("show-checkbox",""),a.appendChild(r)})}this.setAttribute("role","treeitem"),this.hasChildren&&this.setAttribute("aria-expanded","false"),t&&this.setAttribute("aria-checked","false")}renderContent(){const e=this.shadowRoot.querySelector(".node-content");if(!e)return;const t=this.hasAttribute("show-checkbox"),a=this._data.label||"Node";this.setAttribute("aria-label",a);const i=`<svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" aria-hidden="true"/></svg><span class="visually-hidden">${this._data.label||"Node"}</span>`,r=typeof this._toggleLabel=="function"?this._toggleLabel(this._data):`Toggle ${this._data.label||"Node"}`,n=this.hasChildren?`<button class="toggle-btn" tabindex="-1" aria-label="${r}">${i}</button>`:`<button class="toggle-btn hidden" tabindex="-1" aria-hidden="true">${i}</button>`,o=t?`<div class="au-checkbox"><input type="checkbox" id="${this._uid}" tabindex="-1" ${this.checked?"checked":""}>`:"",s=`${this._uid}-label`,u=t?`<label id="${s}" for="${this._uid}">${this._data.label||"Node"}</label></div>`:`<span>${this._data.label||"Node"}</span>`;if(e.innerHTML=`
        ${n}
        ${o}
        ${u}
      `,t&&this.indeterminate){const p=e.querySelector("input");p&&(p.indeterminate=!0)}const h=e.querySelector(".toggle-icon");this.expanded&&h&&(h.style.transform="rotate(90deg)")}}customElements.define("au-tree",P);customElements.define("au-tree-node",w);
