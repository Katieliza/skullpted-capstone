<script setup>
import { useStore } from '@/stores/store'

const store = useStore()
</script>

<template>
  <main>
    <!-- Display the current component !-->
    <component :is="store.currentView" />
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
