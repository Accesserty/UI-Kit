/**
 * 1. Component Configuration Data
 */
const COMPONENT_CONFIGS = [
  // --- TAB 1: Button ---
  {
    id: 'button',
    label: 'Button',
    previewHTML: `
      <div class="your-custom-button-classname">
        <button class="btn" data-size="small">Small Button</button>
        <button class="btn">Default Button</button>
        <button class="btn" data-size="large">Large Button</button>
        <button class="btn a11y">A11y Button</button>
      </div>
    `,
    groups: [
      {
        title: "Base Layout & Border",
        selector: ".your-custom-button-classname",
        vars: [
          { name: "--au-btn-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-btn-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-btn-padding-horizontal", default: "1rem", type: "size" },
          { name: "--au-btn-border-width", default: "1px", type: "size" },
          { name: "--au-btn-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "double", "none"] },
          { name: "--au-btn-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-btn-border-radius", default: "0rem", type: "size" }, // 使用 0rem 讓引擎偵測單位
        ]
      },
      {
        title: "Typography",
        selector: ".your-custom-button-classname",
        vars: [
          { name: "--au-btn-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-btn-text-size", default: "1rem", type: "size" },
          { name: "--au-btn-text-line-height", default: "1.5", type: "size" },
          { name: "--au-btn-text-family", default: "'Helvetica, Arial, sans-serif, system-ui'", type: "text" },
        ]
      },
      {
        title: "Interactive States",
        selector: ".your-custom-button-classname",
        vars: [
          { name: "--au-btn-hover-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-btn-hover-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-btn-active-bg", default: "oklch(0.8689 0 0)", type: "color" },
          { name: "--au-btn-active-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-btn-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-btn-focus-shadow-color", default: "oklch(0.8315 0.15681888825079074 78.05241467152487)", type: "color" },
        ]
      },
      {
        title: "Size Variants",
        selector: ".your-custom-button-classname",
        vars: [
          // Small
          { name: "--au-btn-small-padding-vertical", default: "0.25rem", type: "size" },
          { name: "--au-btn-small-padding-horizontal", default: "0.375rem", type: "size" },
          // Large
          { name: "--au-btn-large-padding-vertical", default: "1rem", type: "size" },
          { name: "--au-btn-large-padding-horizontal", default: "1.625rem", type: "size" },
          { name: "--au-btn-large-text-size", default: "1.25rem", type: "size" },
        ]
      },
      {
        title: "Accessibility (A11y Class)",
        selector: ".your-custom-button-classname",
        vars: [
          { name: "--au-btn-a11y-text-shadow", default: "none", type: "text" },
          { name: "--au-btn-a11y-bg-image", default: "none", type: "text" },
          { name: "--au-btn-a11y-bg-size", default: "1.5rem 1.5rem", type: "text" },
          { name: "--au-btn-a11y-bg-position", default: "center center", type: "text" },
          { name: "--au-btn-a11y-hover-bg-image", default: "none", type: "text" },
          { name: "--au-btn-a11y-active-bg-image", default: "none", type: "text" },
        ]
      }
    ]
  },

  // --- TAB 2: Select ---
  {
    id: 'select',
    label: 'Select',
    previewHTML: `
      <p>CSS Variables = Button Styles</p>
      <div class="your-custom-select-classname">
      
        <select id="general-select" data-size="small">
          <option value="small" selected>Small Button</option>
          <option value="medium">Medium Button</option>
          <option value="large">Large Button</option>
        </select>

        <select id="general-select">
          <option value="small">Small Button</option>
          <option value="medium" selected>Medium Button</option>
          <option value="large">Large Button</option>
        </select>

        <select id="general-select" data-size="large">
          <option value="small">Small Button</option>
          <option value="medium">Medium Button</option>
          <option value="large" selected>Large Button</option>
        </select>

        <select>
          <button>
            <selectedcontent></selectedcontent>
          </button>
          <div>
            <div role="group">
              <label>Group1</label>
              <option value="a">group1-1</option>
              <option value="b">group1-2</option>
              <option value="c">group1-3</option>
            </div>
            <div role="group">
              <label>Group2</label>
              <option value="d">group2-1</option>
              <option value="e">group2-2</option>
              <option value="f">group2-3</option>
            </div>
          </div>
        </select>
      </div>
    `,
    groups: [
      {
        title: "Popover",
        selector: ".your-custom-select-classname",
        vars: [
          { name: "--au-select-picker-border-width", default: "1px", type: "size" },
          { name: "--au-select-picker-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "double", "none"] },
          { name: "--au-select-picker-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-select-picker-border-radius", default: "0.25rem", type: "size" },
          { name: "--au-select-picker-bg", default: "oklch(0.994 0 0)", type: "color" },
        ]
      },
      {
        title: "Group",
        selector: ".your-custom-select-classname",
        vars: [
          { name: "--au-group-label-padding-top", default: "0.25rem", type: "size" },
          { name: "--au-group-label-padding-right", default: "0.375rem", type: "size" },
          { name: "--au-group-label-padding-bottom", default: "0.25rem", type: "size" },
          { name: "--au-group-label-padding-left", default: "0.375rem", type: "size" },
          { name: "--au-group-label-large-text-size", default: "0.875rem", type: "size" },
          { name: "--au-group-label-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-group-label-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-group-label-border-width", default: "1px", type: "size" },
          { name: "--au-group-label-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "double", "none"] },
          { name: "--au-group-label-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-group-label-border-radius", default: "0.25rem", type: "size" },
        ]
      },
      {
        title: "Option",
        selector: ".your-custom-select-classname",
        vars: [
          { name: "--au-option-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-option-padding-top", default: "0.375rem", type: "size" },
          { name: "--au-option-padding-bottom", default: "0.625rem", type: "size" },
          { name: "--au-option-padding-left", default: "0.375rem", type: "size" },
          { name: "--au-option-padding-right", default: "2.675rem", type: "size" },
          { name: "--au-option-hover-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-option-hover-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-option-active-bg", default: "oklch(0.8689 0 0)", type: "color" },
          { name: "--au-option-active-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-option-checked-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-option-checked-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-option-focus-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-checkmark-padding-top", default: "0.375rem", type: "size" },
        ]
      }
    ]
  },

  // --- TAB 3: Accordion ---
  {
    id: 'accordion',
    label: 'Accordion',
    previewHTML: `
      <div class="your-custom-accordion-classname">
        <au-accordion>
          <au-accordion-item>
            <div slot="heading">Accordion Item 1</div>
            <div slot="sub">Subtitle or helper text</div>
            <div slot="icon">
              <span aria-hidden="true" style="font-size: 1.25em; line-height: 1;">+</span>
            </div>
            <div slot="content">
              <p>This is the content for the first accordion item. It is hidden by default.</p>
            </div>
          </au-accordion-item>
          <au-accordion-item open>
            <div slot="heading">Accordion Item 2 (Open)</div>
             <div slot="icon">
              <span aria-hidden="true" style="font-size: 1.25em; line-height: 1;">+</span>
            </div>
            <div slot="content">
              <p>This item is open by default using the \`open\` attribute.</p>
              <p>You can customize styles using the controls on the left.</p>
            </div>
          </au-accordion-item>
          <au-accordion-item>
            <div slot="heading">Accordion Item 3</div>
             <div slot="icon">
              <span aria-hidden="true" style="font-size: 1.25em; line-height: 1;">+</span>
            </div>
            <div slot="content">
              <p>Another item to demonstrate the list effect.</p>
            </div>
          </au-accordion-item>
        </au-accordion>
      </div>
    `,
    groups: [
      {
        title: "Heading Layout",
        selector: ".your-custom-accordion-classname",
        vars: [
          { name: "--au-accordion-item-margin-bottom", default: "1rem", type: "size" },
          { name: "--au-accordion-heading-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-accordion-heading-padding-horizontal", default: "1rem", type: "size" },
        ]
      },
      {
        title: "Heading Typography",
        selector: ".your-custom-accordion-classname",
        vars: [
          { name: "--au-accordion-heading-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-accordion-heading-text-size", default: "1rem", type: "size" },
          { name: "--au-accordion-heading-text-family", default: "'Helvetica, Arial, sans-serif, system-ui'", type: "text" },
          { name: "--au-accordion-heading-text-line-height", default: "1.5", type: "size" },
        ]
      },
      {
        title: "Heading Border",
        selector: ".your-custom-accordion-classname",
        vars: [
          { name: "--au-accordion-heading-border-width", default: "1px", type: "size" },
          { name: "--au-accordion-heading-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "none"] },
          { name: "--au-accordion-heading-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-accordion-heading-border-radius", default: "0.25rem", type: "size" },
        ]
      },
      {
        title: "Heading Backgrounds & State",
        selector: ".your-custom-accordion-classname",
        vars: [
          { name: "--au-accordion-heading-bg", default: "transparent", type: "color" },
          { name: "--au-accordion-heading-hover-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-accordion-heading-hover-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-accordion-heading-active-bg", default: "oklch(0.8689 0 0)", type: "color" },
          { name: "--au-accordion-heading-active-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-accordion-heading-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-accordion-heading-focus-shadow-color", default: "oklch(0.8315 0.1568 78.05)", type: "color" },
        ]
      },
      {
        title: "Content Area",
        selector: ".your-custom-accordion-classname",
        vars: [
          { name: "--au-accordion-content-bg", default: "oklch(0.9731 0 0)", type: "color" },
          { name: "--au-accordion-content-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-accordion-content-padding-top", default: "1rem", type: "size" },
          { name: "--au-accordion-content-padding-right", default: "1rem", type: "size" },
          { name: "--au-accordion-content-padding-bottom", default: "1rem", type: "size" },
          { name: "--au-accordion-content-padding-left", default: "1rem", type: "size" },
          { name: "--au-accordion-content-border-radius", default: "0rem", type: "size" },
        ]
      }
    ]
  },

  // --- TAB 4: Breadcrumbs ---
  {
    id: 'breadcrumbs',
    label: 'Breadcrumbs',
    previewHTML: `
      <div class="your-custom-breadcrumbs-classname">
        <h3>With Separator Attribute</h3>
        <au-breadcrumbs separator="/" items='[{"text":"Home","href":"/"},{"text":"Library","href":"/library"},{"text":"Data"}]'></au-breadcrumbs>

        <h3>With Slotted Icons</h3>
        <au-breadcrumbs items='[{"text":"Home","href":"/"},{"text":"Category","href":"/category"},{"text":"Subcategory"}]'>
          <span slot="icon-0">🏠</span>
          <span slot="icon-1">📂</span>
          <span slot="icon-2">📄</span>
        </au-breadcrumbs>
      </div>
    `,
    groups: [
      {
        title: "Layout & Background",
        selector: ".your-custom-breadcrumbs-classname",
        vars: [
          { name: "--au-breadcrumbs-bg", default: "oklch(0.9731 0 0)", type: "color" },
          { name: "--au-breadcrumbs-link-padding-vertical", default: "0.25rem", type: "size" },
          { name: "--au-breadcrumbs-link-padding-horizontal", default: "0.5rem", type: "size" },
        ]
      },
      {
        title: "Typography & Links",
        selector: ".your-custom-breadcrumbs-classname",
        vars: [
          { name: "--au-breadcrumbs-text-size", default: "1rem", type: "size" },
          { name: "--au-breadcrumbs-text-deco", default: "none", type: "text" },
          { name: "--au-breadcrumbs-link-color", default: "oklch(0.437 0 0)", type: "color" },
          { name: "--au-breadcrumbs-link-visited-color", default: "oklch(0.437 0 0)", type: "color" },
          { name: "--au-breadcrumbs-link-currentpage-color", default: "oklch(0.1398 0 0)", type: "color" },
        ]
      },
      {
        title: "Focus State",
        selector: ".your-custom-breadcrumbs-classname",
        vars: [
          { name: "--au-breadcrumbs-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-breadcrumbs-focus-shadow-color", default: "oklch(0.8315 0.1568 78.05)", type: "color" },
        ]
      }
    ]
  },

  // --- TAB 5: Checkbox ---
  {
    id: 'checkbox',
    label: 'Checkbox',
    previewHTML: `
      <div class="your-custom-checkbox-classname">
        <h3>States</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <au-checkbox name="demo-cb" value="1">Unchecked</au-checkbox>
          <au-checkbox name="demo-cb" value="2" checked>Checked</au-checkbox>
          <au-checkbox name="demo-cb" value="3" disabled>Disabled</au-checkbox>
          <au-checkbox name="demo-cb" value="4" checked disabled>Checked & Disabled</au-checkbox>
        </div>
      </div>
    `,
    groups: [
      {
        title: "Layout & Input Box",
        selector: ".your-custom-checkbox-classname",
        vars: [
          { name: "--au-checkbox-padding", default: "0.25rem", type: "size" },
          { name: "--au-checkbox-content-gap", default: "0.375rem", type: "size" },
          { name: "--au-checkbox-input-width", default: "1.5rem", type: "size" },
          { name: "--au-checkbox-input-height", default: "1.5rem", type: "size" },
          { name: "--au-checkbox-input-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-checkbox-input-border-width", default: "1px", type: "size" },
          { name: "--au-checkbox-input-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "none"] },
          { name: "--au-checkbox-input-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-checkbox-input-border-radius", default: "0.25rem", type: "size" },
        ]
      },
      {
        title: "Checked State",
        selector: ".your-custom-checkbox-classname",
        vars: [
          { name: "--au-checkbox-input-checked-bg", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-checkbox-input-checked-symbol", default: "'✔︎'", type: "text" },
          { name: "--au-checkbox-input-checked-text-color", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-checkbox-input-checked-text-size", default: "1.125rem", type: "size" },
        ]
      },
      {
        title: "Label & Typography",
        selector: ".your-custom-checkbox-classname",
        vars: [
          { name: "--au-checkbox-label-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-checkbox-label-text-size", default: "1rem", type: "size" },
          { name: "--au-checkbox-label-hover-text-deco", default: "underline", type: "text" },
          { name: "--au-checkbox-label-active-text-color", default: "oklch(0.537 0 0)", type: "color" },
          { name: "--au-checkbox-label-disabled-text-color", default: "oklch(0.537 0 0)", type: "color" },
        ]
      },
      {
        title: "Focus State",
        selector: ".your-custom-checkbox-classname",
        vars: [
          { name: "--au-checkbox-input-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-checkbox-input-focus-shadow-color", default: "oklch(0.8315 0.1568 78.05)", type: "color" },
        ]
      }
    ]
  },

  // --- TAB 6: Tabs (Dogfooding: Testing the tabs component itself) ---
  {
    id: 'tabs',
    label: 'Tabs',
    previewHTML: `
      <div class="your-custom-tab-classname">
        <au-tabs id="preview-tabs">
          <div class="au-tab-panel" slot="panel" label="Home" data-prefix="🏠">
            <p>Welcome to the Home tab.</p>
          </div>
          <div class="au-tab-panel" slot="panel" label="Profile" data-badge="New">
            <p>This is the Profile tab content.</p>
          </div>
          <div class="au-tab-panel" slot="panel" label="Settings">
            <p>Settings configuration.</p>
          </div>
        </au-tabs>
      </div>
    `,
    groups: [
      {
        title: "Tabs Container & List",
        selector: ".your-custom-tab-classname",
        targetId: "preview-tabs",
        vars: [
          { name: "--au-tabs-bg", default: "oklch(0.9731 0 0)", type: "color" },
          { name: "--au-tabs-border-width", default: "1px", type: "size" },
          { name: "--au-tabs-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "none"] },
          { name: "--au-tabs-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-tabs-border-radius", default: "0rem", type: "size" },
          { name: "--au-tabs-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-tabs-padding-horizontal", default: "1rem", type: "size" },
        ]
      },
      {
        title: "Selected State",
        selector: ".your-custom-tab-classname",
        targetId: "preview-tabs",
        vars: [
          { name: "--au-tabs-selected-bg", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-tabs-selected-text-color", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-tabs-selected-shadow-width", default: "1px", type: "size" },
          { name: "--au-tabs-selected-shadow-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-tabs-selected-text-stroke-width", default: "0.5px", type: "size" },
          { name: "--au-tabs-selected-text-stroke-color", default: "oklch(0.994 0 0)", type: "color" },
        ]
      },
      {
        title: "Interactions (Hover/Active)",
        selector: ".your-custom-tab-classname",
        targetId: "preview-tabs",
        vars: [
          { name: "--au-tabs-hover-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-tabs-active-bg", default: "oklch(0.8689 0 0)", type: "color" },
          { name: "--au-tabs-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-tabs-focus-shadow-color", default: "oklch(0.8315 0.1568 78.05)", type: "color" },
        ]
      },
      {
        title: "Typography",
        selector: ".your-custom-tab-classname",
        targetId: "preview-tabs",
        vars: [
          { name: "--au-tabs-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-tabs-text-size", default: "1rem", type: "size" },
          { name: "--au-tabs-text-family", default: "'Helvetica, Arial, sans-serif, system-ui'", type: "text" },
        ]
      },
      {
        title: "Panels & Badges",
        selector: ".your-custom-tab-panel-classname",
        targetId: "preview-tabs",
        vars: [
          { name: "--au-tabpanels-border-width", default: "1px", type: "size" },
          { name: "--au-tabpanels-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted"] },
          { name: "--au-tabpanels-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-tab-panel-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-tab-panel-padding-horizontal", default: "1rem", type: "size" },
          { name: "--au-tab-badge-bg", default: "oklch(0.8689 0 0)", type: "color" },
          { name: "--au-tab-badge-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-tab-badge-border-radius", default: "0.75rem", type: "size" },
        ]
      }
    ]
  },

  // --- TAB 7: Dialog ---
  {
    id: 'dialog',
    label: 'Dialog',
    previewHTML: `
      <div>
        <button class="btn" onclick="document.getElementById('dialog-playground').showModal()">Open Dialog</button>
      </div>
      <dialog id="dialog-playground" class="your-custom-dialog-classname">
        <form method="dialog">
          <h3>Dialog Playground Title</h3>
          <p>This is a native HTML dialog component.</p>
          <p>You can customize styles using the controls on the left.</p>
          <div class="spacer"></div>
          <button class="btn" value="cancel">Cancel</button>
          <button class="btn" value="confirm" autofocus>Confirm</button>
        </form>
      </dialog>
    `,
    groups: [
      {
        title: "Text & Background",
        selector: '.your-custom-dialog-classname',
        vars: [
          { name: "--au-dialog-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-dialog-text-color", default: "oklch(0.1398 0 0)", type: "color" },
        ]
      },
      {
        title: "Border & Radius",
        selector: '.your-custom-dialog-classname',
        vars: [
          { name: "--au-dialog-border-width", default: "1px", type: "size" },
          { name: "--au-dialog-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "double", "none"] },
          { name: "--au-dialog-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-dialog-border-radius", default: "0.5rem", type: "size" },
        ]
      },
      {
        title: "Size & Spacing",
        selector: '.your-custom-dialog-classname',
        vars: [
          { name: "--au-dialog-padding", default: "1.5rem", type: "size" },
          { name: "--au-dialog-max-width", default: "calc(100% - 2rem)", type: "text" },
          { name: "--au-dialog-max-height", default: "calc(100% - 2rem)", type: "text" },
        ]
      },
      {
        title: "Shadow & Z-Index",
        selector: '.your-custom-dialog-classname',
        vars: [
          { name: "--au-dialog-shadow", default: "0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)", type: "text" },
          { name: "--au-dialog-z-index", default: "1000", type: "text" },
        ]
      },
      {
        title: "Backdrop",
        selector: '.your-custom-dialog-classname',
        vars: [
          { name: "--au-dialog-backdrop-bg", default: "oklch(0 0 0 / 0.5)", type: "color" },
          { name: "--au-dialog-backdrop-blur", default: "2px", type: "size" },
        ]
      }
    ]
  },

  // --- TAB 8: Dropdown ---
  {
    id: 'dropdown',
    label: 'Dropdown',
    previewHTML: `
      <p>CSS Variables = Button Styles</p>
      <au-dropdown class="your-custom-dropdown-classname">
        <span slot="trigger">Custom Dropdown</span>
        <au-dropdown-item value="1">Action 1</au-dropdown-item>
        <au-dropdown-item value="2">Action 2</au-dropdown-item>
        <hr />
        <au-dropdown-item value="3">Action 3 (Separated)</au-dropdown-item>
      </au-dropdown>
    `,
    groups: [
      {
        title: "Menu Container",
        selector: '.your-custom-dropdown-classname',
        vars: [
          { name: "--au-dropdown-menu-bg", default: "oklch(1 0 0)", type: "color" },
          { name: "--au-dropdown-menu-border-width", default: "1px", type: "size" },
          { name: "--au-dropdown-menu-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "double", "none"] },
          { name: "--au-dropdown-menu-border-color", default: "oklch(0.8 0 0)", type: "color" },
          { name: "--au-dropdown-menu-border-radius", default: "0rem", type: "size" },
        ]
      },
      {
        title: "Menu Items",
        selector: '.your-custom-dropdown-classname',
        vars: [
          { name: "--au-dropdown-item-color", default: "oklch(0.2 0 0)", type: "color" },
          { name: "--au-dropdown-item-hover-bg", default: "oklch(0.95 0 0)", type: "color" },
          { name: "--au-dropdown-item-hover-color", default: "oklch(0.1 0 0)", type: "color" },
          { name: "--au-dropdown-item-padding", default: "0.5rem 1rem", type: "text" },
        ]
      }
    ]
  },

  // --- TAB 9: File Upload ---
  {
    id: 'file-upload',
    label: 'File Upload',
    previewHTML: `
      <div class="your-custom-file-upload-classname" style="padding: 1rem;">
        <au-file-upload label="Upload Files" multiple required max-files="3" max-size-mb="2" max-total-size-mb="2"
          accept=".txt, .jpg,.png,application/pdf" msg-button-text="Click button or drag & drop files to upload"
          msg-drop-text="Drag & drop files here" msg-remove-text="Delete"
          msg-required="You must upload at least one document." msg-type-error="is not a supported file format"
          msg-size-error="is too large. Limit is" msg-count-error="You can only attach up to"
          msg-total-size-error="Total Size: ">
          <button slot="trigger" class="btn">Choose file...</button>
          <div slot="hint">.txt, .jpg, .png, application/pdf</div>
        </au-file-upload>
      </div>
    `,
    groups: [
      {
        title: "Label Styles",
        selector: '.your-custom-file-upload-classname',
        vars: [
          { name: "--au-file-upload-label-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-file-upload-label-text-size", default: "1rem", type: "size" },
          { name: "--au-file-upload-label-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-file-upload-label-padding-horizontal", default: "0rem", type: "size" },
        ]
      },
      {
        title: "Upload Area Styles",
        selector: '.your-custom-file-upload-classname',
        vars: [
          { name: "--au-file-upload-area-border-width", default: "1px", type: "size" },
          { name: "--au-file-upload-area-border-style", default: "dashed", type: "select", options: ["dashed", "solid", "dotted", "double", "none"] },
          { name: "--au-file-upload-area-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-file-upload-area-border-radius", default: "0.25rem", type: "size" },
        ]
      },
      {
        title: "File List & Preview Styles",
        selector: '.your-custom-file-upload-classname',
        vars: [
          { name: "--au-file-upload-file-list-gap", default: "0.625rem", type: "size" },
          { name: "--au-file-upload-file-list-item-gap", default: "0.625rem", type: "size" },
          { name: "--au-file-upload-file-list-preview-width", default: "3rem", type: "size" },
          { name: "--au-file-upload-file-list-preview-height", default: "3rem", type: "size" },
          { name: "--au-file-upload-file-list-preview-border-width", default: "1px", type: "size" },
          { name: "--au-file-upload-file-list-preview-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "double", "none"] },
          { name: "--au-file-upload-file-list-preview-border-color", default: "oklch(0.7894 0 0)", type: "color" },
        ]
      },
      {
        title: "Error Message Styles",
        selector: '.your-custom-file-upload-classname',
        vars: [
          { name: "--au-file-upload-error-area-text-color", default: "oklch(0.4464 0 0)", type: "color" },
          { name: "--au-file-upload-error-area-text-size", default: "0.875rem", type: "size" },
          { name: "--au-file-upload-error-list-text-color", default: "oklch(0.4747 0.193 29.04)", type: "color" },
        ]
      },
      {
        title: "Delete Button Styles",
        selector: '.your-custom-file-upload-classname',
        vars: [
          { name: "--au-file-upload-delete-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-file-upload-delete-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-file-upload-delete-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-file-upload-delete-border-radius", default: "0.25rem", type: "size" },
          { name: "--au-file-upload-delete-hover-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-file-upload-delete-active-bg", default: "oklch(0.8689 0 0)", type: "color" },
        ]
      }
    ]
  },

  // --- TAB 10: Input ---
  {
    id: 'input',
    label: 'Input',
    previewHTML: `
      <div class="your-custom-input-classname">
        <au-input label="Input Label" placeholder="Placeholder text" data-clear data-clear-label="Clear">
          <span slot="prefix">Prefix</span>
        </au-input>
      </div>
    `,
    groups: [
      {
        title: "Container Styles",
        selector: '.your-custom-input-classname',
        vars: [
          { name: "--au-input-wrapper-bg", default: "transparent", type: "color" },
          { name: "--au-input-container-padding-vertical", default: "0.25rem", type: "size" },
          { name: "--au-input-container-padding-horizontal", default: "0.25rem", type: "size" },
          { name: "--au-input-container-gap", default: "0.625rem", type: "size" },
          { name: "--au-input-border-width", default: "1px", type: "size" },
          { name: "--au-input-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "double", "none"] },
          { name: "--au-input-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-input-border-radius", default: "0.25rem", type: "size" },
        ]
      },
      {
        title: "Label Styles",
        selector: '.your-custom-input-classname',
        vars: [
          { name: "--au-input-label-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-input-label-text-size", default: "1rem", type: "size" },
          { name: "--au-input-label-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-input-label-padding-horizontal", default: "1rem", type: "size" },
        ]
      },
      {
        title: "Input Field Styles",
        selector: '.your-custom-input-classname',
        vars: [
          { name: "--au-input-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-input-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-input-text-size", default: "1rem", type: "size" },
          { name: "--au-input-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-input-padding-horizontal", default: "1rem", type: "size" },
        ]
      },
      {
        title: "Interaction Styles",
        selector: '.your-custom-input-classname',
        vars: [
          { name: "--au-input-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-input-focus-shadow-color", default: "oklch(0.8315 0.157 78)", type: "color" },
          { name: "--au-input-invalid-shadow-width", default: "3px", type: "size" },
          { name: "--au-input-invalid-shadow-color", default: "oklch(0.5722 0.233 29.08)", type: "color" },
        ]
      },
      {
        title: "Clear Button Styles",
        selector: '.your-custom-input-classname',
        vars: [
          { name: "--au-input-clear-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-input-clear-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-input-clear-border-radius", default: "0.25rem", type: "size" },
          { name: "--au-input-clear-hover-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-input-clear-active-bg", default: "oklch(0.8689 0 0)", type: "color" },
        ]
      }
    ]
  },

  // --- TAB 11: Pagination ---
  {
    id: 'pagination',
    label: 'Pagination',
    previewHTML: `
      <p>CSS Variables = Button Styles</p>
      <au-pagination
        data-total="1000"
        data-current-page="1" 
        data-pager-count="5" 
        data-page-size="10"
        data-page-size-options='[10,30,50,100]'
        data-layout='["total_page","total_items","page_size","first","prev","pages","next","last","jump"]'
        data-text-per="each page" 
        data-text-total-pages-prefix="Total" 
        data-text-goto="Jump" 
        data-text-page="page(s)"
        data-text-total-items-suffix="item(s)" 
        data-text-first="First" 
        data-text-prev="Prev" 
        data-text-next="Next"
        data-text-last="Last" 
        data-text-go="Go to" class="your-custom-pagination-current-classname your-custom-button-classname">
      </au-pagination>
    `,
    groups: [
      {
        title: "Current Page Style",
        selector: '.your-custom-pagination-current-classname',
        vars: [
          { name: "--au-btn-current-bg", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-btn-current-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-btn-current-border-color", default: "oklch(0.7894 0 0)", type: "color" },
        ]
      }
    ]
  },

  // --- TAB 12: Radio ---
  {
    id: 'radio',
    label: 'Radio',
    previewHTML: `
      <div class="your-custom-radio-classname">
        <h3>Basic Radio Group</h3>
        <au-radio-group aria-label="Basic Radio Group">
          <au-radio checked>Option 1</au-radio>
          <au-radio>Option 2</au-radio>
          <au-radio disabled>Option 3 (Disabled)</au-radio>
        </au-radio-group>
      </div>
    `,
    groups: [
      {
        title: "Layout & Dimensions",
        selector: '.your-custom-radio-classname',
        vars: [
          { name: "--au-radio-content-gap", default: "0.375rem", type: "size" },
          { name: "--au-radio-input-width", default: "1.5rem", type: "size" },
          { name: "--au-radio-input-height", default: "1.5rem", type: "size" },
        ]
      },
      {
        title: "Input Styles",
        selector: '.your-custom-radio-classname',
        vars: [
          { name: "--au-radio-input-border-width", default: "1px", type: "size" },
          { name: "--au-radio-input-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "double", "none"] },
          { name: "--au-radio-input-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-radio-input-bg", default: "oklch(0.994 0 0)", type: "color" },
        ]
      },
      {
        title: "Checked State",
        selector: '.your-custom-radio-classname',
        vars: [
          { name: "--au-radio-input-checked-bg", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-radio-input-checked-circle-color", default: "oklch(0.994 0 0)", type: "color" },
        ]
      },
      {
        title: "Label Styles",
        selector: '.your-custom-radio-classname',
        vars: [
          { name: "--au-radio-label-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-radio-label-text-size", default: "1rem", type: "size" },
        ]
      },
      {
        title: "Interaction",
        selector: '.your-custom-radio-classname',
        vars: [
          { name: "--au-radio-label-hover-text-deco", default: "underline", type: "select", options: ["none", "underline", "overline", "line-through"] },
          { name: "--au-radio-label-active-text-color", default: "oklch(0.537 0 0)", type: "color" },
          { name: "--au-radio-input-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-radio-input-focus-shadow-color", default: "oklch(0.8315 0.157 78)", type: "color" },
          { name: "--au-radio-label-disabled-text-color", default: "oklch(0.537 0 0)", type: "color" },
        ]
      }
    ]
  },

  // --- TAB 13: Rating ---
  {
    id: 'rating',
    label: 'Rating',
    previewHTML: `
      <div class="your-custom-rating-classname">
        <h3>Basic Rating</h3>
        <au-rating aria-label="Rate this product" labels="Very Bad,Bad,OK,Good,Excellent"></au-rating>
        <hr/>
        <h3>With Score</h3>
        <au-rating aria-label="Product rating" value="4" show-score></au-rating>
      </div>
    `,
    groups: [
      {
        title: "Star Appearance",
        selector: '.your-custom-rating-classname',
        vars: [
          { name: "--au-rating-star-size", default: "2rem", type: "size" },
          { name: "--au-rating-star-color", default: "oklch(0.8 0 0)", type: "color" },
          { name: "--au-rating-star-filled-color", default: "oklch(0.75 0.15 85)", type: "color" },
          { name: "--au-rating-star-stroke-color", default: "oklch(0.6 0 0)", type: "color" },
        ]
      },
      {
        title: "Label & Score",
        selector: '.your-custom-rating-classname',
        vars: [
          { name: "--au-rating-label-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-rating-label-size", default: "0.75rem", type: "size" },
          { name: "--au-rating-score-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-rating-score-size", default: "1rem", type: "size" },
        ]
      },
      {
        title: "Layout & Focus",
        selector: '.your-custom-rating-classname',
        vars: [
          { name: "--au-rating-gap", default: "0.25rem", type: "size" },
          { name: "--au-rating-focus-width", default: "3px", type: "size" },
          { name: "--au-rating-focus-color", default: "oklch(0.8315 0.157 78)", type: "color" },
        ]
      }
    ]
  },


  // --- TAB 13: Switch ---
  {
    id: 'switch',
    label: 'Switch',
    previewHTML: `
      <div class="your-custom-switch-classname">
        <h3>Basic Switch</h3>
        <au-switch name="demo-switch" value="1">Off</au-switch>
        <au-switch name="demo-switch" value="2" checked>On</au-switch>
        <au-switch name="demo-switch" value="3" disabled>Disabled Off</au-switch>
        <au-switch name="demo-switch" value="4" checked disabled>Disabled On</au-switch>
      </div>
    `,
    groups: [
      {
        title: "Layout & Spacing",
        selector: '.your-custom-switch-classname',
        vars: [
          { name: "--au-switch-gap", default: "0.625rem", type: "size" },
          { name: "--au-switch-container-gap", default: "0.375rem", type: "size" },
          { name: "--au-switch-padding-top", default: "0.625rem", type: "size" },
          { name: "--au-switch-padding-right", default: "0.25rem", type: "size" },
          { name: "--au-switch-padding-bottom", default: "0.625rem", type: "size" },
          { name: "--au-switch-padding-left", default: "0rem", type: "size" },
        ]
      },
      {
        title: "Switch Dimensions",
        selector: '.your-custom-switch-classname',
        vars: [
          { name: "--au-switch-input-width", default: "2.5rem", type: "size" },
          { name: "--au-switch-inner-distance", default: "2px", type: "size" },
        ]
      },
      {
        title: "Appearance",
        selector: '.your-custom-switch-classname',
        vars: [
          { name: "--au-switch-input-border-width", default: "1px", type: "size" },
          { name: "--au-switch-input-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "none"] },
          { name: "--au-switch-input-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-switch-inner-border-radius", default: "1.25rem", type: "size" },
          { name: "--au-switch-input-checked-bg", default: "oklch(0.1398 0 0)", type: "color" },
        ]
      },
      {
        title: "Focus State",
        selector: '.your-custom-switch-classname',
        vars: [
          { name: "--au-switch-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-switch-focus-shadow-color", default: "oklch(0.8315 0.1568 78.05)", type: "color" },
        ]
      }
    ]
  },

  // --- TAB 14: Textarea ---
  {
    id: 'textarea',
    label: 'Textarea',
    previewHTML: `
      <div class="your-custom-textarea-classname">
        <h3>Basic Textarea</h3>
        <au-textarea label="Description" placeholder="Enter your description here..." rows="4"></au-textarea>
        
        <h3>Required & Invalid</h3>
        <au-textarea id="custom-id" label="Textarea Label" placeholder="Enter..." required></au-textarea>
        
        <h3>Read-only</h3>
        <au-textarea label="Read-only Data" value="This is read-only content." readonly></au-textarea>

        <h3>Disabled</h3>
        <au-textarea label="Disabled Data" value="This is disabled content." disabled></au-textarea>
      </div>
    `,
    groups: [
      {
        title: "Label Styles",
        selector: '.your-custom-textarea-classname',
        vars: [
          { name: "--au-textarea-label-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-textarea-label-text-size", default: "1rem", type: "size" },
          { name: "--au-textarea-label-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-textarea-label-padding-horizontal", default: "0rem", type: "size" },
          { name: "--au-textarea-label-margin-vertical", default: "0rem", type: "size" },
          { name: "--au-textarea-label-margin-horizontal", default: "0rem", type: "size" },
        ]
      },
      {
        title: "Container & Border",
        selector: '.your-custom-textarea-classname',
        vars: [
          { name: "--au-textarea-border-width", default: "1px", type: "size" },
          { name: "--au-textarea-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "none"] },
          { name: "--au-textarea-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-textarea-border-radius", default: "0.25rem", type: "size" },
          { name: "--au-textarea-container-padding-vertical", default: "0.25rem", type: "size" },
          { name: "--au-textarea-container-padding-horizontal", default: "0.25rem", type: "size" },
        ]
      },
      {
        title: "Input Styles",
        selector: '.your-custom-textarea-classname',
        vars: [
          { name: "--au-textarea-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-textarea-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-textarea-text-size", default: "1rem", type: "size" },
          { name: "--au-textarea-text-line-height", default: "1.5", type: "size" },
          { name: "--au-textarea-padding-vertical", default: "0.625rem", type: "size" },
          { name: "--au-textarea-padding-horizontal", default: "1rem", type: "size" },
        ]
      },
      {
        title: "Interaction",
        selector: '.your-custom-textarea-classname',
        vars: [
          { name: "--au-textarea-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-textarea-focus-shadow-color", default: "oklch(0.8315 0.1568 78.05)", type: "color" },
          { name: "--au-textarea-invalid-shadow-width", default: "3px", type: "size" },
          { name: "--au-textarea-invalid-shadow-color", default: "oklch(0.5722 0.233 29.08)", type: "color" },
        ]
      },
      {
        title: "Readonly",
        selector: '.your-custom-textarea-classname',
        vars: [
          { name: "--au-textarea-readonly-bg", default: "oklch(0.95 0 0)", type: "color" },
          { name: "--au-textarea-readonly-text-color", default: "oklch(0.1398 0 0)", type: "color" },
        ]
      }
    ]
  },

  // --- TAB 15: Tree ---
  {
    id: 'tree',
    label: 'Tree',
    previewHTML: `
      <div class="your-custom-tree-classname">
        <h3>Basic Tree</h3>
        <au-tree id="tree-demo-basic"></au-tree>
        
        <h3>Checkbox Tree</h3>
        <au-tree id="tree-demo-check" show-checkbox></au-tree>
      </div>    
    `,
    onLoad: (container) => {
      const data = [
        {
          label: 'Project A',
          children: [
            {
              label: 'src', children: [
                { label: 'index.js' },
                { label: 'style.css' }
              ]
            },
            { label: 'package.json' },
            { label: 'README.md' }
          ]
        },
        {
          label: 'Project B',
          children: [
            {
              label: 'Documents', children: [
                { label: 'Report.pdf' },
                { label: 'Data.xlsx' }
              ]
            }
          ]
        },
        { label: 'Notes.txt' }
      ];

      const basic = container.querySelector('#tree-demo-basic');
      if (basic) basic.data = data;

      const check = container.querySelector('#tree-demo-check');
      if (check) check.data = data;
    },
    groups: [
      {
        title: "Tree Layout",
        selector: '.your-custom-tree-classname',
        vars: [
          { name: "--au-tree-font-size", default: "1rem", type: "size" },
          { name: "--au-tree-indent", default: "1.5rem", type: "size" },
          { name: "--au-tree-color", default: "oklch(0.1398 0 0)", type: "color" },
        ]
      },
      {
        title: "Node Appearance",
        selector: '.your-custom-tree-classname',
        vars: [
          { name: "--au-tree-node-bg", default: "transparent", type: "color" },
          { name: "--au-tree-node-hover-bg", default: "oklch(0.9466 0 0)", type: "color" },
          { name: "--au-tree-node-active-bg", default: "oklch(0.8689 0 0)", type: "color" },
          { name: "--au-tree-node-padding-vertical", default: "0.25rem", type: "size" },
          { name: "--au-tree-node-padding-horizontal", default: "0.25rem", type: "size" },
          { name: "--au-tree-node-border-width", default: "0px", type: "size" },
          { name: "--au-tree-node-border-style", default: "solid", type: "select", options: ["solid", "dashed", "dotted", "none"] },
          { name: "--au-tree-node-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-tree-node-border-radius", default: "0rem", type: "size" },
        ]
      },
      {
        title: "Node Typography",
        selector: '.your-custom-tree-classname',
        vars: [
          { name: "--au-tree-node-text-color", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-tree-node-text-size", default: "1rem", type: "size" },
          { name: "--au-tree-node-text-line-height", default: "1.5", type: "size" },
        ]
      },
      {
        title: "Toggle Button",
        selector: '.your-custom-tree-classname',
        vars: [
          { name: "--au-tree-node-toggle-btn-size", default: "2rem", type: "size" },
          { name: "--au-tree-node-toggle-icon-size", default: "1rem", type: "size" },
        ]
      },
      {
        title: "Checkbox Input",
        selector: '.your-custom-tree-classname',
        vars: [
          { name: "--au-tree-node-checkbox-input-width", default: "1.5rem", type: "size" },
          { name: "--au-tree-node-checkbox-input-height", default: "1.5rem", type: "size" },
          { name: "--au-tree-node-checkbox-input-bg", default: "oklch(0.994 0 0)", type: "color" },
          { name: "--au-tree-node-checkbox-input-border-width", default: "1px", type: "size" },
          { name: "--au-tree-node-checkbox-input-border-color", default: "oklch(0.7894 0 0)", type: "color" },
          { name: "--au-tree-node-checkbox-input-border-radius", default: "0.25rem", type: "size" },
          { name: "--au-tree-node-checkbox-input-checked-bg", default: "oklch(0.1398 0 0)", type: "color" },
          { name: "--au-tree-node-checkbox-input-checked-symbol", default: "'✔︎'", type: "text" },
          { name: "--au-tree-node-checkbox-input-checked-text-color", default: "oklch(0.994 0 0)", type: "color" },
        ]
      },
      {
        title: "Checkbox Label",
        selector: '.your-custom-tree-classname',
        vars: [
          { name: "--au-tree-node-checkbox-content-gap", default: "0.375rem", type: "size" },
        ]
      },
      {
        title: "Focus State",
        selector: '.your-custom-tree-classname',
        vars: [
          { name: "--au-tree-focus-shadow-width", default: "3px", type: "size" },
          { name: "--au-tree-focus-shadow-color", default: "oklch(0.8315 0.1568 78.05)", type: "color" },
        ]
      }
    ]
  },
]

/**
 * 2. Playground Engine Class
 */
class PlaygroundEngine {
  constructor() {
    this.tabsElement = document.getElementById('main-tabs-controller');
    this.interfaceContainer = document.getElementById('playground-interface');
    this.controlsContainer = document.getElementById('controls-container');
    this.previewSandbox = document.getElementById('preview-sandbox');
    this.cssOutput = document.getElementById('generated-css');
    this.copyBtn = document.getElementById('copy-btn');
    this.copyStatus = document.getElementById('copy-status');

    this.currentConfig = null;
    this.currentValues = {};

    // Observer for AuTabs switching logic
    this.tabObserver = new MutationObserver(this.handleTabMutation.bind(this));

    this.initTabs();
    this.initCopy();
  }

  // --- Helpers ---
  getUniqueId(prefix) {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // --- 1. Init Tabs & Panels ---
  initTabs() {
    this.tabsElement.innerHTML = '';

    COMPONENT_CONFIGS.forEach((config, index) => {
      // Create Panel following AuTabs structure
      const panel = document.createElement('div');
      panel.className = 'au-tab-panel';
      panel.setAttribute('slot', 'panel');
      panel.setAttribute('label', config.label);
      panel.dataset.configId = config.id;

      this.tabsElement.appendChild(panel);

      // Observe 'aria-hidden' because AuTabs sets this to 'false' when active
      this.tabObserver.observe(panel, {
        attributes: true,
        attributeFilter: ['aria-hidden']
      });

      // Force load first tab initially (wait for DOM/Component to settle)
      if (index === 0) {
        setTimeout(() => {
          this.loadComponent(config, panel);
        }, 100);
      }
    });
  }

  // --- 2. Handle Tab Switching ---
  handleTabMutation(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
        const panel = mutation.target;
        // AuTabs sets aria-hidden="false" when selected
        if (panel.getAttribute('aria-hidden') === 'false') {
          const configId = panel.dataset.configId;
          const config = COMPONENT_CONFIGS.find(c => c.id === configId);

          if (config && this.interfaceContainer.parentNode !== panel) {
            this.loadComponent(config, panel);
          }
        }
      }
    }
  }

  // --- 3. Load Content into Panel ---
  loadComponent(config, targetPanel) {
    this.currentConfig = config;
    this.currentValues = {};

    // Move Interface DOM into the active panel
    targetPanel.appendChild(this.interfaceContainer);
    this.interfaceContainer.hidden = false;

    // Reset Controls
    this.controlsContainer.innerHTML = '';
    this.previewSandbox.innerHTML = config.previewHTML;

    // Generate Controls
    config.groups.forEach(group => {
      this.renderControlGroup(group);
    });

    this.updateCSS();

    // 5. Optional Init Callback (e.g., for Tree data)
    if (config.onLoad) {
      config.onLoad(this.previewSandbox);
    }
  }

  // --- 4. Render Controls (Accessible) ---
  renderControlGroup(group) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'control-group';
    groupDiv.innerHTML = `<h3>${group.title}</h3>`;

    group.vars.forEach(v => {
      this.currentValues[v.name] = v.default;

      const wrapper = document.createElement('div');
      wrapper.className = 'input-wrapper';
      const inputId = this.getUniqueId(`input-${v.name.replace('--au-', '')}`);

      let labelText = v.name.replace('--au-', '').replace(/-/g, ' ');
      let parsedValue = v.default;
      let parsedUnit = '';

      if (v.type === 'size') {
        const match = v.default.match(/^([0-9.]+)([a-z%]*)$/);
        if (match) {
          parsedValue = match[1];
          parsedUnit = match[2];
        }
        if (parsedUnit) labelText += ` <span class="unit-badge" aria-hidden="true">${parsedUnit}</span>`;
      }

      const label = document.createElement('label');
      label.setAttribute('for', inputId);
      label.innerHTML = labelText;
      wrapper.appendChild(label);

      const row = document.createElement('div');
      row.className = 'input-row';

      if (v.type === 'size') {
        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.id = inputId;
        numInput.step = parsedUnit === 'px' ? '1' : '0.01';
        numInput.value = parsedValue;
        if (parsedUnit) {
          numInput.setAttribute('aria-label', `${labelText.replace(/<[^>]*>?/gm, '')} in ${parsedUnit}`);
        }
        numInput.addEventListener('input', (e) => {
          const val = e.target.value === '' ? '0' : e.target.value;
          this.handleValueChange(v.name, val + parsedUnit, group);
        });
        row.appendChild(numInput);
      }
      else if (v.type === 'color') {
        row.setAttribute('role', 'group');
        row.setAttribute('aria-labelledby', inputId);
        row.className = 'input-row color-group';

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = inputId;
        textInput.value = v.default;

        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = '#ffffff';
        colorPicker.setAttribute('aria-label', `Color picker for ${v.name}`);
        colorPicker.setAttribute('alpha', 'true');

        colorPicker.addEventListener('input', (e) => {
          const oklch = this.hexToOklch(e.target.value);
          textInput.value = oklch;
          this.handleValueChange(v.name, oklch, group);
        });

        textInput.addEventListener('input', (e) => {
          this.handleValueChange(v.name, e.target.value, group);
        });

        row.appendChild(textInput);
        row.appendChild(colorPicker);
      }
      else if (v.type === 'select') {
        const select = document.createElement('select');
        select.id = inputId;
        v.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.innerText = opt;
          if (opt === v.default) option.selected = true;
          select.appendChild(option);
        });
        select.addEventListener('input', (e) => {
          this.handleValueChange(v.name, e.target.value, group);
        });
        row.appendChild(select);
      }
      else if (v.type === 'text') {
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = inputId;
        textInput.value = v.default;
        textInput.addEventListener('input', (e) => {
          this.handleValueChange(v.name, e.target.value, group);
        });
        row.appendChild(textInput);
      }

      wrapper.appendChild(row);
      groupDiv.appendChild(wrapper);
    });

    this.controlsContainer.appendChild(groupDiv);
  }

  handleValueChange(varName, value, group) {
    this.currentValues[varName] = value;

    let targets = [];
    if (group.targetId) {
      const el = document.getElementById(group.targetId);
      if (el) targets.push(el);
    }
    if (targets.length === 0 && group.selector) {
      targets = this.previewSandbox.querySelectorAll(group.selector);
    }
    targets.forEach(el => el.style.setProperty(varName, value));

    this.updateCSS();
  }

  updateCSS() {
    const selectorMap = {};
    this.currentConfig.groups.forEach(group => {
      group.vars.forEach(v => {
        const current = this.currentValues[v.name];
        if (current !== v.default) {
          if (!selectorMap[group.selector]) selectorMap[group.selector] = [];
          selectorMap[group.selector].push(`  ${v.name}: ${current};`);
        }
      });
    });

    let css = "";
    for (const [selector, rules] of Object.entries(selectorMap)) {
      if (rules.length > 0) css += `${selector} {\n${rules.join('\n')}\n}\n\n`;
    }

    if (css === "") {
      this.cssOutput.textContent = "/* Change variables to see generated CSS */";
      this.cssOutput.style.color = "#9ca3af";
    } else {
      this.cssOutput.textContent = css;
      this.cssOutput.style.color = "#f3f4f6";
    }
  }

  initCopy() {
    this.copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.cssOutput.textContent).then(() => {
        this.copyStatus.textContent = "CSS code copied to clipboard";
        const original = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          this.copyBtn.textContent = original;
          this.copyStatus.textContent = "";
        }, 2000);
      });
    });
  }

  hexToOklch(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    const toLinear = (c) => { c = c / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    r = toLinear(r); g = toLinear(g); b = toLinear(b);
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const l_ = Math.cbrt(l); const m_ = Math.cbrt(m); const s_ = Math.cbrt(s);
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const C_a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const C_b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
    const Chroma = Math.sqrt(C_a * C_a + C_b * C_b);
    let Hue = Math.atan2(C_b, C_a) * (180 / Math.PI);
    if (Hue < 0) Hue += 360;
    const rL = parseFloat(L.toFixed(4)); const rC = parseFloat(Chroma.toFixed(4)); const rH = parseFloat(Hue.toFixed(2));
    if (rL < 0.001) return "oklch(0 0 0)"; if (rL > 0.999) return "oklch(1 0 0)";
    return `oklch(${rL} ${rC} ${rH})`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PlaygroundEngine();
});