import { defineStore } from "pinia";
import { ref } from "vue";

export const useMaterialStore = defineStore("materialStore", () => {
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

  const color = ref("");
  const colorSet = ref(false);

  const materialNames = ref([]);
  const selectedMaterial = ref("");

  function RequestColorSet(hex) {
    // console.log("Color set request received");
    colorSet.value = true;
    color.value = hex;
  }

  function SetSelectedMaterial(mat) {
    selectedMaterial.value = mat;
  }

  return {
    color,
    colors,
    colorSet,
    materialNames,
    selectedMaterial,
    RequestColorSet,
    SetSelectedMaterial,
  };
});
