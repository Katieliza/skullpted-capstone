<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "@/stores/store";
import MainScene from "./MainScene.vue";

const store = useStore();

const activeToolie = ref(null)
const toolieX = ref(0);
const toolieY = ref(0);
function ShowToolie(e, hex) {
  toolieX.value = e.clientX + 10;
  toolieY.value = e.clientY + 10;
  activeToolie.value = hex;
}
function HideToolie() {
  activeToolie.value = null;
}
onMounted(() => {
  console.log("AppMain has been mounted");
});
function RequestMaterialSet(mat) {
  // console.log("Requesting material set")
  store.RequestMaterialSet(mat);
}
function RequestColorSet(hex) {
  // console.log("Requesting color set")
  store.RequestColorSet(hex);
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
  <!--------------------Zoom control buttons --------------------->
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
    style="position:absolute; color:white; width: 15%">
  </v-select>
  <v-row id="color-panel">
    <div style="width: 100%; color: white;">Colors</div>
    <div v-for="color in store.colors" :key="color.hex">
      <button @click="RequestColorSet(color.hex)" class="color-button" :style="{ backgroundColor: color.hex }"
        @mouseenter="ShowToolie($event, color.hex)" @mouseleave="HideToolie">
      </button>
      <div class="toolie" v-if="activeToolie === color.hex" :style="{ top: toolieY + 'px', left: toolieX + 'px' }"> {{
        color.name }} </div>
    </div>
  </v-row>
</template>
<style scoped>

  #color-panel {
    position: absolute;
    display: flex;
    top: 40%;
    z-index: 10;
    width: fit-content;
    height: fit-content;
    max-width: 25vw;
    padding: 20px 0px 20px 20px
  }

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

  .color-button {
    height: 40px;
    width: 40px;
    border: 2px solid white;
    margin: 10px 20px 10px 20px
  }

  .toolie {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    z-index: 15;
    pointer-events: none;
  }
</style>
