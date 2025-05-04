import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import AppIntro from "@/components/AppIntro.vue";

export const useControlStore = defineStore("controlStore", () => {
  const currentView = ref(markRaw(AppIntro)); // Mark as raw so Vue doesn't reactively track

  function SetView(viewName) {
    currentView.value = markRaw(viewName); // Mark as raw when updating
  }

  const isRotating = ref(true);
  const zoomLevel = ref(5);
  const zoomInterval = ref(null);
  const rotationText = ref("Pause Rotation");

  function ToggleRotation() {
    isRotating.value = !isRotating.value;
  }
  function ZoomIn() {
    zoomLevel.value /= 1.05;
  }

  function ZoomOut() {
    zoomLevel.value /= 1.1;
  }

  function ResetZoom() {
    zoomLevel.value = 5;
  }

  function StartZoomIn(direction) {
    StopZoomIn();
    const action = direction === "in" ? ZoomIn : ZoomOut;
    action();
    zoomInterval.value = setInterval(action, 100);
  }

  function StopZoomIn() {
    if (zoomInterval.value) {
      clearInterval(zoomInterval.value);
      zoomInterval.value = null;
    }
  }

  return {
    currentView,
    zoomLevel,
    isRotating,
    rotationText,

    ZoomIn,
    ZoomOut,
    ResetZoom,
    StartZoomIn,
    StopZoomIn,
    SetView,
    ToggleRotation,
  };
});
