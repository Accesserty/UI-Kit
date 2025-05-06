var x=Object.defineProperty;var w=(c,t,a)=>t in c?x(c,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):c[t]=a;var g=(c,t,a)=>w(c,typeof t!="symbol"?t+"":t,a);class y extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=document.createElement("div");t.setAttribute("class","au-accordion");const a=document.createElement("slot");t.appendChild(a),this.shadowRoot.appendChild(t)}}customElements.define("au-accordion",y);class A extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=this.generateId(),a=this.generateId(),e=document.createElement("div");e.setAttribute("class","au-accordion-item"),e.innerHTML=`
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
        <button aria-expanded="false" aria-controls="${t}" part="button">
            <div class="heading" id="${a}"><slot name="heading"></slot></div>
            <div class="info">
              <div>
                <slot name="sub"></slot>
              </div>
              <div class="icon" aria-hidden="true">
                <slot name="icon"></slot>
              </div>
            </div>
        </button>
        <div role="region" id="${t}" aria-labelledby="${a}" aria-hidden="true" part="region">
            <slot name="content"></slot>
        </div>
      `,this.shadowRoot.append(e),this.button=this.shadowRoot.querySelector("button"),this.button.addEventListener("click",()=>this.toggleAccordion())}connectedCallback(){this.updateExpanded()}static get observedAttributes(){return["open"]}attributeChangedCallback(t,a,e){t==="open"&&this.updateExpanded()}updateExpanded(){const t=this.hasAttribute("open");this.button.setAttribute("aria-expanded",t),this.shadowRoot.querySelector('div[role="region"]').setAttribute("aria-hidden",!t)}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-accordion-item-${t[0].toString(36)}`}toggleAccordion(){const t=this.button.getAttribute("aria-expanded")==="true";this.button.setAttribute("aria-expanded",!t),this.shadowRoot.querySelector('div[role="region"]').setAttribute("aria-hidden",t),t?this.removeAttribute("open"):this.setAttribute("open","")}}customElements.define("au-accordion-item",A);class E extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.attachInitialAttributes(),this.render()}attachInitialAttributes(){Array.from(this.attributes).forEach(t=>{t.name!=="style"&&!["class","label","items","separator"].includes(t.name)&&this.shadowRoot.host.setAttribute(t.name,t.value)})}static get observedAttributes(){return["id","class","aria-label","items","separator"]}attributeChangedCallback(t,a,e){a!==e&&this.render()}get items(){try{return JSON.parse(this.getAttribute("items")||"[]")}catch(t){return console.error("Error parsing 'items':",t),[]}}set items(t){try{JSON.parse(t),this.setAttribute("items",t),this.render()}catch{console.error("Invalid JSON provided for 'items':",t)}}render(){const t=this.getAttribute("id"),a=this.getAttribute("class"),e=this.getAttribute("aria-label"),i=this.items,r=this.getAttribute("separator")||"/";this.shadowRoot.innerHTML=`
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
        ${t!==null?'id="'+t+'"':""}
        ${a!==null?'class="'+a+'"':""}
        ${e!==null?'aria-label="'+e+'"':""}
      >
        <ol>
          ${i.map((o,s)=>`
                <li>
                  <a href="${o.url||""}" ${s===i.length-1?'aria-current="page"':""}>
                    <slot name="icon-${s+1}"></slot>
                    <span>${o.text}</span>
                  </a>
                  ${s!==i.length-1?'<span aria-hidden="true">'+r+"</span>":""}
                </li>
              `).join("")}
        </ol>
      </nav>
    `}}customElements.define("au-breadcrumbs",E);class C extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot.innerHTML=`
      <div class="au-card-container" part="au-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `}}customElements.define("au-card",C);class f extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const t=this.generateId(),a=document.createElement("style");a.textContent=`
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
    `;const e=document.createElement("div");e.setAttribute("class","au-checkbox");const i=document.createElement("label");i.setAttribute("for",t);const r=document.createElement("input");r.type="checkbox",r.id=t,r.name=this.getAttribute("name")||"default-checkbox",r.value=this.getAttribute("value")||"default";const o=document.createElement("div");o.setAttribute("class","text");const s=document.createElement("slot");o.appendChild(s),i.append(r,o),e.appendChild(i),this.shadowRoot.append(a,e),r.addEventListener("change",n=>{this.checked=n.target.checked,this.dispatchEvent(new CustomEvent("change",{detail:n.target.checked})),this.updateFormValue()}),r.addEventListener("focus",()=>{this.dispatchEvent(new CustomEvent("focus"))}),r.addEventListener("blur",()=>{this.dispatchEvent(new CustomEvent("blur"))})}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-checkbox-${t[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","required"]}attributeChangedCallback(t,a,e){const i=this.shadowRoot.querySelector("input");if(i)switch(t){case"checked":i.checked=e!==null;break;case"disabled":i.disabled=e!==null;break;case"name":i.name=e;break;case"value":i.value=e;break;case"required":i.required=e!==null;break}}connectedCallback(){this.updateCheckedState(),this.updateFormValue()}updateCheckedState(){const t=this.shadowRoot.querySelector("input");t&&(t.checked=this.hasAttribute("checked"))}updateFormValue(){const t=this.shadowRoot.querySelector("input"),a=t.checked?this.getAttribute("value")||"on":null;this.internals.setFormValue(a),t.validity.valid?this.internals.setValidity({}):this.internals.setValidity(t.validity,t.validationMessage,t)}formDisabledCallback(t){const a=this.shadowRoot.querySelector("input");a&&(a.disabled=t)}formResetCallback(){const t=this.shadowRoot.querySelector("input");t&&(t.checked=!1,this.checked=!1,this.updateFormValue())}}g(f,"formAssociated",!0);customElements.define("au-checkbox",f);class k extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId();const t=document.createElement("style");t.textContent=`
      .input-wrapper {
        display: flex;
        align-items: center;
        label {
          word-break: break-word;
        }
        :is(label, input) {
          margin: 0;
          padding: var(--au-input-padding-vertical, 0.75rem) var(--au-input-padding-horizontal, 1rem);
          color: oklch(var(--au-input-text-color, 13.98% 0 0));
          font-size: var(--au-input-text-size, 1rem);
          font-family: var(--au-input-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        }
        input {
          -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
          border: 0;
          border-radius: var(--au-input-border-radius, 0.25rem);
          outline: none;
          background-color: var(--au-input-bg, 99.4% 0 0);
          line-height: var(--au-input-text-line-height, 1.5);

          &:user-invalid {
            box-shadow: inset 0 0 0 var(--au-input-invalid-shadow-width, 3px) oklch(var(--au-input-invalid-shadow-color, 57.22% 0.233 29.08));
          }

          &:focus-visible {
            box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) oklch(var(--au-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
          }
        }
        .input-container {
          display: flex;
          align-items: center;
          border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) oklch(var(--au-input-border-color, 78.94% 0 0));
          border-radius: var(--au-input-border-radius, 0.25rem);
          &:has(.prefix:not([hidden])) {
            padding-left: var(--au-input-padding-horizontal, 1rem);
          }
        }
        .clear-input {
          display: grid;
          place-content: center;

          /* behavior */
          cursor: pointer;
          background-color: oklch(var(--au-input-clear-bg, 99.4% 0 0));
          
          width: 2rem;
          height: 2rem;
          
          /* border */
          border: 0;
          border-radius: 0.25rem;

          &:focus-visible {
            outline: none;
            box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) oklch(var(--au-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
          }

          &:hover {
            background-color: oklch(var(--au-input-clear-hover-bg, 94.66% 0 0));
          }
          
          &:active {
            background-color: oklch(var(--au-input-clear-active-bg, 86.89% 0 0));
          }

          &[hidden] {
            display: none;
          }
        }
        &[au-size="small"] {
          :is(label, input) {
            padding: var(--au-input-small-padding-vertical, 0.25rem) var(--au-input-small-padding-horizontal, 0.5rem);
          }
        }
        &[au-size="large"] {
          :is(label, input)  {
            padding: var(--au-input-large-padding-vertical, 1rem) var(--au-input-large-padding-horizontal, 2rem);
              font-size: var(--au-input-large-text-size, 1.25rem);
          }
        }
        &[au-layout="vertical"] {
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
    `;const a=document.createElement("div");a.className="input-wrapper",this.wrapper=a,this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const e=document.createElement("div");e.className="input-container",this.prefixSlot=document.createElement("slot"),this.prefixSlot.name="prefix",this.prefixSpan=document.createElement("span"),this.prefixSpan.className="prefix",this.prefixSpan.appendChild(this.prefixSlot),this.prefixSpan.hidden=!0,this.input=document.createElement("input"),this.input.id=this._id,this.syncAttributes(),this.clearButton=document.createElement("button"),this.clearButton.type="button",this.clearButton.className="clear-input",this.clearButton.textContent="✖",this.clearButton.hidden=!0,this.clearButton.addEventListener("click",()=>{this.input.value="",this.value="",this.internals.setFormValue(""),this.dispatchEvent(new Event("input",{bubbles:!0})),this.dispatchEvent(new Event("change",{bubbles:!0})),this._updateClearButton()}),this.affixSlot=document.createElement("slot"),this.affixSlot.name="affix",this.affixSpan=document.createElement("span"),this.affixSpan.className="affix",this.affixSpan.appendChild(this.affixSlot),this.affixSpan.hidden=!0,e.append(this.prefixSpan,this.input,this.clearButton,this.affixSpan),a.append(this.labelEl,e),this.shadowRoot.append(t,a),this.input.addEventListener("input",()=>{this.value=this.input.value,this.dispatchEvent(new Event("input",{bubbles:!0})),this.internals.setFormValue(this.value),this._syncValidity(),this._updateClearButton()}),this.input.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0}))}),this.prefixSlot.addEventListener("slotchange",()=>{this.prefixSpan.hidden=this.prefixSlot.assignedNodes().length===0}),this.affixSlot.addEventListener("slotchange",()=>{this.affixSpan.hidden=this.affixSlot.assignedNodes().length===0})}static get observedAttributes(){return["type","name","value","placeholder","required","disabled","readonly","label","min","max","step","pattern","autocomplete","autofocus","inputmode","maxlength","minlength","au-size","au-layout","au-clear","au-clear-label"]}attributeChangedCallback(t,a,e){t==="label"&&this.labelEl?this.labelEl.textContent=e:(t==="au-size"||t==="au-layout")&&this.wrapper?e===null?this.wrapper.removeAttribute(t):this.wrapper.setAttribute(t,e):t==="au-clear"||t==="au-clear-label"?this._updateClearButton():this.input&&(e===null&&typeof this.input[t]=="boolean"?(this.input[t]=!1,this.input.removeAttribute(t)):(this.input.setAttribute(t,e),typeof this.input[t]=="boolean"&&(this.input[t]=!0)),this._syncValidity())}connectedCallback(){this._initialValueSet||(this._initialValue=this.input.value,this._initialValueSet=!0),this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton()}formResetCallback(){this.input.value=this._initialValue||"",this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton()}get value(){var t;return(t=this.input)==null?void 0:t.value}set value(t){this.input&&(this.input.value=t,this.setAttribute("value",t),this.internals.setFormValue(t),this._syncValidity(),this._updateClearButton())}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-input-${t[0].toString(36)}`}syncAttributes(){Array.from(this.attributes).forEach(t=>{["au-size","au-layout","au-clear","au-clear-label"].includes(t.name)||(this.input.setAttribute(t.name,t.value),t.name==="value"&&(this.input.defaultValue=t.value))})}_syncValidity(){this.input&&(this.input.validity.valid?this.internals.setValidity({}):this.internals.setValidity(this.input.validity,this.input.validationMessage,this.input))}_updateClearButton(){const t=this.hasAttribute("au-clear"),a=this.input.value.length>0,e=this.getAttribute("au-clear-label")||"Clear input";this.clearButton.setAttribute("aria-label",e),this.clearButton.hidden=!(t&&a)}}g(k,"formAssociated",!0);customElements.define("au-input",k);class S extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=`
      .au-radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.5rem;
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
        gap: var(--au-radio-content-gap, 0.5rem);
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        padding: 0.25rem;
        input[type="radio"] {
          appearance: none;
          margin: 0;
          cursor: pointer;
          width: var(--au-radio-input-width, 1.5rem);
          height: var(--au-radio-input-height, 1.5rem);
          border: var(--au-radio-input-border-width, 1px) var(--au-radio-input-border-style, solid) oklch(var(--au-radio-input-border-color, 78.94% 0 0));
          border-radius: 50%;
          background-color: oklch(var(--au-radio-input-bg, 99.4% 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: oklch(var(--au-radio-input-checked-bg, 13.98% 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: '';
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background-color: oklch(var(--au-radio-input-checked-circle-color, 99.4% 0 0));
            }
          }
        }
        .text {
          flex: 1;
          color: oklch(var(--au-radio-label-text-color, 13.98% 0 0));
          font-size: var(--au-radio-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-radio-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: oklch(var(--au-radio-label-active-text-color, 53.7% 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-radio-input-focus-shadow-width, 3px) oklch(var(--au-radio-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="radio"]:disabled) {
          cursor: not-allowed;
          input[type="radio"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: oklch(var(--au-radio-label-disabled-text-color, 53.7% 0 0));
          }
        }
      }
    `;const a=document.createElement("div");a.setAttribute("class","au-radio-group"),a.setAttribute("role","radiogroup"),this.groupName="radio-group-name-"+this.generateId(),this.shadowRoot.append(t,a)}connectedCallback(){this.renderRadios();const t=this.getAttribute("aria-label");t&&this.shadowRoot.querySelector(".au-radio-group").setAttribute("aria-label",t),this.getAttribute("direction")==="vertical"&&this.shadowRoot.querySelector(".au-radio-group").classList.add("au-radio-group--vertical")}renderRadios(){const t=this.shadowRoot.querySelector(".au-radio-group");t.innerHTML="";const a=Array.from(this.children),e=this.hasAttribute("disabled");a.forEach((i,r)=>{const o=document.createElement("label"),s="radio-"+this.generateId();o.setAttribute("for",s);const n=document.createElement("input");n.type="radio",n.id=s,n.name=this.groupName,n.value=i.getAttribute("value")||`radio-${r+1}`,i.hasAttribute("checked")&&(n.checked=!0),(e||i.hasAttribute("disabled"))&&(n.disabled=!0);const h=document.createElement("div");h.setAttribute("class","text"),h.textContent=i.textContent.trim(),o.append(n,h),t.appendChild(o),n.addEventListener("change",p=>this.handleChange(p,n)),n.addEventListener("keydown",p=>this.handleKeyDown(p,r))})}handleChange(t,a){a.checked&&this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`).forEach(i=>{i!==a&&(i.checked=!1)})}handleKeyDown(t,a){const e=Array.from(this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`));let i;switch(t.key){case"ArrowRight":case"ArrowDown":for(t.preventDefault(),i=(a+1)%e.length;e[i].disabled;)i=(i+1)%e.length;e[i].focus(),e[i].click();break;case"ArrowLeft":case"ArrowUp":for(t.preventDefault(),i=(a-1+e.length)%e.length;e[i].disabled;)i=(i-1+e.length)%e.length;e[i].focus(),e[i].click();break}}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`${t[0].toString(36)}`}}customElements.define("au-radio-group",S);class L extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=this.generateId(),a=document.createElement("style");a.textContent=`
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
    `;const e=document.createElement("label");e.classList.add("au-switch"),e.setAttribute("for",t);const i=document.createElement("div");i.classList.add("container");const r=document.createElement("span");r.classList.add("off-text"),r.setAttribute("aria-hidden","true");const o=document.createElement("div");o.classList.add("input");const s=document.createElement("input");s.id=t,s.type="checkbox",s.setAttribute("role","switch"),o.appendChild(s);const n=document.createElement("span");n.classList.add("on-text"),n.setAttribute("aria-hidden","true"),i.append(r,o,n),e.append(i),this.shadowRoot.append(a,e);const h=document.createElement("slot");e.prepend(h),s.addEventListener("change",p=>{p.target===s&&this.dispatchEvent(new CustomEvent("change",{detail:s.checked}))})}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-switch-${t[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","off","on"]}attributeChangedCallback(t,a,e){const i=this.shadowRoot.querySelector("input"),r=this.shadowRoot.querySelector(".off-text"),o=this.shadowRoot.querySelector(".on-text");if(!(!i||!r||!o))switch(t){case"checked":i.checked=e!==null;break;case"disabled":i.disabled=e!==null;break;case"off":r.textContent=e||"Off";break;case"on":o.textContent=e||"On";break;default:i.setAttribute(t,e);break}}connectedCallback(){const t=this.shadowRoot.querySelector(".off-text"),a=this.shadowRoot.querySelector(".on-text");this.hasAttribute("off")?t.textContent=this.getAttribute("off"):t.textContent="",this.hasAttribute("on")?a.textContent=this.getAttribute("on"):a.textContent=""}}customElements.define("au-switch",L);class _ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._tabs=[],this._panels=[],this._selectedIndex=0,this.container=document.createElement("div"),this.container.classList.add("au-tabs");const t=document.createElement("style");t.textContent=`
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
            border-right: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) oklch(var(--au-tabs-border-color, 78.94% 0 0));
            border-top-right-radius: var(--au-tabs-border-radius, 0);
          }
        }
      }

      button[role="tab"] {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);

        /* spacing */
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.25rem;
        padding: var(--au-tabs-padding-vertical, 0.75rem) var(--au-tabs-padding-horizontal, 1rem);

        /* border */
        border-top: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) oklch(var(--au-tabs-border-color, 78.94% 0 0));
        border-left: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) oklch(var(--au-tabs-border-color, 78.94% 0 0));
        border-right: 0;
        border-bottom: 0;

        /* text */
        color: oklch(var(--au-tabs-text-color, 13.98% 0 0));
        font-size: var(--au-tabs-text-size, 1rem);
        font-family: var(--au-tabs-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-tabs-text-line-height, 1.5);

        /* background */
        background-color: oklch(var(--au-tabs-bg, 97.31% 0 0));
        transition: background-color 120ms ease-in;

        &:hover {
          background-color: oklch(var(--au-tabs-hover-bg, 94.66% 0 0));
        }
        
        &:active {
          background-color: oklch(var(--au-tabs-active-bg, 86.89% 0 0));
        }

        &[aria-selected="true"] {
          paint-order: stroke fill;
          -webkit-text-stroke: var(--au-tabs-selected-text-stroke-width, 0.5px) oklch(var(--au-tabs-selected-text-stroke-color, 99.4% 0 0));
          box-shadow: inset 0 0 0 var(--au-tabs-selected-shadow-width, 1px) oklch(var(--au-tabs-selected-shadow-color, 78.94% 0 0));
          background-color: oklch(var(--au-tabs-selected-bg, 13.98% 0 0));
          color: oklch(var(--au-tabs-selected-text-color, 99.4% 0 0));
        }

        /* focusd */
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) oklch(var(--au-tabs-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
      }

      .au-tabpanels {
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) oklch(var(--au-tabpanels-border-color, 78.94% 0 0));
      }

      .au-tab-panel {
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
      }

      .badge {
        background-color: oklch(var(--au-tab-badge-bg, 86.89% 0 0));
        color: oklch(var(--au-tab-badge-text-color, 13.98% 0 0));
        padding: var(--au-tab-badge-padding-vertical, 0) var(--au-tab-badge-padding-horizontal, 0.5rem);
        border-radius: var(--au-tab-badge-border-radius, 0.75rem);
      }
    `,this.tabsList=document.createElement("ul"),this.tabsList.setAttribute("role","tablist"),this.tabsList.classList.add("au-tablist"),this.panelsContainer=document.createElement("div"),this.panelsContainer.classList.add("au-tabpanels"),this.container.append(t,this.tabsList,this.panelsContainer),this.shadowRoot.appendChild(this.container)}connectedCallback(){this._renderTabs(),this._attachEvents()}_renderTabs(){const t=Array.from(this.querySelectorAll("au-tab-panel"));this._tabs=[],this._panels=[],this.tabsList.innerHTML="",this.panelsContainer.innerHTML="",t.forEach((a,e)=>{const i=a.getAttribute("label")||`Tab ${e+1}`,r=a.getAttribute("prefix")||"",o=a.getAttribute("badge")||"",s=a.getAttribute("affix")||"",n=a.id||this.generateId(),h=`tab-${e+1}-${n}`,p=`tab-panel-${e+1}-${n}`,m=document.createElement("li");m.setAttribute("role","presentation"),m.className="au-tablist-item"+(e===0?" au-tablist-item--selected":"");const d=document.createElement("button");d.setAttribute("role","tab"),d.setAttribute("id",h),d.setAttribute("aria-controls",p),d.setAttribute("aria-posinset",e+1),d.setAttribute("aria-setsize",t.length),d.setAttribute("tabindex",e===0?"0":"-1"),d.setAttribute("aria-selected",e===0?"true":"false");const b=document.createDocumentFragment();if(r){const l=document.createElement("span");l.className="prefix",l.textContent=r,b.appendChild(l)}const v=document.createElement("span");if(v.className="label",v.textContent=i,b.appendChild(v),o!=null&&o!==""){const l=document.createElement("span");l.className="badge",l.setAttribute("aria-label",`補充資訊：${o}`),l.textContent=o,b.appendChild(l)}if(s){const l=document.createElement("span");l.className="affix",l.textContent=s,b.appendChild(l)}d.appendChild(b),m.appendChild(d),this.tabsList.appendChild(m);const u=document.createElement("div");for(u.setAttribute("id",p),u.setAttribute("role","tabpanel"),u.setAttribute("aria-labelledby",h),u.setAttribute("tabindex","0"),u.className="au-tab-panel"+(e===0?" au-tab-panel--selected":""),e!==0&&(u.hidden=!0);a.firstChild;)u.appendChild(a.firstChild);this._tabs.push(d),this._panels.push(u),this.panelsContainer.appendChild(u)})}_attachEvents(){this._tabs.forEach((t,a)=>{t.addEventListener("click",()=>this._selectTab(a)),t.addEventListener("keydown",e=>this._onKeydown(e,a))})}_selectTab(t){this._tabs.forEach((a,e)=>{const i=e===t;a.setAttribute("aria-selected",i),a.setAttribute("tabindex",i?"0":"-1"),a.parentElement.classList.toggle("au-tablist-item--selected",i),this._panels[e].hidden=!i,this._panels[e].setAttribute("aria-hidden",!i),this._panels[e].classList.toggle("au-tab-panel--selected",i)}),this._tabs[t].focus(),this._selectedIndex=t}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`${t[0].toString(36)}`}_onKeydown(t,a){const e=this._tabs.length-1;let i=a;switch(t.key){case"ArrowRight":case"ArrowDown":i=a===e?0:a+1;break;case"ArrowLeft":case"ArrowUp":i=a===0?e:a-1;break;case"Home":i=0;break;case"End":i=e;break;case"Tab":t.preventDefault(),this._panels[a].focus();return}i!==a&&(t.preventDefault(),this._selectTab(i))}}customElements.define("au-tabs",_);class R extends HTMLElement{}customElements.define("au-tab-panel",R);
