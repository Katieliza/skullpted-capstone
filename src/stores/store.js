import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import AppIntro from '@/components/AppIntro.vue'

export const useStore = defineStore('store', {
  state: () => ({
    currentView: markRaw(AppIntro), // Mark as raw so Vue doesn't reactively track the component
  }),

  actions: {
    setView(viewName) {
      this.currentView = markRaw(viewName) // Mark as raw when updating
    },
  },
})
