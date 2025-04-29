import { defineStore } from "pinia";
import { ref } from "vue";

export const useModelStore = defineStore("modelStore", () => {
  const meshNames = ref([]);
  const activeMesh = ref("");

  function SetMeshNames(names) {
    meshNames.value = names;
  }
  function SetActiveMesh(mesh) {
    activeMesh.value = mesh;
  }

  return {
    meshNames,
    activeMesh,
    SetMeshNames,
    SetActiveMesh,
  };
});
