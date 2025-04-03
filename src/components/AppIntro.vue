<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Component has been mounted')
})
</script>

<template>
  <v-row no-gutters id="col-wrap" style="height: 100vh; width: 100vw">
    <v-col id="left-col"></v-col>
    <v-col
      id="right-col"
      style="justify-items: center; align-content: center; background-color: rgb(51, 51, 51)"
    >
      <p>Welcome to</p>
      <p style="font-size: 3rem; text-transform: uppercase">Skullpted</p>
      <br />

      <v-btn variant="tonal" style="color: white" size="large">Get Started</v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
p {
  font-size: 1.5rem;
  color: white;
}
</style>
