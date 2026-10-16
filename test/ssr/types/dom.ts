// Plain TypeScript: document.querySelector returns the kit's element types.
import type { AuEventDetails } from './vendor/accesserty-ui-kit.js';

const tabs = document.querySelector('au-tabs');
if (tabs) tabs.selectedIndex = 1;
const carousel = document.querySelector('au-carousel');
carousel?.slideTo(carousel.current + 1);
const tree = document.querySelector('au-tree');
if (tree) tree.data = [{ id: 'a', label: 'A', expanded: true }];
const radio = document.querySelector('au-radio-group');
const choice: string | null = radio ? radio.value : null;
const detail: AuEventDetails['au-tab-change'] = { index: 0, label: 'One' };
// @ts-expect-error selectedIndex is a number
if (tabs) tabs.selectedIndex = 'two';
void [choice, detail];
const rating = document.querySelector('au-rating');
const ratingValid: boolean | undefined = rating?.validity.valid;
const upload = document.querySelector('au-file-upload');
const uploadMessage: string | undefined = upload?.validationMessage;
void [ratingValid, uploadMessage];
const email = document.querySelector('au-input');
email?.setCustomValidity('This address is already registered.');
const owner: HTMLFormElement | null | undefined = email?.form;
void owner;
