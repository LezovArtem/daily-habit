<template>
  <section class="panel">
    <div class="panel__header">
      <div>
        <p class="eyebrow">History Snapshot</p>
        <h2>{{ historyTitle }}</h2>
      </div>
    </div>

    <div class="heatmap" :class="{ 'heatmap--weekly': isWeekly }">
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="heatmap__cell"
        :class="{ 'heatmap__cell--done': cell.done }"
        :title="cell.label"
      ></div>
    </div>
  </section>
</template>

<script>
import { defineComponent } from 'vue'
import { formatDateKey, formatLongDate, getPeriodKey, listPeriodsBack } from '../lib/date'

export default defineComponent({
  name: 'ProgressHeatmap',
  props: {
    habit: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {}
  },
  computed: {
    isWeekly() {
      return this.habit.frequency === 'weekly'
    },
    historyTitle() {
      return this.isWeekly ? 'Last 24 weeks' : 'Last 48 days'
    },
    visiblePeriodCount() {
      return this.isWeekly ? 24 : 48
    },
    completionPeriods() {
      return new Set(
        this.habit.completions.map((item) => getPeriodKey(item, this.habit.frequency)),
      )
    },
    periods() {
      return listPeriodsBack(this.habit.frequency, this.visiblePeriodCount)
    },
    cells() {
      return this.periods.map((date) => this.createCell(date))
    },
  },
  methods: {
    createCell(date) {
      const dateKey = formatDateKey(date)
      const periodKey = getPeriodKey(dateKey, this.habit.frequency)

      return {
        key: `${this.habit.id}-${periodKey}`,
        label: this.getCellLabel(dateKey, periodKey),
        done: this.completionPeriods.has(periodKey),
      }
    },
    getCellLabel(dateKey, periodKey) {
      if (this.isWeekly) {
        return `Week of ${formatLongDate(periodKey)}`
      }

      return formatLongDate(dateKey)
    },
  },
})
</script>
