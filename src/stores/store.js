import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import AppIntro from "@/components/AppIntro.vue";

export const useStore = defineStore("store", () => {
  const currentView = ref(markRaw(AppIntro)); // Mark as raw so Vue doesn't reactively track

  const zoomIn = ref(false);
  const zoomOut = ref(false);
  const zoomReset = ref(false);

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
    zoomReset.value = false;
  }
  function RequestZoomReset() {
    // console.log("Zoom reset request received");
    zoomReset.value = true;
  }

  return {
    currentView,
    setView,
    zoomIn,
    zoomOut,
    zoomReset,
    RequestZoomIn,
    RequestZoomOut,
    RequestZoomStop,
    RequestZoomReset,
  };
});
