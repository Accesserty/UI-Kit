// Types for dist/accesserty-ui-kit.js (and the files in dist/components/):
// the elements' public properties, methods and events, for
// document.querySelector('au-tabs') and friends. The React file adds JSX
// declarations on top of these.

/** The validity API every form control shares (from AuFormElement). */
export interface AuValidatable {
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
  /** As on a native control: a non-empty message makes the field invalid; '' removes it. */
  setCustomValidity(message: string): void;
  /** The form the field belongs to, or null. */
  readonly form: HTMLFormElement | null;
}

export interface AuFormElement extends HTMLElement, AuValidatable {
  disabled: boolean;
  required: boolean;
}

export interface AuAccordionElement extends HTMLElement { exclusive: boolean; }
export interface AuAccordionItemElement extends HTMLElement { open: boolean; toggleAccordion(): void; }

export interface AuBreadcrumbItem { text: string; url?: string; }
export interface AuBreadcrumbsElement extends HTMLElement {
  /** Read as an array; set as an array or a JSON string. */
  items: AuBreadcrumbItem[];
  separator: string;
}

export interface AuCardElement extends HTMLElement {}

export interface AuCarouselElement extends HTMLElement {
  /** Zero-based index of the first slide in view. */
  current: number;
  slideTo(index: number): void;
  refresh(): void;
  visibleCount(): number;
}

export interface AuCheckboxElement extends AuFormElement { name: string; checked: boolean; value: string; }
export interface AuSwitchElement extends AuFormElement { name: string; checked: boolean; value: string; }

export interface AuDropdownElement extends HTMLElement {
  isOpen: boolean;
  readonly items: AuDropdownItemElement[];
  open(index?: number): void;
  close(): void;
}
export interface AuDropdownItemElement extends HTMLElement {}

export interface AuFileUploadElement extends HTMLElement, AuValidatable {
  value: File[];
  removeFile(file: File): void;
}

export interface AuInputElement extends AuFormElement {
  value: string;
  /** As on a native input: a number for number, range and date-like types, NaN otherwise. */
  valueAsNumber: number;
  valueAsDate: Date | null;
  readonly: boolean;
  clear(): void;
}
export interface AuTextareaElement extends AuFormElement { name: string; value: string; readonly: boolean; }

export interface AuPaginationElement extends HTMLElement {
  currentPage: number;
  pageSize: number;
  total: number;
  readonly totalPages: number;
  pagerCount: number;
  pageSizeOptions: number[];
  layout: string[];
}

export interface AuRadioGroupElement extends AuFormElement {
  name: string;
  /** The selected value, or null when nothing is selected. */
  value: string | null;
}

export interface AuRatingElement extends HTMLElement, AuValidatable {
  value: number;
  max: number;
  name: string;
  disabled: boolean;
  readonly: boolean;
}

export interface AuTabsElement extends HTMLElement { selectedIndex: number; }

export interface AuTreeNodeData {
  id?: string | number;
  label: string;
  lang?: string;
  children?: AuTreeNodeData[];
  expanded?: boolean;
  checked?: boolean;
  disabled?: boolean;
}
export interface AuTreeElement extends HTMLElement {
  /** Assign as a DOM property, not as JSON markup. */
  data: AuTreeNodeData[];
}
export interface AuTreeNodeElement extends HTMLElement {
  checked: boolean;
  expanded: boolean;
  indeterminate: boolean;
  readonly label: string;
}

/** `event.detail` of each custom event, by event name. */
export interface AuEventDetails {
  'au-toggle': { open: boolean };
  'au-tab-change': { index: number; label: string };
  'au-slide-change': { index: number; total: number; title: string };
  'au-page-change': number;
  'au-page-size-change': number;
  'au-select': { value: string };
  'au-remove-file': File;
}

declare global {
  interface HTMLElementTagNameMap {
    'au-accordion': AuAccordionElement;
    'au-accordion-item': AuAccordionItemElement;
    'au-breadcrumbs': AuBreadcrumbsElement;
    'au-card': AuCardElement;
    'au-carousel': AuCarouselElement;
    'au-checkbox': AuCheckboxElement;
    'au-dropdown': AuDropdownElement;
    'au-dropdown-item': AuDropdownItemElement;
    'au-file-upload': AuFileUploadElement;
    'au-input': AuInputElement;
    'au-pagination': AuPaginationElement;
    'au-radio-group': AuRadioGroupElement;
    'au-rating': AuRatingElement;
    'au-switch': AuSwitchElement;
    'au-tabs': AuTabsElement;
    'au-textarea': AuTextareaElement;
    'au-tree': AuTreeElement;
    'au-tree-node': AuTreeNodeElement;
  }
}
