import { defineStore } from "pinia";
import { ref } from "vue";

export const useModelStore = defineStore("modelStore", () => {
  const meshNames = ref([]);
  const selectedMesh = ref("");

  function SetMeshNames(names) {
    meshNames.value = names;
  }
  function SetSelectedMesh(mesh) {
    selectedMesh.value = mesh;
  }

  return {
    meshNames,
    selectedMesh,
    SetMeshNames,
    SetSelectedMesh,
  };
});
