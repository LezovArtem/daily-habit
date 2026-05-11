<template>
  <article class="panel habit-card" :class="{ 'habit-card--done': habit.isDoneToday }">
    <div class="habit-card__top">
      <div class="habit-card__top-left">
        <p class="chip">{{ habit.category }}</p>
        <h3>{{ habit.name }}</h3>
      </div>
      <span class="frequency-badge">{{ habit.frequency }}</span>
    </div>

    <p class="habit-card__notes">
      {{ habitNotes }}
    </p>

    <div class="habit-card__stats">
      <div>
        <strong>{{ habit.stats.completedPeriods }}/{{ habit.stats.totalPeriods }}</strong>
        <span>periods completed</span>
      </div>
      <div>
        <strong>{{ habit.stats.currentStreak }}</strong>
        <span>current streak</span>
      </div>
      <div>
        <strong>{{ habit.stats.completionRate }}%</strong>
        <span>success rate</span>
      </div>
    </div>

    <div class="progress-bar" aria-hidden="true">
      <span :style="progressBarStyle"></span>
    </div>

    <div class="habit-card__actions">
      <button class="primary-button" type="button" @click="handleToggle">
        {{ toggleButtonLabel }}
      </button>

      <div class="inline-actions">
        <button class="text-button" type="button" @click="handleEdit">Edit</button>
        <button class="text-button danger-text" type="button" @click="handleDelete">
          Delete
        </button>
        <RouterLink class="text-link" :to="{name: 'habit-detail', params:{ id: habit.id }}">Open details</RouterLink>
      </div>
    </div>
  </article>
</template>

<script>
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'HabitCard',
  components: {
    RouterLink,
  },
  props: {
    habit: {
      type: Object,
      required: true,
    }
  },
  emits: ['toggle', 'edit', 'delete'],
  data() {
    return {}
  },
  computed: {
    habitNotes() {
      if (this.habit.notes) {
        return this.habit.notes
      }

      return 'No notes yet. Add context to make the habit easier to stick to.'
    },
    progressBarStyle() {
      return {
        width: `${this.habit.stats.completionRate}%`,
      }
    },
    toggleButtonLabel() {
      if (this.habit.frequency === 'daily' && this.habit.isDoneToday) {
        return 'Undo today'
      }

      if (this.habit.frequency === 'weekly' && this.habit.isDoneThisWeek) {
        return 'Undo this week'
      }

      return this.habit.frequency === 'weekly' ? 'Mark this week' : 'Mark today'
    },
    detailPath() {
      return `/habit/${this.habit.id}`
    },
  },
  methods: {
    handleToggle() {
      this.$emit('toggle', this.habit.id)
    },
    handleEdit() {
      this.$emit('edit', this.habit)
    },
    handleDelete() {
      this.$emit('delete', this.habit.id)
    },
  },
})
</script>
