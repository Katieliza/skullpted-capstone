<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Component has been mounted')
})
</script>

<template>
  <p>HELLO</p>
  <v-btn variant="elevated" size="x-large"> Button</v-btn>
</template>

<style scoped></style>
