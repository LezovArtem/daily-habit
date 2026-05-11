<template>
  <section v-if="habit" class="detail-layout">
    <section class="panel detail-hero">
      <div class="detail-hero__content">
        <div>
          <p class="chip">{{ habit.category }}</p>
          <h2>{{ habit.name }}</h2>
        </div>
        <p class="detail-hero__notes">
          {{ habitNotes }}
        </p>
      </div>

      <div class="detail-hero__actions">
        <button class="primary-button" type="button" @click="handleToggleCompletion">
          {{ toggleButtonLabel }}
        </button>
        <RouterLink class="ghost-button" to="/">Return to dashboard</RouterLink>
      </div>
    </section>

    <section class="detail-grid">
      <article class="panel stat-panel">
        <span>Frequency</span>
        <strong>{{ habit.frequency }}</strong>
      </article>
      <article class="panel stat-panel">
        <span>Current streak</span>
        <strong>{{ habit.stats.currentStreak }}</strong>
      </article>
      <article class="panel stat-panel">
        <span>Longest streak</span>
        <strong>{{ habit.stats.longestStreak }}</strong>
      </article>
      <article class="panel stat-panel">
        <span>Completion rate</span>
        <strong>{{ habit.stats.completionRate }}%</strong>
      </article>
    </section>

    <section class="detail-grid detail-grid--wide">
      <article class="panel">
        <div class="panel__header">
          <div>
            <p class="eyebrow">Progress Summary</p>
            <h2>Consistency overview</h2>
          </div>
        </div>

        <div class="summary-list">
          <div>
            <span>Completed periods </span>
            <strong>{{ habit.stats.completedPeriods }}/{{ habit.stats.totalPeriods }}</strong>
          </div>
          <div>
            <span>Total check-ins </span>
            <strong>{{ habit.stats.totalCheckIns }}</strong>
          </div>
          <div>
            <span>Last completed </span>
            <strong>{{ habit.stats.lastCompletedAt }}</strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel__header">
          <div>
            <p class="eyebrow">Recent Activity</p>
            <h2>Latest check-ins</h2>
          </div>
        </div>

        <ul v-if="recentCheckIns.length" class="activity-list">
          <li v-for="dateKey in recentCheckIns" :key="dateKey">
            <span>{{ formatRecentCheckIn(dateKey) }}</span>
            <strong>Completed</strong>
          </li>
        </ul>
        <div v-else class="empty-state empty-state--compact">
          <p>No completions recorded yet.</p>
        </div>
      </article>
    </section>

    <ProgressHeatmap :habit="habit" />
  </section>

  <section v-else class="panel empty-state">
    <h2>Habit not found</h2>
    <p>The requested habit does not exist or has been removed.</p>
    <RouterLink class="primary-button" to="/">Back home</RouterLink>
  </section>
</template>

<script>
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import ProgressHeatmap from '../components/ProgressHeatmap.vue'
import { useHabits } from '../composables/useHabits'
import { formatLongDate } from '../lib/date'

const habitsStore = useHabits()

export default defineComponent({
  name: 'HabitDetailView',
  components: {
    ProgressHeatmap,
    RouterLink,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {}
  },
  computed: {
    habits() {
      return habitsStore.habits.value
    },
    habit() {
      return this.habits.find((item) => item.id === this.id) ?? null
    },
    habitNotes() {
      if (this.habit?.notes) {
        return this.habit.notes
      }

      return 'This habit has no notes yet. You can still track consistency and view progress below.'
    },
    toggleButtonLabel() {
      if (!this.habit) {
        return ''
      }

      if (this.habit.isDoneToday) {
        return 'Undo latest check-in'
      }

      return this.habit.frequency === 'weekly' ? 'Mark this week' : 'Mark today'
    },
    recentCheckIns() {
      if (!this.habit) {
        return []
      }

      return [...this.habit.completions].sort().reverse().slice(0, 10)
    },
  },
  methods: {
    handleToggleCompletion() {
      if (!this.habit) {
        return
      }

      habitsStore.toggleCompletion(this.habit.id)
    },
    formatRecentCheckIn(dateKey) {
      return formatLongDate(dateKey)
    },
  },
})
</script>
