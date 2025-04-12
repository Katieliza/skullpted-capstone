import { defineStore } from 'pinia'
import { markRaw, ref } from 'vue'
import AppIntro from '@/components/AppIntro.vue'

export const useStore = defineStore('store', () => {
  const currentView = ref(markRaw(AppIntro)) // Mark as raw so Vue doesn't reactively track the component

  const zoomRequested = ref(false)

  function setView(viewName) {
    currentView.value = markRaw(viewName) // Mark as raw when updating
  }

  function RequestZoom() {
    zoomRequested.value = true
  }

  return {
    currentView,
  }
})
