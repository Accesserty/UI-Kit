'use client';
import { useEffect, useRef, useState } from 'react';
import { AuInput, AuTextarea, AuCheckbox, AuSwitch, AuRadioGroup, AuRating, AuFileUpload, defineElements } from '../vendor/accesserty-ui-kit-react.js';

export default function Form() {
  const [name, setName] = useState('Neil');
  const [digits, setDigits] = useState('12');
  const [notes, setNotes] = useState('Hello');
  const [agree, setAgree] = useState(true);
  const [size, setSize] = useState('m');
  const [score, setScore] = useState(3);
  const [files, setFiles] = useState([]);
  const [alertsChanges, setAlertsChanges] = useState(0);
  // The usual React patterns for native fields: checked boxes collected into an array, a number field.
  const [sources, setSources] = useState(['b']);
  const [qty, setQty] = useState(3);
  const [ready, setReady] = useState(false);
  const uncontrolled = useRef(null);
  const [faq, setFaq] = useState([{ id: 'q1', q: 'Returns', a: 'Seven days.', open: false }, { id: 'q2', q: 'Shipping', a: 'Free over 1000.', open: true }]);
  useEffect(() => { window.addFaq = () => setFaq(list => [...list, { id: 'q3', q: 'Invoices', a: 'At checkout.', open: false }]); }, []);
  useEffect(() => { defineElements().then(() => setReady(true)); window.uncontrolledRef = uncontrolled; }, []);
  const setModel = () => { setName('Set by React'); setNotes('Line'); setAgree(false); setSize('s'); setScore(5); };
  return (
    <main>
      <form id="rf-form" onSubmit={e => e.preventDefault()}>
        <AuInput id="rf-name" label="Name" name="name" value={name} onChange={e => setName(e.target.value)} />
        <AuInput id="rf-digits" label="Digits" name="digits" value={digits} onChange={e => { if (/^\d*$/.test(e.target.value)) setDigits(e.target.value); }} />
        <AuInput id="rf-free" ref={uncontrolled} label="Free" name="free" defaultValue="Initial" />
        <AuTextarea id="rf-notes" label="Notes" name="notes" value={notes} onChange={e => setNotes(e.target.value)} />
        <AuCheckbox id="rf-agree" label="Agree" name="agree" className="consumer-class" data-test="kept" checked={agree} onChange={e => setAgree(e.target.checked)} />
        <AuSwitch id="rf-alerts" label="Alerts" name="alerts" defaultChecked={false} onChange={() => setAlertsChanges(c => c + 1)} />
        <AuRadioGroup id="rf-size" label="Size" name="size" value={size} onChange={e => setSize(e.target.value)}>
          <au-radio value="s">Small</au-radio><au-radio value="m">Medium</au-radio>
        </AuRadioGroup>
        <AuRating id="rf-score" label="Score" name="score" value={score} onChange={e => setScore(Number(e.target.value))} />
        <AuFileUpload id="rf-files" label="Files" name="files" accept=".txt" onChange={e => setFiles(e.target.value.map(f => f.name))} />
        {['a', 'b'].map(v => (
          <AuCheckbox key={v} id={'rf-src-' + v} label={'Source ' + v} name="sources" value={v} checked={sources.includes(v)}
            onChange={e => { const { checked, value } = e.target; setSources(list => checked ? [...list, value] : list.filter(x => x !== value)); }} />
        ))}
        <AuInput id="rf-qty" label="Quantity" name="qty" type="number" value={String(qty)} onChange={e => setQty(e.target.valueAsNumber)} />
      </form>
      <au-card id="rf-card"><h2 slot="heading">Plain custom element</h2></au-card>
      <au-accordion id="dsd-faq" exclusive>
        {faq.map(item => <au-accordion-item key={item.id} id={item.id} open={item.open}><span slot="heading">{item.q}</span><div slot="content"><p>{item.a}</p></div></au-accordion-item>)}
      </au-accordion>
      <button id="set-model" type="button" onClick={setModel}>Set from React</button>
      <pre id="model">{JSON.stringify({ name, digits, notes, agree, size, score, files, alertsChanges, sources, qty })}</pre>
      <output id="ready">{String(ready)}</output>
    </main>
  );
}
