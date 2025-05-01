<script setup>
import { onMounted, ref } from "vue";
import { useControlStore } from "@/stores/controlStore.js";
import { useModelStore } from "@/stores/modelStore.js";
import { useMaterialStore } from "@/stores/materialStore.js";
import MainScene from "./MainScene.vue";

const controlStore = useControlStore();
const modelStore = useModelStore();
const materialStore = useMaterialStore();

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
function HandleMouseEnter(e, hex) {
  ShowToolie(e, hex)
  materialStore.SetPreviewColor(hex);
}
function HandleMouseLeave(e) {
  HideToolie()
  materialStore.ClearPreviewColor();

}
function ResetColor() {
    // console.log("Requesting color reset")
  materialStore.RequestColorReset();
}
onMounted(() => {
  console.log("AppMain has been mounted");
});
</script>
<template>
  <MainScene />
  <!--------------------Zoom control buttons --------------------->
  <div id="zoom-controls" class="control-panel"
    style="height: fit-content; width: 100vw; flex-direction: row; justify-content: center; bottom: 5%;">
    <button @mousedown="() => controlStore.StartZoomIn('in')" @mouseup="controlStore.StopZoomIn"
      @mouseleave="controlStore.StopZoomIn">Zoom In</button>
    <button class="controls-button" @mousedown="RequestZoomOut" @mouseup="RequestZoomStop" @mouseleave="RequestZoomStop"
      @touchstart="RequestZoomOut" @touchened="RequestZoomStop"> Zoom Out </button>
    <button class="controls-button" @click="RequestViewReset">Reset View</button>
    <button class="controls-button" @click="RequestRotate">{{ controlStore.rotateText }}</button>
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
    <div v-for="color in materialStore.colors" :key="color.hex">
      <button @click="materialStore.activeColor = color.hex" class="color-button"
        :style="{ backgroundColor: color.hex }" @mouseenter="(e => HandleMouseEnter(e, color.hex))"
        @mouseleave="() => HandleMouseLeave(color.hex)">
      </button>
      <div class="toolie" v-if="activeToolie === color.hex" :style="{ top: toolieY + 'px', left: toolieX + 'px' }"> {{
        color.name }} </div>
    </div>
    <button @click="ResetColor" class="controls-button" style="background-color: rgba(0,0,0,0.5) !important">Reset
      Color</button>
  </v-row>
  <v-row id="select-container">
    <div class="selector" style="margin-bottom: 100px">
      <v-select label="Material" v-model="materialStore.selectedMaterial" :items="materialStore.displayNames"
        :menu-props="{ maxHeight: '100px' }">
      </v-select>
    </div>
    <div class="selector">
      <v-select label="Select Part" :items="modelStore.meshNames" v-model="modelStore.activeMesh"
        :menu-props="{ maxHeight: '150px' }"></v-select>
    </div>
  </v-row>
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

  #select-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 10;
    width: 25vw;
    max-height: 50vh;
    right: 2%;
    top: 35%;
    padding: 20px;
    border-radius: 5px;
  }

  .selector {
    width: 100%;
    border-radius: 5px;
  }

  .control-panel {
    position: absolute;
    display: flex;
    align-content: center;
    z-index: 1;
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
    border: 1px solid white;
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
