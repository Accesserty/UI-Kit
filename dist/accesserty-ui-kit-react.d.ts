// Types for dist/accesserty-ui-kit-react.js.
import type { ChangeEvent, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import type * as Au from './accesserty-ui-kit.js';

/** An element of the kit, as `event.target` in onChange and as the ref value. */
export interface AuFormElement extends HTMLElement {
  name: string;
  disabled: boolean;
  required: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(message: string): void;
  readonly form: HTMLFormElement | null;
}
export interface AuValueElement extends AuFormElement { value: string; }
export interface AuCheckedElement extends AuFormElement {
  checked: boolean;
  /** The box's own value ('on' unless set), for collecting checked boxes into an array. */
  value: string;
}
export interface AuInputValueElement extends AuValueElement { valueAsNumber: number; valueAsDate: Date | null; }
export interface AuFilesElement extends AuFormElement { value: File[]; }

type Base<E extends HTMLElement> = Omit<HTMLAttributes<E>, 'onChange' | 'defaultValue' | 'defaultChecked'> & {
  ref?: Ref<E>;
  name?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  children?: ReactNode;
  [attribute: `data-${string}`]: string | number | boolean | undefined;
};

// The ref keeps AuValueElement so existing useRef<AuValueElement> code still fits.
export type AuInputProps = Base<AuValueElement> & {
  value?: string; defaultValue?: string; type?: string; placeholder?: string;
  onChange?: (event: ChangeEvent<AuInputValueElement>) => void;
};
export type AuTextareaProps = Base<AuValueElement> & {
  value?: string; defaultValue?: string; placeholder?: string; rows?: number;
  onChange?: (event: ChangeEvent<AuValueElement>) => void;
};
export type AuCheckboxProps = Base<AuCheckedElement> & {
  checked?: boolean; defaultChecked?: boolean; value?: string;
  onChange?: (event: ChangeEvent<AuCheckedElement>) => void;
};
export type AuSwitchProps = AuCheckboxProps;
export type AuRadioGroupProps = Base<AuValueElement> & {
  value?: string; defaultValue?: string;
  onChange?: (event: ChangeEvent<AuValueElement>) => void;
};
export type AuRatingProps = Base<AuValueElement> & {
  value?: number; defaultValue?: number; max?: number;
  onChange?: (event: ChangeEvent<AuValueElement>) => void;
};
export type AuFileUploadProps = Base<AuFilesElement> & {
  accept?: string; multiple?: boolean;
  onChange?: (event: ChangeEvent<AuFilesElement>) => void;
};

export function AuInput(props: AuInputProps): ReactElement;
export function AuTextarea(props: AuTextareaProps): ReactElement;
export function AuCheckbox(props: AuCheckboxProps): ReactElement;
export function AuSwitch(props: AuSwitchProps): ReactElement;
export function AuRadioGroup(props: AuRadioGroupProps): ReactElement;
export function AuRating(props: AuRatingProps): ReactElement;
export function AuFileUpload(props: AuFileUploadProps): ReactElement;

/** Defines the au-* elements in the browser; call it from a client-side effect. */
export function defineElements(): Promise<unknown>;

// Every au-* element as a JSX tag: React 19 sets matching properties and
// attaches on + event-name props as listeners (`onau-tab-change`).
type On<K extends keyof Au.AuEventDetails> = (event: CustomEvent<Au.AuEventDetails[K]>) => void;
type Tag<E extends HTMLElement, P = {}> = Omit<HTMLAttributes<E>, 'onChange' | 'onInput' | 'onSelect'> & P & {
  ref?: Ref<E>;
  children?: ReactNode;
};
type FieldTag<E extends HTMLElement> = Tag<E, { name?: string; label?: string; disabled?: boolean; required?: boolean }>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'au-accordion': Tag<Au.AuAccordionElement, { exclusive?: boolean; 'data-text-exclusive-hint'?: string; 'onau-toggle'?: On<'au-toggle'> }>;
      'au-accordion-item': Tag<Au.AuAccordionItemElement, { open?: boolean; 'heading-level'?: number | string; 'no-region'?: boolean; 'onau-toggle'?: On<'au-toggle'> }>;
      'au-breadcrumbs': Tag<Au.AuBreadcrumbsElement, { items?: Au.AuBreadcrumbItem[] | string; separator?: string; label?: string }>;
      'au-card': Tag<Au.AuCardElement>;
      'au-carousel': Tag<Au.AuCarouselElement, { current?: number; 'onau-slide-change'?: On<'au-slide-change'> }>;
      'au-checkbox': FieldTag<Au.AuCheckboxElement> & { checked?: boolean; value?: string };
      'au-dropdown': Tag<Au.AuDropdownElement, { 'data-text-trigger'?: string; 'onau-select'?: On<'au-select'> }>;
      'au-dropdown-item': Tag<Au.AuDropdownItemElement, { value?: string; 'onau-select'?: On<'au-select'> }>;
      'au-file-upload': FieldTag<Au.AuFileUploadElement> & { accept?: string; multiple?: boolean; 'onau-remove-file'?: On<'au-remove-file'> };
      'au-input': FieldTag<Au.AuInputElement> & { value?: string; type?: string; placeholder?: string; readonly?: boolean };
      'au-pagination': Tag<Au.AuPaginationElement, { 'onau-page-change'?: On<'au-page-change'>; 'onau-page-size-change'?: On<'au-page-size-change'> }>;
      'au-radio-group': FieldTag<Au.AuRadioGroupElement> & { value?: string; direction?: 'horizontal' | 'vertical' };
      'au-radio': Tag<HTMLElement, { value?: string; label?: string; checked?: boolean; disabled?: boolean }>;
      'au-rating': FieldTag<Au.AuRatingElement> & { value?: number; max?: number; readonly?: boolean };
      'au-switch': FieldTag<Au.AuSwitchElement> & { checked?: boolean; value?: string };
      'au-tabs': Tag<Au.AuTabsElement, { selectedIndex?: number; 'selected-index'?: number | string; 'onau-tab-change'?: On<'au-tab-change'> }>;
      'au-textarea': FieldTag<Au.AuTextareaElement> & { value?: string; placeholder?: string; rows?: number; readonly?: boolean };
      'au-tree': Tag<Au.AuTreeElement, { data?: Au.AuTreeNodeData[]; 'show-checkbox'?: boolean }>;
    }
  }
}
