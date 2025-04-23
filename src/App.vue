<script setup>
import { useControlStore } from '@/stores/controlStore.js'

const controlStore = useControlStore()
</script>
<template>
  <main>
    <!-- Display the current component !-->
    <component :is="controlStore.currentView" />
  </main>
</template>
<style>
  #app {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgb(51, 51, 51);
    color: white;
  }
</style>
