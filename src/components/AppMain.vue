<script setup>
import { onMounted } from 'vue'
import MainScene from './MainScene.vue'

onMounted(() => {
  console.log('AppMain has been mounted')
})
</script>

<template>
  <MainScene />

  <!--Buttons to control zoom !-->
  <div
    id="zoom-controls"
    class="control-panel"
    style="padding-top: 2%; flex-direction: column; right: 35%"
  >
    <button class="controls-button">Zoom In</button>
    <button class="controls-button">Zoom Out</button>
    <button class="controls-button">Reset Zoom</button>
  </div>

  <div id="view-controls" class="control-panel" style="left: 25%; bottom: 5%">
    <button class="controls-button">Front</button>
    <button class="controls-button">Side</button>
    <button class="controls-button">Top</button>
    <button class="controls-button">Bottom</button>
  </div>
</template>

<style scoped>
.control-panel {
  position: absolute;
  display: flex;
  align-content: center;
  z-index: 1;
}
.controls-button {
  width: 50px;
  height: 50px;
  background-color: white;
  color: black;
  margin-bottom: 5px;
  font-size: small;
}
</style>
