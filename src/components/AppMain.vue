<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "@/stores/store";
import MainScene from "./MainScene.vue";

const store = useStore();

onMounted(() => {
  console.log("AppMain has been mounted");
});
function RequestMaterialSet(mat) {
  // console.log("Requesting material set")
  store.RequestMaterialSet(mat);
}
function RequestZoomIn() {
  // console.log("Requesing zoom in");
  store.RequestZoomIn();
}
function RequestZoomOut() {
  // console.log("Requesting zoom out");
  store.RequestZoomOut();
}
function RequestZoomStop() {
  //console.log("Requesting zoom stop");
  store.RequestZoomStop();
}
function RequestViewReset() {
  // console.log("Requesting view reset");
  store.RequestViewReset();
}
function RequestRotate() {
  // console.log
  store.RequestRotate();
}
</script>
<template>
  <MainScene />
  <!----------------------------------Zoom control buttons ---------------------------------------->
  <div id="zoom-controls" class="control-panel" style="padding-top: 2%; flex-direction: column; right: 35%">
    <button class="controls-button" @mousedown="RequestZoomIn" @mouseup="RequestZoomStop" @mouseleave="RequestZoomStop"
      @touchstart="RequestZoomIn" @touchened="RequestZoomStop"> Zoom In </button>
    <button class="controls-button" @mousedown="RequestZoomOut" @mouseup="RequestZoomStop" @mouseleave="RequestZoomStop"
      @touchstart="RequestZoomOut" @touchened="RequestZoomStop"> Zoom Out </button>
    <button class="controls-button" @click="RequestViewReset">Reset View</button>
    <button class="controls-button" @click="RequestRotate">{{ store.rotateText }}</button>
  </div>
  <div id="view-controls" class="control-panel" style="left: 25%; bottom: 5%">
    <button class="controls-button">Front</button>
    <button class="controls-button">Side</button>
    <button class="controls-button">Top</button>
    <button class="controls-button">Bottom</button>
  </div>
  <v-select label="Material" variant="solo-filled" @update:modelValue="RequestMaterialSet" :items="[`Metal`, 'Plastic']"
    style="position:absolute; color:white; width: 15%"></v-select>
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
    color: #00000092;
    margin-bottom: 5px;
    font-size: small;
  }
</style>
