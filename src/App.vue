<template>
  <div class="app-container">
    <AppLoader v-if="shouldShowLoader" />

    <main v-else class="app-container__content">
      <AppHeader />
      <RouterView />
    </main>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppLoader from './components/AppLoader.vue'
import { useHabits } from './composables/useHabits'

const habitsStore = useHabits()
const LOADER_DELAY_MS = 700

export default defineComponent({
  name: 'App',
  components: {
    AppHeader,
    AppLoader,
    RouterView,
  },
  data() {
    return {
      showLoader: true,
      loaderTimeoutId: null,
    }
  },
  computed: {
    isReady() {
      return habitsStore.isReady.value
    },
    shouldShowLoader() {
      return this.showLoader || !this.isReady
    },
  },
  mounted() {
    habitsStore.loadHabits()
    this.startLoaderDelay()
  },
  beforeUnmount() {
    this.clearLoaderDelay()
  },
  methods: {
    startLoaderDelay() {
      this.clearLoaderDelay()

      this.loaderTimeoutId = window.setTimeout(() => {
        this.showLoader = false
        this.loaderTimeoutId = null
      }, LOADER_DELAY_MS)
    },
    clearLoaderDelay() {
      if (this.loaderTimeoutId === null) {
        return
      }

      window.clearTimeout(this.loaderTimeoutId)
      this.loaderTimeoutId = null
    },
  },
})
</script>
