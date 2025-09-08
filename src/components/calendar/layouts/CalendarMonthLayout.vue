<template>
  <div class="calendar-month-wrapper">
    <div class="calendar-month-header">
      <div class="calendar-month-cell" v-for="(w, idx) in 7" :key="idx">
        {{ weekdayNames[idx] }}
      </div>
    </div>
    <div
      class="calendar-month-grid"
      :style="{
        gridTemplateRows: 'repeat(' + weekCount + ', 1fr)',
      }"
    >
      <div
        v-for="(day, idx) in dayList"
        :key="day.format('YYYY-MM-DD')"
        class="calendar-month-cell day-box"
        :style="{
          gridColumn: ((idx + monthStartWeekDay) % 7) + 1,
          gridRow: Math.floor((idx + monthStartWeekDay) / 7) + 1,
        }"
      >
        <MonthlyViewDay
          :day="day"
          :events="events"
          @dayClicked="$emit('dayClicked', $event)"
          @eventClicked="$emit('eventClicked', $event)"
        />
      </div>
    </div>
  </div>
</template>



<script>
import { Dayjs } from 'dayjs'
import MonthlyViewDay from '@/components/calendar/layouts/MonthlyViewDay.vue'

export default {
  name: 'CalendarMonthWeekView',
  components: { MonthlyViewDay },
  props: {
    dayCount: {
      type: Number,
      default: 7
    },
    currentDate: {
      type: Dayjs,
      required: true
    },
    startDate: {
      type: Dayjs,
      required: true
    },
    endDate: {
      type: Dayjs,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    },
    schedules: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => {
      }
    },
    screenWidth: {
      type: Number,
      default: 0
    },
    screenHeight: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },

  computed: {
    weekCount() {
      const daysTotal = this.dayList.length + this.monthStartWeekDay
      return Math.ceil(daysTotal / 7)
    },
    monthStartWeekDay() {
      return this.startDate.day()
    },
    columnWidth() {
      return (this.screenWidth - 10) / 7
    },
    columnWidthPx() {
      return this.columnWidth + 'px'
    },
    pixelPerMinute() {
      let dayStart = this.$dayjs(this.options.dayStartHour, 'HH:mm')
      let dayEnd = this.$dayjs(this.options.dayEndHour, 'HH:mm')
      let dayLength = dayEnd.diff(dayStart, 'minutes')
      return (this.screenHeight - 30) / dayLength
    },
    layoutStyle() {
      return { height: this.screenHeight + 'px' }
    },
    dayList() {
      let list = []
      for (let s = this.startDate; s <= this.endDate; s = s.add(1, 'day')) {
        list.push(s.clone())
      }
      return list
    },

    preferredLanguage() {
      return localStorage.getItem('preferredLanguage') || 'en'
    },

    weekdayMap() {
      return {
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        tr: ['Paz', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'],
        de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        az: ['B.', 'B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.', 'Ş.']
      }
    },

    weekdayNames() {
      return this.weekdayMap[this.preferredLanguage] || this.weekdayMap.en
    }
  },

  methods: {},
  mounted() {

  }
}
</script>

<style scoped lang="scss">
.calendar-month-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--background);
  min-width: 300px;
  min-height: 400px;
}
.calendar-month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  width: 100%;
}
.calendar-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  width: 100%;
  flex: 1 1 0;
  min-height: 700px;
  //background: var(--background);
}
.calendar-month-cell {
  border: 1px solid #e0e0e0;
  text-align: center;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  //background: var(--background);
  font-weight: 500;
  font-size: 1rem;
  padding: 0.4em 0.2em;
  overflow: hidden;
}
.day-box {
  //background: var(--background);
}


</style>
