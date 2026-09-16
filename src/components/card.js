class AuCard extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
  }
  render() {
    // Slots update natively. Rebuilding the shell would discard its identity and
    // can interrupt focus in projected controls; repeated render calls are safe.
    if (this._rendered) return;
    this._rendered = true;
    this.shadowRoot.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host { display:block; min-inline-size:0; box-sizing:border-box; }

        .au-card-container { min-inline-size:0; overflow-wrap:anywhere; }
      </style>
      <div class="au-card-container" part="au-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-card')) {
  customElements.define("au-card", AuCard);
}
