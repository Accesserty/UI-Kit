class AuFileUpload extends HTMLElement {
  connectedCallback() {
    document.addEventListener('dragover', this._preventDefault);
    document.addEventListener('drop', this._preventDefault);
  }

  disconnectedCallback() {
    document.removeEventListener('dragover', this._preventDefault);
    document.removeEventListener('drop', this._preventDefault);
  }

  _preventDefault = (e) => e.preventDefault();
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();
    this.files = [];

    const style = document.createElement('style');
    style.textContent = `
      .file-upload { display: flex; flex-direction: column; gap: 0.5rem; }
      .file-list { list-style: none; padding: 0; margin: 0; }
      .file-list li { display: flex; justify-content: space-between; align-items: center; padding: 0.25rem 0; }
      .file-list button { background: none; border: none; color: red; cursor: pointer; }
      .drop-zone { padding: 1rem; border: 2px dashed #ccc; border-radius: 4px; text-align: center; cursor: pointer; }
      .drop-zone.dragover { border-color: #666; background-color: #f9f9f9; }
      .file-upload-error ul { margin: 0; padding-left: 1rem; color: red; }
    `;

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'fileupload-wrapper';

    this.container = document.createElement('div');
    this.container.className = 'fileupload-container';

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

    this.uploadButton = document.createElement('button');
    this.uploadButton.type = 'button';
    this.uploadButton.textContent = this.getAttribute('msg-button-text') || 'Select files';
    this.uploadButton.addEventListener('click', () => this.fileInput.click());

    this.dropZone = document.createElement('div');
    this.dropZone.className = 'drop-zone';
    this.dropZone.textContent = this.getAttribute('msg-drop-text') || 'Drop files here';

    this.fileList = document.createElement('ul');
    this.fileList.className = 'file-list';
    this.fileList.setAttribute('role', 'list');
    this.fileList.setAttribute('aria-live', 'assertive');
    this.fileList.setAttribute('aria-atomic', 'true');
    this.fileList.setAttribute('role', 'status');

    this.errorMessage = document.createElement('div');
    this.errorMessage.className = 'file-upload-error';

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-9999px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';

    this.fileInput.addEventListener('change', () => this.handleFiles(this.fileInput.files));

    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('dragover');
    });
    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('dragover');
    });
    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('dragover');
      const dt = e.dataTransfer;
      if (dt?.files) this.handleFiles(dt.files);
    });

    this.container.append(this.labelEl, this.uploadButton, this.dropZone, this.fileList, this.errorMessage, this.liveRegion, this.fileInput);
    this.wrapper.append(this.container);
    this.shadowRoot.append(style, this.wrapper);
  }

  handleFiles(fileList) {
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

    if (errorMessages.length > 0) {
      this.showErrors(errorMessages);
    }

    const totalSize = this.files.reduce((sum, f) => sum + f.size, 0) + filesToAdd.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > maxTotalSizeMB * 1024 * 1024) {
      errorMessages.push(`${msgTotalSizeError} ${maxTotalSizeMB}MB.`);
    }
    if (errorMessages.length > 0) {
      this.showErrors(errorMessages);
    }
    if (filesToAdd.length === 0 || totalSize > maxTotalSizeMB * 1024 * 1024) return;

    this.files.push(...filesToAdd);
    this.updateFileList();
    this.announce(`${filesToAdd.length} file${filesToAdd.length > 1 ? 's' : ''} added.`);
    this.syncFormValue();
    this.checkValidity();
    this.dispatchEvent(new Event('change', { bubbles: true }));
    this.fileInput.value = '';
  }

  showErrors(messages) {
    this.errorMessage.innerHTML = '';
    const ul = document.createElement('ul');
    messages.forEach(msg => {
      const li = document.createElement('li');
      li.textContent = msg;
      ul.appendChild(li);
    });
    this.errorMessage.appendChild(ul);
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
      preview.style.display = 'flex';
      preview.style.alignItems = 'center';
      preview.style.gap = '0.5rem';

      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        img.width = 40;
        img.height = 40;
        img.style.objectFit = 'cover';
        preview.appendChild(img);
      } else {
        const icon = document.createElement('span');
        icon.textContent = '📄';
        icon.setAttribute('aria-hidden', 'true');
        preview.appendChild(icon);
      }

      const nameSpan = document.createElement('span');
      nameSpan.textContent = file.name;
      preview.appendChild(nameSpan);

      const removeBtn = document.createElement('button');
      removeBtn.textContent = this.getAttribute('msg-remove-text') || 'Remove';
      removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
      removeBtn.addEventListener('click', () => {
        this.files = this.files.filter(f => f.name !== file.name || f.size !== file.size);
        this.updateFileList();
        this.announce(`${file.name} removed.`);
        this.syncFormValue();
        this.checkValidity();
        this.dispatchEvent(new CustomEvent('remove-file', { detail: file }));
      });

      li.append(preview, removeBtn);
      this.fileList.appendChild(li);
    });
  }

  syncFormValue() {
    const dt = new DataTransfer();
    this.files.forEach(file => dt.items.add(file));
    this.internals.setFormValue(dt.files);
  }

  checkValidity() {
    if (this.hasAttribute('required') && this.files.length === 0) {
      this.internals.setValidity({ valueMissing: true }, this.getAttribute('msg-required') || 'Please select at least one file.', this.fileInput);
      return false;
    }
    this.internals.setValidity({});
    return true;
  }

  get value() {
    return this.files;
  }

  set value(val) {
    if (Array.isArray(val)) {
      this.files = val;
      this.updateFileList();
      this.syncFormValue();
      this.checkValidity();
    }
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-file-upload-${byteArray[0].toString(36)}`;
  }

  formResetCallback() {
    this.files = [];
    this.updateFileList();
    this.syncFormValue();
    this.checkValidity();
  }

  focus() {
    this.uploadButton.focus();
  }
}

customElements.define('au-file-upload', AuFileUpload);
