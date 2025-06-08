class AuFileUpload extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();
    this.files = [];
    this.previewUrls = new Map();

    const style = document.createElement('style');
    style.textContent = `
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
        color: oklch(var(--au-file-upload-label-text-color, 13.98% 0 0));
        font-size: var(--au-file-upload-label-text-size, 1rem);
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
            padding: var(--au-file-upload-delete-padding-vertical, 0.625rem) var(--au-file-upload-delete-padding-horizontal, 1rem);
            
            /* text */
            color: oklch(var(--au-file-upload-delete-text-color, 13.98% 0 0));
            font-size: var(--au-file-upload-delete-text-size, 1rem);
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
    `;

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'file-upload-wrapper';

    this.container = document.createElement('div');
    this.container.className = 'file-upload-container';

    this._id = this.getAttribute('id') || this.generateId();

    this.labelEl = document.createElement('label');
    this.labelEl.textContent = this.getAttribute('label') || 'Upload files';
    this.labelEl.setAttribute('for', this._id);

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.hidden = true;
    this.fileInput.id = this._id;

    ['accept', 'multiple', 'name', 'disabled', 'required', 'form'].forEach(attr => {
      if (this.hasAttribute(attr)) {
        this.fileInput.setAttribute(attr, this.getAttribute(attr));
      }
    });

    const triggerSlot = document.createElement('slot');
    triggerSlot.name = 'trigger';
    triggerSlot.addEventListener('click', () => {
      if (this.hasAttribute('disabled')) return;
      this.fileInput.click();
    }); // 確保點擊會觸發 input


    this.dropZone = document.createElement('div');
    this.dropZone.className = 'drop-zone';
    this.dropZone.textContent = this.getAttribute('msg-drop-text') || 'Drop files here';

    this.usageDisplay = document.createElement('div');
    this.usageDisplay.className = 'usage';
    this.usageDisplay.setAttribute('aria-live', 'polite');

    this.fileList = document.createElement('ul');
    this.fileList.className = 'file-list';
    this.fileList.setAttribute('role', 'list');
    this.fileList.setAttribute('aria-live', 'polite');
    this.fileList.setAttribute('aria-atomic', 'true');

    const hintSlot = document.createElement('slot');
    hintSlot.name = 'hint';
    this.errorMessage = document.createElement('div');
    this.errorMessage.className = 'error-area';
    
    this.errorList = document.createElement('ul');
    this.errorList.className = 'error-list';
    this.errorMessage.append(hintSlot, this.usageDisplay, this.errorList);

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-atomic', 'true');

    this.fileInput.addEventListener('change', () => this.handleFiles(this.fileInput.files));

    this.dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      if (this.hasAttribute('disabled')) return;
      this.dropZone.classList.add('dragover');
    });
    this.dropZone.addEventListener('dragleave', () => {
      if (this.hasAttribute('disabled')) return;
      this.dropZone.classList.remove('dragover');
    });
    this.dropZone.addEventListener('drop', e => {
      e.preventDefault();
      if (this.hasAttribute('disabled')) return;
      this.dropZone.classList.remove('dragover');
      const dt = e.dataTransfer;
      if (dt?.files) this.handleFiles(dt.files);
    });

    const actionGroup = document.createElement('div');
    actionGroup.className = 'actions';
    const fileArea = document.createElement('div');
    fileArea.className = 'upload-area';
    fileArea.append(triggerSlot, this.dropZone);
    actionGroup.append(fileArea);

    this.container.append(
      this.labelEl,
      actionGroup,
      this.errorMessage,
      this.fileList,
      this.liveRegion,
      this.fileInput
    );

    this.wrapper.append(this.container);
    this.shadowRoot.append(style, this.wrapper);
  }

  connectedCallback() {
    document.addEventListener('dragover', this._preventDefault);
    document.addEventListener('drop', this._preventDefault);
  }

  disconnectedCallback() {
    document.removeEventListener('dragover', this._preventDefault);
    document.removeEventListener('drop', this._preventDefault);
    this.revokeAllPreviewUrls();
  }

  _preventDefault = e => e.preventDefault();

  revokePreviewUrl(file) {
    const url = this.previewUrls.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrls.delete(file);
    }
  }

  revokeAllPreviewUrls() {
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
    this.previewUrls.clear();
  }

  handleFiles(fileList) {
    if (this.hasAttribute('disabled')) return;
    const maxTotalSizeMB = parseFloat(this.getAttribute('max-total-size-mb') || '20');
    const msgTotalSizeError = this.getAttribute('msg-total-size-error') || 'Total file size exceeds limit of';
    const msgTypeError = this.getAttribute('msg-type-error') || 'is not an accepted file type.';
    const msgSizeError = this.getAttribute('msg-size-error') || 'exceeds the maximum size of';
    const msgCountError = this.getAttribute('msg-count-error') || 'You can only upload up to';
    const maxFiles = parseInt(this.getAttribute('max-files') || '5', 10);
    const maxSizeMB = parseFloat(this.getAttribute('max-size-mb') || '5');
    const acceptAttr = this.getAttribute('accept');
    const acceptList = acceptAttr ? acceptAttr.split(',').map(type => type.trim()) : [];

    const newFiles = Array.from(fileList);
    const validFiles = [];
    const errorMessages = [];

    newFiles.forEach(file => {
      const isValidType = acceptList.length === 0 || acceptList.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type || file.name.endsWith(type);
      });
      if (!isValidType) {
        errorMessages.push(`${file.name} ${msgTypeError}`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        errorMessages.push(`${file.name} ${msgSizeError} ${maxSizeMB}MB.`);
        return;
      }
      validFiles.push(file);
    });

    const uniqueFiles = validFiles.filter(file =>
      !this.files.some(f => f.name === file.name && f.size === file.size)
    );

    const slotsLeft = maxFiles - this.files.length;
    const filesToAdd = uniqueFiles.slice(0, slotsLeft);
    const dropped = uniqueFiles.slice(slotsLeft);

    dropped.forEach(file => {
      errorMessages.push(`${file.name} ${msgCountError} ${maxFiles} files.`);
    });

    const totalSize = this.files.reduce((sum, f) => sum + f.size, 0) +
                      filesToAdd.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > maxTotalSizeMB * 1024 * 1024) {
      errorMessages.push(`${msgTotalSizeError} ${maxTotalSizeMB}MB.`);
      filesToAdd.length = 0;
    }

    if (errorMessages.length > 0) {
      this.showErrors(errorMessages);
    }

    if (filesToAdd.length === 0) return;

    this.files.push(...filesToAdd);
    this.updateFileList();
    this.updateUsage();
    this.announce(`${filesToAdd.length} file${filesToAdd.length > 1 ? 's' : ''} added.`);
    this.syncFormValue();
    this.checkValidity();
    this.dispatchEvent(new Event('change', { bubbles: true }));
    this.fileInput.value = '';
  }

  showErrors(messages) {
    this.errorList.innerHTML = '';
    messages.forEach(msg => {
      const li = document.createElement('li');
      li.textContent = msg;
      this.errorList.appendChild(li);
    });
    this.announce(messages.join(' '));
  }

  announce(message) {
    while (this.liveRegion.firstChild) this.liveRegion.removeChild(this.liveRegion.firstChild);
    requestAnimationFrame(() => {
      const span = document.createElement('span');
      span.textContent = message;
      this.liveRegion.appendChild(span);
    });
  }

  updateFileList() {
    this.fileList.innerHTML = '';
    this.files.forEach(file => {
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');

      const preview = document.createElement('div');

      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.className = "preview";
        let url = this.previewUrls.get(file);
        if (!url) {
          url = URL.createObjectURL(file);
          this.previewUrls.set(file, url);
        }
        img.src = url;
        img.alt = file.name;
        img.width = 40;
        img.height = 40;
        preview.appendChild(img);
      } else {
        const icon = document.createElement('span');
        icon.className = "preview"
        icon.textContent = '📄';
        icon.setAttribute('aria-hidden', 'true');
        preview.appendChild(icon);
      }

      const nameSpan = document.createElement('span');
      nameSpan.className = 'file-name';
      nameSpan.textContent = file.name;
      preview.appendChild(nameSpan);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'delete';
      removeBtn.textContent = this.getAttribute('msg-remove-text') || 'Remove';
      removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
      removeBtn.setAttribute('part', 'delete');
      removeBtn.addEventListener('click', () => {
        if (this.hasAttribute('disabled')) return;
        this.revokePreviewUrl(file);
        this.files = this.files.filter(f => f.name !== file.name || f.size !== file.size);
        this.updateFileList();
        this.updateUsage();
        this.announce(`${file.name} removed.`);
        this.syncFormValue();
        this.checkValidity();
        this.dispatchEvent(new CustomEvent('remove-file', { detail: file }));
      });

      li.append(preview, removeBtn);
      this.fileList.appendChild(li);
    });
  }

  removeFile(file) {
    if (this.hasAttribute('disabled')) return;
    this.revokePreviewUrl(file);
    this.files = this.files.filter(f => f.name !== file.name || f.size !== file.size);
    this.updateFileList();
    this.updateUsage();
    this.announce(`${file.name} removed.`);
    this.syncFormValue();
    this.checkValidity();
    this.dispatchEvent(new CustomEvent('remove-file', { detail: file }));
  };

  updateUsage() {
    const maxMB = parseFloat(this.getAttribute('max-total-size-mb') || '20');
    const totalMB = this.files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
    this.usageDisplay.textContent = `${totalMB.toFixed(1)}MB / ${maxMB}MB`;
  }

  syncFormValue() {
    const dt = new DataTransfer();
    this.files.forEach(file => dt.items.add(file));
    this.internals.setFormValue(dt.files);
  }

  checkValidity() {
    if (this.hasAttribute('required') && this.files.length === 0) {
      this.internals.setValidity(
        { valueMissing: true },
        this.getAttribute('msg-required') || 'Please select at least one file.',
        this.fileInput
      );
      return false;
    }
    this.internals.setValidity({});
    return true;
  }

  formResetCallback() {
    this.revokeAllPreviewUrls();
    this.files = [];
    this.updateFileList();
    this.updateUsage();
    this.syncFormValue();
    this.checkValidity();
  }

  get value() {
    return this.files;
  }

  set value(val) {
    if (Array.isArray(val)) {
      this.revokeAllPreviewUrls();
      this.files = val;
      this.updateFileList();
      this.updateUsage();
      this.syncFormValue();
      this.checkValidity();
    }
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-file-upload-${byteArray[0].toString(36)}`;
  }
}

customElements.define('au-file-upload', AuFileUpload);
