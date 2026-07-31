class AuCarousel extends HTMLElement {
  static get observedAttributes() {
    return [
      'data-live-template',
      'data-item-fallback',
      'data-dot-template',
      'data-text-prev',
      'data-text-next',
      'data-text-pagination',
      'data-text-instructions',
      'data-icon-prev',
      'data-icon-next',
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Interactive state that must survive re-renders lives on the instance, so
    // the shell is built ONCE here and only the dots are rebuilt on slotchange
    // (per the UI Kit "build once, then patch" rule for stateful components).
    this._current = -1;
    this._slides = [];
    this._names = [];
    this._dots = [];
    this._settle = null;

    // A slide is "reachable" if it holds something focusable. Exclude disabled
    // controls and tabindex=-1 so interception lands on a real tab stop.
    this._FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])';

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        /* The carousel is its OWN container, so "slides per view" responds to
           the carousel's width, not the viewport. @container rules below target
           descendants, because a container can't style itself. Author-facing
           custom properties live here so slotted (light-DOM) slides inherit
           them — shadow-DOM variables would NOT reach slotted content. */
        container: au-carousel / inline-size;

        --au-carousel-gap: 1rem;
        --au-carousel-visible: 1;                 /* overridden by @container */

        --au-carousel-dot-target: 1.75rem;        /* >=24px focus/click target */
        --au-carousel-dot-size: 0.7rem;           /* visible dot diameter */
        --au-carousel-dot-color: oklch(0.62 0 0); /* >=3:1 on white (WCAG 1.4.11) */
        --au-carousel-dot-current-color: oklch(0.2 0 0);
        --au-carousel-dot-gap: 0.25rem;
        --au-carousel-dot-focus-shadow-width: 3px;
        --au-carousel-dot-focus-shadow-color: oklch(0.55 0.2 256); /* >=3:1 on white */

        --au-carousel-button-size: 2.75rem;       /* >=24px target */
        --au-carousel-button-bg: oklch(0.2 0 0);
        --au-carousel-button-text-color: oklch(0.99 0 0);
        --au-carousel-button-radius: 999px;
        --au-carousel-button-disabled-opacity: 0.35;
        --au-carousel-button-focus-shadow-width: 3px;
        --au-carousel-button-focus-shadow-color: oklch(0.55 0.2 256); /* >=3:1 on white */

        --au-carousel-controls-gap: 0.75rem;
      }
      :host([hidden]) { display: none; }

      /* ---- pagination: one real button per slide, named by its title ---- */
      .au-carousel-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--au-carousel-dot-gap);
        margin-block-end: 0.5rem;
      }
      .au-carousel-dot {
        display: inline-flex;
        inline-size: var(--au-carousel-dot-target);
        block-size: var(--au-carousel-dot-target);
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        /* draw the visible dot inside the larger hit area */
        background-image: radial-gradient(
          circle,
          var(--au-carousel-dot-color) 0 calc(var(--au-carousel-dot-size) / 2),
          transparent calc(var(--au-carousel-dot-size) / 2)
        );
      }
      .au-carousel-dot[aria-current="true"] {
        background-image: radial-gradient(
          circle,
          var(--au-carousel-dot-current-color) 0 calc(var(--au-carousel-dot-size) / 2),
          transparent calc(var(--au-carousel-dot-size) / 2)
        );
      }
      .au-carousel-dot:focus-visible {
        outline: none;
        border-radius: 999px;
        box-shadow: 0 0 0 var(--au-carousel-dot-focus-shadow-width) var(--au-carousel-dot-focus-shadow-color);
      }

      /* ---- the track: scroll-snap, DOM order = reading order ---- */
      .au-carousel-track {
        /* One slide's width, derived from slides-per-view; reused by the
           trailing spacer so the LAST slide can still scroll to the left edge.
           (Slides get their own flex-basis via ::slotted below, because slotted
           light-DOM content does not inherit this shadow-DOM variable.) */
        --au-carousel-slide-basis: calc(
          (100% - (var(--au-carousel-visible) - 1) * var(--au-carousel-gap))
          / var(--au-carousel-visible)
        );
        display: flex;
        gap: var(--au-carousel-gap);
        margin: 0;
        padding: 0;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        /* The host's container-type applies size/layout/style containment but
           NOT paint, so a slotted slide's off-screen width would otherwise leak
           into the document and give the PAGE a horizontal scrollbar. Paint
           containment clips the track's overflow to its own box (the intended
           scroll viewport) while keeping the internal scroll working. It sits on
           the track, not the host, so the dots' and buttons' focus rings — which
           live outside the track — are never clipped. */
        contain: paint;
      }
      @container au-carousel (min-width: 34rem) { .au-carousel-track { --au-carousel-visible: 2; } }
      @container au-carousel (min-width: 52rem) { .au-carousel-track { --au-carousel-visible: 3; } }
      @media (prefers-reduced-motion: reduce) {
        .au-carousel-track { scroll-behavior: auto; }
      }
      /* Trailing space so the last slide can snap to the left edge; without it
         you can't scroll past the end and the last few slides never become
         current. max(0px, …) guards the 1-per-view case (basis == 100%). */
      .au-carousel-track::after {
        content: "";
        flex: 0 0 max(0px, calc(100% - var(--au-carousel-slide-basis) - var(--au-carousel-gap)));
      }

      /* Slides are author-defined light-DOM content: the component only sizes
         and snaps them. Their visual design (cards, images, text) is the
         author's, styled from the light DOM. */
      ::slotted(*) {
        flex: 0 0 100%;
        min-inline-size: 0;
        scroll-snap-align: start;
      }
      @container au-carousel (min-width: 34rem) {
        ::slotted(*) { flex-basis: calc((100% - 1 * var(--au-carousel-gap)) / 2); }
      }
      @container au-carousel (min-width: 52rem) {
        ::slotted(*) { flex-basis: calc((100% - 2 * var(--au-carousel-gap)) / 3); }
      }

      /* ---- prev / next: real buttons after the content ---- */
      .au-carousel-controls {
        display: flex;
        justify-content: center;
        gap: var(--au-carousel-controls-gap);
        margin-block-start: 0.75rem;
      }
      .au-carousel-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--au-carousel-button-size);
        block-size: var(--au-carousel-button-size);
        border: none;
        border-radius: var(--au-carousel-button-radius);
        background: var(--au-carousel-button-bg);
        color: var(--au-carousel-button-text-color);
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
      }
      .au-carousel-button:disabled {
        opacity: var(--au-carousel-button-disabled-opacity);
        cursor: not-allowed;
      }
      .au-carousel-button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 var(--au-carousel-button-focus-shadow-width) var(--au-carousel-button-focus-shadow-color);
      }

      .au-carousel-live,
      .au-carousel-sr-hint {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        border: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }
    `;

    // ---- shell (built once) ----
    this._wrapper = document.createElement('div');
    this._wrapper.className = 'au-carousel';

    // Pagination first: users learn how many slides exist before the content.
    this._pagination = document.createElement('div');
    this._pagination.className = 'au-carousel-pagination';
    this._pagination.setAttribute('role', 'group');

    // Visually-hidden usage hint, associated with the pagination group via
    // aria-describedby so a screen reader hears HOW to operate the dots. Kept
    // outside the pagination element so _rebuild()'s replaceChildren() can't
    // wipe it; the idref still resolves anywhere in this shadow root.
    this._hintId = this.generateId();
    this._hint = document.createElement('div');
    this._hint.className = 'au-carousel-sr-hint';
    this._hint.id = this._hintId;
    this._pagination.setAttribute('aria-describedby', this._hintId);

    // Track holds the single default <slot>; author blocks project in here.
    this._track = document.createElement('div');
    this._track.className = 'au-carousel-track';
    this._slot = document.createElement('slot');
    this._track.appendChild(this._slot);

    // Prev/next after the content, so tab order is dots -> content -> prev/next.
    this._controls = document.createElement('div');
    this._controls.className = 'au-carousel-controls';
    this._prevBtn = document.createElement('button');
    this._prevBtn.type = 'button';
    this._prevBtn.className = 'au-carousel-button';
    this._prevBtn.dataset.carouselPrev = '';
    // Visible glyph only (decorative) — the accessible name comes from the
    // aria-label, so a screen reader never reads this. Overridable via
    // data-icon-prev; applied in _applyText(). Default: single left angle quote.
    this._prevBtn.textContent = '‹';
    this._nextBtn = document.createElement('button');
    this._nextBtn.type = 'button';
    this._nextBtn.className = 'au-carousel-button';
    this._nextBtn.dataset.carouselNext = '';
    this._nextBtn.textContent = '›';
    this._controls.append(this._prevBtn, this._nextBtn);

    // Polite live region announces the current slide on change.
    this._live = document.createElement('div');
    this._live.className = 'au-carousel-live';
    this._live.setAttribute('aria-live', 'polite');
    this._live.setAttribute('aria-atomic', 'true');

    this._wrapper.append(this._pagination, this._track, this._controls, this._live, this._hint);
    this.shadowRoot.append(style, this._wrapper);

    // Bind handlers once so add/removeEventListener share the same references.
    this._onSlotChange = this._onSlotChange.bind(this);
    this._onPaginationKeydown = this._onPaginationKeydown.bind(this);
    this._onPrevKeydown = this._onPrevKeydown.bind(this);
    this._onPrevClick = () => this.slideTo(this._current - 1);
    this._onNextClick = () => this.slideTo(this._current + 1);
    this._onFocusIn = this._onFocusIn.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onSettled = this._onSettled.bind(this);
    this._resizeObserver = new ResizeObserver(() => {
      if (this._current > this._maxIndex()) this.setCurrent(this._maxIndex());
      else this._apply();
    });
    // Watch the author's light-DOM slides for runtime title changes — a
    // framework locale switch that rewrites a slide's data-title or heading text
    // (with no host-attribute change) would otherwise leave the dot names stale.
    // Debounced so a burst of edits rebuilds once; the debounce also coalesces
    // the overlap with slotchange when slides are added or removed.
    this._contentObserver = new MutationObserver(() => {
      clearTimeout(this._contentTimer);
      this._contentTimer = setTimeout(() => {
        if (this.isConnected) this._rebuild();
      }, 100);
    });
  }

  connectedCallback() {
    this._applyText();
    this._slot.addEventListener('slotchange', this._onSlotChange);
    this._pagination.addEventListener('keydown', this._onPaginationKeydown);
    this._prevBtn.addEventListener('click', this._onPrevClick);
    this._nextBtn.addEventListener('click', this._onNextClick);
    this._prevBtn.addEventListener('keydown', this._onPrevKeydown);
    // Focus events on slotted (light-DOM) slides bubble to the host, so listen
    // here rather than on the shadow track.
    this.addEventListener('focusin', this._onFocusIn);
    this._track.addEventListener('scroll', this._onScroll, { passive: true });
    this._resizeObserver.observe(this);
    this._contentObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-title'],
    });
    this._rebuild();
  }

  disconnectedCallback() {
    this._slot.removeEventListener('slotchange', this._onSlotChange);
    this._pagination.removeEventListener('keydown', this._onPaginationKeydown);
    this._prevBtn.removeEventListener('click', this._onPrevClick);
    this._nextBtn.removeEventListener('click', this._onNextClick);
    this._prevBtn.removeEventListener('keydown', this._onPrevKeydown);
    this.removeEventListener('focusin', this._onFocusIn);
    this._track.removeEventListener('scroll', this._onScroll);
    this._resizeObserver.disconnect();
    this._contentObserver.disconnect();
    clearTimeout(this._settle);
    clearTimeout(this._contentTimer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this._applyText();
    // Names/announcements depend on templates; rebuild dots so labels refresh.
    this._rebuild();
  }

  // ---- i18n text (aria-labels + templates) ----
  _applyText() {
    this._prevBtn.setAttribute('aria-label', this.getAttribute('data-text-prev') || 'Previous slide');
    this._nextBtn.setAttribute('aria-label', this.getAttribute('data-text-next') || 'Next slide');
    // Decorative glyphs (screen readers use the aria-labels above). Authors can
    // swap them — a different character, an icon-font glyph, or the flipped
    // chevrons for a right-to-left layout. Set as text, never markup.
    this._prevBtn.textContent = this.getAttribute('data-icon-prev') || '‹';
    this._nextBtn.textContent = this.getAttribute('data-icon-next') || '›';
    this._pagination.setAttribute('aria-label', this.getAttribute('data-text-pagination') || 'Choose a slide');
    this._hint.textContent =
      this.getAttribute('data-text-instructions') ||
      'Use the arrow keys to move between slides.';
  }

  _fill(tpl, name, i) {
    return tpl
      .replaceAll('{title}', name)
      .replaceAll('{current}', String(i + 1))
      .replaceAll('{total}', String(this._slides.length));
  }

  // Resolve a slide's human title: explicit data-title -> its heading ->
  // positional fallback. `real` marks whether a genuine title/heading was found
  // (vs the positional fallback), so the dot label can add "{current} of
  // {total}" to real titles without doubling it onto an already-positional
  // fallback. The plain title is what the live region and slide-change event
  // use for {title}.
  _resolveName(el, i) {
    if (el.dataset && el.dataset.title) return { name: el.dataset.title, real: true };
    const h = el.querySelector && el.querySelector('h1, h2, h3, h4, h5, h6');
    if (h && h.textContent.trim()) return { name: h.textContent.trim(), real: true };
    const fallback = this.getAttribute('data-item-fallback') || 'Item {current} of {total}';
    // Only warn once the element is really unnamed — helps authors add a title
    // without hard-requiring one.
    console.warn(
      `[au-carousel] slide ${i + 1} has no data-title or heading; using a ` +
        `positional label. Add one for a clearer screen-reader name.`
    );
    return { name: this._fill(fallback, '', i), real: false };
  }

  // ---- (re)build the dots from the slotted slides ----
  _rebuild() {
    this._slides = this._slot.assignedElements();
    const total = this._slides.length;
    const resolved = this._slides.map((el, i) => this._resolveName(el, i));
    // Plain titles for the live region / event; position-bearing labels for the
    // dots so each dot announces "{title}, {current} of {total}".
    this._names = resolved.map((r) => r.name);
    const dotTemplate = this.getAttribute('data-dot-template') || '{title}, {current} of {total}';
    this._dotLabels = resolved.map((r, i) => (r.real ? this._fill(dotTemplate, r.name, i) : r.name));

    // A rebuild may fire while a dot is focused (e.g. a runtime locale switch
    // that re-renders titles); remember which so focus can be restored after
    // replaceChildren() destroys the old dots.
    const focusedDot = this._dots.indexOf(this.shadowRoot.activeElement);

    // Rebuild the dot row (shell) from the current slides.
    this._pagination.replaceChildren();
    this._dots = this._dotLabels.map((label, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'au-carousel-dot';
      b.setAttribute('aria-label', label);
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener('click', () => {
        this._setRoving(i);
        this.slideTo(i);
      });
      this._pagination.appendChild(b);
      return b;
    });

    if (!total) {
      this._current = -1;
      this._prevBtn.disabled = true;
      this._nextBtn.disabled = true;
      return;
    }
    // Re-anchor current within the new range (0 on first build). Update the
    // shell directly rather than via setCurrent() so a rebuild never fires the
    // live region or a slide-change event — those belong to user navigation.
    this._current = this._current < 0 ? 0 : Math.min(this._current, this._maxIndex());
    this._apply();
    if (focusedDot >= 0 && this._dots[focusedDot]) this._dots[focusedDot].focus();
  }

  /**
   * Re-read the slotted slides and rebuild the dots. Call this after changing a
   * slide's `data-title` or heading text at runtime (e.g. a framework locale
   * switch), since those live in author light-DOM and are not observed
   * attributes of the host. Content that changes a host attribute or adds/removes
   * slides refreshes on its own; this covers the "only the titles changed" case.
   */
  refresh() {
    this._rebuild();
  }

  // How many slides show at once (from the @container rules).
  visibleCount() {
    const raw = parseInt(getComputedStyle(this._track).getPropertyValue('--au-carousel-visible'), 10);
    return Math.max(1, raw || 1);
  }

  // The trailing spacer lets ANY slide scroll to the left edge, so prev/next and
  // the current dot can reach the very last slide.
  _maxIndex() {
    return Math.max(0, this._slides.length - 1);
  }

  // Roving tabindex: exactly ONE dot is ever a tab stop.
  _setRoving(i) {
    const idx = Math.max(0, Math.min(this._slides.length - 1, i));
    this._dots.forEach((d, j) => {
      d.tabIndex = j === idx ? 0 : -1;
    });
  }

  _firstFocusable(i) {
    const el = this._slides[i];
    return el && el.querySelector ? el.querySelector(this._FOCUSABLE) : null;
  }

  _apply() {
    // Every slide stays a normal tab stop AND readable (no inert / no tabindex
    // removal), so a keyboard or screen-reader user can move through ALL slides
    // both ways — the carousel scrolls to follow focus. Landing on the CURRENT
    // slide when entering from a control is done by interception, not by taking
    // other slides out of the tab order.
    this._dots.forEach((d, j) => {
      d.setAttribute('aria-current', j === this._current ? 'true' : 'false');
    });
    this._prevBtn.disabled = this._current <= 0;
    this._nextBtn.disabled = this._current >= this._maxIndex();
    // Keep the tab stop on the current dot only when focus is OUTSIDE the dot
    // group; while the user is arrowing inside it, leave their focus alone.
    if (!this._pagination.contains(this.shadowRoot.activeElement)) {
      this._setRoving(this._current);
    }
  }

  setCurrent(i) {
    const idx = Math.max(0, Math.min(this._maxIndex(), i));
    const changed = idx !== this._current;
    this._current = idx;
    this._apply();
    if (changed && this._slides.length) {
      // A focused dot already announces its own "{title}, {current} of {total}"
      // name, so skip the live region then to avoid a double announcement. It
      // still fires for prev/next, swipe/scroll and programmatic changes.
      if (!this._pagination.contains(this.shadowRoot.activeElement)) {
        const tpl = this.getAttribute('data-live-template') || '{title}, item {current} of {total}';
        this._live.textContent = this._fill(tpl, this._names[idx], idx);
      }
      this.dispatchEvent(
        new CustomEvent('slide-change', {
          bubbles: true,
          composed: true,
          detail: { index: idx, total: this._slides.length, title: this._names[idx] },
        })
      );
    }
  }

  slideTo(i) {
    if (!this._slides.length) return;
    const idx = Math.max(0, Math.min(this._maxIndex(), i));
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    this._slides[idx].scrollIntoView({ behavior, inline: 'start', block: 'nearest' });
    this.setCurrent(idx);
  }

  // ---- event handlers ----
  _onSlotChange() {
    this._rebuild();
  }

  _onPaginationKeydown(e) {
    const idx = this._dots.indexOf(this.shadowRoot.activeElement);
    if (idx < 0) return;
    // Tab forward out of the dots enters the content at the CURRENT slide.
    if (e.key === 'Tab' && !e.shiftKey) {
      const target = this._firstFocusable(this._current);
      if (target) {
        e.preventDefault();
        target.focus();
      }
      return;
    }
    const last = this._slides.length - 1;
    let to = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = Math.min(last, idx + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = Math.max(0, idx - 1);
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = last;
    if (to === null) return;
    e.preventDefault();
    this._setRoving(to);
    this._dots[to].focus();
    this.slideTo(to);
  }

  _onPrevKeydown(e) {
    // Shift+Tab back from the prev button (buttons sit after the content) should
    // enter the content at the CURRENT slide, not the last visible one.
    if (e.key !== 'Tab' || !e.shiftKey) return;
    const target = this._firstFocusable(this._current);
    if (target) {
      e.preventDefault();
      target.focus();
    }
  }

  _onFocusIn(e) {
    // Tab / Shift+Tab through slide content: if focus lands on a slide that is
    // off-screen, scroll it into view (a visible slide is left where it is).
    const li = this._slides.find((s) => s === e.target || (s.contains && s.contains(e.target)));
    if (!li) return;
    const i = this._slides.indexOf(li);
    if (i < this._current || i >= this._current + this.visibleCount()) this.slideTo(i);
  }

  _onScroll() {
    clearTimeout(this._settle);
    this._settle = setTimeout(this._onSettled, 120);
  }

  // Current = the left-most slide in view, read from the scroll position when
  // scrolling settles (deterministic for N-per-view; no mid-scroll chatter).
  _onSettled() {
    if (this._slides.length < 1) return;
    const stride =
      this._slides.length > 1
        ? this._slides[1].offsetLeft - this._slides[0].offsetLeft
        : this._slides[0].offsetWidth;
    this.setCurrent(stride > 0 ? Math.round(this._track.scrollLeft / stride) : 0);
  }

  // ---- public properties ----
  get current() {
    return this._current;
  }
  set current(val) {
    this.slideTo(val);
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-carousel-${byteArray[0].toString(36)}`;
    }
    return `au-carousel-${Math.random().toString(36).slice(2)}`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-carousel')) {
  customElements.define('au-carousel', AuCarousel);
}
