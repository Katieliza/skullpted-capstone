<script setup>
import { onMounted } from 'vue'
import { useStore } from '@/stores/store'
import IntroScene from './IntroScene.vue'
import AppMain from './AppMain.vue'

const store = useStore()

onMounted(() => {
  console.log('AppIntro has been mounted')
})
</script>

<template>
  <!-- Mount three canvas !-->
  <div class="three-container">
    <IntroScene />

    <!-- Overlay to sit on top of canvas !-->
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
        <!-- Switch to main view !-->
        <v-btn @click="store.setView(AppMain)" variant="tonal" style="color: white" size="large"
          >Get Started</v-btn
        ></v-row
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
