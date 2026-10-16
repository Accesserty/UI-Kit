<script setup>
import { ref } from 'vue'
const email = ref(''), agree = ref(false), score = ref(2), field = ref(null)
defineExpose({ email, agree, score, field })
</script>
<template>
  <au-input id="email" ref="field" label="Email" name="email" v-model.trim="email"></au-input>
  <au-checkbox id="agree" label="I agree" name="agree" v-model="agree"></au-checkbox>
  <au-rating id="score" label="Score" name="score" v-model="score"></au-rating>
  <au-card id="card"><h2 slot="heading">Card</h2></au-card>
  <pre id="model">{{ JSON.stringify({ email, agree, score }) }}</pre>
</template>
