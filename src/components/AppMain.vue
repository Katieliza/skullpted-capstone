<script setup>
import { onMounted } from "vue";
import { useStore } from "@/stores/store";
import MainScene from "./MainScene.vue";

const store = useStore();

onMounted(() => {
  console.log("AppMain has been mounted");
});

function RequestZoomIn() {
  //console.log("Requesing zoom in");
  store.RequestZoomIn();
}
function RequestZoomOut() {
  //console.log("Requesting zoom out");
  store.RequestZoomOut();
}
function RequestZoomStop() {
  //console.log("Requesting zoom stop");
  store.RequestZoomStop();
}
function RequestZoomReset() {
  // console.log("Requesting zoom reset");
  store.RequestZoomReset();
}
</script>

<template>
  <MainScene />

  <!----------------------------------Zoom control buttons ---------------------------------------->
  <div
    id="zoom-controls"
    class="control-panel"
    style="padding-top: 2%; flex-direction: column; right: 35%"
  >
    <button
      class="controls-button"
      @mousedown="RequestZoomIn"
      @mouseup="RequestZoomStop"
      @mouseleave="RequestZoomStop"
      @touchstart="RequestZoomIn"
      @touchened="RequestZoomStop"
    >
      Zoom In
    </button>
    <button
      class="controls-button"
      @mousedown="RequestZoomOut"
      @mouseup="RequestZoomStop"
      @mouseleave="RequestZoomStop"
      @touchstart="RequestZoomOut"
      @touchened="RequestZoomStop"
    >
      Zoom Out
    </button>
    <button class="controls-button" @click="RequestZoomReset">Reset Zoom</button>
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
