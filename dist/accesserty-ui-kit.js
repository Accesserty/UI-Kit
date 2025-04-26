var b=Object.defineProperty;var p=(c,e,t)=>e in c?b(c,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):c[e]=t;var d=(c,e,t)=>p(c,typeof e!="symbol"?e+"":e,t);class m extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=document.createElement("div");e.setAttribute("class","au-accordion");const t=document.createElement("slot");e.appendChild(t),this.shadowRoot.appendChild(e)}}customElements.define("au-accordion",m);class v extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=this.generateId(),t=this.generateId(),a=document.createElement("div");a.setAttribute("class","au-accordion-item"),a.innerHTML=`
        <style>
          .au-accordion-item {
            margin-bottom: var(--au-accordion-item-margin-bottom, 1rem);
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
            padding: var(--au-accordion-heading-padding-vertical, 0.75rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: oklch(var(--au-accordion-heading-text-color, 13.98% 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family, 'Helvetica, Arial, sans-serif, system-ui');
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) oklch(var(--au-accordion-heading-border-color, 78.94% 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: oklch(var(--au-accordion-heading-bg, 99.4% 0 0));
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
              background-color: oklch(var(--au-accordion-heading-hover-bg, 94.66% 0 0));
              border-color: oklch(var(--au-accordion-heading-hover-border-color, 78.94% 0 0));
            }
            
            &:active {
              background-color: oklch(var(--au-accordion-heading-active-bg, 86.89% 0 0));
              border-color: oklch(var(--au-accordion-heading-active-border-color, 78.94% 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-accordion-heading-focus-shadow-width, 3px) oklch(var(--au-accordion-heading-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
            }
          }

          div[role="region"] {
            background-color: oklch(var(--au-accordion-content-bg, 97.31% 0 0));
            color: oklch(var(--au-accordion-content-text-color, 13.98% 0 0));
            padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);

            &[aria-hidden="true"] {
              display: none;
            }

            &[aria-hidden="false"] {
              display: block;
              overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
              max-height: var(--au-accordion-content-max-height, 300px);
              overflow: auto;
              border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) oklch(var(--au-accordion-heading-border-color, 78.94% 0 0));
              border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) oklch(var(--au-accordion-heading-border-color, 78.94% 0 0));
              border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) oklch(var(--au-accordion-heading-border-color, 78.94% 0 0));
            }
          }
        </style>
        <button aria-expanded="false" aria-controls="${e}" part="button">
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
        <div role="region" id="${e}" aria-labelledby="${t}" aria-hidden="true" part="region">
            <slot name="content"></slot>
        </div>
      `,this.shadowRoot.append(a),this.button=this.shadowRoot.querySelector("button"),this.button.addEventListener("click",()=>this.toggleAccordion())}connectedCallback(){this.updateExpanded()}static get observedAttributes(){return["open"]}attributeChangedCallback(e,t,a){e==="open"&&this.updateExpanded()}updateExpanded(){const e=this.hasAttribute("open");this.button.setAttribute("aria-expanded",e),this.shadowRoot.querySelector('div[role="region"]').setAttribute("aria-hidden",!e)}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-accordion-item-${e[0].toString(36)}`}toggleAccordion(){const e=this.button.getAttribute("aria-expanded")==="true";this.button.setAttribute("aria-expanded",!e),this.shadowRoot.querySelector('div[role="region"]').setAttribute("aria-hidden",e),e?this.removeAttribute("open"):this.setAttribute("open","")}}customElements.define("au-accordion-item",v);class g extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.attachInitialAttributes(),this.render()}attachInitialAttributes(){Array.from(this.attributes).forEach(e=>{e.name!=="style"&&!["class","label","items","separator"].includes(e.name)&&this.shadowRoot.host.setAttribute(e.name,e.value)})}static get observedAttributes(){return["id","class","aria-label","items","separator"]}attributeChangedCallback(e,t,a){t!==a&&this.render()}get items(){try{return JSON.parse(this.getAttribute("items")||"[]")}catch(e){return console.error("Error parsing 'items':",e),[]}}set items(e){try{JSON.parse(e),this.setAttribute("items",e),this.render()}catch{console.error("Invalid JSON provided for 'items':",e)}}render(){const e=this.getAttribute("id"),t=this.getAttribute("class"),a=this.getAttribute("aria-label"),o=this.items,r=this.getAttribute("separator")||"/";this.shadowRoot.innerHTML=`
      <style>
        nav {
          background-color: oklch(var(--au-breadcrumbs-bg, transparent));
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
                padding: var(--au-breadcrumbs-link-padding-vertical, 0.75rem) var(--au-breadcrumbs-link-padding-horizontal, 0.5rem);
                font-size: var(--au-breadcrumbs-text-size, 1rem);
                text-decoration: var(--au-breadcrumbs-text-deco, none);
                color: oklch(var(--au-breadcrumbs-link-color, 42.9% 0.2972777928415759 264.05202063805507));
                -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
                &:hover {
                  opacity: 0.7;
                }
                &:active {
                  opacity: 1;
                }
                &:visited {
                  color: oklch(var(--au-breadcrumbs-link-visited-color, 37.48% 0.167 303.51));
                }
                &:focus-visible {
                  outline: none;
                  box-shadow: inset 0 0 0 var(--au-breadcrumbs-focus-shadow-width, 3px) oklch(var(--au-breadcrumbs-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
                }
                &[aria-current="page"] {
                  color: oklch(var(--au-breadcrumbs-link-currentpage-color, 13.98% 0 0));
                  pointer-events: none;
                }
              }
            }
          }
        }
      </style>
      <nav 
        ${e!==null?'id="'+e+'"':""}
        ${t!==null?'class="'+t+'"':""}
        ${a!==null?'aria-label="'+a+'"':""}
      >
        <ol>
          ${o.map((i,n)=>`
                <li>
                  <a href="${i.url||""}" ${n===o.length-1?'aria-current="page"':""}>
                    <slot name="icon-${n+1}"></slot>
                    <span>${i.text}</span>
                  </a>
                  ${n!==o.length-1?'<span aria-hidden="true">'+r+"</span>":""}
                </li>
              `).join("")}
        </ol>
      </nav>
    `}}customElements.define("au-breadcrumbs",g);class k extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot.innerHTML=`
      <div class="au-card-container" part="au-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `}}customElements.define("au-card",k);class l extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const e=this.generateId(),t=document.createElement("style");t.textContent=`
      .au-checkbox {
        display: inline-block;
        vertical-align: middle;
        padding: var(--au-checkbox-padding, 0.25rem);
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--au-checkbox-content-gap, 0.5rem);
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          width: var(--au-checkbox-input-width, 1.5rem);
          height: var(--au-checkbox-input-height, 1.5rem);
          border: var(--au-checkbox-input-border-width, 1px) var(--au-checkbox-input-border-style, solid) oklch(var(--au-checkbox-input-border-color, 78.94% 0 0));
          border-radius: var(--au-checkbox-input-border-radius, 0.25rem);
          background-color: oklch(var(--au-checkbox-input-bg, 99.4% 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: oklch(var(--au-checkbox-input-checked-bg, 13.98% 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--au-checkbox-input-checked-symbol, '✔︎');
              color: oklch(var(--au-checkbox-input-checked-text-color, 99.4% 0 0));
              font-size: var(--au-checkbox-input-checked-text-size, 1.125rem);
            }
          }
        }
        .text {
          flex: 1;
          color: oklch(var(--au-checkbox-label-text-color, 13.98% 0 0));
          font-size: var(--au-checkbox-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-checkbox-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: oklch(var(--au-checkbox-label-active-text-color, 53.7% 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-checkbox-input-focus-shadow-width, 3px) oklch(var(--au-checkbox-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="checkbox"]:disabled) {
          cursor: not-allowed;
          input[type="checkbox"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: oklch(var(--au-checkbox-label-disabled-text-color, 53.7% 0 0));
          }
        }
      }
    `;const a=document.createElement("div");a.setAttribute("class","au-checkbox");const o=document.createElement("label");o.setAttribute("for",e);const r=document.createElement("input");r.type="checkbox",r.id=e,r.name=this.getAttribute("name")||"default-checkbox",r.value=this.getAttribute("value")||"default";const i=document.createElement("div");i.setAttribute("class","text");const n=document.createElement("slot");i.appendChild(n),o.append(r,i),a.appendChild(o),this.shadowRoot.append(t,a),r.addEventListener("change",s=>{this.checked=s.target.checked,this.dispatchEvent(new CustomEvent("change",{detail:s.target.checked})),this.updateFormValue()}),r.addEventListener("focus",()=>{this.dispatchEvent(new CustomEvent("focus"))}),r.addEventListener("blur",()=>{this.dispatchEvent(new CustomEvent("blur"))})}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-checkbox-${e[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","required"]}attributeChangedCallback(e,t,a){const o=this.shadowRoot.querySelector("input");if(o)switch(e){case"checked":o.checked=a!==null;break;case"disabled":o.disabled=a!==null;break;case"name":o.name=a;break;case"value":o.value=a;break;case"required":o.required=a!==null;break}}connectedCallback(){this.updateCheckedState(),this.updateFormValue()}updateCheckedState(){const e=this.shadowRoot.querySelector("input");e&&(e.checked=this.hasAttribute("checked"))}updateFormValue(){const e=this.shadowRoot.querySelector("input"),t=e.checked?this.getAttribute("value")||"on":null;this.internals.setFormValue(t),e.validity.valid?this.internals.setValidity({}):this.internals.setValidity(e.validity,e.validationMessage,e)}formDisabledCallback(e){const t=this.shadowRoot.querySelector("input");t&&(t.disabled=e)}formResetCallback(){const e=this.shadowRoot.querySelector("input");e&&(e.checked=!1,this.checked=!1,this.updateFormValue())}}d(l,"formAssociated",!0);customElements.define("au-checkbox",l);class w extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=this.generateId(),t=document.createElement("style");t.textContent=`
      .au-switch {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--au-switch-gap, 1rem);
        cursor: pointer;
        padding-top: var(--au-switch-padding-top, 0.5rem);
        padding-right: var(--au-switch-padding-right, 0.25rem);
        padding-bottom: var(--au-switch-padding-bottom, 0.5rem);
        padding-left: var(--au-switch-padding-left, 0.25rem);
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--au-switch-container-gap, 0.5rem);
      }
      .input {
        position: relative;
      }
      input[type="checkbox"] {
        appearance: none;
        cursor: pointer;
        margin: 0;
        display: block;
        width: var(--au-switch-input-width, 4rem);
        height: calc(var(--au-switch-input-width, 4rem) / 2);
        border: var(--au-switch-input-border-width, 1px) var(--au-switch-input-border-style, solid) oklch(var(--au-switch-input-border-color, 78.94% 0 0));
        border-radius: var(--au-switch-input-border-radius, calc(var(--au-switch-input-width, 4rem) / 4));
        transition: background-color 360ms ease-in;
      }
      input[type="checkbox"]:focus-visible {
        outline: none;
      }
      .input:before {
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
      .input:has(input[type="checkbox"]:checked) input[type="checkbox"] {
        background-color: oklch(var(--au-switch-input-checked-bg, 13.98% 0 0));
      }
      .input:has(input[type="checkbox"]:checked):before {
        background-color: oklch(var(--au-switch-inner-checked-bg, 99.4% 0 0));
        left: calc(100% - (var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem)) - var(--au-switch-inner-distance, 0.25rem));
      }
      .au-switch:hover,
      .au-switch:has(input:focus-visible) {
        box-shadow: inset 0 0 0 var(--au-switch-focus-shadow-width, 3px) oklch(var(--au-switch-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
      }
    `;const a=document.createElement("label");a.classList.add("au-switch"),a.setAttribute("for",e);const o=document.createElement("div");o.classList.add("container");const r=document.createElement("span");r.classList.add("off-text"),r.setAttribute("aria-hidden","true");const i=document.createElement("div");i.classList.add("input");const n=document.createElement("input");n.id=e,n.type="checkbox",n.setAttribute("role","switch"),i.appendChild(n);const s=document.createElement("span");s.classList.add("on-text"),s.setAttribute("aria-hidden","true"),o.append(r,i,s),a.append(o),this.shadowRoot.append(t,a);const u=document.createElement("slot");a.prepend(u),n.addEventListener("change",h=>{h.target===n&&this.dispatchEvent(new CustomEvent("change",{detail:n.checked}))})}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-switch-${e[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","off","on"]}attributeChangedCallback(e,t,a){const o=this.shadowRoot.querySelector("input"),r=this.shadowRoot.querySelector(".off-text"),i=this.shadowRoot.querySelector(".on-text");if(!(!o||!r||!i))switch(e){case"checked":o.checked=a!==null;break;case"disabled":o.disabled=a!==null;break;case"off":r.textContent=a||"Off";break;case"on":i.textContent=a||"On";break;default:o.setAttribute(e,a);break}}connectedCallback(){const e=this.shadowRoot.querySelector(".off-text"),t=this.shadowRoot.querySelector(".on-text");this.hasAttribute("off")?e.textContent=this.getAttribute("off"):e.textContent="",this.hasAttribute("on")?t.textContent=this.getAttribute("on"):t.textContent=""}}customElements.define("au-switch",w);
