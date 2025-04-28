import { defineStore } from "pinia";
import { ref, computed } from "vue";

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
  const colorReset = ref(false);
  const selectedMaterial = ref("");

  const materials = [
    { name: "Matte Metal", baseName: "Polligon_MetalPaintedMatte" },
    { name: "Leather", baseName: "leather_white" },
  ];

  // Generate display names for use in v-select
  const displayNames = computed(() => materials.map((mat) => mat.name));

  function RequestColorSet(hex) {
    // console.log("Color set request received");
    colorSet.value = true;
    color.value = hex;
  }
  function RequestColorReset() {
    // console.log("Color reset request received");
    colorReset.value = true;
  }
  function SetSelectedMaterial(mat) {
    selectedMaterial.value = mat;
  }

  // Find base texture name by display name
  function GetBaseName(name) {
    const material = materials.find((mat) => mat.name === name);
    return material?.baseName || null;
  }
  return {
    color,
    colors,
    colorSet,
    colorReset,
    selectedMaterial,
    materials,
    displayNames,
    RequestColorSet,
    RequestColorReset,
    SetSelectedMaterial,
    GetBaseName,
  };
});
