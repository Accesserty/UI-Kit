// Base class of the kit's form controls. It joins the element to its <form>
// through ElementInternals and exposes the same validity API as native
// controls. Value, reset, restore and disabled handling stay in each
// component, because they depend on the kind of value it holds.

const VALIDITY_FLAGS = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort',
  'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput'];

export class AuFormElement extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    const internals = this.attachInternals();
    this.internals = internals;
    // Components report their own validity through internals.setValidity. Keep
    // that report so a custom error (setCustomValidity) can sit on top of it and
    // be removed again without losing it, as on a native control.
    const setValidity = internals.setValidity.bind(internals);
    let own = { flags: {}, message: '', anchor: undefined };
    this._customValidity = '';
    this._applyValidity = () => {
      if (!this._customValidity) { setValidity(own.flags, own.message, own.anchor); return; }
      const flags = { customError: true };
      for (const flag of VALIDITY_FLAGS) if (own.flags[flag]) flags[flag] = true;
      setValidity(flags, this._customValidity, own.anchor || this._validityAnchor());
    };
    internals.setValidity = (flags = {}, message = '', anchor) => {
      own = { flags, message, anchor };
      this._applyValidity();
    };
  }

  get form() { return this.internals.form; }

  get validity() { return this.internals.validity; }
  get validationMessage() { return this.internals.validationMessage; }
  get willValidate() { return this.internals.willValidate; }
  checkValidity() { return this.internals.checkValidity(); }
  reportValidity() { return this.internals.reportValidity(); }

  // As on a native control: a non-empty message makes the field invalid with
  // that message (validity.customError); an empty one removes it. The
  // component's own checks, such as required, keep working underneath.
  setCustomValidity(message) {
    this._customValidity = message == null ? '' : String(message);
    this._applyValidity();
  }

  // Where the browser points (and focuses) when it reports a custom error.
  _validityAnchor() {
    return this.shadowRoot?.querySelector('input:not([type=hidden]), textarea, button, [tabindex]') || undefined;
  }
}
