<script setup>
import { onMounted } from 'vue'
import IntroScene from './IntroScene.vue'

onMounted(() => {
  console.log('Component has been mounted')
})
</script>

<template>
  <div class="three-container">
    <IntroScene />
    <div
      class="overlay"
      style="
        position: absolute;
        z-index: 1;
        width: 50%;
        right: 0;
        height: 100%;
        align-content: center;
      "
    >
      <v-row class="overlay-row" no-gutters> <p>Welcome to</p> </v-row>
      <v-row class="overlay-row" no-gutters
        ><p style="font-size: 3rem; text-transform: uppercase">Skullpted</p>
      </v-row>
      <v-row class="overlay-row" no-gutters>
        <v-btn variant="tonal" style="color: white" size="large">Get Started</v-btn></v-row
      >
    </div>
  </div>
</template>

<style scoped>
.three-container {
  width: 100vw;
  height: 100vh;
  font-size: 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.overlay-row {
  justify-content: center;
  align-items: center;
  padding: 10px 0px 10px 0px;
}
</style>
