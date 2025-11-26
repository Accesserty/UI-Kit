var z=Object.defineProperty;var L=(g,t,e)=>t in g?z(g,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):g[t]=e;var k=(g,t,e)=>L(g,typeof t!="symbol"?t+"":t,e);class _ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=document.createElement("div");t.setAttribute("class","au-accordion");const e=document.createElement("slot");t.appendChild(e),this.shadowRoot.appendChild(t)}}customElements.define("au-accordion",_);class R extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=this.generateId(),e=this.generateId(),a=document.createElement("div");a.setAttribute("class","au-accordion-item"),a.innerHTML=`
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
            padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-accordion-heading-text-color, oklch(13.98% 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family, 'Helvetica, Arial, sans-serif, system-ui');
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(78.94% 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: var(--au-accordion-heading-bg, oklch(99.4% 0 0));
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
              background-color: var(--au-accordion-heading-hover-bg, oklch(94.66% 0 0));
              border-color: var(--au-accordion-heading-hover-border-color, oklch(78.94% 0 0));
            }
            
            &:active {
              background-color: var(--au-accordion-heading-active-bg, oklch(86.89% 0 0));
              border-color: var(--au-accordion-heading-active-border-color, oklch(78.94% 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-accordion-heading-focus-shadow-width, 3px) var(--au-accordion-heading-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
            }
          }

          div[role="region"] {
            background-color: var(--au-accordion-content-bg, oklch(97.31% 0 0));
            color: var(--au-accordion-content-text-color, oklch(13.98% 0 0));
            padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);
            overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
            max-height: var(--au-accordion-content-max-height, 300px);
            overflow: auto;
            border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(78.94% 0 0));
            border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(78.94% 0 0));
            border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(78.94% 0 0));
          }
        </style>
        <button type="button" aria-expanded="false" aria-controls="${t}" part="button">
            <div class="heading" id="${e}"><slot name="heading"></slot></div>
            <div class="info">
              <div>
                <slot name="sub"></slot>
              </div>
              <div class="icon" aria-hidden="true">
                <slot name="icon"></slot>
              </div>
            </div>
        </button>
        <div role="region" id="${t}" aria-labelledby="${e}" hidden part="region">
            <slot name="content"></slot>
        </div>
      `,this.shadowRoot.append(a),this.button=this.shadowRoot.querySelector("button"),this.button.addEventListener("click",()=>this.toggleAccordion())}connectedCallback(){this.updateExpanded()}static get observedAttributes(){return["open"]}attributeChangedCallback(t,e,a){t==="open"&&this.updateExpanded()}updateExpanded(){const t=this.hasAttribute("open");this.button.setAttribute("aria-expanded",t);const e=this.shadowRoot.querySelector('div[role="region"]');t?e.removeAttribute("hidden"):e.setAttribute("hidden","")}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-accordion-item-${t[0].toString(36)}`}toggleAccordion(){this.hasAttribute("open")?this.removeAttribute("open"):this.setAttribute("open","")}}customElements.define("au-accordion-item",R);class I extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.attachInitialAttributes(),this.render()}attachInitialAttributes(){Array.from(this.attributes).forEach(t=>{t.name!=="style"&&!["class","label","items","separator"].includes(t.name)&&this.shadowRoot.host.setAttribute(t.name,t.value)})}static get observedAttributes(){return["id","class","aria-label","aria-labelledby","label","items","separator"]}attributeChangedCallback(t,e,a){e!==a&&this.render()}get items(){try{return JSON.parse(this.getAttribute("items")||"[]")}catch(t){return console.error("Error parsing 'items':",t),[]}}set items(t){try{JSON.parse(t),this.setAttribute("items",t),this.render()}catch{console.error("Invalid JSON provided for 'items':",t)}}render(){const t=this.getAttribute("id"),e=this.getAttribute("class"),a=this.getAttribute("aria-label"),i=this.getAttribute("aria-labelledby"),o=this.getAttribute("label"),l=this.items,r=this.getAttribute("separator")||"/",c=this.getAttribute("data-link-title-prefix")||"go to";let u="";a!==null?u=`aria-label="${a}"`:i!==null?u=`aria-labelledby="${i}"`:o!==null&&(u=`aria-label="${o}"`),this.shadowRoot.innerHTML=`
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
                }
              }
              a {
                display: inline-block;
                padding: var(--au-breadcrumbs-link-padding-vertical, 0.375rem) var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
                font-size: var(--au-breadcrumbs-text-size, 1rem);
                text-decoration: var(--au-breadcrumbs-text-deco, none);
                color: var(--au-breadcrumbs-link-color, oklch(42.9% 0.2972777928415759 264.05202063805507));
                -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
                &:hover {
                  opacity: 0.7;
                }
                &:active {
                  opacity: 1;
                }
                &:visited {
                  color: var(--au-breadcrumbs-link-visited-color, oklch(37.48% 0.167 303.51));
                }
                &:focus-visible {
                  outline: none;
                  box-shadow: inset 0 0 0 var(--au-breadcrumbs-focus-shadow-width, 3px) var(--au-breadcrumbs-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
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
        ${t!==null?'id="'+t+'"':""}
        ${e!==null?'class="'+e+'"':""}
        ${u}
      >
        <ol>
          ${l.map((p,b)=>`
                <li>
                  ${b===l.length-1?`<span aria-current="page"><slot name="icon-${b+1}"></slot><span>${p.text}</span></span>`:`<a href="${p.url||""}" title="${c} ${p.text}"><slot name="icon-${b+1}"></slot><span>${p.text}</span></a>`}
                  ${b!==l.length-1?'<span aria-hidden="true">'+r+"</span>":""}
                </li>
              `).join("")}
        </ol>
      </nav>
    `}}customElements.define("au-breadcrumbs",I);class T extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot.innerHTML=`
      <div class="au-card-container" part="au-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `}}customElements.define("au-card",T);class E extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const t=this.generateId(),e=document.createElement("style");e.textContent=`
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
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          width: var(--au-checkbox-input-width, 1.5rem);
          height: var(--au-checkbox-input-height, 1.5rem);
          border: var(--au-checkbox-input-border-width, 1px) var(--au-checkbox-input-border-style, solid) var(--au-checkbox-input-border-color, oklch(78.94% 0 0));
          border-radius: var(--au-checkbox-input-border-radius, 0.25rem);
          background-color: var(--au-checkbox-input-bg, oklch(99.4% 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-checkbox-input-checked-bg, oklch(13.98% 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--au-checkbox-input-checked-symbol, '✔︎');
              color: var(--au-checkbox-input-checked-text-color, oklch(99.4% 0 0));
              font-size: var(--au-checkbox-input-checked-text-size, 1.125rem);
            }
          }
        }
        .text {
          flex: 1;
          color: var(--au-checkbox-label-text-color, oklch(13.98% 0 0));
          font-size: var(--au-checkbox-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-checkbox-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: var(--au-checkbox-label-active-text-color, oklch(53.7% 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-checkbox-input-focus-shadow-width, 3px) var(--au-checkbox-input-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="checkbox"]:disabled) {
          cursor: not-allowed;
          input[type="checkbox"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: var(--au-checkbox-label-disabled-text-color, oklch(53.7% 0 0));
          }
        }
      }
    `;const a=document.createElement("div");a.setAttribute("class","au-checkbox");const i=document.createElement("label");i.setAttribute("for",t);const o=document.createElement("input");o.type="checkbox",o.id=t,o.name=this.getAttribute("name")||"default-checkbox",o.value=this.getAttribute("value")||"default";const l=document.createElement("div");l.setAttribute("class","text");const r=document.createElement("slot");l.appendChild(r),i.append(o,l),a.appendChild(i),this.shadowRoot.append(e,a),o.addEventListener("change",c=>{this.checked=c.target.checked,this.dispatchEvent(new CustomEvent("change",{detail:c.target.checked})),this.updateFormValue()}),o.addEventListener("focus",()=>{this.dispatchEvent(new CustomEvent("focus"))}),o.addEventListener("blur",()=>{this.dispatchEvent(new CustomEvent("blur"))})}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-checkbox-${t[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","required"]}attributeChangedCallback(t,e,a){const i=this.shadowRoot.querySelector("input");if(i)switch(t){case"checked":i.checked=a!==null;break;case"disabled":i.disabled=a!==null;break;case"name":i.name=a;break;case"value":i.value=a;break;case"required":i.required=a!==null;break}}connectedCallback(){this.updateCheckedState(),this.updateFormValue()}updateCheckedState(){const t=this.shadowRoot.querySelector("input");t&&(t.checked=this.hasAttribute("checked"))}updateFormValue(){const t=this.shadowRoot.querySelector("input"),e=t.checked?this.getAttribute("value")||"on":null;this.internals.setFormValue(e),t.validity.valid?this.internals.setValidity({}):this.internals.setValidity(t.validity,t.validationMessage,t)}formDisabledCallback(t){const e=this.shadowRoot.querySelector("input");e&&(e.disabled=t)}formResetCallback(){const t=this.shadowRoot.querySelector("input");t&&(t.checked=!1,this.checked=!1,this.updateFormValue())}}k(E,"formAssociated",!0);customElements.define("au-checkbox",E);class A extends HTMLElement{constructor(){super();k(this,"_preventDefault",e=>e.preventDefault());this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this.files=[],this.previewUrls=new Map;const e=document.createElement("style");e.textContent=`
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
        color: var(--au-file-upload-label-text-color, oklch(13.98% 0 0));
        font-size: var(--au-file-upload-label-text-size, 1rem);
      }
      .upload-area {
        position: relative;
        display: grid;
        place-content: center;
        padding: 4rem;
        border: var(--au-file-upload-area-border-width, 1px) var(--au-file-upload-area-border-style, dashed) var(--au-file-upload-area-border-color, oklch(78.94% 0 0));
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
        color: var(--au-file-upload-error-area-text-color, oklch(44.64% 0 0));
      }
      .error-list {
        margin: 0;
        color: var(--au-file-upload-error-list-text-color, oklch(47.47% 0.193 29.04));
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
            border: var(--au-file-upload-file-list-preview-border-width, 1px) var(--au-file-upload-file-list-preview-border-style, solid) var(--au-file-upload-file-list-preview-border-color, oklch(78.94% 0 0));
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
            -webkit-tap-highlight-color: var(--au-file-upload-delete-tap-highlight-color, oklch(0% 0 0 / 0));
            
            /* spacing */
            padding: var(--au-file-upload-delete-padding-vertical, 0.625rem) var(--au-file-upload-delete-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-file-upload-delete-text-color, oklch(13.98% 0 0));
            font-size: var(--au-file-upload-delete-text-size, 1rem);
            line-height: var(--au-file-upload-delete-text-line-height, 1.5);
            
            /* border */
            border: var(--au-file-upload-delete-border-width, 1px) var(--au-file-upload-delete-border-style, solid) var(--au-file-upload-delete-border-color, oklch(78.94% 0 0));
            border-radius: var(--au-file-upload-delete-border-radius, 0.25rem);
            
            /* others decoration */
            background-color: var(--au-file-upload-delete-bg, oklch(99.4% 0 0));
            transition: background-color 160ms ease-in;
            
            &:hover {
              background-color: var(--au-file-upload-delete-hover-bg, oklch(94.66% 0 0));
              border-color: var(--au-file-upload-delete-hover-border-color, oklch(78.94% 0 0));
            }
            
            &:active {
              background-color: var(--au-file-upload-delete-active-bg, oklch(86.89% 0 0));
              border-color: var(--au-file-upload-delete-active-border-color, oklch(78.94% 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-file-upload-delete-focus-shadow-width, 3px) var(--au-file-upload-delete-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
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
    `,this.wrapper=document.createElement("div"),this.wrapper.className="file-upload-wrapper",this.container=document.createElement("div"),this.container.className="file-upload-container",this._id=this.getAttribute("id")||this.generateId(),this.labelEl=document.createElement("label"),this.labelEl.textContent=this.getAttribute("label")||"Upload files",this.labelEl.setAttribute("for",this._id),this.fileInput=document.createElement("input"),this.fileInput.type="file",this.fileInput.hidden=!0,this.fileInput.id=this._id,["accept","multiple","name","disabled","required","form"].forEach(r=>{this.hasAttribute(r)&&this.fileInput.setAttribute(r,this.getAttribute(r))});const a=document.createElement("slot");a.name="trigger",a.addEventListener("click",()=>{this.hasAttribute("disabled")||this.fileInput.click()}),a.addEventListener("keydown",r=>{if(r.key==="Enter"||r.key===" "||r.key==="Spacebar"){if(r.preventDefault(),this.hasAttribute("disabled"))return;this.fileInput.click()}}),this.dropZone=document.createElement("div"),this.dropZone.className="drop-zone",this.dropZone.textContent=this.getAttribute("msg-drop-text")||"Drop files here",this.usageDisplay=document.createElement("div"),this.usageDisplay.className="usage",this.usageDisplay.setAttribute("aria-live","polite"),this.fileList=document.createElement("ul"),this.fileList.className="file-list",this.fileList.setAttribute("role","list"),this.fileList.setAttribute("aria-live","polite"),this.fileList.setAttribute("aria-atomic","true");const i=document.createElement("slot");i.name="hint",this.errorMessage=document.createElement("div"),this.errorMessage.className="error-area",this.errorList=document.createElement("ul"),this.errorList.className="error-list",this.errorMessage.append(i,this.usageDisplay,this.errorList),this.liveRegion=document.createElement("div"),this.liveRegion.setAttribute("aria-live","polite"),this.liveRegion.setAttribute("role","status"),this.liveRegion.setAttribute("aria-atomic","true"),this.fileInput.addEventListener("change",()=>this.handleFiles(this.fileInput.files)),this.dropZone.addEventListener("dragover",r=>{r.preventDefault(),!this.hasAttribute("disabled")&&this.dropZone.classList.add("dragover")}),this.dropZone.addEventListener("dragleave",()=>{this.hasAttribute("disabled")||this.dropZone.classList.remove("dragover")}),this.dropZone.addEventListener("drop",r=>{if(r.preventDefault(),this.hasAttribute("disabled"))return;this.dropZone.classList.remove("dragover");const c=r.dataTransfer;c!=null&&c.files&&this.handleFiles(c.files)});const o=document.createElement("div");o.className="actions";const l=document.createElement("div");l.className="upload-area",l.append(a,this.dropZone),o.append(l),this.container.append(this.labelEl,o,this.errorMessage,this.fileList,this.liveRegion,this.fileInput),this.wrapper.append(this.container),this.shadowRoot.append(e,this.wrapper)}connectedCallback(){document.addEventListener("dragover",this._preventDefault),document.addEventListener("drop",this._preventDefault)}disconnectedCallback(){document.removeEventListener("dragover",this._preventDefault),document.removeEventListener("drop",this._preventDefault),this.revokeAllPreviewUrls()}revokePreviewUrl(e){const a=this.previewUrls.get(e);a&&(URL.revokeObjectURL(a),this.previewUrls.delete(e))}revokeAllPreviewUrls(){this.previewUrls.forEach(e=>URL.revokeObjectURL(e)),this.previewUrls.clear()}handleFiles(e){if(this.hasAttribute("disabled"))return;const a=parseFloat(this.getAttribute("max-total-size-mb")||"20"),i=this.getAttribute("msg-total-size-error")||"Total file size exceeds limit of",o=this.getAttribute("msg-type-error")||"is not an accepted file type.",l=this.getAttribute("msg-size-error")||"exceeds the maximum size of",r=this.getAttribute("msg-count-error")||"You can only upload up to",c=parseInt(this.getAttribute("max-files")||"5",10),u=parseFloat(this.getAttribute("max-size-mb")||"5"),p=this.getAttribute("accept"),b=p?p.split(",").map(m=>m.trim()):[],s=Array.from(e),n=[],d=[];s.forEach(m=>{if(!(b.length===0||b.some(w=>w.endsWith("/*")?m.type.startsWith(w.replace("/*","")):m.type===w||m.name.endsWith(w)))){d.push(`${m.name} ${o}`);return}if(m.size>u*1024*1024){d.push(`${m.name} ${l} ${u}MB.`);return}n.push(m)});const f=n.filter(m=>!this.files.some(x=>x.name===m.name&&x.size===m.size)),h=c-this.files.length,v=f.slice(0,h);f.slice(h).forEach(m=>{d.push(`${m.name} ${r} ${c} files.`)}),this.files.reduce((m,x)=>m+x.size,0)+v.reduce((m,x)=>m+x.size,0)>a*1024*1024&&(d.push(`${i} ${a}MB.`),v.length=0),d.length>0&&this.showErrors(d),v.length!==0&&(this.files.push(...v),this.updateFileList(),this.updateUsage(),this.announce(`${v.length} file${v.length>1?"s":""} added.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new Event("change",{bubbles:!0})),this.fileInput.value="")}showErrors(e){this.errorList.innerHTML="",e.forEach(a=>{const i=document.createElement("li");i.textContent=a,this.errorList.appendChild(i)}),this.announce(e.join(" "))}announce(e){for(;this.liveRegion.firstChild;)this.liveRegion.removeChild(this.liveRegion.firstChild);requestAnimationFrame(()=>{const a=document.createElement("span");a.textContent=e,this.liveRegion.appendChild(a)})}updateFileList(){this.fileList.innerHTML="",this.files.forEach(e=>{const a=document.createElement("li");a.setAttribute("role","listitem");const i=document.createElement("div");if(e.type.startsWith("image/")){const r=document.createElement("img");r.className="preview";let c=this.previewUrls.get(e);c||(c=URL.createObjectURL(e),this.previewUrls.set(e,c)),r.src=c,r.alt=e.name,r.width=40,r.height=40,i.appendChild(r)}else{const r=document.createElement("span");r.className="preview",r.textContent="📄",r.setAttribute("aria-hidden","true"),i.appendChild(r)}const o=document.createElement("span");o.className="file-name",o.textContent=e.name,i.appendChild(o);const l=document.createElement("button");l.type="button",l.className="delete",l.textContent=this.getAttribute("msg-remove-text")||"Remove",l.setAttribute("aria-label",`Remove ${e.name}`),l.setAttribute("part","delete"),l.addEventListener("click",()=>{this.hasAttribute("disabled")||(this.revokePreviewUrl(e),this.files=this.files.filter(r=>r.name!==e.name||r.size!==e.size),this.updateFileList(),this.updateUsage(),this.announce(`${e.name} removed.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new CustomEvent("remove-file",{detail:e})))}),a.append(i,l),this.fileList.appendChild(a)})}removeFile(e){this.hasAttribute("disabled")||(this.revokePreviewUrl(e),this.files=this.files.filter(a=>a.name!==e.name||a.size!==e.size),this.updateFileList(),this.updateUsage(),this.announce(`${e.name} removed.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new CustomEvent("remove-file",{detail:e})))}updateUsage(){const e=parseFloat(this.getAttribute("max-total-size-mb")||"20"),a=this.files.reduce((i,o)=>i+o.size,0)/(1024*1024);this.usageDisplay.textContent=`${a.toFixed(1)}MB / ${e}MB`}syncFormValue(){const e=new DataTransfer;this.files.forEach(a=>e.items.add(a)),this.internals.setFormValue(e.files)}checkValidity(){return this.hasAttribute("required")&&this.files.length===0?(this.internals.setValidity({valueMissing:!0},this.getAttribute("msg-required")||"Please select at least one file.",this.fileInput),!1):(this.internals.setValidity({}),!0)}formResetCallback(){this.revokeAllPreviewUrls(),this.files=[],this.updateFileList(),this.updateUsage(),this.syncFormValue(),this.checkValidity()}get value(){return this.files}set value(e){Array.isArray(e)&&(this.revokeAllPreviewUrls(),this.files=e,this.updateFileList(),this.updateUsage(),this.syncFormValue(),this.checkValidity())}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-file-upload-${e[0].toString(36)}`}}k(A,"formAssociated",!0);customElements.define("au-file-upload",A);class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId();const t=document.createElement("style");t.textContent=`
    .input-wrapper {
      display: flex;
      align-items: center;
      background-color: var(--au-input-bg, oklch(99.4% 0 0));

      label {
        word-break: break-word;
      }
      label {
        margin: 0;
        padding: var(--au-input-label-padding-vertical, 0.625rem) var(--au-input-label-padding-horizontal, 1rem);
        color: oklch(var(--au-input-label-text-color, 13.98% 0 0));
        font-size: var(--au-inpu-label-text-size, 1rem);
      }
      input {
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        margin: 0;
        padding: var(--au-input-padding-vertical, 0.625rem) var(--au-input-padding-horizontal, 1rem);
        color: var(--au-input-text-color, oklch(13.98% 0 0));
        font-size: var(--au-input-text-size, 1rem);
        border: 0;
        border-radius: var(--au-input-border-radius, 0.25rem);
        outline: none;
        background-color: var(--au-input-bg, oklch(99.4% 0 0));
        line-height: var(--au-input-text-line-height, 1.5);

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-input-invalid-shadow-width, 3px) var(--au-input-invalid-shadow-color, oklch(57.22% 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
        }
      }
      .input-container {
        display: flex;
        align-items: center;
        border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) var(--au-input-border-color, oklch(78.94% 0 0));
        border-radius: var(--au-input-border-radius, 0.25rem);
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
        gap: var(--au-input-container-gap, 0.625rem);
      }
      .clear-input {
        display: grid;
        place-content: center;

        /* behavior */
        cursor: pointer;
        background-color: var(--au-input-clear-bg, oklch(99.4% 0 0));
        color: var(--au-input-clear-text-color, oklch(13.98% 0 0));

        width: 2rem;
        height: 2rem;
        
        /* border */
        border: 0;
        border-radius: var(--au-input-clear-border-radius, 0.25rem);

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
        }

        &:hover {
          background-color: var(--au-input-clear-hover-bg, oklch(94.66% 0 0));
        }
        
        &:active {
          background-color: var(--au-input-clear-active-bg, oklch(86.89% 0 0));
        }

        &[hidden] {
          display: none;
        }
      }
      &[data-size="small"] {
        :is(label, input) {
          padding: var(--au-input-small-padding-vertical, 0.25rem) var(--au-input-small-padding-horizontal, 0.375rem);
        }
      }
      &[data-size="large"] {
        :is(label, input)  {
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
  `;const e=document.createElement("div");e.className="input-wrapper",this.wrapper=e,this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const a=document.createElement("div");a.className="input-container",this.prefixSlot=document.createElement("slot"),this.prefixSlot.name="prefix",this.prefixSpan=document.createElement("span"),this.prefixSpan.className="prefix",this.prefixSpan.appendChild(this.prefixSlot),this.prefixSpan.hidden=!0,this.input=document.createElement("input"),this.input.id=this._id,this.syncAttributes(),this.clearButton=document.createElement("button"),this.clearButton.type="button",this.clearButton.className="clear-input",this.clearButton.textContent="✖",this.clearButton.hidden=!0,this.clearButton.setAttribute("part","clear"),this.clearButton.addEventListener("click",()=>{this.clear()}),this.affixSlot=document.createElement("slot"),this.affixSlot.name="affix",this.affixSpan=document.createElement("span"),this.affixSpan.className="affix",this.affixSpan.appendChild(this.affixSlot),this.affixSpan.hidden=!0,a.append(this.prefixSpan,this.input,this.clearButton,this.affixSpan),e.append(this.labelEl,a),this.shadowRoot.append(t,e),this.input.addEventListener("input",()=>{this.value=this.input.value,this.dispatchEvent(new Event("input",{bubbles:!0})),this.internals.setFormValue(this.value),this._syncValidity(),this._updateClearButton()}),this.input.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0}))}),this.prefixSlot.addEventListener("slotchange",()=>{this.prefixSpan.hidden=this.prefixSlot.assignedNodes().length===0}),this.affixSlot.addEventListener("slotchange",()=>{this.affixSpan.hidden=this.affixSlot.assignedNodes().length===0})}static get observedAttributes(){return["type","name","value","placeholder","required","disabled","readonly","label","min","max","step","pattern","autocomplete","autofocus","inputmode","maxlength","minlength","data-size","data-layout","data-clear","data-clear-label"]}attributeChangedCallback(t,e,a){t==="label"&&this.labelEl?this.labelEl.textContent=a:(t==="data-size"||t==="data-layout")&&this.wrapper?a===null?this.wrapper.removeAttribute(t):this.wrapper.setAttribute(t,a):t==="data-clear"||t==="data-clear-label"?this._updateClearButton():this.input&&(a===null&&typeof this.input[t]=="boolean"?(this.input[t]=!1,this.input.removeAttribute(t)):(this.input.setAttribute(t,a),typeof this.input[t]=="boolean"&&(this.input[t]=!0)),this._syncValidity())}connectedCallback(){this._initialValueSet||(this._initialValue=this.input.value,this._initialValueSet=!0),this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton()}formResetCallback(){this.input.value=this._initialValue||"",this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton()}get value(){var t;return(t=this.input)==null?void 0:t.value}set value(t){this.input&&(this.input.value=t,this.setAttribute("value",t),this.internals.setFormValue(t),this._syncValidity(),this._updateClearButton())}clear(){this.input.value="",this.value="",this.internals.setFormValue(""),this.dispatchEvent(new Event("input",{bubbles:!0})),this.dispatchEvent(new Event("change",{bubbles:!0})),this._updateClearButton()}suggest(t=""){this.input.value=t,this.value=t,this.internals.setFormValue(t),this.dispatchEvent(new Event("input",{bubbles:!0})),this._updateClearButton()}focus(){var t;(t=this.input)==null||t.focus()}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-input-${t[0].toString(36)}`}syncAttributes(){Array.from(this.attributes).forEach(t=>{["data-size","data-layout","data-clear","data-clear-label"].includes(t.name)||(this.input.setAttribute(t.name,t.value),t.name==="value"&&(this.input.defaultValue=t.value))})}_syncValidity(){this.input&&(this.input.validity.valid?this.internals.setValidity({}):this.internals.setValidity(this.input.validity,this.input.validationMessage,this.input))}_updateClearButton(){const t=this.hasAttribute("data-clear"),e=this.input.value.length>0,a=this.getAttribute("data-clear-label")||"Clear input";this.clearButton.setAttribute("aria-label",a),this.clearButton.hidden=!(t&&e)}}k(C,"formAssociated",!0);customElements.define("au-input",C);class y extends HTMLElement{static get observedAttributes(){return["data-total","data-current-page","data-pager-count","data-page-size","data-page-size-options","data-layout","data-text-total-pages-prefix","data-text-page","data-text-total-items-suffix","data-text-per","data-text-first","data-text-prev","data-text-next","data-text-last","data-text-go","data-text-goto"]}static generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-pagination-${t[0].toString(36)}`}constructor(){super(),this.attachShadow({mode:"open"}),this._selectId=y.generateId(),this._jumpId=y.generateId(),this.liveRegion=document.createElement("div"),this.liveRegion.setAttribute("aria-live","polite"),this.liveRegion.setAttribute("role","status"),this.liveRegion.setAttribute("aria-atomic","true"),this._parseAttributes(),this._render()}attributeChangedCallback(){this._parseAttributes(),this._requestRender()}_requestRender(){this._updatePending||(this._updatePending=!0,requestAnimationFrame(()=>{this._render(),this._updatePending=!1}))}_parseAttributes(){this.total=parseInt(this.getAttribute("data-total"))||0,this.currentPage=parseInt(this.getAttribute("data-current-page"))||1,this.pagerCount=parseInt(this.getAttribute("data-pager-count"))||5,this.pageSize=parseInt(this.getAttribute("data-page-size"))||10;const t=this.getAttribute("data-page-size-options");if(t)try{this.pageSizeOptions=JSON.parse(t)}catch{this.pageSizeOptions=t.split(",").map(a=>parseInt(a.trim()))}else this.pageSizeOptions=[10,30,50,100];const e=this.getAttribute("data-layout");if(e)try{this.layout=JSON.parse(e)}catch{this.layout=e.replace(/[[\]' ]/g,"").split(",")}else this.layout=["total_page","total_items","page_size","first","prev","pages","next","last","jump"];this.texts={totalPagesPrefix:this.getAttribute("data-text-total-pages-prefix")||"Total",pageSuffix:this.getAttribute("data-text-page")||"page(s)",totalItemsSuffix:this.getAttribute("data-text-total-items-suffix")||"item(s)",perText:this.getAttribute("data-text-per")||"each page",firstText:this.getAttribute("data-text-first")||"First",prevText:this.getAttribute("data-text-prev")||"Prev",nextText:this.getAttribute("data-text-next")||"Next",lastText:this.getAttribute("data-text-last")||"Last",goText:this.getAttribute("data-text-go")||"go to",gotoText:this.getAttribute("data-text-goto")||"go to"}}get totalPages(){return Math.ceil(this.total/this.pageSize)||1}get pagers(){const e=Math.floor((this.currentPage-1)/this.pagerCount)*this.pagerCount+1,a=Math.min(e+this.pagerCount-1,this.totalPages),i=[];for(let o=e;o<=a;o++)i.push(o);return i}_render(){const t=this.texts,e=this.layout,a=this.totalPages,i=this.total;this.shadowRoot.innerHTML="";const o=document.createElement("style");o.textContent=`
      :is(ul, ol) {
        list-style: none;
        margin: 0;
        padding: 0;
      } 
      :is(button, select, input) {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        
        /* spacing */
        padding: var(--au-btn-padding-vertical, 0.625rem) var(--au-btn-padding-horizontal, 1rem);
        
        /* text */
        color: var(--au-btn-text-color, oklch(13.98% 0 0));
        font-size: var(--au-btn-text-size, 1rem);
        font-family: var(--au-btn-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-btn-text-line-height, 1.5);
        
        /* border */
        border: var(--au-btn-border-width, 1px) var(--au-btn-border-style, solid) var(--au-btn-border-color, oklch(78.94% 0 0));
        border-radius: var(--au-btn-border-radius, 0.25rem);
        
        /* others decoration */
        background-color: var(--au-btn-bg, oklch(99.4% 0 0));
        transition: background-color 160ms ease-in;
        
        &:disabled {
          cursor: not-allowed;
          pointer-events: none;
          opacity: 0.4;
        }
        
        &:hover {
          background-color: var(--au-btn-hover-bg, oklch(94.66% 0 0));
          border-color: var(--au-btn-hover-border-color, oklch(78.94% 0 0));
        }
        
        &:active {
          background-color: var(--au-btn-active-bg, oklch(86.89% 0 0));
          border-color: var(--au-btn-active-border-color, oklch(78.94% 0 0));
        }
        
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-btn-focus-shadow-width, 3px) var(--au-btn-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
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
    `,this.shadowRoot.appendChild(o);const l=document.createElement("div");l.className="au-pagination";const r=document.createElement("div");r.className="au-pagination-container";const c=document.createElement("div");if(c.className="au-pagination-group",e.includes("total_page")){const s=document.createElement("span");s.textContent=`${t.totalPagesPrefix}${a}${t.pageSuffix}`,c.appendChild(s)}if(e.includes("total_items")){const s=document.createElement("span");s.textContent=`${i}${t.totalItemsSuffix}`,c.appendChild(s)}if(e.includes("page_size")){const s=document.createElement("span");s.className="visually-hidden",s.textContent="Page size",c.appendChild(s);const n=document.createElement("label");n.setAttribute("for",this._selectId),n.textContent=t.perText,c.appendChild(n);const d=document.createElement("select");d.id=this._selectId,this.pageSizeOptions.forEach(h=>{const v=document.createElement("option");v.value=h,v.textContent=h,h===this.pageSize&&(v.selected=!0),d.appendChild(v)}),d.addEventListener("change",h=>{this.pageSize=+h.target.value,this.setAttribute("data-page-size",this.pageSize),this.dispatchEvent(new CustomEvent("page-size-change",{detail:this.pageSize,bubbles:!0,composed:!0})),this.currentPage=1,this.setAttribute("data-current-page","1")}),c.appendChild(d);const f=document.createElement("span");f.textContent=t.totalItemsSuffix,c.appendChild(f)}r.appendChild(c);const u=document.createElement("div");u.className="au-pagination-group";const p=document.createElement("ul");if(p.className="pagination-buttons",e.includes("first")){const s=document.createElement("li"),n=document.createElement("button");n.textContent=t.firstText,n.disabled=this.currentPage===1,n.addEventListener("click",()=>this._goto(1)),s.appendChild(n),p.appendChild(s)}if(e.includes("prev")){const s=document.createElement("li"),n=document.createElement("button");n.textContent=t.prevText,n.disabled=this.currentPage===1,n.addEventListener("click",()=>this._goto(this.currentPage-1)),s.appendChild(n),p.appendChild(s)}if(e.includes("pages")&&this.pagers.forEach(s=>{const n=document.createElement("li"),d=document.createElement("button");d.className="pager",s===this.currentPage?(d.setAttribute("aria-current","page"),d.setAttribute("part","current-page")):(d.removeAttribute("aria-current"),d.removeAttribute("part")),d.textContent=s,d.addEventListener("click",()=>this._goto(s)),n.appendChild(d),p.appendChild(n)}),e.includes("next")){const s=document.createElement("li"),n=document.createElement("button");n.textContent=t.nextText,n.disabled=this.currentPage>=a,n.addEventListener("click",()=>this._goto(this.currentPage+1)),s.appendChild(n),p.appendChild(s)}if(e.includes("last")){const s=document.createElement("li"),n=document.createElement("button");n.textContent=t.lastText,n.disabled=this.currentPage>=a,n.addEventListener("click",()=>this._goto(a)),s.appendChild(n),p.appendChild(s)}const b=document.createElement("nav");if(b.setAttribute("aria-label","pagination"),b.appendChild(p),u.appendChild(b),r.appendChild(u),e.includes("jump")){const s=document.createElement("div");s.className="au-pagination-group";const n=document.createElement("label");n.setAttribute("for",this._jumpId),n.textContent=t.goText,s.appendChild(n);const d=document.createElement("input");d.type="number",d.id=this._jumpId,d.min="1",d.max=String(a),d.value=String(this.currentPage),d.addEventListener("keyup",v=>{v.key==="Enter"&&this._goto(+d.value)}),s.appendChild(d);const f=document.createElement("span");f.textContent=t.pageSuffix,s.appendChild(f);const h=document.createElement("button");h.type="button",h.textContent=t.gotoText,h.addEventListener("click",()=>this._goto(+d.value)),s.appendChild(h),r.appendChild(s)}l.appendChild(r),this.shadowRoot.append(l,this.liveRegion)}_goto(t){t<1&&(t=1),t>this.totalPages&&(t=this.totalPages),t!==this.currentPage&&(this.currentPage=t,this.setAttribute("data-current-page",String(t)),this.dispatchEvent(new CustomEvent("page-change",{detail:t,bubbles:!0,composed:!0})),this.announce(`Page ${t}`))}announce(t){for(;this.liveRegion.firstChild;)this.liveRegion.removeChild(this.liveRegion.firstChild);requestAnimationFrame(()=>{const e=document.createElement("span");e.textContent=t,this.liveRegion.appendChild(e)})}}customElements.define("au-pagination",y);class $ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=`
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
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        padding: 0.25rem;
        input[type="radio"] {
          appearance: none;
          margin: 0;
          cursor: pointer;
          width: var(--au-radio-input-width, 1.5rem);
          height: var(--au-radio-input-height, 1.5rem);
          border: var(--au-radio-input-border-width, 1px) var(--au-radio-input-border-style, solid) var(--au-radio-input-border-color, oklch(78.94% 0 0));
          border-radius: 50%;
          background-color: var(--au-radio-input-bg, oklch(99.4% 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-radio-input-checked-bg, oklch(13.98% 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: '';
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background-color: var(--au-radio-input-checked-circle-color, oklch(99.4% 0 0));
            }
          }
        }
        .text {
          flex: 1;
          color: var(--au-radio-label-text-color, oklch(13.98% 0 0));
          font-size: var(--au-radio-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-radio-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: var(--au-radio-label-active-text-color, oklch(53.7% 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-radio-input-focus-shadow-width, 3px) var(--au-radio-input-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="radio"]:disabled) {
          cursor: not-allowed;
          input[type="radio"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: var(--au-radio-label-disabled-text-color, oklch(53.7% 0 0));
          }
        }
      }
    `;const e=document.createElement("div");e.setAttribute("class","au-radio-group"),e.setAttribute("role","radiogroup"),this.groupName="radio-group-name-"+this.generateId();const a=document.createElement("slot");a.style.display="none",this.shadowRoot.append(t,e,a)}connectedCallback(){this.shadowRoot.querySelector("slot").addEventListener("slotchange",()=>{this.renderRadios()}),this.renderRadios();const e=this.getAttribute("aria-label");e&&this.shadowRoot.querySelector(".au-radio-group").setAttribute("aria-label",e),this.getAttribute("direction")==="vertical"&&this.shadowRoot.querySelector(".au-radio-group").classList.add("au-radio-group--vertical")}renderRadios(){const t=this.shadowRoot.querySelector(".au-radio-group");t.innerHTML="";const a=this.shadowRoot.querySelector("slot").assignedElements(),i=this.hasAttribute("disabled");a.forEach((o,l)=>{const r=document.createElement("label"),c="radio-"+this.generateId();r.setAttribute("for",c);const u=document.createElement("input");u.type="radio",u.id=c,u.name=this.groupName,u.value=o.getAttribute("value")||`radio-${l+1}`,o.hasAttribute("checked")&&(u.checked=!0),(i||o.hasAttribute("disabled"))&&(u.disabled=!0);const p=document.createElement("div");p.setAttribute("class","text"),p.textContent=o.textContent.trim(),r.append(u,p),t.appendChild(r),u.addEventListener("change",b=>this.handleChange(b,u)),u.addEventListener("keydown",b=>this.handleKeyDown(b,l))})}handleChange(t,e){e.checked&&this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`).forEach(i=>{i!==e&&(i.checked=!1)})}handleKeyDown(t,e){const a=Array.from(this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`));let i;switch(t.key){case"ArrowRight":case"ArrowDown":for(t.preventDefault(),i=(e+1)%a.length;a[i].disabled;)i=(i+1)%a.length;a[i].focus(),a[i].click();break;case"ArrowLeft":case"ArrowUp":for(t.preventDefault(),i=(e-1+a.length)%a.length;a[i].disabled;)i=(i-1+a.length)%a.length;a[i].focus(),a[i].click();break}}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`${t[0].toString(36)}`}}customElements.define("au-radio-group",$);class N extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const t=this.generateId(),e=document.createElement("style");e.textContent=`
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
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--au-switch-container-gap, 0.625rem);
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
        border: var(--au-switch-input-border-width, 1px) var(--au-switch-input-border-style, solid) var(--au-switch-input-border-color, oklch(78.94% 0 0));
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
        background-color: var(--au-switch-input-checked-bg, oklch(13.98% 0 0));
      }
      .input:has(input[type="checkbox"]:checked):before {
        background-color: var(--au-switch-inner-checked-bg, oklch(99.4% 0 0));
        left: calc(100% - (var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem)) - var(--au-switch-inner-distance, 0.25rem));
      }
      .au-switch:hover {
        text-decoration: underline;
      }
      .au-switch:has(input:focus-visible) {
        box-shadow: inset 0 0 0 var(--au-switch-focus-shadow-width, 3px) var(--au-switch-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
      }
    `;const a=document.createElement("label");a.classList.add("au-switch"),a.setAttribute("for",t);const i=document.createElement("div");i.classList.add("container");const o=document.createElement("span");o.classList.add("off-text"),o.setAttribute("aria-hidden","true");const l=document.createElement("div");l.classList.add("input"),this.inputElement=document.createElement("input"),this.inputElement.id=t,this.inputElement.type="checkbox",this.inputElement.setAttribute("role","switch"),this.inputElement.setAttribute("aria-checked","false"),l.appendChild(this.inputElement);const r=document.createElement("span");r.classList.add("on-text"),r.setAttribute("aria-hidden","true"),i.append(o,l,r),a.append(i),this.shadowRoot.append(e,a);const c=document.createElement("slot");a.prepend(c),this.inputElement.addEventListener("change",u=>{const p=u.target.checked;this.inputElement.setAttribute("aria-checked",p.toString()),this.dispatchEvent(new CustomEvent("change",{detail:p}))})}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-switch-${t[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","off","on"]}attributeChangedCallback(t,e,a){const i=this.shadowRoot.querySelector("input"),o=this.shadowRoot.querySelector(".off-text"),l=this.shadowRoot.querySelector(".on-text");if(!(!i||!o||!l))switch(t){case"checked":i.checked=a!==null,i.setAttribute("aria-checked",i.checked.toString());break;case"disabled":i.disabled=a!==null;break;case"off":o.textContent=a||"Off";break;case"on":l.textContent=a||"On";break;default:i.setAttribute(t,a);break}}connectedCallback(){const t=this.shadowRoot.querySelector("input"),e=this.shadowRoot.querySelector(".off-text"),a=this.shadowRoot.querySelector(".on-text");t.setAttribute("aria-checked",t.checked.toString()),this.hasAttribute("off")?e.textContent=this.getAttribute("off"):e.textContent="",this.hasAttribute("on")?a.textContent=this.getAttribute("on"):a.textContent=""}}customElements.define("au-switch",N);class F extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._tabs=[],this._panels=[],this._selectedIndex=0,this.container=document.createElement("div"),this.container.classList.add("au-tabs");const t=document.createElement("style");t.textContent=`
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
            border-right: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(78.94% 0 0));
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
        padding: var(--au-tabs-padding-vertical, 0.625rem) var(--au-tabs-padding-horizontal, 1rem);

        /* border */
        border-top: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(78.94% 0 0));
        border-left: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(78.94% 0 0));
        border-right: 0;
        border-bottom: 0;

        /* text */
        color: var(--au-tabs-text-color, oklch(13.98% 0 0));
        font-size: var(--au-tabs-text-size, 1rem);
        font-family: var(--au-tabs-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-tabs-text-line-height, 1.5);

        /* background */
        background-color: var(--au-tabs-bg, oklch(97.31% 0 0));
        transition: background-color 120ms ease-in;

        &:hover {
          background-color: var(--au-tabs-hover-bg, oklch(94.66% 0 0));
        }
        
        &:active {
          background-color: var(--au-tabs-active-bg, oklch(86.89% 0 0));
        }

        &[aria-selected="true"] {
          paint-order: stroke fill;
          -webkit-text-stroke: var(--au-tabs-selected-text-stroke-width, 0.5px) var(--au-tabs-selected-text-stroke-color, oklch(99.4% 0 0));
          box-shadow: inset 0 0 0 var(--au-tabs-selected-shadow-width, 1px) var(--au-tabs-selected-shadow-color, oklch(78.94% 0 0));
          background-color: var(--au-tabs-selected-bg, oklch(13.98% 0 0));
          color: var(--au-tabs-selected-text-color, oklch(99.4% 0 0));
        }

        /* focusd */
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
        }
      }

      .au-tabpanels {
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(78.94% 0 0));
      }

      .au-tab-panel {
        padding: var(--au-tab-panel-padding-vertical, 0.625rem) var(--au-tab-panel-padding-horizontal, 1rem);
      }

      .badge {
        background-color: var(--au-tab-badge-bg, oklch(86.89% 0 0));
        color: var(--au-tab-badge-text-color, oklch(13.98% 0 0));
        padding: var(--au-tab-badge-padding-vertical, 0) var(--au-tab-badge-padding-horizontal, 0.625rem);
        border-radius: var(--au-tab-badge-border-radius, 0.75rem);
      }

       ::slotted(.au-tab-panel) {
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
        display: none;
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(78.94% 0 0));
      }

      ::slotted(.au-tab-panel[aria-hidden="false"]) {
        display: block;
      }
    `,this.tabsList=document.createElement("ul"),this.tabsList.setAttribute("role","tablist"),this.tabsList.classList.add("au-tablist");const e=document.createElement("slot");e.name="panel",this.container.append(t,this.tabsList,e),this.shadowRoot.appendChild(this.container)}connectedCallback(){this.shadowRoot.querySelector('slot[name="panel"]').addEventListener("slotchange",()=>{this._renderTabs(),this._attachEvents()}),this._renderTabs(),this._attachEvents()}_renderTabs(){const e=this.shadowRoot.querySelector('slot[name="panel"]').assignedElements().filter(a=>a.classList.contains("au-tab-panel"));this._tabs=[],this._panels=[],this.tabsList.innerHTML="",e.forEach((a,i)=>{const o=a.getAttribute("label")||`Tab ${i+1}`,l=a.getAttribute("data-prefix")||"",r=a.getAttribute("data-badge")||"",c=a.getAttribute("data-affix")||"",u=a.id||this.generateId(),p=`tab-${u}`,b=`panel-${u}`;a.setAttribute("id",b),a.setAttribute("role","tabpanel"),a.setAttribute("aria-labelledby",p),a.setAttribute("aria-hidden",i===0?"false":"true");const s=document.createElement("li");s.setAttribute("role","presentation"),s.className="au-tablist-item"+(i===0?" au-tablist-item--selected":"");const n=document.createElement("button");n.setAttribute("role","tab"),n.setAttribute("id",p),n.setAttribute("aria-controls",b),n.setAttribute("aria-selected",i===0?"true":"false"),n.setAttribute("tabindex",i===0?"0":"-1");const d=document.createDocumentFragment();if(l){const h=document.createElement("span");h.className="prefix",h.textContent=l,d.appendChild(h)}const f=document.createElement("span");if(f.className="label",f.textContent=o,d.appendChild(f),r){const h=document.createElement("span");h.className="badge",h.setAttribute("aria-label",`補充資訊：${r}`),h.textContent=r,d.appendChild(h)}if(c){const h=document.createElement("span");h.className="affix",h.textContent=c,d.appendChild(h)}n.appendChild(d),s.appendChild(n),this.tabsList.appendChild(s),this._tabs.push(n),this._panels.push(a)})}_attachEvents(){this._tabs.forEach((t,e)=>{t.addEventListener("click",()=>this._selectTab(e)),t.addEventListener("keydown",a=>this._onKeydown(a,e))})}_selectTab(t){this._tabs.forEach((e,a)=>{const i=a===t;e.setAttribute("aria-selected",i),e.setAttribute("tabindex",i?"0":"-1"),e.parentElement.classList.toggle("au-tablist-item--selected",i),this._panels[a].setAttribute("aria-hidden",!i)}),this._tabs[t].focus(),this._selectedIndex=t}_onKeydown(t,e){const a=this._tabs.length-1;let i=e;switch(t.key){case"ArrowRight":case"ArrowDown":i=e===a?0:e+1;break;case"ArrowLeft":case"ArrowUp":i=e===0?a:e-1;break;case"Home":i=0;break;case"End":i=a;break;default:return}t.preventDefault(),this._selectTab(i)}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),t[0].toString(36)}}customElements.define("au-tabs",F);class S extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId();const t=document.createElement("style");t.textContent=`
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
        color: var(--au-textarea-label-text-color, oklch(13.98% 0 0));
        font-size: var(--au-textarea-label-text-size, 1rem);
        font-family: var(--au-textarea-label-text-family, 'Helvetica, Arial, sans-serif, system-ui');
      }

      .textarea-container {
        display: flex;
        align-items: center;
        border: var(--au-textarea-border-width, 1px) var(--au-textarea-border-style, solid) var(--au-textarea-border-color, oklch(78.94% 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        padding: var(--au-textarea-container-padding-vertical, 0.25rem) var(--au-textarea-container-padding-horizontal, 0.25rem);
      }

      textarea {
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        margin: 0;
        padding: var(--au-textarea-padding-vertical, 0.625rem) var(--au-textarea-padding-horizontal, 1rem);
        color: var(--au-textarea-text-color, oklch(13.98% 0 0));
        font-size: var(--au-textarea-text-size, 1rem);
        font-family: var(--au-textarea-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-textarea-text-line-height, 1.5);

        border: 0;
        outline: none;
        background-color: var(--au-textarea-bg, oklch(99.4% 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        width: 100%;
        
        resize: none;
        field-sizing: content;

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-textarea-invalid-shadow-width, 3px) var(--au-textarea-invalid-shadow-color, oklch(57.22% 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-textarea-focus-shadow-width, 3px) var(--au-textarea-focus-shadow-color, oklch(83.15% 0.15681888825079074 78.05241467152487));
        }
      }
        
    `;const e=document.createElement("div");e.className="textarea-wrapper",this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const a=document.createElement("div");a.className="textarea-container",this.textarea=document.createElement("textarea"),this.textarea.id=this._id;const i=this.getAttribute("label");i&&!this.hasAttribute("aria-label")&&!this.hasAttribute("aria-labelledby")&&this.textarea.setAttribute("aria-label",i),this.textarea.addEventListener("input",()=>{this.value=this.textarea.value,this.internals.setFormValue(this.value),this.dispatchEvent(new Event("input",{bubbles:!0}))}),this.textarea.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0}))}),a.append(this.textarea),e.append(this.labelEl,a),this.shadowRoot.append(t,e)}static get observedAttributes(){return["placeholder","name","rows","cols","disabled","readonly","required","maxlength","minlength","aria-label","aria-labelledby","label","id"]}attributeChangedCallback(t,e,a){var i;t==="label"&&this.labelEl?(this.labelEl.textContent=a,!this.hasAttribute("aria-label")&&!this.hasAttribute("aria-labelledby")&&this.textarea.setAttribute("aria-label",a)):t==="id"&&a?(this.textarea.id=a,(i=this.labelEl)==null||i.setAttribute("for",a)):a===null?this.textarea.removeAttribute(t):this.textarea.setAttribute(t,a)}connectedCallback(){this.internals.setFormValue(this.textarea.value)}get value(){return this.textarea.value}set value(t){this.textarea.value=t,this.internals.setFormValue(t)}formResetCallback(){this.value=""}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-textarea-${t[0].toString(36)}`}}k(S,"formAssociated",!0);customElements.define("au-textarea",S);
