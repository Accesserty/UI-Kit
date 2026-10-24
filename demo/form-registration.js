// Application code for the event registration case.
//
// This file does only what UI Kit does not: validation rules and messages,
// the error summary, moving focus on submit, the success message and reset.
// Labels, required state, forwarding aria-describedby and aria-invalid to the
// inner controls, and the submitted and reset values are handled by the
// components.
(() => {
  const form = document.getElementById('registration');
  const summary = document.getElementById('error-summary');
  const summaryTitle = document.getElementById('error-summary-title');
  const summaryList = document.getElementById('error-summary-list');
  const status = document.getElementById('form-status');
  const result = document.getElementById('form-result');

  // Each field: the component's id, its name in the error summary, and a check
  // that returns the error message (or an empty string). The checks read the
  // component's validity, as they would on a native field.
  const fields = [
    {
      id: 'reg-name', label: 'Name',
      check: el => (el.validity.valueMissing || !el.value.trim() ? 'Enter your name.' : ''),
    },
    {
      id: 'reg-email', label: 'Email',
      check: el => (el.validity.valueMissing ? 'Enter your email address.'
        : el.validity.typeMismatch ? 'Enter an email address in the correct format, like name@example.com.' : ''),
    },
    {
      id: 'reg-meal', label: 'Meal',
      check: el => (el.validity.valueMissing ? 'Choose a meal.' : ''),
    },
    {
      id: 'reg-terms', label: 'Event terms',
      check: el => (el.validity.valueMissing ? 'Agree to the event terms to register.' : ''),
    },
  ];

  // Fields are re-checked on change only after the first submit, so nobody
  // sees errors before they have finished filling in the form.
  let submitted = false;
  let statusTimer = 0;

  // Clear, then write shortly after: writing the same text again is not
  // announced a second time.
  function announce(message) {
    clearTimeout(statusTimer);
    status.textContent = '';
    statusTimer = setTimeout(() => { status.textContent = message; }, 100);
  }

  // Write the message into the element next to the field (the component
  // references it with aria-describedby) and set aria-invalid. With no error
  // the text is cleared: a referenced element is read even when hidden.
  function show(field, message) {
    const el = document.getElementById(field.id);
    document.getElementById(`${field.id}-error`).textContent = message;
    if (message) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function validate(field) {
    const message = field.check(document.getElementById(field.id));
    show(field, message);
    return message;
  }

  function hideSummary() {
    summary.hidden = true;
    summaryList.replaceChildren();
  }

  // On submit the summary is shown and focused; while fields are corrected it
  // is only updated, without taking focus.
  function showSummary(errors, { focus }) {
    summaryTitle.textContent = errors.length === 1 ? 'There is 1 problem to fix' : `There are ${errors.length} problems to fix`;
    summaryList.replaceChildren(...errors.map(({ field, message }) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${field.id}`;
      link.textContent = `${field.label}: ${message}`;
      // The link puts focus on the field itself rather than only scrolling to it.
      link.addEventListener('click', event => {
        event.preventDefault();
        document.getElementById(field.id).focus();
      });
      item.append(link);
      return item;
    }));
    summary.hidden = false;
    if (focus) summary.focus();
  }

  const currentErrors = () => fields
    .map(field => ({ field, message: document.getElementById(`${field.id}-error`).textContent }))
    .filter(e => e.message);

  for (const field of fields) {
    document.getElementById(field.id).addEventListener('change', () => {
      if (!submitted) return;
      validate(field);
      if (summary.hidden) return;
      const remaining = currentErrors();
      if (remaining.length) showSummary(remaining, { focus: false });
      else hideSummary();
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    submitted = true;
    clearTimeout(statusTimer);
    status.textContent = '';
    result.hidden = true;
    const errors = fields.map(field => ({ field, message: validate(field) })).filter(e => e.message);
    if (errors.length) {
      showSummary(errors, { focus: true });
      return;
    }
    hideSummary();
    // The components take part in the form through ElementInternals, so
    // FormData has their values.
    const data = new FormData(form);
    const rows = [['Name', data.get('name')], ['Email', data.get('email')], ['Meal', data.get('meal')],
      ['Notes', data.get('notes') || '(none)'], ['Agreed to the terms', data.get('terms') ? 'Yes' : 'No']];
    result.querySelector('dl').replaceChildren(...rows.flatMap(([term, value]) => {
      const dt = document.createElement('dt'); dt.textContent = term;
      const dd = document.createElement('dd'); dd.textContent = value;
      return [dt, dd];
    }));
    result.hidden = false;
    // Focus stays on the submit button, which is still there; the success
    // message is announced by role="status".
    announce('Registration complete. This is a demo page; nothing was sent.');
  });

  // A native reset restores the components' initial values; the
  // application clears its own errors, summary and messages.
  form.addEventListener('reset', () => {
    submitted = false;
    for (const field of fields) show(field, '');
    hideSummary();
    clearTimeout(statusTimer);
    status.textContent = '';
    result.hidden = true;
  });
})();
