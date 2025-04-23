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

  function SetView(viewName) {
    currentView.value = markRaw(viewName); // Mark as raw when updating
  }

  function RequestColorSet(hex) {
    // console.log("Color set request received");
    colorSet.value = true;
    color.value = hex;
  }

  return {
    color,
    colors,
    colorSet,
    currentView,

    SetView,
    RequestColorSet,
  };
});
