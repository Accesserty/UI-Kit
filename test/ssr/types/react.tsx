// The README's React usage must type-check, and wrong props must not.
import { useRef, useState } from 'react';
import { AuCheckbox, AuFileUpload, AuInput, AuRadioGroup, AuRating, defineElements, type AuValueElement } from './vendor/accesserty-ui-kit-react.js';

export function Form() {
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [score, setScore] = useState(3);
  const ref = useRef<AuValueElement>(null);
  void defineElements();
  return (
    <form>
      <AuInput ref={ref} label="Email" name="email" value={email} onChange={e => setEmail(e.target.value)} className="field" data-test="x" />
      <AuCheckbox label="Agree" checked={agree} onChange={e => setAgree(e.target.checked)} />
      <AuRadioGroup label="Size" defaultValue="m"><au-radio value="m">M</au-radio></AuRadioGroup>
      <AuRating label="Score" value={score} onChange={e => setScore(Number(e.target.value))} />
      <AuFileUpload label="Files" onChange={e => console.log(e.target.value.map(file => file.name))} />
      <AuCheckbox label="Source" value="a" onChange={e => console.log(e.target.checked ? e.target.value : '')} />
      <AuInput label="Qty" type="number" onChange={e => console.log(e.target.valueAsNumber + 1)} />
      {/* @ts-expect-error checked is boolean */}
      <AuCheckbox label="Wrong" checked="yes" />
      {/* @ts-expect-error rating value is a number */}
      <AuRating label="Wrong" value="3" />
    </form>
  );
}

// Other elements are plain JSX tags with typed properties and events.
export function Layout() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  return (
    <>
      <au-accordion exclusive>
        <au-accordion-item open={open} heading-level="2" onau-toggle={e => setOpen(e.detail.open)}>Q</au-accordion-item>
      </au-accordion>
      <au-tabs selected-index={tab} aria-label="Sections" onau-tab-change={e => setTab(e.detail.index)}>
        <div slot="panel" className="au-tab-panel">One</div>
      </au-tabs>
      <au-carousel aria-label="Photos" onau-slide-change={e => console.log(e.detail.total)} />
      <au-pagination data-total="100" onau-page-change={e => console.log(e.detail + 1)} />
      <au-dropdown onau-select={e => console.log(e.detail.value.toUpperCase())}><au-dropdown-item value="a">A</au-dropdown-item></au-dropdown>
      <au-file-upload label="Files" onau-remove-file={e => console.log(e.detail.name)} />
      <au-breadcrumbs items={[{ text: 'Home', url: '/' }, { text: 'Here' }]} />
      <au-tree data={[{ label: 'Root', children: [{ label: 'Leaf' }] }]} show-checkbox />
      <au-card><h3 slot="heading">Card</h3></au-card>
      {/* @ts-expect-error au-toggle detail has open, not index */}
      <au-accordion-item onau-toggle={e => console.log(e.detail.index)} />
      {/* @ts-expect-error tree data needs labels */}
      <au-tree data={[{ id: 1 }]} />
    </>
  );
}
