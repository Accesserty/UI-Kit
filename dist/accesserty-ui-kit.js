var u=Object.defineProperty;var p=(c,t,e)=>t in c?u(c,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):c[t]=e;var d=(c,t,e)=>p(c,typeof t!="symbol"?t+"":t,e);class m extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=document.createElement("div");t.setAttribute("class","ry-accordion");const e=document.createElement("slot");t.appendChild(e),this.shadowRoot.appendChild(t)}}customElements.define("ry-accordion",m);class y extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=this.generateId(),e=this.generateId(),r=document.createElement("div");r.setAttribute("class","ry-accordion-item"),r.innerHTML=`
        <style>
          .ry-accordion-item {
            margin-bottom: var(--ry-accordion-item-margin-bottom, 1rem);
          }
          button {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
            
            /* spacing */
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            word-break: break-word;
            width: 100%;
            text-align: left;
            padding: var(--ry-accordion-heading-padding-vertical, 0.75rem) var(--ry-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: oklch(var(--ry-accordion-heading-text-color, 13.98% 0 0));
            font-size: var(--ry-accordion-heading-text-size, 1rem);
            font-family: var(--ry-accordion-heading-text-family, 'Helvetica, Arial, sans-serif, system-ui');
            line-height: var(--ry-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--ry-accordion-heading-border-width, 1px) var(--ry-accordion-heading-border-style, solid) oklch(var(--ry-accordion-heading-border-color, 78.94% 0 0));
            border-radius: var(--ry-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: oklch(var(--ry-accordion-heading-bg, 99.4% 0 0));
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
              background-color: oklch(var(--ry-accordion-heading-hover-bg, 94.66% 0 0));
              border-color: oklch(var(--ry-accordion-heading-hover-border-color, 78.94% 0 0));
            }
            
            &:active {
              background-color: oklch(var(--ry-accordion-heading-active-bg, 86.89% 0 0));
              border-color: oklch(var(--ry-accordion-heading-active-border-color, 78.94% 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--ry-accordion-heading-focus-shadow-width, 3px) oklch(var(--ry-accordion-heading-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
            }
          }

          div[role="region"] {
            background-color: oklch(var(--ry-accordion-content-bg, 97.31% 0 0));
            color: oklch(var(--ry-accordion-content-text-color, 13.98% 0 0));
            padding: var(--ry-accordion-content-padding-top, 1rem)  var(--ry-accordion-content-padding-right, 1rem)  var(--ry-accordion-content-padding-bottom, 1rem)  var(--ry-accordion-content-padding-left, 1rem);

            &[aria-hidden="true"] {
              display: none;
            }

            &[aria-hidden="false"] {
              display: block;
              overscroll-behavior: var(--ry-accordion-content-overscroll-behavior, auto);
              max-height: var(--ry-accordion-content-max-height, 300px);
              overflow: auto;
              border-left: var(--ry-accordion-heading-border-width, 1px) var(--ry-accordion-heading-border-style, solid) oklch(var(--ry-accordion-heading-border-color, 78.94% 0 0));
              border-right: var(--ry-accordion-heading-border-width, 1px) var(--ry-accordion-heading-border-style, solid) oklch(var(--ry-accordion-heading-border-color, 78.94% 0 0));
              border-bottom: var(--ry-accordion-heading-border-width, 1px) var(--ry-accordion-heading-border-style, solid) oklch(var(--ry-accordion-heading-border-color, 78.94% 0 0));
            }
          }
        </style>
        <button aria-expanded="false" aria-controls="${t}" part="button">
            <div class="heading" id="${e}"><slot name="heading"></slot></div>
            <div class="info">
              <div>
                <slot name="sub"></slot>
              </div>
              <div class="icon"">
                <slot name="icon"></slot>
              </div>
            </div>
        </button>
        <div role="region" id="${t}" aria-labelledby="${e}" aria-hidden="true" part="region">
            <slot name="content"></slot>
        </div>
      `,this.shadowRoot.append(r),this.button=this.shadowRoot.querySelector("button"),this.button.addEventListener("click",()=>this.toggleAccordion())}connectedCallback(){this.updateExpanded()}static get observedAttributes(){return["open"]}attributeChangedCallback(t,e,r){t==="open"&&this.updateExpanded()}updateExpanded(){const t=this.hasAttribute("open");this.button.setAttribute("aria-expanded",t),this.shadowRoot.querySelector('div[role="region"]').setAttribute("aria-hidden",!t)}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`ry-accordion-item-${t[0].toString(36)}`}toggleAccordion(){const t=this.button.getAttribute("aria-expanded")==="true";this.button.setAttribute("aria-expanded",!t),this.shadowRoot.querySelector('div[role="region"]').setAttribute("aria-hidden",t),t?this.removeAttribute("open"):this.setAttribute("open","")}}customElements.define("ry-accordion-item",y);class g extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.attachInitialAttributes(),this.render()}attachInitialAttributes(){Array.from(this.attributes).forEach(t=>{t.name!=="style"&&!["class","label","items","separator"].includes(t.name)&&this.shadowRoot.host.setAttribute(t.name,t.value)})}static get observedAttributes(){return["id","class","aria-label","items","separator"]}attributeChangedCallback(t,e,r){e!==r&&this.render()}get items(){try{return JSON.parse(this.getAttribute("items")||"[]")}catch(t){return console.error("Error parsing 'items':",t),[]}}set items(t){try{JSON.parse(t),this.setAttribute("items",t),this.render()}catch{console.error("Invalid JSON provided for 'items':",t)}}render(){const t=this.getAttribute("id"),e=this.getAttribute("class"),r=this.getAttribute("aria-label"),o=this.items,a=this.getAttribute("separator")||"/";this.shadowRoot.innerHTML=`
      <style>
        nav {
          background-color: oklch(var(--ry-breadcrumbs-bg, transparent));
          overflow: auto;
          white-space: nowrap;
          ol {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
            li {
              display: inline-block;
              vertical-align: middle;
              &:last-child {
                a {
                  text-decoration: none;
                }
              }
              a {
                display: inline-block;
                padding: var(--ry-breadcrumbs-link-padding-vertical, 0.75rem) var(--ry-breadcrumbs-link-padding-horizontal, 0.5rem);
                font-size: var(--ry-breadcrumbs-text-size, 1rem);
                text-decoration: var(--ry-breadcrumbs-text-deco, none);
                color: oklch(var(--ry-breadcrumbs-link-color, 42.9% 0.2972777928415759 264.05202063805507));
                -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
                &:hover {
                  opacity: 0.7;
                }
                &:active {
                  opacity: 1;
                }
                &:visited {
                  color: oklch(var(--ry-breadcrumbs-link-visited-color, 37.48% 0.167 303.51));
                }
                &:focus-visible {
                  outline: none;
                  box-shadow: inset 0 0 0 var(--ry-breadcrumbs-focus-shadow-width, 3px) oklch(var(--ry-breadcrumbs-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
                }
                &[aria-current="page"] {
                  color: oklch(var(--ry-breadcrumbs-link-currentpage-color, 13.98% 0 0));
                  pointer-events: none;
                }
              }
            }
          }
        }
      </style>
      <nav 
        ${t!==null?'id="'+t+'"':""}
        ${e!==null?'class="'+e+'"':""}
        ${r!==null?'aria-label="'+r+'"':""}
      >
        <ol>
          ${o.map((i,n)=>`
                <li>
                  <a href="${i.url||""}" ${n===o.length-1?'aria-current="page"':""}>
                    <slot name="icon-${n+1}"></slot>
                    <span>${i.text}</span>
                  </a>
                  ${n!==o.length-1?'<span aria-hidden="true">'+a+"</span>":""}
                </li>
              `).join("")}
        </ol>
      </nav>
    `}}customElements.define("ry-breadcrumbs",g);class v extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.button=document.createElement("button"),this.button.addEventListener("click",r=>this.handleClick(r));const t=document.createElement("slot");this.button.appendChild(t),this.shadowRoot.appendChild(this.button);const e=document.createElement("style");e.textContent=`
      button {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        
        /* spacing */
        padding: var(--ry-btn-padding-vertical, 0.75rem) var(--ry-btn-padding-horizontal, 1rem);
        
        /* text */
        color: oklch(var(--ry-btn-text-color, 13.98% 0 0));
        font-size: var(--ry-btn-text-size, 1rem);
        font-family: var(--ry-btn-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--ry-btn-text-line-height, 1.5);
        
        /* border */
        border: var(--ry-btn-border-width, 1px) var(--ry-btn-border-style, solid) oklch(var(--ry-btn-border-color, 78.94% 0 0));
        border-radius: var(--ry-btn-border-radius, 0.25rem);
        
        /* others decoration */
        background-color: oklch(var(--ry-btn-bg, 99.4% 0 0));
        transition: background-color 160ms ease-in;

        &[size="small"] {
          padding: var(--ry-btn-small-padding-vertical, 0.25rem) var(--ry-btn-small-padding-horizontal, 0.5rem);
        }
        
        &[size="large"] {
          padding: var(--ry-btn-large-padding-vertical, 1rem) var(--ry-btn-large-padding-horizontal, 2rem);
          font-size: var(--ry-btn-large-text-size, 1.25rem);
        }
        
        &:disabled {
          cursor: not-allowed;
          pointer-events: none;
          opacity: 0.4;
        }
        
        &:hover {
          background-color: oklch(var(--ry-btn-hover-bg, 94.66% 0 0));
          border-color: oklch(var(--ry-btn-hover-border-color, 78.94% 0 0));
        }
        
        &:active {
          background-color: oklch(var(--ry-btn-active-bg, 86.89% 0 0));
          border-color: oklch(var(--ry-btn-active-border-color, 78.94% 0 0));
        }
        
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--ry-btn-focus-shadow-width, 3px) oklch(var(--ry-btn-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
        
        &.a11y {
          transition: none;
          text-shadow: var(--ry-btn-a11y-text-shadow, none);
          background-image: var(--ry-btn-a11y-bg-image, none);
            
          background-size: var(--ry-btn-a11y-bg-size, 1.5rem 1.5rem);
          background-position: var(--ry-btn-a11y-bg-position, center center);
          &:hover {
            background-image: var(--ry-btn-a11y-hover-bg-image, none);
          }
          &:active {
            background-image: var(--ry-btn-a11y-active-bg-image, none);
          }
        }
        
      }
      
      .spinner {
        display: inline-block;
        vertical-align: text-bottom;
        position: relative;
        width: 1.25rem;
        height: 1.25rem;
          > span {
            box-sizing: border-box;
            display: block;
            position: absolute;
            width: 1rem;
            height: 1rem;
            margin: 0.125rem;
            border: 0.125rem solid oklch(var(--ry-btn-spinner-color, 78.94% 0 0));
            border-color: oklch(var(--ry-btn-spinner-color, 78.94% 0 0)) transparent transparent transparent;
            border-radius: 50%;
            animation: btn-loading-animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            &:nth-child(1) {
              animation-delay: -450ms;
            }
            &:nth-child(2) {
              animation-delay: -300ms;
            }
            &:nth-child(3) {
              animation-delay: -150ms;
            }
          }
         }
         
         @keyframes btn-loading-animation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `,this.shadowRoot.append(e,this.button)}connectedCallback(){this.attachInitialAttributes()}attachInitialAttributes(){Array.from(this.attributes).forEach(t=>{t.name!=="style"&&!t.name.startsWith("@")&&this.button.setAttribute(t.name,t.value)})}handleClick(t){if(this.button.getAttribute("type")==="submit"){const e=this.closest("form");e&&e.submit()}else if(this.button.getAttribute("type")==="reset"){const e=this.closest("form");e&&e.reset()}}static get observedAttributes(){return["disabled","loading","type"]}attributeChangedCallback(t,e,r){t==="loading"?this.updateLoadingState(r!==null):t.startsWith("@")||this.button.setAttribute(t,r)}updateLoadingState(t){t?(this.button.disabled=!0,this.button.setAttribute("aria-busy","true"),this.button.appendChild(this.createSpinner())):(this.button.disabled=!1,this.button.removeAttribute("aria-busy"),this.spinner&&this.button.removeChild(this.spinner))}createSpinner(){const t=document.createElement("span");t.classList.add("spinner");for(let e=0;e<3;e++){const r=document.createElement("span");t.appendChild(r)}return t}}window.customElements.define("ry-btn",v);class k extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot.innerHTML=`
      <div class="ry-card-container" part="ry-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `}}customElements.define("ry-card",k);class l extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const t=this.generateId(),e=document.createElement("style");e.textContent=`
      .ry-checkbox {
        display: inline-block;
        vertical-align: middle;
        padding: var(--ry-checkbox-padding, 0.25rem);
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--ry-checkbox-content-gap, 0.5rem);
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          width: var(--ry-checkbox-input-width, 1.5rem);
          height: var(--ry-checkbox-input-height, 1.5rem);
          border: var(--ry-checkbox-input-border-width, 1px) var(--ry-checkbox-input-border-style, solid) oklch(var(--ry-checkbox-input-border-color, 78.94% 0 0));
          border-radius: var(--ry-checkbox-input-border-radius, 0.25rem);
          background-color: oklch(var(--ry-checkbox-input-bg, 99.4% 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: oklch(var(--ry-checkbox-input-checked-bg, 13.98% 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--ry-checkbox-input-checked-symbol, '✔︎');
              color: oklch(var(--ry-checkbox-input-checked-text-color, 99.4% 0 0));
              font-size: var(--ry-checkbox-input-checked-text-size, 1.125rem);
            }
          }
        }
        .text {
          flex: 1;
          color: oklch(var(--ry-checkbox-label-text-color, 13.98% 0 0));
          font-size: var(--ry-checkbox-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--ry-checkbox-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: oklch(var(--ry-checkbox-label-active-text-color, 53.7% 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--ry-checkbox-input-focus-shadow-width, 3px) oklch(var(--ry-checkbox-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="checkbox"]:disabled) {
          cursor: not-allowed;
          input[type="checkbox"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: oklch(var(--ry-checkbox-label-disabled-text-color, 53.7% 0 0));
          }
        }
      }
    `;const r=document.createElement("div");r.setAttribute("class","ry-checkbox");const o=document.createElement("label");o.setAttribute("for",t);const a=document.createElement("input");a.type="checkbox",a.id=t,a.name=this.getAttribute("name")||"default-checkbox",a.value=this.getAttribute("value")||"default";const i=document.createElement("div");i.setAttribute("class","text");const n=document.createElement("slot");i.appendChild(n),o.append(a,i),r.appendChild(o),this.shadowRoot.append(e,r),a.addEventListener("change",s=>{this.checked=s.target.checked,this.dispatchEvent(new CustomEvent("change",{detail:s.target.checked})),this.updateFormValue()}),a.addEventListener("focus",()=>{this.dispatchEvent(new CustomEvent("focus"))}),a.addEventListener("blur",()=>{this.dispatchEvent(new CustomEvent("blur"))})}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`ry-checkbox-${t[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","required"]}attributeChangedCallback(t,e,r){const o=this.shadowRoot.querySelector("input");if(o)switch(t){case"checked":o.checked=r!==null;break;case"disabled":o.disabled=r!==null;break;case"name":o.name=r;break;case"value":o.value=r;break;case"required":o.required=r!==null;break}}connectedCallback(){this.updateCheckedState(),this.updateFormValue()}updateCheckedState(){const t=this.shadowRoot.querySelector("input");t&&(t.checked=this.hasAttribute("checked"))}updateFormValue(){const t=this.shadowRoot.querySelector("input"),e=t.checked?this.getAttribute("value")||"on":null;this.internals.setFormValue(e),t.validity.valid?this.internals.setValidity({}):this.internals.setValidity(t.validity,t.validationMessage,t)}formDisabledCallback(t){const e=this.shadowRoot.querySelector("input");e&&(e.disabled=t)}formResetCallback(){const t=this.shadowRoot.querySelector("input");t&&(t.checked=!1,this.checked=!1,this.updateFormValue())}}d(l,"formAssociated",!0);customElements.define("ry-checkbox",l);class f extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=this.generateId(),e=document.createElement("style");e.textContent=`
      .ry-switch {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ry-switch-gap, 1rem);
        cursor: pointer;
        padding-top: var(--ry-switch-padding-top, 0.5rem);
        padding-right: var(--ry-switch-padding-right, 0.25rem);
        padding-bottom: var(--ry-switch-padding-bottom, 0.5rem);
        padding-left: var(--ry-switch-padding-left, 0.25rem);
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--ry-switch-container-gap, 0.5rem);
      }
      .input {
        position: relative;
      }
      input[type="checkbox"] {
        appearance: none;
        cursor: pointer;
        margin: 0;
        display: block;
        width: var(--ry-switch-input-width, 4rem);
        height: calc(var(--ry-switch-input-width, 4rem) / 2);
        border: var(--ry-switch-input-border-width, 1px) var(--ry-switch-input-border-style, solid) oklch(var(--ry-switch-input-border-color, 78.94% 0 0));
        border-radius: var(--ry-switch-input-border-radius, calc(var(--ry-switch-input-width, 4rem) / 4));
        transition: background-color 360ms ease-in;
      }
      input[type="checkbox"]:focus-visible {
        outline: none;
      }
      .input:before {
        content: '';
        display: block;
        width: calc(var(--ry-switch-input-width, 4rem) / 2 - 2 * var(--ry-switch-inner-distance, 0.25rem));
        height: calc(var(--ry-switch-input-width, 4rem) / 2 - 2 * var(--ry-switch-inner-distance, 0.25rem));
        background-color: gray;
        position: absolute;
        top: var(--ry-switch-inner-distance, 0.25rem);
        left: var(--ry-switch-inner-distance, 0.25rem);
        border-radius: var(--ry-switch-inner-border-radius, calc((var(--ry-switch-input-width, 4rem) / 2 - var(--ry-switch-inner-distance, 0.25rem)) / 2));
        transition: background-color 360ms ease-in, left 240ms ease-in;
      }
      .input:has(input[type="checkbox"]:checked) input[type="checkbox"] {
        background-color: oklch(var(--ry-switch-input-checked-bg, 13.98% 0 0));
      }
      .input:has(input[type="checkbox"]:checked):before {
        background-color: oklch(var(--ry-switch-inner-checked-bg, 99.4% 0 0));
        left: calc(100% - (var(--ry-switch-input-width, 4rem) / 2 - 2 * var(--ry-switch-inner-distance, 0.25rem)) - var(--ry-switch-inner-distance, 0.25rem));
      }
      .ry-switch:hover,
      .ry-switch:has(input:focus-visible) {
        box-shadow: inset 0 0 0 var(--ry-switch-focus-shadow-width, 3px) oklch(var(--ry-switch-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
      }
    `;const r=document.createElement("label");r.classList.add("ry-switch"),r.setAttribute("for",t);const o=document.createElement("div");o.classList.add("container");const a=document.createElement("span");a.classList.add("off-text"),a.setAttribute("aria-hidden","true");const i=document.createElement("div");i.classList.add("input");const n=document.createElement("input");n.id=t,n.type="checkbox",n.setAttribute("role","switch"),i.appendChild(n);const s=document.createElement("span");s.classList.add("on-text"),s.setAttribute("aria-hidden","true"),o.append(a,i,s),r.append(o),this.shadowRoot.append(e,r);const h=document.createElement("slot");r.prepend(h),n.addEventListener("change",b=>{b.target===n&&this.dispatchEvent(new CustomEvent("change",{detail:n.checked}))})}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`ry-switch-${t[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","off","on"]}attributeChangedCallback(t,e,r){const o=this.shadowRoot.querySelector("input"),a=this.shadowRoot.querySelector(".off-text"),i=this.shadowRoot.querySelector(".on-text");if(!(!o||!a||!i))switch(t){case"checked":o.checked=r!==null;break;case"disabled":o.disabled=r!==null;break;case"off":a.textContent=r||"Off";break;case"on":i.textContent=r||"On";break;default:o.setAttribute(t,r);break}}connectedCallback(){const t=this.shadowRoot.querySelector(".off-text"),e=this.shadowRoot.querySelector(".on-text");this.hasAttribute("off")?t.textContent=this.getAttribute("off"):t.textContent="",this.hasAttribute("on")?e.textContent=this.getAttribute("on"):e.textContent=""}}customElements.define("ry-switch",f);
