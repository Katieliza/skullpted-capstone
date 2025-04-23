<script setup>
import { onMounted, ref, watch } from "vue";
import { useStore } from "@/stores/store";
import { useModelStore } from "@/stores/modelStore.js";
import { useMaterialStore } from "@/stores/materialStore.js";
import MainScene from "./MainScene.vue";

const store = useStore();
const modelStore = useModelStore();
const materialStore = useMaterialStore();

const materialNames = ['Matte Metal', 'Leather'];

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
  <div id="zoom-controls" class="control-panel" style="padding-top: 2%; flex-direction: row; left: 35%">
    <button class="controls-button" @mousedown="RequestZoomIn" @mouseup="RequestZoomStop" @mouseleave="RequestZoomStop"
      @touchstart="RequestZoomIn" @touchened="RequestZoomStop"> Zoom In </button>
    <button class="controls-button" @mousedown="RequestZoomOut" @mouseup="RequestZoomStop" @mouseleave="RequestZoomStop"
      @touchstart="RequestZoomOut" @touchened="RequestZoomStop"> Zoom Out </button>
    <button class="controls-button" @click="RequestViewReset">Reset View</button>
    <button class="controls-button" @click="RequestRotate">{{ store.rotateText }}</button>
  </div>
  <!--
  <div id="view-controls" class="control-panel" style="left: 25%; bottom: 5%">
    <button class="controls-button">Front</button>
    <button class="controls-button">Side</button>
    <button class="controls-button">Top</button>
    <button class="controls-button">Bottom</button>
  </div>
  -->
  <v-row id="color-panel">
    <div style="width: 100%; padding: 0px 0px 10px 10px; color: white;">Colors</div>
    <div v-for="color in store.colors" :key="color.hex">
      <button @click="RequestColorSet(color.hex)" class="color-button" :style="{ backgroundColor: color.hex }"
        @mouseenter="ShowToolie($event, color.hex)" @mouseleave="HideToolie">
      </button>
      <div class="toolie" v-if="activeToolie === color.hex" :style="{ top: toolieY + 'px', left: toolieX + 'px' }"> {{
        color.name }} </div>
    </div>
  </v-row>
  <v-select label="Material" variant="solo-filled" class="material-panel" v-model="materialStore.selectedMaterial"
    :items="materialNames" style="position:absolute; color:white; width: 15%">
  </v-select>
  <v-select label="Select Part" variant="solo-filled" :items="modelStore.meshNames"
    v-model="modelStore.selectedMesh"></v-select>
</template>
<style scoped>

  #color-panel {
    position: absolute;
    display: flex;
    top: 5%;
    z-index: 10;
    width: fit-content;
    height: fit-content;
    max-width: 25vw;
    padding: 20px 0px 20px 20px;
    right: 2%;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
  }

  .control-panel {
    position: absolute;
    display: flex;
    align-content: center;
    z-index: 1;
  }

  .material-panel {
    display: absolute;
    right: 2%;
    top: 30%;
  }

  .controls-button {
    width: fit-content;
    height: fit-content;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 10px;
    margin: 5px;
    color: white;
    margin-bottom: 5px;
    font-size: small;
    border-radius: 5px;
  }

  .controls-button:hover {
    color: black
  }


  .color-button {
    height: 40px;
    width: 40px;
    border: 2px solid rgba(255, 255, 255, 0.434);
    margin: 5px 10px 5px 10px
  }

  .color-button:hover {
    border: 2px solid white;
  }

  .toolie {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    z-index: 15;
    pointer-events: none;
  }
</style>
