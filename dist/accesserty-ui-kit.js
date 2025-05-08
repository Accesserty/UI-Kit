var L=Object.defineProperty;var S=(d,e,t)=>e in d?L(d,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[e]=t;var x=(d,e,t)=>S(d,typeof e!="symbol"?e+"":e,t);class z extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=document.createElement("div");e.setAttribute("class","au-accordion");const t=document.createElement("slot");e.appendChild(t),this.shadowRoot.appendChild(e)}}customElements.define("au-accordion",z);class R extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=this.generateId(),t=this.generateId(),a=document.createElement("div");a.setAttribute("class","au-accordion-item"),a.innerHTML=`
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
      `,this.shadowRoot.append(a),this.button=this.shadowRoot.querySelector("button"),this.button.addEventListener("click",()=>this.toggleAccordion())}connectedCallback(){this.updateExpanded()}static get observedAttributes(){return["open"]}attributeChangedCallback(e,t,a){e==="open"&&this.updateExpanded()}updateExpanded(){const e=this.hasAttribute("open");this.button.setAttribute("aria-expanded",e),this.shadowRoot.querySelector('div[role="region"]').setAttribute("aria-hidden",!e)}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-accordion-item-${e[0].toString(36)}`}toggleAccordion(){const e=this.button.getAttribute("aria-expanded")==="true";this.button.setAttribute("aria-expanded",!e),this.shadowRoot.querySelector('div[role="region"]').setAttribute("aria-hidden",e),e?this.removeAttribute("open"):this.setAttribute("open","")}}customElements.define("au-accordion-item",R);class _ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.attachInitialAttributes(),this.render()}attachInitialAttributes(){Array.from(this.attributes).forEach(e=>{e.name!=="style"&&!["class","label","items","separator"].includes(e.name)&&this.shadowRoot.host.setAttribute(e.name,e.value)})}static get observedAttributes(){return["id","class","aria-label","items","separator"]}attributeChangedCallback(e,t,a){t!==a&&this.render()}get items(){try{return JSON.parse(this.getAttribute("items")||"[]")}catch(e){return console.error("Error parsing 'items':",e),[]}}set items(e){try{JSON.parse(e),this.setAttribute("items",e),this.render()}catch{console.error("Invalid JSON provided for 'items':",e)}}render(){const e=this.getAttribute("id"),t=this.getAttribute("class"),a=this.getAttribute("aria-label"),i=this.items,o=this.getAttribute("separator")||"/";this.shadowRoot.innerHTML=`
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
          ${i.map((s,r)=>`
                <li>
                  <a href="${s.url||""}" ${r===i.length-1?'aria-current="page"':""}>
                    <slot name="icon-${r+1}"></slot>
                    <span>${s.text}</span>
                  </a>
                  ${r!==i.length-1?'<span aria-hidden="true">'+o+"</span>":""}
                </li>
              `).join("")}
        </ol>
      </nav>
    `}}customElements.define("au-breadcrumbs",_);class I extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot.innerHTML=`
      <div class="au-card-container" part="au-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `}}customElements.define("au-card",I);class y extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals();const e=this.generateId(),t=document.createElement("style");t.textContent=`
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
    `;const a=document.createElement("div");a.setAttribute("class","au-checkbox");const i=document.createElement("label");i.setAttribute("for",e);const o=document.createElement("input");o.type="checkbox",o.id=e,o.name=this.getAttribute("name")||"default-checkbox",o.value=this.getAttribute("value")||"default";const s=document.createElement("div");s.setAttribute("class","text");const r=document.createElement("slot");s.appendChild(r),i.append(o,s),a.appendChild(i),this.shadowRoot.append(t,a),o.addEventListener("change",n=>{this.checked=n.target.checked,this.dispatchEvent(new CustomEvent("change",{detail:n.target.checked})),this.updateFormValue()}),o.addEventListener("focus",()=>{this.dispatchEvent(new CustomEvent("focus"))}),o.addEventListener("blur",()=>{this.dispatchEvent(new CustomEvent("blur"))})}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-checkbox-${e[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","required"]}attributeChangedCallback(e,t,a){const i=this.shadowRoot.querySelector("input");if(i)switch(e){case"checked":i.checked=a!==null;break;case"disabled":i.disabled=a!==null;break;case"name":i.name=a;break;case"value":i.value=a;break;case"required":i.required=a!==null;break}}connectedCallback(){this.updateCheckedState(),this.updateFormValue()}updateCheckedState(){const e=this.shadowRoot.querySelector("input");e&&(e.checked=this.hasAttribute("checked"))}updateFormValue(){const e=this.shadowRoot.querySelector("input"),t=e.checked?this.getAttribute("value")||"on":null;this.internals.setFormValue(t),e.validity.valid?this.internals.setValidity({}):this.internals.setValidity(e.validity,e.validationMessage,e)}formDisabledCallback(e){const t=this.shadowRoot.querySelector("input");t&&(t.disabled=e)}formResetCallback(){const e=this.shadowRoot.querySelector("input");e&&(e.checked=!1,this.checked=!1,this.updateFormValue())}}x(y,"formAssociated",!0);customElements.define("au-checkbox",y);class E extends HTMLElement{constructor(){super();x(this,"_preventDefault",t=>t.preventDefault());this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this.files=[];const t=document.createElement("style");t.textContent=`
      .file-upload-container {
        position: relative;
        :is(ul, ol) {
          list-style: none;
          margin: 0;
          padding: 0;
        }
      }
      label {
        padding: var(--au-file-upload-label-padding-vertical, 0.75rem) var(--au-file-upload-label-padding-horizontal, 0);
        color: oklch(var(--au-file-upload-label-text-color, 13.98% 0 0));
        font-size: var(--au-file-upload-label-text-size, 1rem);
        font-family: var(--au-file-upload-label-text-family, 'Helvetica, Arial, sans-serif, system-ui');
      }
      .upload-area {
        position: relative;
        display: grid;
        place-content: center;
        padding: 4rem;
        border: var(--au-file-upload-area-border-width, 1px) var(--au-file-upload-area-border-style, dashed) oklch(var(--au-file-upload-area-border-color, 78.94% 0 0));
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
        color: oklch(var(--au-file-upload-error-area-text-color, 44.64% 0 0));
      }
      .error-list {
        margin: 0;
        color: oklch(var(--au-file-upload-error-list-text-color, 47.47% 0.193 29.04));
      }
      .file-list {
        display: flex;
        flex-direction: column;
        gap: var(--au-file-upload-file-list-gap, 0.5rem);
        [role="listitem"] {
          display: flex;
          justify-content: space-between;
          gap: var(--au-file-upload-file-list-item-gap, 0.5rem);
          word-break: break-word;
          align-items: center;
          >div {
            flex: 1;
            display: flex;
            align-items: center;
            gap: var(--au-file-upload-file-list-item-inner-gap, 0.5rem);
          }
          .preview {
            flex: 0 0 3rem;
            width: var(--au-file-upload-file-list-preview-width, 3rem);
            height: var(--au-file-upload-file-list-preview-height, 3rem);
            display: grid;
            place-content: center;
            object-fit: contain;
            border: var(--au-file-upload-file-list-preview-border-width, 1px) var(--au-file-upload-file-list-preview-border-style, solid) oklch(var(--au-file-upload-file-list-preview-border-color, 78.94% 0 0));
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
            -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
            
            /* spacing */
            padding: var(--au-file-upload-delete-padding-vertical, 0.75rem) var(--au-file-upload-delete-padding-horizontal, 1rem);
            
            /* text */
            color: oklch(var(--au-file-upload-delete-text-color, 13.98% 0 0));
            font-size: var(--au-file-upload-delete-text-size, 1rem);
            font-family: var(--au-file-upload-delete-text-family, 'Helvetica, Arial, sans-serif, system-ui');
            line-height: var(--au-file-upload-delete-text-line-height, 1.5);
            
            /* border */
            border: var(--au-file-upload-delete-border-width, 1px) var(--au-file-upload-delete-border-style, solid) oklch(var(--au-file-upload-delete-border-color, 78.94% 0 0));
            border-radius: var(--au-file-upload-delete-border-radius, 0.25rem);
            
            /* others decoration */
            background-color: oklch(var(--au-file-upload-delete-bg, 99.4% 0 0));
            transition: background-color 160ms ease-in;
            
            &:hover {
              background-color: oklch(var(--au-file-upload-delete-hover-bg, 94.66% 0 0));
              border-color: oklch(var(--au-file-upload-delete-hover-border-color, 78.94% 0 0));
            }
            
            &:active {
              background-color: oklch(var(--au-file-upload-delete-active-bg, 86.89% 0 0));
              border-color: oklch(var(--au-file-upload-delete-active-border-color, 78.94% 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-file-upload-delete-focus-shadow-width, 3px) oklch(var(--au-file-upload-delete-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
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
    `,this.wrapper=document.createElement("div"),this.wrapper.className="file-upload-wrapper",this.container=document.createElement("div"),this.container.className="file-upload-container",this._id=this.getAttribute("id")||this.generateId(),this.labelEl=document.createElement("label"),this.labelEl.textContent=this.getAttribute("label")||"Upload files",this.labelEl.setAttribute("for",this._id),this.fileInput=document.createElement("input"),this.fileInput.type="file",this.fileInput.hidden=!0,this.fileInput.id=this._id,["accept","multiple","name","disabled","required","form"].forEach(r=>{this.hasAttribute(r)&&this.fileInput.setAttribute(r,this.getAttribute(r))});const a=document.createElement("slot");a.name="trigger",a.addEventListener("click",()=>this.fileInput.click()),this.dropZone=document.createElement("div"),this.dropZone.className="drop-zone",this.dropZone.textContent=this.getAttribute("msg-drop-text")||"Drop files here",this.usageDisplay=document.createElement("div"),this.usageDisplay.className="usage",this.usageDisplay.setAttribute("aria-live","polite"),this.fileList=document.createElement("ul"),this.fileList.className="file-list",this.fileList.setAttribute("role","list"),this.fileList.setAttribute("aria-live","polite"),this.fileList.setAttribute("aria-atomic","true");const i=document.createElement("slot");i.name="hint",this.errorMessage=document.createElement("div"),this.errorMessage.className="error-area",this.errorList=document.createElement("ul"),this.errorList.className="error-list",this.errorMessage.append(i,this.usageDisplay,this.errorList),this.liveRegion=document.createElement("div"),this.liveRegion.setAttribute("aria-live","polite"),this.liveRegion.setAttribute("role","status"),this.liveRegion.setAttribute("aria-atomic","true"),this.fileInput.addEventListener("change",()=>this.handleFiles(this.fileInput.files)),this.dropZone.addEventListener("dragover",r=>{r.preventDefault(),this.dropZone.classList.add("dragover")}),this.dropZone.addEventListener("dragleave",()=>{this.dropZone.classList.remove("dragover")}),this.dropZone.addEventListener("drop",r=>{r.preventDefault(),this.dropZone.classList.remove("dragover");const n=r.dataTransfer;n!=null&&n.files&&this.handleFiles(n.files)});const o=document.createElement("div");o.className="actions";const s=document.createElement("div");s.className="upload-area",s.append(a,this.dropZone),o.append(s),this.container.append(this.labelEl,o,this.errorMessage,this.fileList,this.liveRegion,this.fileInput),this.wrapper.append(this.container),this.shadowRoot.append(t,this.wrapper)}connectedCallback(){document.addEventListener("dragover",this._preventDefault),document.addEventListener("drop",this._preventDefault)}disconnectedCallback(){document.removeEventListener("dragover",this._preventDefault),document.removeEventListener("drop",this._preventDefault)}handleFiles(t){const a=parseFloat(this.getAttribute("max-total-size-mb")||"20"),i=this.getAttribute("msg-total-size-error")||"Total file size exceeds limit of",o=this.getAttribute("msg-type-error")||"is not an accepted file type.",s=this.getAttribute("msg-size-error")||"exceeds the maximum size of",r=this.getAttribute("msg-count-error")||"You can only upload up to",n=parseInt(this.getAttribute("max-files")||"5",10),h=parseFloat(this.getAttribute("max-size-mb")||"5"),u=this.getAttribute("accept"),v=u?u.split(",").map(l=>l.trim()):[],p=Array.from(t),m=[],b=[];p.forEach(l=>{if(!(v.length===0||v.some(k=>k.endsWith("/*")?l.type.startsWith(k.replace("/*","")):l.type===k||l.name.endsWith(k)))){b.push(`${l.name} ${o}`);return}if(l.size>h*1024*1024){b.push(`${l.name} ${s} ${h}MB.`);return}m.push(l)});const c=m.filter(l=>!this.files.some(g=>g.name===l.name&&g.size===l.size)),w=n-this.files.length,f=c.slice(0,w);c.slice(w).forEach(l=>{b.push(`${l.name} ${r} ${n} files.`)}),this.files.reduce((l,g)=>l+g.size,0)+f.reduce((l,g)=>l+g.size,0)>a*1024*1024&&(b.push(`${i} ${a}MB.`),f.length=0),b.length>0&&this.showErrors(b),f.length!==0&&(this.files.push(...f),this.updateFileList(),this.updateUsage(),this.announce(`${f.length} file${f.length>1?"s":""} added.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new Event("change",{bubbles:!0})),this.fileInput.value="")}showErrors(t){this.errorList.innerHTML="",t.forEach(a=>{const i=document.createElement("li");i.textContent=a,this.errorList.appendChild(i)}),this.announce(t.join(" "))}announce(t){for(;this.liveRegion.firstChild;)this.liveRegion.removeChild(this.liveRegion.firstChild);requestAnimationFrame(()=>{const a=document.createElement("span");a.textContent=t,this.liveRegion.appendChild(a)})}updateFileList(){this.fileList.innerHTML="",this.files.forEach(t=>{const a=document.createElement("li");a.setAttribute("role","listitem");const i=document.createElement("div");if(t.type.startsWith("image/")){const r=document.createElement("img");r.className="preview",r.src=URL.createObjectURL(t),r.alt=t.name,r.width=40,r.height=40,i.appendChild(r)}else{const r=document.createElement("span");r.className="preview",r.textContent="📄",r.setAttribute("aria-hidden","true"),i.appendChild(r)}const o=document.createElement("span");o.className="file-name",o.textContent=t.name,i.appendChild(o);const s=document.createElement("button");s.className="delete",s.textContent=this.getAttribute("msg-remove-text")||"Remove",s.setAttribute("aria-label",`Remove ${t.name}`),s.addEventListener("click",()=>{this.files=this.files.filter(r=>r.name!==t.name||r.size!==t.size),this.updateFileList(),this.updateUsage(),this.announce(`${t.name} removed.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new CustomEvent("remove-file",{detail:t}))}),a.append(i,s),this.fileList.appendChild(a)})}removeFile(t){this.files=this.files.filter(a=>a.name!==t.name||a.size!==t.size),this.updateFileList(),this.updateUsage(),this.announce(`${t.name} removed.`),this.syncFormValue(),this.checkValidity(),this.dispatchEvent(new CustomEvent("remove-file",{detail:t}))}updateUsage(){const t=parseFloat(this.getAttribute("max-total-size-mb")||"20"),a=this.files.reduce((i,o)=>i+o.size,0)/(1024*1024);this.usageDisplay.textContent=`${a.toFixed(1)}MB / ${t}MB`}syncFormValue(){const t=new DataTransfer;this.files.forEach(a=>t.items.add(a)),this.internals.setFormValue(t.files)}checkValidity(){return this.hasAttribute("required")&&this.files.length===0?(this.internals.setValidity({valueMissing:!0},this.getAttribute("msg-required")||"Please select at least one file.",this.fileInput),!1):(this.internals.setValidity({}),!0)}formResetCallback(){this.files=[],this.updateFileList(),this.updateUsage(),this.syncFormValue(),this.checkValidity()}focus(){this.uploadButton.focus()}get value(){return this.files}set value(t){Array.isArray(t)&&(this.files=t,this.updateFileList(),this.updateUsage(),this.syncFormValue(),this.checkValidity())}generateId(){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),`au-file-upload-${t[0].toString(36)}`}}x(E,"formAssociated",!0);customElements.define("au-file-upload",E);class A extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId();const e=document.createElement("style");e.textContent=`
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
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
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
      &[data-size="small"] {
        :is(label, input) {
          padding: var(--au-input-small-padding-vertical, 0.25rem) var(--au-input-small-padding-horizontal, 0.5rem);
        }
      }
      &[data-size="large"] {
        :is(label, input)  {
          padding: var(--au-input-large-padding-vertical, 1rem) var(--au-input-large-padding-horizontal, 2rem);
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
  `;const t=document.createElement("div");t.className="input-wrapper",this.wrapper=t,this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const a=document.createElement("div");a.className="input-container",this.prefixSlot=document.createElement("slot"),this.prefixSlot.name="prefix",this.prefixSpan=document.createElement("span"),this.prefixSpan.className="prefix",this.prefixSpan.appendChild(this.prefixSlot),this.prefixSpan.hidden=!0,this.input=document.createElement("input"),this.input.id=this._id,this.syncAttributes(),this.clearButton=document.createElement("button"),this.clearButton.type="button",this.clearButton.className="clear-input",this.clearButton.textContent="✖",this.clearButton.hidden=!0,this.clearButton.addEventListener("click",()=>{this.clear()}),this.affixSlot=document.createElement("slot"),this.affixSlot.name="affix",this.affixSpan=document.createElement("span"),this.affixSpan.className="affix",this.affixSpan.appendChild(this.affixSlot),this.affixSpan.hidden=!0,a.append(this.prefixSpan,this.input,this.clearButton,this.affixSpan),t.append(this.labelEl,a),this.shadowRoot.append(e,t),this.input.addEventListener("input",()=>{this.value=this.input.value,this.dispatchEvent(new Event("input",{bubbles:!0})),this.internals.setFormValue(this.value),this._syncValidity(),this._updateClearButton()}),this.input.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0}))}),this.prefixSlot.addEventListener("slotchange",()=>{this.prefixSpan.hidden=this.prefixSlot.assignedNodes().length===0}),this.affixSlot.addEventListener("slotchange",()=>{this.affixSpan.hidden=this.affixSlot.assignedNodes().length===0})}static get observedAttributes(){return["type","name","value","placeholder","required","disabled","readonly","label","min","max","step","pattern","autocomplete","autofocus","inputmode","maxlength","minlength","data-size","data-layout","data-clear","data-clear-label"]}attributeChangedCallback(e,t,a){e==="label"&&this.labelEl?this.labelEl.textContent=a:(e==="data-size"||e==="data-layout")&&this.wrapper?a===null?this.wrapper.removeAttribute(e):this.wrapper.setAttribute(e,a):e==="data-clear"||e==="data-clear-label"?this._updateClearButton():this.input&&(a===null&&typeof this.input[e]=="boolean"?(this.input[e]=!1,this.input.removeAttribute(e)):(this.input.setAttribute(e,a),typeof this.input[e]=="boolean"&&(this.input[e]=!0)),this._syncValidity())}connectedCallback(){this._initialValueSet||(this._initialValue=this.input.value,this._initialValueSet=!0),this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton()}formResetCallback(){this.input.value=this._initialValue||"",this.internals.setFormValue(this.input.value),this._syncValidity(),this._updateClearButton()}get value(){var e;return(e=this.input)==null?void 0:e.value}set value(e){this.input&&(this.input.value=e,this.setAttribute("value",e),this.internals.setFormValue(e),this._syncValidity(),this._updateClearButton())}clear(){this.input.value="",this.value="",this.internals.setFormValue(""),this.dispatchEvent(new Event("input",{bubbles:!0})),this.dispatchEvent(new Event("change",{bubbles:!0})),this._updateClearButton()}suggest(e=""){this.input.value=e,this.value=e,this.internals.setFormValue(e),this.dispatchEvent(new Event("input",{bubbles:!0})),this._updateClearButton()}focus(){var e;(e=this.input)==null||e.focus()}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-input-${e[0].toString(36)}`}syncAttributes(){Array.from(this.attributes).forEach(e=>{["data-size","data-layout","data-clear","data-clear-label"].includes(e.name)||(this.input.setAttribute(e.name,e.value),e.name==="value"&&(this.input.defaultValue=e.value))})}_syncValidity(){this.input&&(this.input.validity.valid?this.internals.setValidity({}):this.internals.setValidity(this.input.validity,this.input.validationMessage,this.input))}_updateClearButton(){const e=this.hasAttribute("data-clear"),t=this.input.value.length>0,a=this.getAttribute("data-clear-label")||"Clear input";this.clearButton.setAttribute("aria-label",a),this.clearButton.hidden=!(e&&t)}}x(A,"formAssociated",!0);customElements.define("au-input",A);class $ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=document.createElement("style");e.textContent=`
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
    `;const t=document.createElement("div");t.setAttribute("class","au-radio-group"),t.setAttribute("role","radiogroup"),this.groupName="radio-group-name-"+this.generateId(),this.shadowRoot.append(e,t)}connectedCallback(){this.renderRadios();const e=this.getAttribute("aria-label");e&&this.shadowRoot.querySelector(".au-radio-group").setAttribute("aria-label",e),this.getAttribute("direction")==="vertical"&&this.shadowRoot.querySelector(".au-radio-group").classList.add("au-radio-group--vertical")}renderRadios(){const e=this.shadowRoot.querySelector(".au-radio-group");e.innerHTML="";const t=Array.from(this.children),a=this.hasAttribute("disabled");t.forEach((i,o)=>{const s=document.createElement("label"),r="radio-"+this.generateId();s.setAttribute("for",r);const n=document.createElement("input");n.type="radio",n.id=r,n.name=this.groupName,n.value=i.getAttribute("value")||`radio-${o+1}`,i.hasAttribute("checked")&&(n.checked=!0),(a||i.hasAttribute("disabled"))&&(n.disabled=!0);const h=document.createElement("div");h.setAttribute("class","text"),h.textContent=i.textContent.trim(),s.append(n,h),e.appendChild(s),n.addEventListener("change",u=>this.handleChange(u,n)),n.addEventListener("keydown",u=>this.handleKeyDown(u,o))})}handleChange(e,t){t.checked&&this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`).forEach(i=>{i!==t&&(i.checked=!1)})}handleKeyDown(e,t){const a=Array.from(this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`));let i;switch(e.key){case"ArrowRight":case"ArrowDown":for(e.preventDefault(),i=(t+1)%a.length;a[i].disabled;)i=(i+1)%a.length;a[i].focus(),a[i].click();break;case"ArrowLeft":case"ArrowUp":for(e.preventDefault(),i=(t-1+a.length)%a.length;a[i].disabled;)i=(i-1+a.length)%a.length;a[i].focus(),a[i].click();break}}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`${e[0].toString(36)}`}}customElements.define("au-radio-group",$);class V extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"});const e=this.generateId(),t=document.createElement("style");t.textContent=`
      .au-switch {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--au-switch-gap, 1rem);
        cursor: pointer;
        padding-top: var(--au-switch-padding-top, 0.5rem);
        padding-right: var(--au-switch-padding-right, 0.25rem);
        padding-bottom: var(--au-switch-padding-bottom, 0.5rem);
        padding-left: var(--au-switch-padding-left, 0);
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
      .au-switch:hover {
        text-decoration: underline;
      }
      .au-switch:has(input:focus-visible) {
        box-shadow: inset 0 0 0 var(--au-switch-focus-shadow-width, 3px) oklch(var(--au-switch-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
      }
    `;const a=document.createElement("label");a.classList.add("au-switch"),a.setAttribute("for",e);const i=document.createElement("div");i.classList.add("container");const o=document.createElement("span");o.classList.add("off-text"),o.setAttribute("aria-hidden","true");const s=document.createElement("div");s.classList.add("input"),this.inputElement=document.createElement("input"),this.inputElement.id=e,this.inputElement.type="checkbox",this.inputElement.setAttribute("role","switch"),this.inputElement.setAttribute("aria-checked","false"),s.appendChild(this.inputElement);const r=document.createElement("span");r.classList.add("on-text"),r.setAttribute("aria-hidden","true"),i.append(o,s,r),a.append(i),this.shadowRoot.append(t,a);const n=document.createElement("slot");a.prepend(n),this.inputElement.addEventListener("change",h=>{const u=h.target.checked;this.inputElement.setAttribute("aria-checked",u.toString()),this.dispatchEvent(new CustomEvent("change",{detail:u}))})}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-switch-${e[0].toString(36)}`}static get observedAttributes(){return["name","value","checked","disabled","off","on"]}attributeChangedCallback(e,t,a){const i=this.shadowRoot.querySelector("input"),o=this.shadowRoot.querySelector(".off-text"),s=this.shadowRoot.querySelector(".on-text");if(!(!i||!o||!s))switch(e){case"checked":i.checked=a!==null,i.setAttribute("aria-checked",i.checked.toString());break;case"disabled":i.disabled=a!==null;break;case"off":o.textContent=a||"Off";break;case"on":s.textContent=a||"On";break;default:i.setAttribute(e,a);break}}connectedCallback(){const e=this.shadowRoot.querySelector("input"),t=this.shadowRoot.querySelector(".off-text"),a=this.shadowRoot.querySelector(".on-text");e.setAttribute("aria-checked",e.checked.toString()),this.hasAttribute("off")?t.textContent=this.getAttribute("off"):t.textContent="",this.hasAttribute("on")?a.textContent=this.getAttribute("on"):a.textContent=""}}customElements.define("au-switch",V);class F extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._tabs=[],this._panels=[],this._selectedIndex=0,this.container=document.createElement("div"),this.container.classList.add("au-tabs");const e=document.createElement("style");e.textContent=`
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

       ::slotted(.au-tab-panel) {
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
        display: none;
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) oklch(var(--au-tabpanels-border-color, 78.94% 0 0));
      }

      ::slotted(.au-tab-panel[aria-hidden="false"]) {
        display: block;
      }
    `,this.tabsList=document.createElement("ul"),this.tabsList.setAttribute("role","tablist"),this.tabsList.classList.add("au-tablist");const t=document.createElement("slot");t.name="panel",this.container.append(e,this.tabsList,t),this.shadowRoot.appendChild(this.container)}connectedCallback(){this._renderTabs(),this._attachEvents()}_renderTabs(){const e=Array.from(this.querySelectorAll(':scope > .au-tab-panel[slot="panel"]'));this._tabs=[],this._panels=[],this.tabsList.innerHTML="",e.forEach((t,a)=>{const i=t.getAttribute("label")||`Tab ${a+1}`,o=t.getAttribute("data-prefix")||"",s=t.getAttribute("data-badge")||"",r=t.getAttribute("data-affix")||"",n=t.id||this.generateId(),h=`tab-${n}`,u=`panel-${n}`;t.setAttribute("id",u),t.setAttribute("role","tabpanel"),t.setAttribute("aria-labelledby",h),t.setAttribute("aria-hidden",a===0?"false":"true");const v=document.createElement("li");v.setAttribute("role","presentation"),v.className="au-tablist-item"+(a===0?" au-tablist-item--selected":"");const p=document.createElement("button");p.setAttribute("role","tab"),p.setAttribute("id",h),p.setAttribute("aria-controls",u),p.setAttribute("aria-selected",a===0?"true":"false"),p.setAttribute("tabindex",a===0?"0":"-1");const m=document.createDocumentFragment();if(o){const c=document.createElement("span");c.className="prefix",c.textContent=o,m.appendChild(c)}const b=document.createElement("span");if(b.className="label",b.textContent=i,m.appendChild(b),s){const c=document.createElement("span");c.className="badge",c.setAttribute("aria-label",`補充資訊：${s}`),c.textContent=s,m.appendChild(c)}if(r){const c=document.createElement("span");c.className="affix",c.textContent=r,m.appendChild(c)}p.appendChild(m),v.appendChild(p),this.tabsList.appendChild(v),this._tabs.push(p),this._panels.push(t)})}_attachEvents(){this._tabs.forEach((e,t)=>{e.addEventListener("click",()=>this._selectTab(t)),e.addEventListener("keydown",a=>this._onKeydown(a,t))})}_selectTab(e){this._tabs.forEach((t,a)=>{const i=a===e;t.setAttribute("aria-selected",i),t.setAttribute("tabindex",i?"0":"-1"),t.parentElement.classList.toggle("au-tablist-item--selected",i),this._panels[a].setAttribute("aria-hidden",!i)}),this._tabs[e].focus(),this._selectedIndex=e}_onKeydown(e,t){const a=this._tabs.length-1;let i=t;switch(e.key){case"ArrowRight":case"ArrowDown":i=t===a?0:t+1;break;case"ArrowLeft":case"ArrowUp":i=t===0?a:t-1;break;case"Home":i=0;break;case"End":i=a;break;default:return}e.preventDefault(),this._selectTab(i)}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),e[0].toString(36)}}customElements.define("au-tabs",F);class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.internals=this.attachInternals(),this._id=this.getAttribute("id")||this.generateId();const e=document.createElement("style");e.textContent=`
      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      label {
        word-break: break-word;
        margin: var(--au-textarea-label-margin-vertical, 0) var(--au-textarea-label-margin-horizontal, 0);
        padding: var(--au-textarea-label-padding-vertical, 0.75rem) var(--au-textarea-label-padding-horizontal, 0);
        color: oklch(var(--au-textarea-label-text-color, 13.98% 0 0));
        font-size: var(--au-textarea-label-text-size, 1rem);
        font-family: var(--au-textarea-label-text-family, 'Helvetica, Arial, sans-serif, system-ui');
      }

      .textarea-container {
        display: flex;
        align-items: center;
        border: var(--au-textarea-border-width, 1px) var(--au-textarea-border-style, solid) oklch(var(--au-textarea-border-color, 78.94% 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        padding: var(--au-textarea-container-padding-vertical, 0.25rem) var(--au-textarea-container-padding-horizontal, 0.25rem);
      }

      textarea {
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        margin: 0;
        padding: var(--au-textarea-padding-vertical, 0.75rem) var(--au-textarea-padding-horizontal, 1rem);
        color: oklch(var(--au-textarea-text-color, 13.98% 0 0));
        font-size: var(--au-textarea-text-size, 1rem);
        font-family: var(--au-textarea-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-textarea-text-line-height, 1.5);

        border: 0;
        outline: none;
        background-color: var(--au-textarea-bg, 99.4% 0 0);
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        width: 100%;
        
        resize: none;
        field-sizing: content;

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-textarea-invalid-shadow-width, 3px) oklch(var(--au-textarea-invalid-shadow-color, 57.22% 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-textarea-focus-shadow-width, 3px) oklch(var(--au-textarea-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
      }
        
    `;const t=document.createElement("div");t.className="textarea-wrapper",this.labelEl=document.createElement("label"),this.labelEl.setAttribute("for",this._id),this.labelEl.textContent=this.getAttribute("label")||"";const a=document.createElement("div");a.className="textarea-container",this.textarea=document.createElement("textarea"),this.textarea.id=this._id;const i=this.getAttribute("label");i&&!this.hasAttribute("aria-label")&&!this.hasAttribute("aria-labelledby")&&this.textarea.setAttribute("aria-label",i),this.textarea.addEventListener("input",()=>{this.value=this.textarea.value,this.internals.setFormValue(this.value),this.dispatchEvent(new Event("input",{bubbles:!0}))}),this.textarea.addEventListener("change",()=>{this.dispatchEvent(new Event("change",{bubbles:!0}))}),a.append(this.textarea),t.append(this.labelEl,a),this.shadowRoot.append(e,t)}static get observedAttributes(){return["placeholder","name","rows","cols","disabled","readonly","required","maxlength","minlength","aria-label","aria-labelledby","label","id"]}attributeChangedCallback(e,t,a){var i;e==="label"&&this.labelEl?(this.labelEl.textContent=a,!this.hasAttribute("aria-label")&&!this.hasAttribute("aria-labelledby")&&this.textarea.setAttribute("aria-label",a)):e==="id"&&a?(this.textarea.id=a,(i=this.labelEl)==null||i.setAttribute("for",a)):a===null?this.textarea.removeAttribute(e):this.textarea.setAttribute(e,a)}connectedCallback(){this.internals.setFormValue(this.textarea.value)}get value(){return this.textarea.value}set value(e){this.textarea.value=e,this.internals.setFormValue(e)}formResetCallback(){this.value=""}generateId(){const e=new Uint32Array(1);return window.crypto.getRandomValues(e),`au-textarea-${e[0].toString(36)}`}}x(C,"formAssociated",!0);customElements.define("au-textarea",C);
