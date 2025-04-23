import { defineStore } from "pinia";
import { ref } from "vue";

export const useMaterialStore = defineStore("materialStore", () => {
  const materialNames = ref([]);
  const selectedMaterial = ref("");

  function SetSelectedMaterial(mat) {
    selectedMaterial.value = mat;
  }

  return {
    materialNames,
    selectedMaterial,
    SetSelectedMaterial,
  };
});
