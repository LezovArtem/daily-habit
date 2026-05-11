<template>
  <header class="hero">
    <div class="hero__copy">
      <p class="eyebrow">Daily Habit Tracker</p>
      <h1>Build consistency with a simple ritual board.</h1>
      <p class="hero__text">
        Track daily and weekly habits, review streaks, and keep your progress visible without
        relying on a backend.
      </p>
    </div>

    <RouterLink
      v-if="!isHome"
      class="ghost-button"
      to="/"
    >
      Back to dashboard
    </RouterLink>
  </header>
</template>

<script>
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'AppHeader',
  components: {
    RouterLink,
  },
  data() {
    return {}
  },
  computed: {
    isHome() {
      return this.$route.name === 'home'
    },
  },
})
</script>
