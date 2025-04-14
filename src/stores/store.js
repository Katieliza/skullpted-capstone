import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import AppIntro from "@/components/AppIntro.vue";

export const useStore = defineStore("store", () => {
  const currentView = ref(markRaw(AppIntro)); // Mark as raw so Vue doesn't reactively track

  const zoomIn = ref(false);
  const zoomOut = ref(false);
  const viewReset = ref(false);
  const rotate = ref(true);
  const rotateText = ref("Pause");

  function setView(viewName) {
    currentView.value = markRaw(viewName); // Mark as raw when updating
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
    currentView,
    setView,
    zoomIn,
    zoomOut,
    viewReset,
    rotate,
    rotateText,
    RequestZoomIn,
    RequestZoomOut,
    RequestZoomStop,
    RequestViewReset,
    RequestRotate,
  };
});
