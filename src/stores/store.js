import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import AppIntro from "@/components/AppIntro.vue";

export const useStore = defineStore("store", () => {
  const currentView = ref(markRaw(AppIntro)); // Mark as raw so Vue doesn't reactively track

  const colors = [
    { hex: "#ff6b6b", name: "Coral Red" },
    { hex: "#4ecdc4", name: "Turquoise" },
  ];

  const materialSet = ref(false);
  const material = ref("");
  const colorSet = ref(false);
  const color = ref("");
  const zoomIn = ref(false);
  const zoomOut = ref(false);
  const viewReset = ref(false);
  const rotate = ref(true);
  const rotateText = ref("Pause");

  function SetView(viewName) {
    currentView.value = markRaw(viewName); // Mark as raw when updating
  }
  function RequestMaterialSet(mat) {
    // console.log("Material set request received");
    materialSet.value = true;
    material.value = mat;
  }
  function RequestColorSet(hex) {
    // console.log("Color set request received");
    colorSet.value = true;
    color.value = hex;
  }
  function RequestZoomIn() {
    // console.log("Zoom in request received");
    zoomIn.value = true;
  }
  function RequestZoomOut() {
    // console.log("Zoom out request received");
    zoomIn.value = false;
    zoomOut.value = true;
  }
  function RequestZoomStop() {
    // console.log("Zoom stop request received");
    zoomIn.value = false;
    zoomOut.value = false;
    viewReset.value = false;
  }
  function RequestViewReset() {
    // console.log("Zoom reset request received");
    viewReset.value = true;
  }
  function RequestRotate() {
    // Play rotation if it is paused
    if (rotate.value == false) {
      rotate.value = true;
      rotateText.value = "Pause"; // Set text to pause
      // Pause rotation if it is playing
    } else if (rotate.value == true) {
      rotate.value = false;
      rotateText.value = "Play"; // Set text to play
    }
  }
  return {
    material,
    materialSet,
    color,
    colors,
    colorSet,
    currentView,
    zoomIn,
    zoomOut,
    viewReset,
    rotate,
    rotateText,
    SetView,
    RequestMaterialSet,
    RequestColorSet,
    RequestZoomIn,
    RequestZoomOut,
    RequestZoomStop,
    RequestViewReset,
    RequestRotate,
  };
});
