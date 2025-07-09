<template>

  <div class="weekdays d-flex">
    <div class="weekday">Sun</div>
    <div class="weekday">Mon</div>
    <div class="weekday">Tue</div>
    <div class="weekday">Wed</div>
    <div class="weekday">Thu</div>
    <div class="weekday">Fri</div>
    <div class="weekday">Sat</div>
  </div>

  <div class="calendar-month-week-view" :style="layoutStyle">
    <div class="position-absolute day-box" :style="{
        width: (columnWidth * monthStartWeekDay ) +'px',
        left: '0px' ,
        height: columnWidth+'px',
        top:  '0px'
      }">

    </div>

    <div class="position-absolute day-box" :style="{
        width: columnWidth+'px',
        left: (columnWidth * ((column + monthStartWeekDay)%7))+'px' ,
        height: columnWidth+'px',
        top: (columnWidth * (Math.floor((column + monthStartWeekDay)/7))+'px')
      }"
         v-for="(day, column) in dayList"
         :key="day.format('YYYY-MM-DD')">
      <MonthlyViewDay
        :day="day"
        :events="events"
        @dayClicked="$emit('dayClicked', $event)"
        @eventClicked="$emit('eventClicked', $event)"
      />
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
    monthStartWeekDay() {
      return this.startDate.day()
    },
    columnWidth() {
      return (this.screenWidth - 10) / 7
    },
    columnWidthPx() {
      //used on css side
      return this.columnWidth + 'px'
    },
    pixelPerMinute() {
      let dayStart = this.$dayjs(this.options.dayStartHour, 'HH:mm')
      let dayEnd = this.$dayjs(this.options.dayEndHour, 'HH:mm')
      let dayLength = dayEnd.diff(dayStart, 'minutes')
      return (this.screenHeight - 30) / dayLength
    },

    layoutStyle() {
      return {
        height: this.screenHeight + 'px'
      }
    },

    dayList() {

      let list = []
      for (let s = this.startDate; s <= this.endDate; s = s.add(1, 'day')) {
        list.push(s.clone())
      }

      return list

    }

  },

  methods: {},
  mounted() {

  }
}
</script>

<style scoped lang="scss">


</style>
