<script setup>
import { ref, onMounted } from 'vue';
const name = ref('Neil'), trimmed = ref(''), lazy = ref(''), age = ref(30), notes = ref('Hello');
const agree = ref(true), alerts = ref(false), size = ref('m'), score = ref(3), files = ref([]);
const nameRef = ref(null), ready = ref(false), changes = ref(0);
// Same binding shapes as native controls: checkbox arrays, true-value, number input, typed radio values.
const sources = ref(['b']), consent = ref('yes'), qty = ref(3), level = ref(2);
const crumbs = [{ text: 'Home', url: '/' }, { text: 'Docs', url: '/docs' }, { text: 'Forms' }];
const faq = ref([{ id: 'q1', q: 'Returns', a: 'Seven days.', open: false }, { id: 'q2', q: 'Shipping', a: 'Free over 1000.', open: true }]);
const tabs = ['Intro', 'Specs', 'Reviews'];
onMounted(() => { window.addFaq = () => faq.value.push({ id: 'q3', q: 'Invoices', a: 'At checkout.', open: false }); });
onMounted(() => { ready.value = true; window.nameRef = nameRef; });
function setModel() {
  name.value = 'Set by Vue'; notes.value = 'Line'; agree.value = false; alerts.value = true;
  size.value = 's'; score.value = 5; files.value = [];
}
</script>
<template>
  <main>
    <form id="vm-form" @submit.prevent>
      <au-input id="vm-input" ref="nameRef" label="Name" name="name" v-model="name" @change="changes++"></au-input>
      <au-input id="vm-trim" label="Trimmed" name="trimmed" v-model.trim="trimmed"></au-input>
      <au-input id="vm-lazy" label="Lazy" name="lazy" v-model.lazy="lazy"></au-input>
      <au-input id="vm-number" label="Age" name="age" v-model.number="age"></au-input>
      <au-textarea id="vm-textarea" label="Notes" name="notes" v-model="notes"></au-textarea>
      <au-checkbox id="vm-checkbox" label="Agree" name="agree" class="consumer-class" data-test="kept" v-model="agree"></au-checkbox>
      <au-switch id="vm-switch" label="Alerts" name="alerts" v-model="alerts"></au-switch>
      <au-radio-group id="vm-radio" label="Size" name="size" v-model="size"><au-radio value="s">Small</au-radio><au-radio value="m">Medium</au-radio></au-radio-group>
      <au-rating id="vm-rating" label="Score" name="score" v-model="score"></au-rating>
      <au-file-upload id="vm-files" label="Files" name="files" accept=".txt" multiple v-model="files"></au-file-upload>
      <au-checkbox id="vm-src-a" label="Search" name="sources" value="a" v-model="sources"></au-checkbox>
      <au-checkbox id="vm-src-b" label="Friend" name="sources" value="b" v-model="sources"></au-checkbox>
      <au-checkbox id="vm-consent" label="Consent" name="consent" true-value="yes" false-value="no" v-model="consent"></au-checkbox>
      <au-input id="vm-qty" label="Quantity" name="qty" type="number" v-model="qty"></au-input>
      <au-radio-group id="vm-level" label="Level" name="level" v-model="level"><au-radio v-for="n in [1, 2, 3]" :key="n" :value="n">Level {{ n }}</au-radio></au-radio-group>
    </form>
    <au-card id="vm-card"><h2 slot="heading">Unwrapped custom element</h2></au-card>
    <!-- Declarative Shadow DOM: the module inserts these components' shadow roots on the server. -->
    <au-breadcrumbs id="dsd-crumbs" aria-label="Breadcrumb" :items="JSON.stringify(crumbs)"></au-breadcrumbs>
    <au-accordion id="dsd-faq" exclusive>
      <au-accordion-item v-for="item in faq" :key="item.id" :id="item.id" :open="item.open"><span slot="heading">{{ item.q }}</span><div slot="content"><p>{{ item.a }}</p></div></au-accordion-item>
    </au-accordion>
    <au-tabs id="dsd-tabs" aria-label="Product" selected-index="1">
      <div v-for="tab in tabs" :key="tab" class="au-tab-panel" slot="panel" :label="tab">{{ tab }} body</div>
    </au-tabs>
    <button id="set-model" type="button" @click="setModel">Set from Vue</button>
    <pre id="model">{{ JSON.stringify({ name, trimmed, lazy, age, notes, agree, alerts, size, score, files: files.map(f => f.name), changes, sources, consent, qty, level }) }}</pre>
    <output id="ready">{{ ready }}</output>
  </main>
</template>
