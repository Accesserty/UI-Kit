// A server component rendering the client form: wrappers are importable from server code.
import Form from './Form';
export const dynamic = 'force-dynamic';
// Server-rendered custom elements: the custom server inserts their shadow roots.
const crumbs = JSON.stringify([{ text: 'Home', url: '/' }, { text: 'Docs', url: '/docs' }, { text: 'Forms' }]);
export default function Page() {
  return <>
    <au-breadcrumbs id="dsd-crumbs" aria-label="Breadcrumb" items={crumbs}></au-breadcrumbs>
    <Form />
    <au-tabs id="dsd-tabs" aria-label="Product" selected-index="1">
      {['Intro', 'Specs', 'Reviews'].map(tab => <div key={tab} className="au-tab-panel" slot="panel" label={tab}>{tab} body</div>)}
    </au-tabs>
  </>;
}
