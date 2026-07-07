var R=Object.defineProperty;var T=(f,e,t)=>e in f?R(f,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):f[e]=t;var x=(f,e,t)=>T(f,typeof e!="symbol"?e+"":e,t);/*! Accesserty UI Kit v1.0.3 | built 2026-07-07 */class z extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._container=document.createElement("div"),this._container.setAttribute("class","au-accordion");const e=document.createElement("slot");this._container.appendChild(e),this._exclusiveHint=document.createElement("span"),this._exclusiveHint.style.cssText="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;padding:0;";const t=`au-accordion-hint-${Math.random().toString(36).slice(2)}`;this._exclusiveHint.id=t,this._exclusiveHint.textContent="Only one section may be expanded at a time.",this.shadowRoot.appendChild(this._exclusiveHint),this.shadowRoot.appendChild(this._container),this._onToggle=this._handleToggle.bind(this)}connectedCallback(){this.addEventListener("au-toggle",this._onToggle),this._updateExclusiveAria()}disconnectedCallback(){this.removeEventListener("au-toggle",this._onToggle)}static get observedAttributes(){return["exclusive","data-text-exclusive-hint"]}get exclusive(){return this.hasAttribute("exclusive")}set exclusive(e){e?this.setAttribute("exclusive",""):this.removeAttribute("exclusive")}attributeChangedCallback(e,t,a){e==="exclusive"&&t!==a&&this._updateExclusiveAria(),e==="data-text-exclusive-hint"&&t!==a&&this._updateExclusiveHint()}_updateExclusiveHint(){this._exclusiveHint&&(this._exclusiveHint.textContent=this.getAttribute("data-text-exclusive-hint")||"Only one section may be expanded at a time.")}_updateExclusiveAria(){this.exclusive?this._container.setAttribute("aria-describedby",this._exclusiveHint.id):this._container.removeAttribute("aria-describedby")}_handleToggle(e){if(!this.exclusive||!e.detail.open)return;[...this.children].filter(a=>a.tagName.toLowerCase()==="au-accordion-item"&&a!==e.target).forEach(a=>{a.open=!1})}}typeof customElements<"u"&&!customElements.get("au-accordion")&&customElements.define("au-accordion",z);class I extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=this.generateId(),t=this.generateId(),a=document.createElement("div");a.setAttribute("class","au-accordion-item"),a.innerHTML=`
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
            align-items: flex-start;
            gap: 1rem;
            word-break: break-word;
            width: 100%;
            text-align: left;
            padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-accordion-heading-text-color, oklch(0.1398 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family);
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: var(--au-accordion-heading-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;

            .heading {
              min-width: 0;
              flex: 1 1 auto;
              overflow-wrap: break-word;

              slot,
              ::slotted(*),
              * {
                display: block;
                width: 100%;
              }
            }

            .info {
              display: flex;
              align-items: center;
              gap: 1rem;
              flex: 0 1 auto;
              min-width: 0;
              max-width: 50%;
              & > *:first-child  {
                flex: 1;
                min-width: 20px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;

                slot,
                ::slotted(*),
                * {
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;
                  display: block;
                  width: 100%;
                }
              }
            }

            .icon {
              transition: transform 300ms ease-in;
              display: flex;
              align-items: center;
              flex: 0 0 auto;
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
      `,this.shadowRoot.append(a),this.button=this.shadowRoot.querySelector("button"),this.button.addEventListener("click",()=>this.toggleAccordion())}connectedCallback(){this.updateExpanded()}static get observedAttributes(){return["open"]}get open(){return this.hasAttribute("open")}set open(e){e?this.setAttribute("open",""):this.removeAttribute("open")}attributeChangedCallback(e,t,a){e==="open"&&t!==a&&(this.updateExpanded(),this.isConnected&&this.dispatchEvent(new CustomEvent("au-toggle",{bubbles:!0,composed:!0,detail:{open:this.open}})))}updateExpanded(){const e=this.hasAttribute("open");this.button.setAttribute("aria-expanded",e);const t=this.shadowRoot.querySelector('div[role="region"]');e?t.removeAttribute("hidden"):t.setAttribute("hidden","")}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`au-accordion-item-${e[0].toString(36)}`}return`au-accordion-item-${Math.random().toString(36).slice(2)}`}toggleAccordion(){this.open=!this.open}}typeof customElements<"u"&&!customElements.get("au-accordion-item")&&customElements.define("au-accordion-item",I);class N extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.render()}static get observedAttributes(){return["id","class","aria-label","aria-labelledby","label","items","separator","data-link-title-prefix","data-link-title-template"]}attributeChangedCallback(e,t,a){t!==a&&this.render()}get items(){const e=this.getAttribute("items");if(!e)return[];try{return JSON.parse(e)}catch(t){return console.error("Error parsing 'items':",t),[]}}set items(e){if(typeof e=="string")this.setAttribute("items",e);else if(Array.isArray(e)||e&&typeof e=="object"){const t=Array.isArray(e)?e:[e];this.setAttribute("items",JSON.stringify(t))}else{console.error("Invalid value provided for 'items'. Expected string (JSON) or Array:",e);return}}get separator(){return this.getAttribute("separator")||"/"}set separator(e){this.setAttribute("separator",e)}formatText(e,t={}){return Object.entries(t).reduce((a,[i,r])=>a.replaceAll(`{${i}}`,String(r)),e)}escapeHTML(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}render(){if(!this.shadowRoot)return;const e=this.getAttribute("id"),t=this.getAttribute("class"),a=this.getAttribute("aria-label"),i=this.getAttribute("aria-labelledby"),r=this.getAttribute("label"),s=this.items,o=this.getAttribute("separator")||"/",n=this.escapeHTML(o),v=this.getAttribute("data-link-title-prefix")||"go to",c=this.getAttribute("data-link-title-template"),p=e!==null?this.escapeHTML(e):"",l=t!==null?this.escapeHTML(t):"";let d="";a!==null?d=`aria-label="${this.escapeHTML(a)}"`:i!==null?d=`aria-labelledby="${this.escapeHTML(i)}"`:r!==null&&(d=`aria-label="${this.escapeHTML(r)}"`),this.shadowRoot.innerHTML=`
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
              font-size: 0;
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
        ${e!==null?'id="'+p+'"':""}
        ${t!==null?'class="'+l+'"':""}
        ${d}
      >
        <ol>
          ${s.map((h,b)=>{const g=this.escapeHTML(h.text||""),u=this.escapeHTML(h.url||""),m=this.escapeHTML(c?this.formatText(c,{text:h.text||"",index:b+1}):`${v} ${h.text||""}`);return`
                <li>
                  ${b===s.length-1?`<span aria-current="page"><slot name="icon-${b+1}"></slot><span>${g}</span></span>`:`<a href="${u}" title="${m}"><slot name="icon-${b+1}"></slot><span>${g}</span></a>`}
                  ${b!==s.length-1?'<span aria-hidden="true">'+n+"</span>":""}
                </li>
              `}).join("")}
        </ol>
      </nav>
    `}}typeof customElements<"u"&&!customElements.get("au-breadcrumbs")&&customElements.define("au-breadcrumbs",N);class M extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot.innerHTML=`
      <div class="au-card-container" part="au-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `}}typeof customElements<"u"&&!customElements.get("au-card")&&customElements.define("au-card",M);class A extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const e=this.generateId(),t=document.createElement("style");t.textContent=`
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
    `;const a=document.createElement("div");a.setAttribute("class","au-checkbox");const i=document.createElement("label");i.setAttribute("for",e);const r=document.createElement("input");r.type="checkbox",r.id=e,r.name=this.getAttribute("name")||"default-checkbox",r.value=this.getAttribute("value")||"default";const s=document.createElement("div");s.setAttribute("class","text");const o=document.createElement("slot");this.labelFallback=document.createElement("span"),this.labelFallback.textContent=this.getAttribute("label")||"",o.appendChild(this.labelFallback),s.appendChild(o),i.append(r,s),a.appendChild(i),this.shadowRoot.append(t,a),r.addEventListener("change",n=>{this.checked=n.target.checked,this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:n.target.checked})),this.updateFormValue()}),r.addEventListener("focus",()=>{this.dispatchEvent(new CustomEvent("focus",{bubbles:!0,composed:!0}))}),r.addEventListener("blur",()=>{this.dispatchEvent(new CustomEvent("blur",{bubbles:!0,composed:!0}))}),this.syncAccessibleLabel()}get checked(){var e;return((e=this.shadowRoot.querySelector("input"))==null?void 0:e.checked)??!1}set checked(e){e?this.setAttribute("checked",""):this.removeAttribute("checked")}get disabled(){return this.hasAttribute("disabled")}set disabled(e){e?this.setAttribute("disabled",""):this.removeAttribute("disabled")}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`au-checkbox-${e[0].toString(36)}`}return`au-checkbox-${Math.random().toString(36).slice(2)}`}static get observedAttributes(){return["name","value","checked","disabled","required","label","aria-label","aria-labelledby"]}attributeChangedCallback(e,t,a){const i=this.shadowRoot.querySelector("input");if(i)switch(e){case"checked":i.checked=a!==null;break;case"disabled":i.disabled=a!==null;break;case"name":i.name=a;break;case"value":i.value=a;break;case"required":i.required=a!==null;break;case"label":this.labelFallback&&(this.labelFallback.textContent=a||""),this.syncAccessibleLabel();break;case"aria-label":case"aria-labelledby":this.syncAccessibleLabel();break}}syncAccessibleLabel(){const e=this.shadowRoot.querySelector("input");e&&(this.hasAttribute("aria-label")?e.setAttribute("aria-label",this.getAttribute("aria-label")):e.removeAttribute("aria-label"),this.hasAttribute("aria-labelledby")?e.setAttribute("aria-labelledby",this.getAttribute("aria-labelledby")):e.removeAttribute("aria-labelledby"))}connectedCallback(){this.updateCheckedState(),this.updateFormValue()}updateCheckedState(){const e=this.shadowRoot.querySelector("input");e&&(e.checked=this.hasAttribute("checked"))}updateFormValue(){const e=this.shadowRoot.querySelector("input"),t=e.checked?this.getAttribute("value")||"on":null;this.internals.setFormValue(t),e.validity.valid?this.internals.setValidity({}):this.internals.setValidity(e.validity,e.validationMessage,e)}formDisabledCallback(e){const t=this.shadowRoot.querySelector("input");t&&(t.disabled=e)}formResetCallback(){const e=this.shadowRoot.querySelector("input");e&&(e.checked=!1,this.checked=!1,this.updateFormValue())}}x(A,"formAssociated",!0);typeof customElements<"u"&&!customElements.get("au-checkbox")&&customElements.define("au-checkbox",A);class V extends HTMLElement{static get observedAttributes(){return["data-text-trigger"]}constructor(){super(),this.attachShadow({mode:"open"}),this.triggerId=this.generateId("trigger"),this.menuId=this.generateId("menu"),this._focusIndex=null;const e=document.createElement("template");e.innerHTML=`
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
          font-family: var(--au-btn-text-family);
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
        <slot name="trigger"><span class="trigger-fallback"></span></slot>
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
    `,this.shadowRoot.appendChild(e.content.cloneNode(!0)),this.trigger=this.shadowRoot.getElementById(this.triggerId),this.menu=this.shadowRoot.getElementById(this.menuId),this.triggerFallback=this.shadowRoot.querySelector(".trigger-fallback"),this.handleKeyDown=this.handleKeyDown.bind(this),this.handleMenuKeyDown=this.handleMenuKeyDown.bind(this),this.handleToggle=this.handleToggle.bind(this)}connectedCallback(){this.updateTriggerFallback(),this.trigger.addEventListener("keydown",this.handleKeyDown),this.menu.addEventListener("keydown",this.handleMenuKeyDown),this.menu.addEventListener("toggle",this.handleToggle)}attributeChangedCallback(e,t,a){e==="data-text-trigger"&&t!==a&&this.updateTriggerFallback()}disconnectedCallback(){this.trigger.removeEventListener("keydown",this.handleKeyDown),this.menu.removeEventListener("keydown",this.handleMenuKeyDown),this.menu.removeEventListener("toggle",this.handleToggle)}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`au-dropdown-${e[0].toString(36)}`}return`au-dropdown-${Math.random().toString(36).slice(2)}`}updateTriggerFallback(){this.triggerFallback&&(this.triggerFallback.textContent=this.getAttribute("data-text-trigger")||"Dropdown")}open(e=0){this.isOpen?this.focusItem(e):(this._focusIndex=e,this.menu.showPopover())}close(){this.menu.hidePopover()}handleToggle(e){var a;const t=e.newState==="open";if(this.trigger.setAttribute("aria-expanded",t),t){const i=this._focusIndex;this._focusIndex=null,i!=null&&requestAnimationFrame(()=>this.focusItem(i))}else((a=document.activeElement)==null?void 0:a.closest("au-dropdown"))===this&&this.trigger.focus(),this._focusIndex=null}get isOpen(){return this.menu.matches(":popover-open")}set isOpen(e){e?this.menu.showPopover():this.menu.hidePopover()}focusItem(e){const t=this.items;if(t.length>0){let a=e;a<0&&(a=t.length-1),a>=t.length&&(a=0),t[a].focus()}}get items(){return Array.from(this.querySelectorAll("au-dropdown-item"))}handleKeyDown(e){switch(e.key){case"Enter":case" ":case"Spacebar":case"ArrowDown":e.preventDefault(),this.open(0);break;case"ArrowUp":e.preventDefault(),this.open(this.items.length-1);break}}handleMenuKeyDown(e){const t=this.items,a=t.indexOf(document.activeElement);switch(e.key){case"ArrowDown":e.preventDefault(),this.focusItem(a+1);break;case"ArrowUp":e.preventDefault(),this.focusItem(a-1);break;case"Home":e.preventDefault(),this.focusItem(0);break;case"End":e.preventDefault(),this.focusItem(t.length-1);break;case"Tab":this.close();break;case"Escape":e.preventDefault(),this.close();break}}}class $ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=document.createElement("template");e.innerHTML=`
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
    `,this.shadowRoot.appendChild(e.content.cloneNode(!0)),this.item=this.shadowRoot.querySelector(".item")}connectedCallback(){this.setAttribute("tabindex","-1"),this.setAttribute("role","none"),this.addEventListener("click",()=>{this.dispatchEvent(new CustomEvent("selected",{bubbles:!0,composed:!0,detail:{value:this.getAttribute("value")}}));const e=this.closest("au-dropdown");e&&e.close()}),this.item.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "||e.key==="Spacebar"){e.preventDefault();const t=this.querySelector("a");t?t.click():this.click()}})}focus(){this.item.focus()}}typeof customElements<"u"&&(customElements.get("au-dropdown")||customElements.define("au-dropdown",V),customElements.get("au-dropdown-item")||customElements.define("au-dropdown-item",$));class E extends HTMLElement{constructor(){super();x(this,"_preventDefault",t=>t.preventDefault());this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this.files=[],this.previewUrls=new Map;const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper=document.createElement("div"),this.wrapper.className="file-upload-wrapper",this.container=document.createElement("div"),this.container.className="file-upload-container",this._id=this.getAttribute("id")||this.generateId(),this.labelEl=document.createElement("label"),this.labelEl.textContent=this.getAttribute("label")||"Upload files",this.labelEl.setAttribute("for",this._id),this.fileInput=document.createElement("input"),this.fileInput.type="file",this.fileInput.hidden=!0,this.fileInput.id=this._id,["accept","multiple","name","disabled","required","form"].forEach(o=>{this.hasAttribute(o)&&this.fileInput.setAttribute(o,this.getAttribute(o))});const a=document.createElement("slot");a.name="trigger",a.addEventListener("click",()=>{this.hasAttribute("disabled")||this.fileInput.click()}),a.addEventListener("keydown",o=>{if(o.key==="Enter"||o.key===" "||o.key==="Spacebar"){if(o.preventDefault(),this.hasAttribute("disabled"))return;this.fileInput.click()}}),this.dropZone=document.createElement("div"),this.dropZone.className="drop-zone",this.dropZone.textContent=this.getAttribute("msg-drop-text")||"Drop files here",this.usageDisplay=document.createElement("div"),this.usageDisplay.className="usage",this.usageDisplay.setAttribute("aria-live","polite"),this.fileList=document.createElement("ul"),this.fileList.className="file-list",this.fileList.setAttribute("role","list"),this.fileList.setAttribute("aria-live","polite"),this.fileList.setAttribute("aria-atomic","true");const i=document.createElement("slot");i.name="hint",this.errorMessage=document.createElement("div"),this.errorMessage.className="error-area",this.errorList=document.createElement("ul"),this.errorList.className="error-list",this.errorMessage.append(i,this.usageDisplay,this.errorList),this.liveRegion=document.createElement("div"),this.liveRegion.setAttribute("aria-live","polite"),this.liveRegion.setAttribute("role","status"),this.liveRegion.setAttribute("aria-atomic","true"),this.fileInput.addEventListener("change",()=>this.handleFiles(this.fileInput.files)),this.dropZone.addEventListener("dragover",o=>{o.preventDefault(),!this.hasAttribute("disabled")&&this.dropZone.classList.add("dragover")}),this.dropZone.addEventListener("dragleave",()=>{this.hasAttribute("disabled")||this.dropZone.classList.remove("dragover")}),this.dropZone.addEventListener("drop",o=>{if(o.preventDefault(),this.hasAttribute("disabled"))return;this.dropZone.classList.remove("dragover");const n=o.dataTransfer;n!=null&&n.files&&this.handleFiles(n.files)});const r=document.createElement("div");r.className="actions";const s=document.createElement("div");s.className="upload-area",s.append(a,this.dropZone),r.append(s),this.container.append(this.labelEl,r,this.errorMessage,this.fileList,this.liveRegion,this.fileInput),this.wrapper.append(this.container),this.shadowRoot.append(t,this.wrapper)}static get observedAttributes(){return["accept","disabled","form","id","label","multiple","msg-drop-text","msg-total-size-error","msg-type-error","msg-size-error","msg-count-error","msg-added","msg-removed","msg-remove-text","msg-remove-file-label","msg-required","name","required"]}attributeChangedCallback(t,a,i){if(a!==i&&this.shadowRoot)switch(t){case"id":this._id=i||this.generateId(),this.labelEl&&this.labelEl.setAttribute("for",this._id),this.fileInput&&(this.fileInput.id=this._id);break;case"label":this.updateLabelText();break;case"msg-drop-text":this.updateDropText();break;case"msg-remove-text":case"msg-remove-file-label":this.updateFileList();break;case"msg-required":this.checkValidity();break;case"disabled":this.syncBooleanAttributeToInput("disabled");break;case"multiple":this.syncBooleanAttributeToInput("multiple");break;case"required":this.syncBooleanAttributeToInput("required"),this.checkValidity();break;case"accept":case"form":case"name":this.syncAttributeToInput(t);break}}connectedCallback(){this.updateLabelText(),this.updateDropText(),document.addEventListener("dragover",this._preventDefault),document.addEventListener("drop",this._preventDefault)}disconnectedCallback(){document.removeEventListener("dragover",this._preventDefault),document.removeEventListener("drop",this._preventDefault),this.revokeAllPreviewUrls()}updateLabelText(){this.labelEl&&(this.labelEl.textContent=this.getAttribute("label")||"Upload files")}updateDropText(){this.dropZone&&(this.dropZone.textContent=this.getAttribute("msg-drop-text")||"Drop files here")}getText(t,a){return this.getAttribute(t)||a}formatMessage(t,a,i={}){const r=this.getText(t,a);return Object.entries(i).reduce((s,[o,n])=>s.replaceAll(`{${o}}`,String(n)),r)}formatFileError(t,a,i,r,s={}){const o=this.getAttribute(t);return o&&o.includes("{")?this.formatMessage(t,a,{fileName:r,...s}):`${r} ${o||i}`}syncAttributeToInput(t){if(!this.fileInput)return;const a=this.getAttribute(t);a===null?this.fileInput.removeAttribute(t):this.fileInput.setAttribute(t,a)}syncBooleanAttributeToInput(t){this.fileInput&&(this.hasAttribute(t)?this.fileInput.setAttribute(t,""):this.fileInput.removeAttribute(t))}revokePreviewUrl(t){const a=this.previewUrls.get(t);a&&(URL.revokeObjectURL(a),this.previewUrls.delete(t))}revokeAllPreviewUrls(){this.previewUrls.forEach(t=>URL.revokeObjectURL(t)),this.previewUrls.clear()}handleFiles(t){var g;if(this.hasAttribute("disabled"))return;const a=parseFloat(this.getAttribute("max-total-size-mb")||"20"),i=parseInt(this.getAttribute("max-files")||"5",10),r=parseFloat(this.getAttribute("max-size-mb")||"5"),s=this.getAttribute("accept"),o=s?s.split(",").map(u=>u.trim()):[],n=Array.from(t),v=[],c=[];n.forEach(u=>{if(!(o.length===0||o.some(y=>y.endsWith("/*")?u.type.startsWith(y.replace("/*","")):u.type===y||u.name.endsWith(y)))){c.push(this.formatFileError("msg-type-error","{fileName} is not an accepted file type.","is not an accepted file type.",u.name));return}if(u.size>r*1024*1024){c.push(this.formatFileError("msg-size-error","{fileName} exceeds the maximum size of {maxSize}MB.",`exceeds the maximum size of ${r}MB.`,u.name,{maxSize:r}));return}v.push(u)});const p=v.filter(u=>!this.files.some(m=>m.name===u.name&&m.size===u.size)),l=i-this.files.length,d=p.slice(0,l);if(p.slice(l).forEach(u=>{c.push(this.formatFileError("msg-count-error","{fileName} cannot be added. You can only upload up to {maxFiles} files.",`You can only upload up to ${i} files.`,u.name,{maxFiles:i}))}),this.files.reduce((u,m)=>u+m.size,0)+d.reduce((u,m)=>u+m.size,0)>a*1024*1024){const u=(g=this.getAttribute("msg-total-size-error"))!=null&&g.includes("{")?this.formatMessage("msg-total-size-error","Total file size exceeds limit of {maxTotalSize}MB.",{maxTotalSize:a}):`${this.getText("msg-total-size-error","Total file size exceeds limit of")} ${a}MB.`;c.push(u),d.length=0}c.length>0&&this.showErrors(c),d.length!==0&&(this.files.push(...d),this.updateFileList(),this.updateUsage(),this.announce(this.formatMessage("msg-added","{count} file(s) added.",{count:d.length})),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),this.fileInput.value="")}showErrors(t){this.errorList.innerHTML="",t.forEach(a=>{const i=document.createElement("li");i.textContent=a,this.errorList.appendChild(i)}),this.announce(t.join(" "))}announce(t){for(;this.liveRegion.firstChild;)this.liveRegion.removeChild(this.liveRegion.firstChild);requestAnimationFrame(()=>{const a=document.createElement("span");a.textContent=t,this.liveRegion.appendChild(a)})}updateFileList(){this.fileList.innerHTML="",this.files.forEach(t=>{const a=document.createElement("li");a.setAttribute("role","listitem");const i=document.createElement("div");if(t.type.startsWith("image/")){const o=document.createElement("img");o.className="preview";let n=this.previewUrls.get(t);n||(n=URL.createObjectURL(t),this.previewUrls.set(t,n)),o.src=n,o.alt=t.name,o.width=40,o.height=40,i.appendChild(o)}else{const o=document.createElement("span");o.className="preview",o.textContent="📄",o.setAttribute("aria-hidden","true"),i.appendChild(o)}const r=document.createElement("span");r.className="file-name",r.textContent=t.name,i.appendChild(r);const s=document.createElement("button");s.type="button",s.className="delete",s.textContent=this.getAttribute("msg-remove-text")||"Remove",s.setAttribute("aria-label",this.formatMessage("msg-remove-file-label","Remove {fileName}",{fileName:t.name})),s.setAttribute("part","delete"),s.addEventListener("click",()=>{this.hasAttribute("disabled")||(this.revokePreviewUrl(t),this.files=this.files.filter(o=>o.name!==t.name||o.size!==t.size),this.updateFileList(),this.updateUsage(),this.announce(this.formatMessage("msg-removed","{fileName} removed.",{fileName:t.name})),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new CustomEvent("remove-file",{bubbles:!0,composed:!0,detail:t})))}),a.append(i,s),this.fileList.appendChild(a)})}removeFile(t){this.hasAttribute("disabled")||(this.revokePreviewUrl(t),this.files=this.files.filter(a=>a.name!==t.name||a.size!==t.size),this.updateFileList(),this.updateUsage(),this.announce(this.formatMessage("msg-removed","{fileName} removed.",{fileName:t.name})),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new CustomEvent("remove-file",{detail:t})))}updateUsage(){const t=parseFloat(this.getAttribute("max-total-size-mb")||"20"),a=this.files.reduce((i,r)=>i+r.size,0)/(1024*1024);this.usageDisplay.textContent=`${a.toFixed(1)}MB / ${t}MB`}syncFormValue(){const t=new DataTransfer;this.files.forEach(a=>t.items.add(a)),this.internals.setFormValue(t.files)}checkValidity(){return this.hasAttribute("required")&&this.files.length===0?(this.internals.setValidity({valueMissing:!0},this.getText("msg-required","Please select at least one file."),this.fileInput),!1):(this.internals.setValidity({}),!0)}formResetCallback(){this.revokeAllPreviewUrls(),this.files=[],this.updateFileList(),this.updateUsage(),this.syncFormValue(),this.checkValidity()}get value(){return this.files}set value(t){Array.isArray(t)&&(this.revokeAllPreviewUrls(),this.files=t,this.updateFileList(),this.updateUsage(),this.syncFormValue(),this.checkValidity())}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const t=new Uint32Array(1);return crypto.getRandomValues(t),`au-file-upload-${t[0].toString(36)}`}return`au-file-upload-${Math.random().toString(36).slice(2)}`}}x(E,"formAssociated",!0);typeof customElements<"u"&&!customElements.get("au-file-upload")&&customElements.define("au-file-upload",E);class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId();const e=document.createElement("style");e.textContent=`
    :host {
      display: block;
      container-type: inline-size;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      background: var(--au-input-wrapper-bg, transparent);
      container-type: inline-size;

      @container (width < 768px) {
        flex-direction: column;
        align-items: flex-start;
      }

      label {
        margin: 0;
        padding: var(--au-input-label-padding-vertical, 0.625rem) var(--au-input-label-padding-horizontal, 1rem);
        color: var(--au-input-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-input-label-text-size, 1rem);
        word-break: break-word;
        @container (width < 768px) {
          padding-left: 0;
        }
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

        @container (width < 768px) {
          width: 100%;
          box-sizing: border-box;
        }
      }
      .input-container {
        display: flex;
        align-items: center;
        border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) var(--au-input-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-input-border-radius, 0.25rem);
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
        gap: var(--au-input-container-gap, 0.625rem);
        @container (width < 768px) {
          flex-direction: column;
          align-items: flex-start;
        }
      }
      .color-code {
        font-family: var(--au-input-text-family);
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
          @container (width < 768px) {
            padding-left: 0;
          }
        }
      }
      &[data-size="large"] {
        :is(label, input, .color-code)  {
          padding: var(--au-input-large-padding-vertical, 1rem) var(--au-input-large-padding-horizontal, 1.625rem);
          font-size: var(--au-input-large-text-size, 1.25rem);
          @container (width < 768px) {
            padding-left: 0;
          }
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
  `;const t=document.createElement("div");t.className="input-wrapper",this.wrapper=t,this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const a=document.createElement("div");a.className="input-container",this.inputContainer=a,this.prefixSlot=document.createElement("slot"),this.prefixSlot.name="prefix",this.prefixSpan=document.createElement("span"),this.prefixSpan.className="prefix",this.prefixSpan.appendChild(this.prefixSlot),this.prefixSpan.hidden=!0,this.input=document.createElement("input"),this.input.id=this._id,this.syncAttributes(),this.colorCodeSpan=document.createElement("span"),this.colorCodeSpan.className="color-code",this.colorCodeSpan.hidden=!0,this.clearButton=document.createElement("button"),this.clearButton.type="button",this.clearButton.className="clear-input",this.clearButton.textContent="✖",this.clearButton.hidden=!0,this.clearButton.setAttribute("part","clear"),this.clearButton.addEventListener("click",()=>{this.clear()}),this.affixSlot=document.createElement("slot"),this.affixSlot.name="affix",this.affixSpan=document.createElement("span"),this.affixSpan.className="affix",this.affixSpan.appendChild(this.affixSlot),this.affixSpan.hidden=!0,a.append(this.prefixSpan,this.input,this.colorCodeSpan,this.clearButton,this.affixSpan),t.append(this.labelEl,a),this.shadowRoot.append(e,t),this._bindInputEvents(),this.prefixSlot.addEventListener("slotchange",()=>{this.prefixSpan.hidden=this.prefixSlot.assignedNodes().length===0}),this.affixSlot.addEventListener("slotchange",()=>{this.affixSpan.hidden=this.affixSlot.assignedNodes().length===0})}_bindInputEvents(){this.input.addEventListener("input",()=>{this.value=this.input.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),this.internals.setFormValue(this.value),this._syncValidity(),this._updateClearButton(),this._updateColorCode()}),this.input.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}static get observedAttributes(){return["type","name","value","placeholder","required","disabled","readonly","label","min","max","step","pattern","autocomplete","autofocus","inputmode","maxlength","minlength","list","aria-label","aria-labelledby","data-size","data-layout","data-clear","data-clear-label"]}attributeChangedCallback(e,t,a){if(e==="label"&&this.labelEl)this.labelEl.textContent=a;else if((e==="data-size"||e==="data-layout")&&this.wrapper)a===null?this.wrapper.removeAttribute(e):this.wrapper.setAttribute(e,a);else if(e==="data-clear"||e==="data-clear-label")this._updateClearButton();else if(e==="list")this._handleListAttribute(a);else if(this.input){if(a===null){this.input.removeAttribute(e);const i=e.replace(/-([a-z])/g,(r,s)=>s.toUpperCase());typeof this.input[i]=="boolean"?this.input[i]=!1:typeof this.input[e]=="boolean"&&(this.input[e]=!1)}else{this.input.setAttribute(e,a);const i=e.replace(/-([a-z])/g,(r,s)=>s.toUpperCase());typeof this.input[i]=="boolean"?this.input[i]=!0:typeof this.input[e]=="boolean"&&(this.input[e]=!0)}this._syncValidity(),this._updateColorCode()}}get validity(){return this.internals.validity}get validationMessage(){return this.internals.validationMessage}get willValidate(){return this.internals.willValidate}checkValidity(){return this.internals.checkValidity()}reportValidity(){return this.internals.reportValidity()}connectedCallback(){this._initialValueSet||(this._initialValue=this.input.value,this._initialValueSet=!0),this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton(),this._updateColorCode(),this.hasAttribute("list")&&requestAnimationFrame(()=>{this._handleListAttribute(this.getAttribute("list"))})}formResetCallback(){const e=this._initialValue||"",t=this.input.cloneNode(!1);t.value=e,this.inputContainer.replaceChild(t,this.input),this.input=t,this._bindInputEvents(),this.internals.setFormValue(e),this._syncValidity(),this._updateClearButton(),this._updateColorCode()}get value(){var e;return(e=this.input)==null?void 0:e.value}set value(e){this.input&&(this.input.value=e,this.setAttribute("value",e),this.internals.setFormValue(e),this._syncValidity(),this._updateClearButton(),this._updateColorCode())}clear(){this.input.value="",this.value="",this.internals.setFormValue(""),this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),this._updateClearButton(),this._updateColorCode()}suggest(e=""){this.input.value=e,this.value=e,this.internals.setFormValue(e),this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),this._updateClearButton(),this._updateColorCode()}get disabled(){return this.hasAttribute("disabled")}set disabled(e){e?this.setAttribute("disabled",""):this.removeAttribute("disabled")}get required(){return this.hasAttribute("required")}set required(e){e?this.setAttribute("required",""):this.removeAttribute("required")}get readonly(){return this.hasAttribute("readonly")}set readonly(e){e?this.setAttribute("readonly",""):this.removeAttribute("readonly")}focus(){var e;(e=this.input)==null||e.focus()}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`au-input-${e[0].toString(36)}`}return`au-input-${Math.random().toString(36).slice(2)}`}syncAttributes(){Array.from(this.attributes).forEach(e=>{["data-size","data-layout","data-clear","data-clear-label"].includes(e.name)||(this.input.setAttribute(e.name,e.value),e.name==="value"&&(this.input.defaultValue=e.value))})}_syncValidity(){this.input&&(this.input.validity.valid?this.internals.setValidity({}):this.internals.setValidity(this.input.validity,this.input.validationMessage,this.input))}_updateClearButton(){const e=this.hasAttribute("data-clear"),t=this.input.value.length>0,a=this.getAttribute("data-clear-label")||"Clear input";this.clearButton.setAttribute("aria-label",a),this.clearButton.hidden=!(e&&t)}_updateColorCode(){this.input.type==="color"?(this.colorCodeSpan.textContent=this.input.value,this.colorCodeSpan.hidden=!1):this.colorCodeSpan.hidden=!0}_handleListAttribute(e){if(!this.shadowRoot||!this.input)return;this._disconnectDatalistObserver();const t=this.shadowRoot.querySelector("datalist");if(t&&t.remove(),!e){this.input.removeAttribute("list");return}const a=this.getRootNode(),i=a instanceof Document||a instanceof ShadowRoot?a.getElementById(e):document.getElementById(e);i&&i.tagName==="DATALIST"?(this._syncInternalDatalist(i,e),this._datalistObserver=new MutationObserver(()=>{this._syncInternalDatalist(i,e)}),this._datalistObserver.observe(i,{childList:!0,subtree:!0,attributes:!0})):this.input.setAttribute("list",e)}_syncInternalDatalist(e,t){if(!this.shadowRoot||!this.input)return;const a=this.shadowRoot.querySelector("datalist");a&&a.remove();const i=document.createElement("datalist");i.id=t,Array.from(e.options).forEach(r=>{i.appendChild(r.cloneNode(!0))}),this.shadowRoot.appendChild(i),this.input.setAttribute("list",t)}_disconnectDatalistObserver(){this._datalistObserver&&(this._datalistObserver.disconnect(),this._datalistObserver=null)}disconnectedCallback(){this._disconnectDatalistObserver()}}x(C,"formAssociated",!0);typeof customElements<"u"&&!customElements.get("au-input")&&customElements.define("au-input",C);class w extends HTMLElement{static get observedAttributes(){return["data-total","data-current-page","data-pager-count","data-page-size","data-page-size-options","data-layout","data-text-total-pages-prefix","data-text-page","data-text-total-items-suffix","data-text-per","data-text-first","data-text-prev","data-text-next","data-text-last","data-text-go","data-text-goto","data-text-pagination-label","data-text-page-size","data-text-page-announcement"]}static generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`au-pagination-${e[0].toString(36)}`}return`au-pagination-${Math.random().toString(36).slice(2)}`}constructor(){super(),this.attachShadow({mode:"open"}),this._selectId=w.generateId(),this._jumpId=w.generateId(),this.liveRegion=document.createElement("div"),this.liveRegion.setAttribute("aria-live","polite"),this.liveRegion.setAttribute("role","status"),this.liveRegion.setAttribute("aria-atomic","true"),this._parseAttributes(),this._render()}attributeChangedCallback(){this._parseAttributes(),this._requestRender()}_requestRender(){this._updatePending||(this._updatePending=!0,requestAnimationFrame(()=>{this._render(),this._updatePending=!1}))}_parseAttributes(){this.total=parseInt(this.getAttribute("data-total"))||0,this.currentPage=parseInt(this.getAttribute("data-current-page"))||1,this.pagerCount=parseInt(this.getAttribute("data-pager-count"))||5,this.pageSize=parseInt(this.getAttribute("data-page-size"))||10;const e=this.getAttribute("data-page-size-options");if(e)try{this._pageSizeOptions=JSON.parse(e)}catch{this._pageSizeOptions=e.split(",").map(a=>parseInt(a.trim()))}else this._pageSizeOptions=[10,30,50,100];const t=this.getAttribute("data-layout");if(t)try{this._layout=JSON.parse(t)}catch{this._layout=t.replace(/[[\]' ]/g,"").split(",")}else this._layout=["total_page","total_items","page_size","first","prev","pages","next","last","jump"];this.texts={totalPagesPrefix:this.getAttribute("data-text-total-pages-prefix")||"Total",pageSuffix:this.getAttribute("data-text-page")||"page(s)",totalItemsSuffix:this.getAttribute("data-text-total-items-suffix")||"item(s)",perText:this.getAttribute("data-text-per")||"each page",firstText:this.getAttribute("data-text-first")||"First",prevText:this.getAttribute("data-text-prev")||"Prev",nextText:this.getAttribute("data-text-next")||"Next",lastText:this.getAttribute("data-text-last")||"Last",goText:this.getAttribute("data-text-go")||"go to",gotoText:this.getAttribute("data-text-goto")||"go to",paginationLabel:this.getAttribute("data-text-pagination-label")||"pagination",pageSizeText:this.getAttribute("data-text-page-size")||"Page size",pageAnnouncement:this.getAttribute("data-text-page-announcement")||"Page {page}"}}formatText(e,t={}){return Object.entries(t).reduce((a,[i,r])=>a.replaceAll(`{${i}}`,String(r)),e)}get pageSizeOptions(){return this._pageSizeOptions??[10,30,50,100]}set pageSizeOptions(e){this._pageSizeOptions=e,this.setAttribute("data-page-size-options",JSON.stringify(e))}get layout(){return this._layout??["total_page","total_items","page_size","first","prev","pages","next","last","jump"]}set layout(e){this._layout=e,this.setAttribute("data-layout",JSON.stringify(e))}get totalPages(){return Math.ceil(this.total/this.pageSize)||1}get pagers(){const t=Math.floor((this.currentPage-1)/this.pagerCount)*this.pagerCount+1,a=Math.min(t+this.pagerCount-1,this.totalPages),i=[];for(let r=t;r<=a;r++)i.push(r);return i}_render(){const e=this.texts,t=this.layout,a=this.totalPages,i=this.total;this.shadowRoot.innerHTML="";const r=document.createElement("style");r.textContent=`
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
        font-family: var(--au-btn-text-family);
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
    `,this.shadowRoot.appendChild(r);const s=document.createElement("div");s.className="au-pagination";const o=document.createElement("div");o.className="au-pagination-container";const n=document.createElement("div");if(n.className="au-pagination-group",t.includes("total_page")){const l=document.createElement("span");l.textContent=`${e.totalPagesPrefix}${a}${e.pageSuffix}`,n.appendChild(l)}if(t.includes("total_items")){const l=document.createElement("span");l.textContent=`${i}${e.totalItemsSuffix}`,n.appendChild(l)}if(t.includes("page_size")){const l=document.createElement("span");l.className="visually-hidden",l.textContent=e.pageSizeText,n.appendChild(l);const d=document.createElement("label");d.setAttribute("for",this._selectId),d.textContent=e.perText,n.appendChild(d);const h=document.createElement("select");h.id=this._selectId,this.pageSizeOptions.forEach(g=>{const u=document.createElement("option");u.value=g,u.textContent=g,g===this.pageSize&&(u.selected=!0),h.appendChild(u)}),h.addEventListener("change",g=>{this.pageSize=+g.target.value,this.setAttribute("data-page-size",this.pageSize),this.dispatchEvent(new CustomEvent("page-size-change",{detail:this.pageSize,bubbles:!0,composed:!0})),this.currentPage=1,this.setAttribute("data-current-page","1")}),n.appendChild(h);const b=document.createElement("span");b.textContent=e.totalItemsSuffix,n.appendChild(b)}o.appendChild(n);const v=document.createElement("div");v.className="au-pagination-group";const c=document.createElement("ul");if(c.className="pagination-buttons",t.includes("first")){const l=document.createElement("li"),d=document.createElement("button");d.textContent=e.firstText,d.disabled=this.currentPage===1,d.addEventListener("click",()=>this._goto(1)),l.appendChild(d),c.appendChild(l)}if(t.includes("prev")){const l=document.createElement("li"),d=document.createElement("button");d.textContent=e.prevText,d.disabled=this.currentPage===1,d.addEventListener("click",()=>this._goto(this.currentPage-1)),l.appendChild(d),c.appendChild(l)}if(t.includes("pages")&&this.pagers.forEach(l=>{const d=document.createElement("li"),h=document.createElement("button");h.className="pager",l===this.currentPage?(h.setAttribute("aria-current","page"),h.setAttribute("part","current-page")):(h.removeAttribute("aria-current"),h.removeAttribute("part")),h.textContent=l,h.addEventListener("click",()=>this._goto(l)),d.appendChild(h),c.appendChild(d)}),t.includes("next")){const l=document.createElement("li"),d=document.createElement("button");d.textContent=e.nextText,d.disabled=this.currentPage>=a,d.addEventListener("click",()=>this._goto(this.currentPage+1)),l.appendChild(d),c.appendChild(l)}if(t.includes("last")){const l=document.createElement("li"),d=document.createElement("button");d.textContent=e.lastText,d.disabled=this.currentPage>=a,d.addEventListener("click",()=>this._goto(a)),l.appendChild(d),c.appendChild(l)}const p=document.createElement("nav");if(p.setAttribute("aria-label",e.paginationLabel),p.appendChild(c),v.appendChild(p),o.appendChild(v),t.includes("jump")){const l=document.createElement("div");l.className="au-pagination-group";const d=document.createElement("label");d.setAttribute("for",this._jumpId),d.textContent=e.goText,l.appendChild(d);const h=document.createElement("input");h.type="number",h.id=this._jumpId,h.min="1",h.max=String(a),h.value=String(this.currentPage),h.addEventListener("keyup",u=>{u.key==="Enter"&&this._goto(+h.value)}),l.appendChild(h);const b=document.createElement("span");b.textContent=e.pageSuffix,l.appendChild(b);const g=document.createElement("button");g.type="button",g.textContent=e.gotoText,g.addEventListener("click",()=>this._goto(+h.value)),l.appendChild(g),o.appendChild(l)}s.appendChild(o),this.shadowRoot.append(s,this.liveRegion)}_goto(e){e<1&&(e=1),e>this.totalPages&&(e=this.totalPages),e!==this.currentPage&&(this.currentPage=e,this.setAttribute("data-current-page",String(e)),this.dispatchEvent(new CustomEvent("page-change",{detail:e,bubbles:!0,composed:!0})),this.announce(this.formatText(this.texts.pageAnnouncement,{page:e})))}announce(e){for(;this.liveRegion.firstChild;)this.liveRegion.removeChild(this.liveRegion.firstChild);requestAnimationFrame(()=>{const t=document.createElement("span");t.textContent=e,this.liveRegion.appendChild(t)})}}typeof customElements<"u"&&!customElements.get("au-pagination")&&customElements.define("au-pagination",w);class _ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const e=document.createElement("style");e.textContent=`
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
    `;const t=document.createElement("div");t.setAttribute("class","au-radio-group"),t.setAttribute("role","radiogroup"),this.groupName="radio-group-name-"+this.generateId();const a=document.createElement("slot");a.style.display="none",this.shadowRoot.append(e,t,a)}connectedCallback(){this.shadowRoot.querySelector("slot").addEventListener("slotchange",()=>{this.renderRadios()}),this._mutationObserver=new MutationObserver(()=>{this.renderRadios(),this.updateGroupAttributes()}),this._mutationObserver.observe(this,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:["label","value","checked","disabled"]}),this.renderRadios(),this.updateGroupAttributes()}disconnectedCallback(){var e;(e=this._mutationObserver)==null||e.disconnect()}renderRadios(){const e=this.shadowRoot.querySelector(".au-radio-group");e.innerHTML="";const a=this.shadowRoot.querySelector("slot").assignedElements(),i=this.hasAttribute("disabled");let r=null;a.forEach((s,o)=>{const n=document.createElement("label"),v="radio-"+this.generateId();n.setAttribute("for",v);const c=document.createElement("input");c.type="radio",c.id=v,c.name=this.groupName,c.value=s.getAttribute("value")||`radio-${o+1}`,s.hasAttribute("checked")&&(c.checked=!0,r=c.value),(i||s.hasAttribute("disabled"))&&(c.disabled=!0);const p=document.createElement("div");p.setAttribute("class","text"),p.textContent=s.getAttribute("label")||s.textContent.trim(),n.append(c,p),e.appendChild(n),c.addEventListener("change",l=>this.handleChange(l,c)),c.addEventListener("keydown",l=>this.handleKeyDown(l,o))}),this.internals.setFormValue(r)}handleChange(e,t){t.checked&&(this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`).forEach(i=>{i!==t&&(i.checked=!1)}),this.internals.setFormValue(t.value),this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:{value:t.value}})))}handleKeyDown(e,t){const a=Array.from(this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`));let i;switch(e.key){case"ArrowRight":case"ArrowDown":for(e.preventDefault(),i=(t+1)%a.length;a[i].disabled;)i=(i+1)%a.length;a[i].focus(),a[i].click();break;case"ArrowLeft":case"ArrowUp":for(e.preventDefault(),i=(t-1+a.length)%a.length;a[i].disabled;)i=(i-1+a.length)%a.length;a[i].focus(),a[i].click();break}}static get observedAttributes(){return["disabled","direction","aria-label","aria-labelledby","label"]}attributeChangedCallback(e){if(e==="disabled"){const t=this.hasAttribute("disabled");this.shadowRoot.querySelectorAll('input[type="radio"]').forEach(a=>{a.disabled=t})}else["direction","aria-label","aria-labelledby","label"].includes(e)&&this.updateGroupAttributes()}updateGroupAttributes(){const e=this.shadowRoot.querySelector(".au-radio-group");if(!e)return;const t=this.getAttribute("aria-label")||this.getAttribute("label");t?e.setAttribute("aria-label",t):e.removeAttribute("aria-label"),this.hasAttribute("aria-labelledby")?e.setAttribute("aria-labelledby",this.getAttribute("aria-labelledby")):e.removeAttribute("aria-labelledby"),e.classList.toggle("au-radio-group--vertical",this.getAttribute("direction")==="vertical")}get value(){const e=Array.from(this.shadowRoot.querySelectorAll('input[type="radio"]')).find(t=>t.checked);return(e==null?void 0:e.value)??null}get disabled(){return this.hasAttribute("disabled")}set disabled(e){e?this.setAttribute("disabled",""):this.removeAttribute("disabled")}formResetCallback(){this.renderRadios()}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`${e[0].toString(36)}`}return Math.random().toString(36).slice(2)}}x(_,"formAssociated",!0);typeof customElements<"u"&&!customElements.get("au-radio-group")&&customElements.define("au-radio-group",_);class D extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._groupName="rating-"+this.generateId(),this._skipRender=!1;const e=document.createElement("template");e.innerHTML=`
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
    `,this.shadowRoot.appendChild(e.content.cloneNode(!0)),this._fieldset=this.shadowRoot.querySelector(".au-rating"),this._legend=this.shadowRoot.querySelector("legend"),this._scoreEl=this.shadowRoot.querySelector(".score"),this._internals=this.attachInternals()}static get formAssociated(){return!0}static get observedAttributes(){return["value","max","labels","aria-label","name","show-score","score-info","disabled","readonly","data-text-rating","data-text-star","data-text-score"]}connectedCallback(){this.render(),this._fieldset.addEventListener("change",e=>this.handleChange(e)),this._fieldset.addEventListener("keydown",e=>this.handleKeyDown(e))}attributeChangedCallback(e,t,a){if(t!==a&&this.isConnected&&!this._skipRender)if(e==="value"){const i=parseFloat(a);this.updateStars(i),this.updateScoreDisplay(i),this._internals.setFormValue(a)}else this.render()}get max(){return parseInt(this.getAttribute("max"))||5}get value(){const e=this.getAttribute("value");return e?parseFloat(e):0}set value(e){this.setAttribute("value",e)}get labels(){const e=this.getAttribute("labels");return e?e.split(",").map(t=>t.trim()):[]}get name(){return this.getAttribute("name")||"rating"}get scoreInfo(){return this.getAttribute("score-info")||""}get ratingLabel(){return this.getAttribute("aria-label")||this.getAttribute("data-text-rating")||"Rating"}get starLabelTemplate(){return this.getAttribute("data-text-star")||"{value} Star(s)"}get scoreTemplate(){return this.getAttribute("data-text-score")||"{value} / {max} {scoreInfo}"}get showScore(){return this.hasAttribute("show-score")}get disabled(){return this.hasAttribute("disabled")}set disabled(e){e?this.setAttribute("disabled",""):this.removeAttribute("disabled")}get readonly(){return this.hasAttribute("readonly")}set readonly(e){e?this.setAttribute("readonly",""):this.removeAttribute("readonly")}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),e[0].toString(36)}return Math.random().toString(36).slice(2)}getStarSVG(e=""){return`<svg class="star ${e}" viewBox="0 0 24 24" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`}formatText(e,t={}){return Object.entries(t).reduce((a,[i,r])=>a.replaceAll(`{${i}}`,String(r)),e).trim()}render(){const e=this.ratingLabel;this._legend.textContent=e,this._fieldset.setAttribute("aria-label",e),this._fieldset.innerHTML='<legend class="visually-hidden"></legend>',this._legend=this._fieldset.querySelector("legend"),this._legend.textContent=e,this.readonly&&this._fieldset.setAttribute("aria-readonly","true"),this.disabled&&this._fieldset.setAttribute("aria-disabled","true");const t=this.labels,a=this.value,i=Math.round(a);for(let r=1;r<=this.max;r++){const s=document.createElement("div");s.className="rating-option";const o=`${this._groupName}-${r}`,n=document.createElement("input");n.type="radio",n.name=this._groupName,n.value=r,n.id=o,r===i&&(n.checked=!0),t[r-1]||n.setAttribute("aria-label",this.formatText(this.starLabelTemplate,{value:r,max:this.max})),(this.disabled||this.readonly)&&(n.disabled=!0);const c=document.createElement("label");c.setAttribute("for",o);const p=document.createElement("span");p.className="star-wrapper";const l=Math.floor(a),d=a-l;let h=100;r<=l?h=0:r===l+1&&d>0&&(h=100-d*100),p.style.setProperty("--au-rating-clip",`${h}%`),p.innerHTML=`
        ${this.getStarSVG("star-bg")}
        ${this.getStarSVG("star-fill")}
      `,c.appendChild(p);const b=document.createElement("span");b.className="label-text",b.textContent=t[r-1]||"",c.appendChild(b),s.appendChild(n),s.appendChild(c),this._fieldset.appendChild(s)}this.updateScoreDisplay(a),this._internals.setFormValue(a.toString())}updateScoreDisplay(e){this.showScore?this._scoreEl.textContent=this.formatText(this.scoreTemplate,{value:e,max:this.max,scoreInfo:this.scoreInfo}):this._scoreEl.textContent=""}handleChange(e){if(e.target.type==="radio"){const t=parseInt(e.target.value);this.value=t,this.updateStars(t),this.updateScoreDisplay(t),this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:{value:t}}))}}updateStars(e){const t=this._fieldset.querySelectorAll(".star-wrapper"),a=Math.floor(e),i=e-a;t.forEach((r,s)=>{const o=s+1;r.classList.remove("animate");let n=100;o<=a?(n=0,o===a&&i===0&&r.classList.add("animate")):o===a+1&&i>0&&(n=100-i*100,r.classList.add("animate")),r.style.setProperty("--au-rating-clip",`${n}%`)})}handleKeyDown(e){const t=Array.from(this._fieldset.querySelectorAll('input[type="radio"]')),a=t.findIndex(r=>r===this.shadowRoot.activeElement||r.checked);let i;switch(e.key){case"ArrowRight":case"ArrowDown":e.preventDefault(),this.value===0&&a===0?i=0:i=(a+1)%t.length,t[i].focus(),t[i].click();break;case"ArrowLeft":case"ArrowUp":e.preventDefault(),i=(a-1+t.length)%t.length,t[i].focus(),t[i].click();break}}formResetCallback(){this.value=this.getAttribute("value")||0,this._internals.setFormValue(this.value?this.value.toString():null)}formStateRestoreCallback(e,t){e&&(this.value=e)}}typeof customElements<"u"&&!customElements.get("au-rating")&&customElements.define("au-rating",D);class L extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const e=this.generateId(),t=document.createElement("style");t.textContent=`
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
     
    `;const a=document.createElement("label");a.classList.add("au-switch"),a.setAttribute("for",e);const i=document.createElement("div");i.classList.add("container");const r=document.createElement("span");r.classList.add("off-text"),r.setAttribute("aria-hidden","true");const s=document.createElement("div");s.classList.add("input"),this.inputElement=document.createElement("input"),this.inputElement.id=e,this.inputElement.type="checkbox",this.inputElement.setAttribute("role","switch"),this.inputElement.setAttribute("aria-checked","false"),s.appendChild(this.inputElement);const o=document.createElement("span");o.classList.add("on-text"),o.setAttribute("aria-hidden","true"),i.append(r,s,o),a.append(i),this.shadowRoot.append(t,a);const n=document.createElement("slot");this.labelFallback=document.createElement("span"),this.labelFallback.textContent=this.getAttribute("label")||"",n.appendChild(this.labelFallback),a.prepend(n),this.inputElement.addEventListener("change",v=>{const c=v.target.checked;this.inputElement.setAttribute("aria-checked",c.toString());const p=c?this.getAttribute("value")||"on":null;this.internals.setFormValue(p),this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:c}))}),this.syncAccessibleLabel()}get checked(){var e;return((e=this.inputElement)==null?void 0:e.checked)??!1}set checked(e){e?this.setAttribute("checked",""):this.removeAttribute("checked")}get disabled(){return this.hasAttribute("disabled")}set disabled(e){e?this.setAttribute("disabled",""):this.removeAttribute("disabled")}formResetCallback(){this.inputElement.checked=!1,this.inputElement.setAttribute("aria-checked","false"),this.internals.setFormValue(null)}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`au-switch-${e[0].toString(36)}`}return`au-switch-${Math.random().toString(36).slice(2)}`}static get observedAttributes(){return["name","value","checked","disabled","off","on","label","aria-label","aria-labelledby"]}attributeChangedCallback(e,t,a){const i=this.shadowRoot.querySelector("input"),r=this.shadowRoot.querySelector(".off-text"),s=this.shadowRoot.querySelector(".on-text");if(!(!i||!r||!s))switch(e){case"checked":i.checked=a!==null,i.setAttribute("aria-checked",i.checked.toString());break;case"disabled":i.disabled=a!==null;break;case"off":r.textContent=a||"";break;case"on":s.textContent=a||"";break;case"label":this.labelFallback&&(this.labelFallback.textContent=a||""),this.syncAccessibleLabel();break;case"aria-label":case"aria-labelledby":this.syncAccessibleLabel();break;default:a===null?i.removeAttribute(e):i.setAttribute(e,a);break}}syncAccessibleLabel(){this.inputElement&&(this.hasAttribute("aria-label")?this.inputElement.setAttribute("aria-label",this.getAttribute("aria-label")):this.inputElement.removeAttribute("aria-label"),this.hasAttribute("aria-labelledby")?this.inputElement.setAttribute("aria-labelledby",this.getAttribute("aria-labelledby")):this.inputElement.removeAttribute("aria-labelledby"))}connectedCallback(){const e=this.shadowRoot.querySelector("input"),t=this.shadowRoot.querySelector(".off-text"),a=this.shadowRoot.querySelector(".on-text");e.setAttribute("aria-checked",e.checked.toString()),this.hasAttribute("off")?t.textContent=this.getAttribute("off"):t.textContent="",this.hasAttribute("on")?a.textContent=this.getAttribute("on"):a.textContent="";const i=e.checked?this.getAttribute("value")||"on":null;this.internals.setFormValue(i)}}x(L,"formAssociated",!0);typeof customElements<"u"&&!customElements.get("au-switch")&&customElements.define("au-switch",L);class F extends HTMLElement{static get observedAttributes(){return["data-text-tab","data-text-badge-label-prefix"]}constructor(){super(),this.attachShadow({mode:"open"}),this._tabs=[],this._panels=[],this._selectedIndex=0,this.container=document.createElement("div"),this.container.classList.add("au-tabs");const e=document.createElement("style");e.textContent=`
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
        font-family: var(--au-tabs-text-family);
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
    `,this.tabsList=document.createElement("ul"),this.tabsList.setAttribute("role","tablist"),this.tabsList.classList.add("au-tablist");const t=document.createElement("slot");t.name="panel",this.container.append(e,this.tabsList,t),this.shadowRoot.appendChild(this.container)}connectedCallback(){this.shadowRoot.querySelector('slot[name="panel"]').addEventListener("slotchange",()=>{this._renderTabs(),this._attachEvents()}),this._renderTabs(),this._attachEvents()}attributeChangedCallback(){this.isConnected&&(this._renderTabs(),this._attachEvents())}formatText(e,t={}){return Object.entries(t).reduce((a,[i,r])=>a.replaceAll(`{${i}}`,String(r)),e)}_renderTabs(){const t=this.shadowRoot.querySelector('slot[name="panel"]').assignedElements().filter(i=>i.classList.contains("au-tab-panel"));this._tabs=[],this._panels=[],this.tabsList.innerHTML="";const a=Math.min(this._selectedIndex,Math.max(t.length-1,0));t.forEach((i,r)=>{const s=i.getAttribute("label")||this.formatText(this.getAttribute("data-text-tab")||"Tab {index}",{index:r+1}),o=i.getAttribute("label-lang")||this.getAttribute("data-text-tab-lang")||"",n=i.getAttribute("data-prefix")||"",v=i.getAttribute("data-badge")||"",c=i.getAttribute("data-affix")||"",p=i.id||this.generateId(),l=`tab-${p}`,d=`panel-${p}`;i.setAttribute("id",d),i.setAttribute("role","tabpanel"),i.setAttribute("aria-label",s),i.setAttribute("aria-hidden",r===a?"false":"true");const h=document.createElement("li");h.setAttribute("role","presentation"),h.className="au-tablist-item"+(r===a?" au-tablist-item--selected":"");const b=document.createElement("button");b.setAttribute("role","tab"),b.setAttribute("id",l),b.setAttribute("aria-selected",r===a?"true":"false"),b.setAttribute("tabindex",r===a?"0":"-1");const g=document.createDocumentFragment();if(n){const m=document.createElement("span");m.className="prefix",m.textContent=n,g.appendChild(m)}const u=document.createElement("span");if(u.className="label",o&&u.setAttribute("lang",o),u.textContent=s,g.appendChild(u),v){const m=document.createElement("span");m.className="badge";const y=this.getAttribute("data-text-badge-label-prefix")||"Additional information:";m.setAttribute("aria-label",`${y} ${v}`),m.textContent=v,g.appendChild(m)}if(c){const m=document.createElement("span");m.className="affix",m.textContent=c,g.appendChild(m)}b.appendChild(g),h.appendChild(b),this.tabsList.appendChild(h),this._tabs.push(b),this._panels.push(i)}),this._selectedIndex=a}_attachEvents(){this._tabs.forEach((e,t)=>{e.addEventListener("click",()=>this._selectTab(t)),e.addEventListener("keydown",a=>this._onKeydown(a,t))})}_selectTab(e){var t;this._tabs.forEach((a,i)=>{const r=i===e;a.setAttribute("aria-selected",r),a.setAttribute("tabindex",r?"0":"-1"),a.parentElement.classList.toggle("au-tablist-item--selected",r),this._panels[i].setAttribute("aria-hidden",!r)}),this._tabs[e].focus(),this._selectedIndex=e,this.dispatchEvent(new CustomEvent("tab-change",{bubbles:!0,composed:!0,detail:{index:e,label:((t=this._panels[e])==null?void 0:t.getAttribute("label"))??""}}))}_onKeydown(e,t){const a=this._tabs.length-1;let i=t;switch(e.key){case"ArrowRight":case"ArrowDown":i=t===a?0:t+1;break;case"ArrowLeft":case"ArrowUp":i=t===0?a:t-1;break;case"Home":i=0;break;case"End":i=a;break;default:return}e.preventDefault(),this._selectTab(i)}get selectedIndex(){return this._selectedIndex}set selectedIndex(e){this._selectTab(e)}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),e[0].toString(36)}return Math.random().toString(36).slice(2)}}typeof customElements<"u"&&!customElements.get("au-tabs")&&customElements.define("au-tabs",F);class S extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId(),this._initialValue="",this._initialValueSet=!1;const e=document.createElement("style");e.textContent=`
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
        font-family: var(--au-textarea-label-text-family);
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
        font-family: var(--au-textarea-text-family);
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
        
    `;const t=document.createElement("div");t.className="textarea-wrapper",this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const a=document.createElement("div");a.className="textarea-container",this.textareaContainer=a,this.textarea=document.createElement("textarea"),this.textarea.id=this._id;const i=this.getAttribute("label");i&&!this.hasAttribute("aria-label")&&!this.hasAttribute("aria-labelledby")&&this.textarea.setAttribute("aria-label",i),this._bindTextareaEvents(),a.append(this.textarea),t.append(this.labelEl,a),this.shadowRoot.append(e,t)}_bindTextareaEvents(){this.textarea.addEventListener("input",()=>{this.value=this.textarea.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),this._syncValidity()}),this.textarea.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}static get observedAttributes(){return["value","placeholder","name","rows","cols","disabled","readonly","required","maxlength","minlength","aria-label","aria-labelledby","label","id"]}get validity(){return this.internals.validity}get validationMessage(){return this.internals.validationMessage}get willValidate(){return this.internals.willValidate}checkValidity(){return this.internals.checkValidity()}reportValidity(){return this.internals.reportValidity()}attributeChangedCallback(e,t,a){var i;e==="label"&&this.labelEl?(this.labelEl.textContent=a,!this.hasAttribute("aria-label")&&!this.hasAttribute("aria-labelledby")&&this.textarea.setAttribute("aria-label",a)):e==="id"&&a?(this.textarea.id=a,(i=this.labelEl)==null||i.setAttribute("for",a)):e==="value"?(this._initialValueSet||(this._initialValue=a||"",this._initialValueSet=!0),this.textarea.value=a,this.internals.setFormValue(a)):a===null?this.textarea.removeAttribute(e):this.textarea.setAttribute(e,a),this._syncValidity()}connectedCallback(){this._initialValueSet||(this._initialValue=this.getAttribute("value")||this.textarea.value||"",this._initialValueSet=!0),this.internals.setFormValue(this.textarea.value),this._syncValidity()}get value(){return this.textarea.value}set value(e){this.textarea.value=e,this.internals.setFormValue(e),this._syncValidity()}formResetCallback(){const e=this._initialValue||"",t=this.textarea.cloneNode(!1);t.value=e,this.textareaContainer.replaceChild(t,this.textarea),this.textarea=t,this._bindTextareaEvents(),this.internals.setFormValue(e),this._syncValidity()}formStateRestoreCallback(e,t){this.value=e}get disabled(){return this.hasAttribute("disabled")}set disabled(e){e?this.setAttribute("disabled",""):this.removeAttribute("disabled")}get readonly(){return this.hasAttribute("readonly")}set readonly(e){e?this.setAttribute("readonly",""):this.removeAttribute("readonly")}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`au-textarea-${e[0].toString(36)}`}return`au-textarea-${Math.random().toString(36).slice(2)}`}_syncValidity(){this.textarea&&(this.textarea.validity.valid?this.internals.setValidity({}):this.internals.setValidity(this.textarea.validity,this.textarea.validationMessage,this.textarea))}}x(S,"formAssociated",!0);typeof customElements<"u"&&!customElements.get("au-textarea")&&customElements.define("au-textarea",S);class q extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._data=[],this._nodeRegistry=[],this._showCheckbox=!1,this.handleKeyDown=this.handleKeyDown.bind(this),this.handleNodeExpand=this.handleNodeExpand.bind(this),this.handleNodeCheckChange=this.handleNodeCheckChange.bind(this),this._toggleLabel=null,this._fallbackNodeLabel="Node",this._toggleLabelTemplate=null}static get observedAttributes(){return["show-checkbox","data-text-node","data-text-toggle"]}attributeChangedCallback(e,t,a){e==="show-checkbox"&&(this._showCheckbox=a!==null,this.getAllNodes().forEach(i=>{this._showCheckbox?i.setAttribute("show-checkbox",""):i.removeAttribute("show-checkbox")})),e==="data-text-node"&&(this._fallbackNodeLabel=a||"Node",this.getAllNodes().forEach(i=>{i.fallbackNodeLabel=this._fallbackNodeLabel})),e==="data-text-toggle"&&(this._toggleLabelTemplate=a,this.getAllNodes().forEach(i=>{i.toggleLabelTemplate=this._toggleLabelTemplate}))}get toggleLabel(){return this._toggleLabel}set toggleLabel(e){this._toggleLabel=e,this.getAllNodes().forEach(t=>{t.toggleLabel=e})}get fallbackNodeLabel(){return this._fallbackNodeLabel}set fallbackNodeLabel(e){this._fallbackNodeLabel=e||"Node",this.setAttribute("data-text-node",this._fallbackNodeLabel)}get toggleLabelTemplate(){return this._toggleLabelTemplate}set toggleLabelTemplate(e){this._toggleLabelTemplate=e,e==null?this.removeAttribute("data-text-toggle"):this.setAttribute("data-text-toggle",e)}get data(){return this._data}set data(e){this._data=e,this.render()}connectedCallback(){this._upgradeProperty("data"),this.shadowRoot.innerHTML===""&&this.render(),this.addEventListener("keydown",this.handleKeyDown),this.addEventListener("au-tree-node-expand",this.handleNodeExpand),this.addEventListener("au-tree-node-check-change",this.handleNodeCheckChange)}_upgradeProperty(e){if(this.hasOwnProperty(e)){let t=this[e];delete this[e],this[e]=t}}generateId(){if(typeof crypto<"u"&&crypto.getRandomValues){const e=new Uint32Array(1);return crypto.getRandomValues(e),`au-tree-${e[0].toString(36)}`}return`au-tree-${Math.random().toString(36).slice(2)}`}render(){const e=this.generateId();this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          font-family: var(--au-tree-text-family);
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
    `;const t=this.shadowRoot.getElementById(e);Array.isArray(this._data)&&this._data.forEach(a=>{const i=document.createElement("au-tree-node");i.data=a,i.toggleLabel=this._toggleLabel,i.fallbackNodeLabel=this._fallbackNodeLabel,i.toggleLabelTemplate=this._toggleLabelTemplate,this._showCheckbox&&i.setAttribute("show-checkbox",""),t.appendChild(i)}),requestAnimationFrame(()=>this.updateNodeRegistry())}getAllNodes(){return this.collectNodes(this.shadowRoot)}collectNodes(e,t=!1){let a=[];return Array.from(e.querySelectorAll("au-tree-node")).forEach(r=>{a.push(r),(!t||r.expanded)&&r.shadowRoot&&(a=a.concat(this.collectNodes(r.shadowRoot,t)))}),a}updateNodeRegistry(){this._nodeRegistry=this.collectNodes(this.shadowRoot,!0),this._nodeRegistry=this.collectNodes(this.shadowRoot,!0);const e=this.findActiveNode();this._nodeRegistry.forEach(t=>t.tabIndex=-1),e.activeNode&&this._nodeRegistry.includes(e.activeNode)?e.activeNode.tabIndex=0:this._nodeRegistry.length>0&&(this._nodeRegistry[0].tabIndex=0)}findActiveNode(){let e=this.shadowRoot.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;return{activeNode:e instanceof k?e:null}}handleKeyDown(e){const t=e.composedPath().find(r=>r instanceof k);if(!t)return;this.updateNodeRegistry();const a=this._nodeRegistry.indexOf(t);let i=null;switch(e.key){case"ArrowDown":e.preventDefault(),a<this._nodeRegistry.length-1&&(i=this._nodeRegistry[a+1]);break;case"ArrowUp":e.preventDefault(),a>0&&(i=this._nodeRegistry[a-1]);break;case"ArrowRight":e.preventDefault(),t.hasChildren&&(t.expanded?a<this._nodeRegistry.length-1&&(i=this._nodeRegistry[a+1]):(t.setExpanded(!0),this.updateNodeRegistry()));break;case"ArrowLeft":if(e.preventDefault(),t.hasChildren&&t.expanded)t.setExpanded(!1),this.updateNodeRegistry(),t.setExpanded(!1),this.updateNodeRegistry(),i=t;else{const s=t.getRootNode().host;s instanceof k&&(i=s)}break;case"Home":e.preventDefault(),this._nodeRegistry.length>0&&(i=this._nodeRegistry[0]);break;case"End":e.preventDefault(),this._nodeRegistry.length>0&&(i=this._nodeRegistry[this._nodeRegistry.length-1]);break;case"*":e.preventDefault();const r=t.getRootNode().host;r&&r instanceof k?r.expandAllChildren():this.expandAllChildren(),this.updateNodeRegistry();break;default:e.key.length===1&&e.key.match(/\S/)&&this.handleTypeAhead(e.key,a);break}i&&(this._nodeRegistry.forEach(r=>r.tabIndex=-1),i.tabIndex=0,i.focus())}handleTypeAhead(e,t){e=e.toLowerCase();const a=this._nodeRegistry.slice(t+1).find(r=>r.label.toLowerCase().startsWith(e));if(a){this.focusNode(a);return}const i=this._nodeRegistry.slice(0,t).find(r=>r.label.toLowerCase().startsWith(e));i&&this.focusNode(i)}focusNode(e){this._nodeRegistry.forEach(t=>t.tabIndex=-1),e.tabIndex=0,e.focus()}expandAllChildren(){Array.from(this.shadowRoot.querySelectorAll("au-tree-node")).forEach(e=>e.setExpanded(!0))}handleNodeExpand(){}handleNodeCheckChange(e){const t=this.getAllNodes().filter(a=>a.checked).map(a=>a.data);this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:{checkedNodes:t}}))}}class k extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._data={},this.expanded=!1,this.checked=!1,this.indeterminate=!1,this._initialized=!1,this._uid=`au-tree-node-${Math.random().toString(36).substr(2,9)}`,this._toggleLabel=null,this._fallbackNodeLabel="Node",this._toggleLabelTemplate=null}static get observedAttributes(){return["expanded","show-checkbox","checked","indeterminate"]}get toggleLabel(){return this._toggleLabel}set toggleLabel(e){this._toggleLabel=e,this.renderContent(),this.shadowRoot&&this.shadowRoot.querySelectorAll("au-tree-node").forEach(t=>t.toggleLabel=e)}get fallbackNodeLabel(){return this._fallbackNodeLabel}set fallbackNodeLabel(e){this._fallbackNodeLabel=e||"Node",this.renderContent(),this.shadowRoot&&this.shadowRoot.querySelectorAll("au-tree-node").forEach(t=>t.fallbackNodeLabel=this._fallbackNodeLabel)}get toggleLabelTemplate(){return this._toggleLabelTemplate}set toggleLabelTemplate(e){this._toggleLabelTemplate=e,this.renderContent(),this.shadowRoot&&this.shadowRoot.querySelectorAll("au-tree-node").forEach(t=>t.toggleLabelTemplate=e)}get data(){return this._data}set data(e){this._data=e,this.render()}get label(){return this._data.label||""}get hasChildren(){return this._data.children&&this._data.children.length>0}getLabelText(){return this._data.label||this._fallbackNodeLabel}formatText(e,t={}){return Object.entries(t).reduce((a,[i,r])=>a.replaceAll(`{${i}}`,String(r)),e)}escapeHTML(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}connectedCallback(){this.shadowRoot.addEventListener("au-tree-node-check-change",this.handleChildCheckChange.bind(this)),this.addEventListener("click",e=>{e.stopPropagation()}),this.shadowRoot.addEventListener("click",e=>{e.stopPropagation();const t=e.target,a=t.closest(".toggle-btn");if(a&&!a.classList.contains("hidden")){this.setExpanded(!this.expanded),this.focus();return}t.closest(".node-content")}),this.shadowRoot.addEventListener("change",e=>{const t=e.target;t.tagName==="INPUT"&&t.type==="checkbox"&&(e.stopPropagation(),this.toggleCheck(t.checked))}),this.addEventListener("keydown",e=>{const t=e.composedPath()[0],a=t.tagName==="INPUT"||t.tagName==="BUTTON";a||(e.key===" "&&(e.preventDefault(),e.stopPropagation(),this.hasAttribute("show-checkbox")?a||this.toggleCheck():this.hasChildren&&this.setExpanded(!this.expanded)),e.key==="Enter"&&(e.preventDefault(),e.stopPropagation(),this.setExpanded(!this.expanded)))})}attributeChangedCallback(e,t,a){this._initialized&&e==="show-checkbox"&&(this.renderContent(),this.shadowRoot.querySelectorAll("au-tree-node").forEach(r=>{a!==null?r.setAttribute("show-checkbox",""):r.removeAttribute("show-checkbox")}))}setExpanded(e){if(e===this.expanded)return;this.expanded=e;const t=this.shadowRoot.querySelector('div[role="group"]'),a=this.shadowRoot.querySelector(".toggle-icon");this.expanded?(this.setAttribute("aria-expanded","true"),t&&(t.style.display="block"),a&&(a.style.transform="rotate(90deg)")):(this.setAttribute("aria-expanded","false"),t&&(t.style.display="none"),a&&(a.style.transform="rotate(0deg)")),this.dispatchEvent(new CustomEvent("au-tree-node-expand",{bubbles:!0,composed:!0}))}expandAllChildren(){this.setExpanded(!0),Array.from(this.shadowRoot.querySelectorAll("au-tree-node")).forEach(e=>e.expandAllChildren())}toggleCheck(e=null){const t=e!==null?e:!this.checked;this.setChecked(t),this.setChildrenChecked(t),this.dispatchEvent(new CustomEvent("au-tree-node-check-change",{bubbles:!0,composed:!0,detail:{checked:this.checked,node:this}}))}setChecked(e,t=!1){this.checked=e,this.indeterminate=t,this.indeterminate?this.setAttribute("aria-checked","mixed"):this.setAttribute("aria-checked",e?"true":"false");const a=this.shadowRoot.querySelector(`input#${this._uid}`);a&&(a.checked=e,a.indeterminate=t)}setChildrenChecked(e){if(!this.hasChildren)return;Array.from(this.shadowRoot.querySelectorAll("au-tree-node")).forEach(a=>{a.setChecked(e),a.setChildrenChecked(e)})}handleChildCheckChange(e){e.stopPropagation(),this.updateStateFromChildren(),this.dispatchEvent(new CustomEvent("au-tree-node-check-change",{bubbles:!0,composed:!0,detail:{checked:this.checked,node:this}}))}updateStateFromChildren(){const e=Array.from(this.shadowRoot.querySelectorAll("au-tree-node")),t=e.every(i=>i.checked&&!i.indeterminate),a=e.every(i=>!i.checked&&!i.indeterminate);t?this.setChecked(!0,!1):a?this.setChecked(!1,!1):this.setChecked(!1,!0)}render(){this._initialized=!0;const{children:e}=this._data,t=this.hasAttribute("show-checkbox");if(this.shadowRoot.innerHTML=`
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
          font-family: var(--au-tree-node-text-family);
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
            align-items: center;
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
    `,this.renderContent(),this.hasChildren){const a=this.shadowRoot.querySelector('div[role="group"]');e.forEach(i=>{const r=document.createElement("au-tree-node");r.data=i,r.toggleLabel=this._toggleLabel,r.fallbackNodeLabel=this._fallbackNodeLabel,r.toggleLabelTemplate=this._toggleLabelTemplate,t&&r.setAttribute("show-checkbox",""),a.appendChild(r)})}this.setAttribute("role","treeitem"),this.hasChildren&&this.setAttribute("aria-expanded","false"),t&&this.setAttribute("aria-checked","false")}renderContent(){const e=this.shadowRoot.querySelector(".node-content");if(!e)return;const t=this.hasAttribute("show-checkbox"),a=this.getLabelText(),i=this.escapeHTML(a);this.setAttribute("aria-label",a);const r=`<svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" aria-hidden="true"/></svg><span class="visually-hidden">${i}</span>`,s=typeof this._toggleLabel=="function"?this._toggleLabel(this._data):this.formatText(this._toggleLabelTemplate||"Toggle {label}",{label:a}),o=this.escapeHTML(s),n=this.hasChildren?`<button class="toggle-btn" tabindex="-1" aria-label="${o}">${r}</button>`:`<button class="toggle-btn hidden" tabindex="-1" aria-hidden="true">${r}</button>`,v=t?`<div class="au-checkbox"><input type="checkbox" id="${this._uid}" tabindex="-1" ${this.checked?"checked":""}>`:"",c=`${this._uid}-label`,p=t?`<label id="${c}" for="${this._uid}">${i}</label></div>`:`<span>${i}</span>`;if(e.innerHTML=`
        ${n}
        ${v}
        ${p}
      `,t&&this.indeterminate){const d=e.querySelector("input");d&&(d.indeterminate=!0)}const l=e.querySelector(".toggle-icon");this.expanded&&l&&(l.style.transform="rotate(90deg)")}}typeof customElements<"u"&&(customElements.get("au-tree")||customElements.define("au-tree",q),customElements.get("au-tree-node")||customElements.define("au-tree-node",k));
