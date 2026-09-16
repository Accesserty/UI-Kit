class AuFileUpload extends HTMLElement {
  static formAssociated = true;
  static get observedAttributes() {
    return [
      'accept',
      'aria-describedby',
      'aria-invalid',
      'disabled',
      'form',
      'id',
      'label',
      'multiple',
      'msg-drop-text',
      'msg-total-size-error',
      'msg-type-error',
      'msg-size-error',
      'msg-count-error',
      'msg-added',
      'msg-removed',
      'msg-remove-text',
      'msg-remove-file-label',
      'msg-required',
      'name',
      'required',
      'max-total-size-mb',
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();
    this.files = [];
    this.previewUrls = new Map();

    const style = document.createElement('style');
    style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-inline-size: 0; }

      * { box-sizing: border-box; }
      .file-upload-wrapper, .file-upload-container, .actions { min-inline-size: 0; overflow-wrap: anywhere; }
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
        padding: clamp(0.75rem, 4vw, 2rem);
        gap: 0.75rem;
        min-inline-size: 0;
        border: var(--au-file-upload-area-border-width, 1px) var(--au-file-upload-area-border-style, dashed) var(--au-file-upload-area-border-color, oklch(0.55 0 0));
        border-radius: var(--au-file-upload-area-border-radius, 0.25rem);
        transition: box-shadow 120ms ease-in;
        ::slotted([slot="trigger"]) {
          position: relative;
          z-index: 2;
        }
        .drop-zone {
          text-align: center;
        }
        &:hover {
          box-shadow: var(--box-shadow, 0 0.75rem 1.125rem oklch(from oklch(0.1398 0 0) l c h / 0.15));
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
            min-width: 0;
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
            border: var(--au-file-upload-file-list-preview-border-width, 1px) var(--au-file-upload-file-list-preview-border-style, solid) var(--au-file-upload-file-list-preview-border-color, oklch(0.55 0 0));
          }
          .file-name  {
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: var(--au-file-upload-file-list-neme-ellipsis-line, 2);
            overflow: hidden;
            -webkit-box-orient: vertical;
          }
          .delete {
            min-inline-size: 24px;
            min-block-size: 24px;
            max-inline-size: 100%;
            flex-shrink: 0;
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
            border: var(--au-file-upload-delete-border-width, 1px) var(--au-file-upload-delete-border-style, solid) var(--au-file-upload-delete-border-color, oklch(0.55 0 0));
            border-radius: var(--au-file-upload-delete-border-radius, 0.25rem);

            /* others decoration */
            background-color: var(--au-file-upload-delete-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;

            &:hover {
              background-color: var(--au-file-upload-delete-hover-bg, oklch(0.9466 0 0));
              border-color: var(--au-file-upload-delete-hover-border-color, oklch(0.55 0 0));
            }

            &:active {
              background-color: var(--au-file-upload-delete-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-file-upload-delete-active-border-color, oklch(0.55 0 0));
            }

            &:focus-visible {
              outline: max(2px, var(--au-file-upload-delete-focus-shadow-width, 3px)) solid var(--au-file-upload-delete-focus-shadow-color, oklch(0.45 0.15 260));
              outline-offset: 2px;
            }
          }
        }
        &+[aria-live] {
          position: absolute;
          inline-size: 1px; block-size: 1px; padding: 0;
          overflow: hidden; clip-path: inset(50%); white-space: nowrap;
        }
      }
      .trigger-area { min-inline-size: 0; }
      .trigger-area:focus-visible, .default-trigger:focus-visible { outline: 2px solid Highlight; outline-offset: 2px; }
      .default-trigger { font: inherit; min-block-size: 24px; min-inline-size: 24px; padding: 0.625rem; max-inline-size: 100%; overflow-wrap: anywhere; }
      .file-upload-container[aria-disabled="true"] { opacity: 0.65; }
      @media (max-width: 360px) { .file-list [role=listitem] { flex-wrap: wrap; } }
      @media (prefers-reduced-motion: reduce) { .upload-area, .file-list [role=listitem] .delete { transition: none; } }
      @media (forced-colors: active) { .file-list [role=listitem] .delete:focus-visible { outline: 2px solid Highlight; } }
    `;

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'file-upload-wrapper';

    this.container = document.createElement('div');
    this.container.className = 'file-upload-container';
    this.container.setAttribute('role', 'group');
    this.container.setAttribute('aria-labelledby', 'upload-label');
    this.container.setAttribute('aria-describedby', 'upload-errors upload-drop');

    this._id = this.getAttribute('id') || this.generateId();

    this.labelEl = document.createElement('label');
    this.labelEl.id = 'upload-label';
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
    this.defaultTrigger = document.createElement('button');
    this.defaultTrigger.type = 'button';
    this.defaultTrigger.className = 'default-trigger';
    this.defaultTrigger.textContent = this.labelEl.textContent;
    triggerSlot.append(this.defaultTrigger);
    triggerSlot.addEventListener('click', () => {
      if (this.effectiveDisabled) return;
      this.fileInput.click();
    }); // ensure the click triggers the input
    triggerSlot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        const nativeButton = e.composedPath().some(node => node instanceof Element && node.matches('button'));
        // A slotted button crosses the shadow boundary before its native
        // activation is dispatched. Handle it here so keyboard activation
        // preserves the file chooser's user-activation requirement in SSR
        // and plain-HTML consumers, while preventing a second native click.
        if (nativeButton || !e.composedPath().some(node => node instanceof Element && node.matches('input, a[href]'))) {
          e.preventDefault();
        } else {
          return;
        }
        if (this.effectiveDisabled) return;
        this.fileInput.click();
      }
    }); // support non-button trigger accessibility


    this.dropZone = document.createElement('div');
    this.dropZone.className = 'drop-zone';
    this.dropZone.id = 'upload-drop';
    this.dropZone.textContent = this.getAttribute('msg-drop-text') || 'Drop files here';

    this.usageDisplay = document.createElement('div');
    this.usageDisplay.className = 'usage';

    this.fileList = document.createElement('ul');
    this.fileList.className = 'file-list';
    this.fileList.setAttribute('role', 'list');

    const hintSlot = document.createElement('slot');
    hintSlot.name = 'hint';
    this.errorMessage = document.createElement('div');
    this.errorMessage.className = 'error-area';
    this.errorMessage.id = 'upload-errors';

    this.errorList = document.createElement('ul');
    this.errorList.className = 'error-list';
    this.errorMessage.append(hintSlot, this.usageDisplay, this.errorList);

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-atomic', 'true');

    this.fileInput.addEventListener('change', e => {
      e.stopPropagation();
      try { this.handleFiles(this.fileInput.files); }
      finally { this.fileInput.value = ''; }
    });
    this.addEventListener('invalid', () => {
      this.showErrors([this.internals.validationMessage]);
    });

    this.container.addEventListener('dragover', e => {
      e.preventDefault();
      if (this.effectiveDisabled) return;
      this.dropZone.classList.add('dragover');
    });
    this.container.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('dragover');
    });
    this.container.addEventListener('drop', e => {
      e.preventDefault();
      if (this.effectiveDisabled) return;
      this.dropZone.classList.remove('dragover');
      const dt = e.dataTransfer;
      if (dt?.files) this.handleFiles(dt.files);
    });

    const actionGroup = document.createElement('div');
    actionGroup.className = 'actions';
    const fileArea = document.createElement('div');
    fileArea.className = 'upload-area';
    this.triggerArea = document.createElement('div');
    this.triggerArea.className = 'trigger-area';
    this.triggerArea.tabIndex = -1;
    this.triggerArea.setAttribute('role', 'group');
    this.triggerArea.setAttribute('aria-labelledby', 'upload-label');
    this.triggerArea.setAttribute('aria-describedby', 'upload-errors');
    this.triggerArea.append(triggerSlot);
    fileArea.append(this.triggerArea, this.dropZone);
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

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (!this.shadowRoot) return;

    switch (name) {
      case 'aria-describedby':
        if (this.isConnected) this._observeDescriptions();
        break;
      case 'aria-invalid':
        this.updateValidity();
        break;
      case 'id':
        this._id = newValue || this.generateId();
        if (this.labelEl) this.labelEl.setAttribute('for', this._id);
        if (this.fileInput) this.fileInput.id = this._id;
        break;
      case 'label':
        this.updateLabelText();
        break;
      case 'msg-drop-text':
        this.updateDropText();
        break;
      case 'msg-remove-text':
      case 'msg-remove-file-label':
        this.updateFileList();
        break;
      case 'msg-required':
        this.updateValidity();
        break;
      case 'disabled':
        this.syncDisabled();
        break;
      case 'multiple':
        this.syncBooleanAttributeToInput('multiple');
        break;
      case 'required':
        this.syncBooleanAttributeToInput('required');
        this.updateValidity();
        break;
      case 'accept':
      case 'form':
      case 'name':
        this.syncAttributeToInput(name);
        if (name === 'name') this.syncFormValue();
        break;
      case 'max-total-size-mb':
        this.updateUsage();
        break;
    }
  }

  connectedCallback() {
    if (Object.hasOwn(this, 'value')) {
      const value = this.value; delete this.value; this.value = value;
    }
    this.updateLabelText();
    this.updateDropText();
    this.updateFileList();
    this.syncFormValue();
    this.updateUsage();
    this.updateValidity();
    this.syncDisabled();
    this._observeDescriptions();
  }

  disconnectedCallback() {
    this._descriptionObserver?.disconnect();
    cancelAnimationFrame(this._announcementFrame);
    this.liveRegion.textContent = '';
    this.revokeAllPreviewUrls();
  }

  get effectiveDisabled() { return this.hasAttribute('disabled') || !!this._formDisabled; }

  _observeDescriptions() {
    this._descriptionObserver?.disconnect();
    if (this.hasAttribute('aria-describedby')) {
      this._descriptionObserver ??= new MutationObserver(() => this._syncDescriptions());
      this._descriptionObserver.observe(this.getRootNode(), {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ['id'],
      });
    }
    this._syncDescriptions();
  }

  _syncDescriptions() {
    const root = this.getRootNode();
    const external = [...new Set((this.getAttribute('aria-describedby') || '').trim().split(/\s+/))]
      .filter(Boolean).map(id => root.getElementById?.(id)).filter(el => el && el !== this);
    // Own controls only: do not overwrite ARIA supplied on a consumer's slotted trigger.
    for (const target of [this.container, this.triggerArea, this.defaultTrigger]) {
      if (typeof target.ariaDescribedByElements !== 'undefined') {
        target.ariaDescribedByElements = [this.errorMessage, this.dropZone, ...external];
      } else {
        if (!this._descriptionMirror) {
          this._descriptionMirror = document.createElement('span');
          this._descriptionMirror.id = 'external-description';
          this._descriptionMirror.hidden = true;
          this.shadowRoot.append(this._descriptionMirror);
        }
        const text = external.map(el => el.textContent).join(' ').trim();
        if (this._descriptionMirror.textContent !== text) this._descriptionMirror.textContent = text;
        target.setAttribute('aria-describedby', 'upload-errors upload-drop' + (text ? ' external-description' : ''));
      }
    }
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    this.syncDisabled();
  }

  syncDisabled() {
    if (!this.triggerArea) return;
    const disabled = this.effectiveDisabled;
    this.fileInput.disabled = disabled;
    this.defaultTrigger.disabled = disabled;
    // Inert applies to the composed subtree without rewriting consumer buttons.
    this.triggerArea.inert = disabled;
    this.container.setAttribute('aria-disabled', String(disabled));
    this.fileList.querySelectorAll('button').forEach(button => { button.disabled = disabled; });
    if (disabled) this.dropZone.classList.remove('dragover');
  }

  updateLabelText() {
    if (this.labelEl) this.labelEl.textContent = this.getAttribute('label') || 'Upload files';
    if (this.defaultTrigger) this.defaultTrigger.textContent = this.labelEl.textContent;
  }

  updateDropText() {
    if (this.dropZone) this.dropZone.textContent = this.getAttribute('msg-drop-text') || 'Drop files here';
  }

  getText(name, fallback) {
    return this.getAttribute(name) || fallback;
  }

  formatMessage(name, fallback, values = {}) {
    const template = this.getText(name, fallback);
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template);
  }

  formatFileError(name, fallbackTemplate, legacySuffix, fileName, values = {}) {
    const customMessage = this.getAttribute(name);
    if (customMessage && customMessage.includes('{')) {
      return this.formatMessage(name, fallbackTemplate, { fileName, ...values });
    }
    return `${fileName} ${customMessage || legacySuffix}`;
  }

  syncAttributeToInput(name) {
    if (!this.fileInput) return;
    const value = this.getAttribute(name);
    if (value === null) this.fileInput.removeAttribute(name);
    else this.fileInput.setAttribute(name, value);
  }

  syncBooleanAttributeToInput(name) {
    if (!this.fileInput) return;
    if (this.hasAttribute(name)) this.fileInput.setAttribute(name, '');
    else this.fileInput.removeAttribute(name);
  }

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
    if (this.effectiveDisabled) return;
    const maxTotalSizeMB = this.limit('max-total-size-mb', 20);
    const maxFiles = Math.min(Math.floor(this.limit('max-files', 5)), this.hasAttribute('multiple') ? Infinity : 1);
    const maxSizeMB = this.limit('max-size-mb', 5);
    const acceptAttr = this.getAttribute('accept');
    const acceptList = acceptAttr ? acceptAttr.toLowerCase().split(',').map(type => type.trim()).filter(Boolean) : [];

    const newFiles = Array.from(fileList || []).filter(file => file instanceof File);
    const validFiles = [];
    const errorMessages = [];

    newFiles.forEach(file => {
      const isValidType = acceptList.length === 0 || acceptList.some(type => {
        if (type.endsWith('/*')) {
          return file.type.toLowerCase().startsWith(type.slice(0, -1));
        }
        return type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : file.type.toLowerCase() === type;
      });
      if (!isValidType) {
        errorMessages.push(this.formatFileError(
          'msg-type-error',
          '{fileName} is not an accepted file type.',
          'is not an accepted file type.',
          file.name
        ));
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        errorMessages.push(this.formatFileError(
          'msg-size-error',
          '{fileName} exceeds the maximum size of {maxSize}MB.',
          `exceeds the maximum size of ${maxSizeMB}MB.`,
          file.name,
          { maxSize: maxSizeMB }
        ));
        return;
      }
      validFiles.push(file);
    });

    const uniqueFiles = [];
    validFiles.forEach(file => {
      if (![...this.files, ...uniqueFiles].some(f => f.name === file.name && f.size === file.size)) uniqueFiles.push(file);
    });

    const slotsLeft = Math.max(0, maxFiles - this.files.length);
    const filesToAdd = uniqueFiles.slice(0, slotsLeft);
    const dropped = uniqueFiles.slice(slotsLeft);

    dropped.forEach(file => {
      errorMessages.push(this.formatFileError(
        'msg-count-error',
        '{fileName} cannot be added. You can only upload up to {maxFiles} files.',
        `You can only upload up to ${maxFiles} files.`,
        file.name,
        { maxFiles }
      ));
    });

    const totalSize = this.files.reduce((sum, f) => sum + f.size, 0) +
                      filesToAdd.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > maxTotalSizeMB * 1024 * 1024) {
      const totalSizeMessage = this.getAttribute('msg-total-size-error')?.includes('{')
        ? this.formatMessage('msg-total-size-error', 'Total file size exceeds limit of {maxTotalSize}MB.', { maxTotalSize: maxTotalSizeMB })
        : `${this.getText('msg-total-size-error', 'Total file size exceeds limit of')} ${maxTotalSizeMB}MB.`;
      errorMessages.push(totalSizeMessage);
      filesToAdd.length = 0;
    }

    this.showErrors(errorMessages);

    if (filesToAdd.length === 0) return;

    this.files.push(...filesToAdd);
    this.updateFileList();
    this.updateUsage();
    this.announce([this.formatMessage('msg-added', '{count} file(s) added.', { count: filesToAdd.length }), ...errorMessages].join(' '));
    this.syncFormValue();
    this.updateValidity();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
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
    cancelAnimationFrame(this._announcementFrame);
    while (this.liveRegion.firstChild) this.liveRegion.removeChild(this.liveRegion.firstChild);
    if (!this.isConnected || !message) return;
    this._announcementFrame = requestAnimationFrame(() => {
      const span = document.createElement('span');
      span.textContent = message;
      this.liveRegion.appendChild(span);
    });
  }

  createFileRow(file) {
    const row = document.createElement('li');
    row.setAttribute('role', 'listitem');
    const preview = document.createElement('div');
    const image = file.type.startsWith('image/');
    const icon = document.createElement(image ? 'img' : 'span');
    icon.className = 'preview';
    if (image) {
      icon.alt = '';
      icon.width = 40;
      icon.height = 40;
    } else {
      icon.textContent = '📄';
      icon.setAttribute('aria-hidden', 'true');
    }
    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = file.name;
    preview.append(icon, name);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'delete';
    button._file = file;
    button.setAttribute('part', 'delete');
    button.addEventListener('click', () => this.removeFile(file));
    row.append(preview, button);
    return row;
  }

  updateFileList() {
    const previousButtons = [...this.fileList.querySelectorAll('button.delete')];
    const focused = this.shadowRoot.activeElement;
    const focusedIndex = previousButtons.indexOf(focused);
    const focusedFile = focused?._file;
    this._fileRows ??= new Map();
    for (const [file, row] of this._fileRows) {
      if (!this.files.includes(file)) { row.remove(); this._fileRows.delete(file); this.revokePreviewUrl(file); }
    }
    this.files.forEach((file, index) => {
      let li = this._fileRows.get(file);
      if (!li) {
        li = this.createFileRow(file);
        this._fileRows.set(file, li);
      }
      const removeBtn = li.querySelector('button.delete');
      const visibleLabel = this.getAttribute('msg-remove-text')?.trim() || 'Remove';
      const requestedName = this.formatMessage('msg-remove-file-label', '{action} {fileName}', { action: visibleLabel, fileName: file.name });
      removeBtn.textContent = visibleLabel;
      // Preserve speech-input matching even when only one label is localized.
      removeBtn.setAttribute('aria-label', requestedName.includes(visibleLabel) ? requestedName : `${visibleLabel} ${requestedName}`);
      removeBtn.disabled = this.effectiveDisabled;
      const img = li.querySelector('img');
      if (img) {
        if (!this.previewUrls.has(file)) this.previewUrls.set(file, URL.createObjectURL(file));
        if (img.src !== this.previewUrls.get(file)) img.src = this.previewUrls.get(file);
      }
      if (this.fileList.children[index] !== li) this.fileList.insertBefore(li, this.fileList.children[index] || null);
    });
    if (focusedIndex >= 0) {
      const buttons = [...this.fileList.querySelectorAll('button.delete')];
      const next = buttons.find(button => button._file === focusedFile)
        || buttons[Math.min(focusedIndex, buttons.length - 1)];
      if (next) next.focus();
      else this.focusTrigger();
    }
  }

  removeFile(file) {
    if (this.effectiveDisabled) return;
    const index = this.files.findIndex(f => f === file || (f.name === file?.name && f.size === file?.size));
    if (index < 0) return;
    const removed = this.files[index];
    this.revokePreviewUrl(removed);
    this.files = this.files.filter((_, i) => i !== index);
    this.updateFileList();
    this.updateUsage();
    this.announce(this.formatMessage('msg-removed', '{fileName} removed.', { fileName: removed.name }));
    this.syncFormValue();
    this.updateValidity();
    this.dispatchEvent(new CustomEvent('remove-file', { bubbles: true, composed: true, detail: removed }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  updateUsage() {
    const maxMB = this.limit('max-total-size-mb', 20);
    const totalMB = this.files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
    this.usageDisplay.textContent = `${totalMB.toFixed(1)}MB / ${maxMB}MB`;
  }

  syncFormValue() {
    const name = this.getAttribute('name');
    if (!name || this.files.length === 0) {
      this.internals.setFormValue(null);
      return;
    }
    const data = new FormData();
    this.files.forEach(file => data.append(name, file, file.name));
    this.internals.setFormValue(data);
  }

  limit(name, fallback) {
    const raw = this.getAttribute(name);
    const value = raw?.trim() ? Number(raw) : NaN;
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  focus(options) {
    if (!this.effectiveDisabled) this.focusTrigger(options);
  }

  focusTrigger(options) {
    const slot = this.shadowRoot.querySelector('slot[name=trigger]');
    const roots = slot.assignedElements({flatten:true});
    const candidates = roots.flatMap(root => [root, ...root.querySelectorAll('button,input,[tabindex]')]);
    const trigger = candidates.find(el => el.matches('button,input,[tabindex]') && !el.matches(':disabled') && el.tabIndex >= 0 && !el.closest('[hidden],[inert]') && el.getClientRects().length && getComputedStyle(el).visibility === 'visible');
    (trigger || this.triggerArea).focus(options);
  }

  updateValidity() {
    const missing = this.hasAttribute('required') && this.files.length === 0;
    const invalid = missing ? 'true' : (this.getAttribute('aria-invalid') || 'false');
    for (const target of [this.container, this.triggerArea, this.defaultTrigger]) target.setAttribute('aria-invalid', invalid);
    if (missing) {
      this.internals.setValidity(
        { valueMissing: true },
        this.getText('msg-required', 'Please select at least one file.'),
        this.triggerArea
      );
      return false;
    }
    this.internals.setValidity({});
    return true;
  }

  checkValidity() { this.updateValidity(); return this.internals.checkValidity(); }
  reportValidity() { this.updateValidity(); return this.internals.reportValidity(); }

  formResetCallback() {
    this.revokeAllPreviewUrls();
    this.files = [];
    this.fileInput.value = '';
    this.showErrors([]);
    this.updateFileList();
    this.updateUsage();
    this.syncFormValue();
    this.updateValidity();
  }

  get value() {
    return [...this.files];
  }

  set value(val) {
    if (Array.isArray(val)) {
      this.files = [...new Set(val.filter(file => file instanceof File))];
      this.fileInput.value = '';
      this.showErrors([]);
      this.updateFileList();
      this.updateUsage();
      this.syncFormValue();
      this.updateValidity();
    }
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-file-upload-${byteArray[0].toString(36)}`;
    }
    return `au-file-upload-${Math.random().toString(36).slice(2)}`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-file-upload')) {
  customElements.define('au-file-upload', AuFileUpload);
}
