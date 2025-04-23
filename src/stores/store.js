import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import AppIntro from "@/components/AppIntro.vue";

export const useStore = defineStore("store", () => {
  const currentView = ref(markRaw(AppIntro)); // Mark as raw so Vue doesn't reactively track

  const colors = [
    { hex: "#7f7f7f", name: "Gray" },
    { hex: "#907d57", name: "Bronze" },
    { hex: "#899ab1", name: "Steel Blue" },
    { hex: "#757f6a", name: "Olive Green" },
    { hex: "#3c3c3c", name: "Dark Gray" },

    { hex: "#9a8a68", name: "Beige" },
    { hex: "#7c4e42", name: "Brick Red" },
    { hex: "#422121", name: "Deep Burgundy" },
    { hex: "#606c7c", name: "Dusty Blue" },
    { hex: "#1e304f", name: "Navy Blue" },
  ];

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
    RequestColorSet,
    RequestZoomIn,
    RequestZoomOut,
    RequestZoomStop,
    RequestViewReset,
    RequestRotate,
  };
});
