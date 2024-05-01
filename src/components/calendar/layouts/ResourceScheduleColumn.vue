<template>

  <div
    ref="scheduleColumn"
    class="schedule-column" :style="scheduleStyle"
  >

    <div :style="droppedPosition">

    </div>

  </div>
  <div :style="hourGridStyle">
    <VerticalHourGrid
      :day="day"
      :width="columnWidth"
      :options="options"
      :pixel-per-minute="pixelPerMinute"
      @hourSlotClicked="hourSlotClicked"
      @hourSlotDropped="hourSlotDropped"
    />
  </div>


  <EventItemComponent
    v-for="e in resourceEvents"
    :day="day"
    :event="e"
    :key="e.id"
    :pixel-per-minute="pixelPerMinute"
    :column-width="columnWidth"
    :schedule-list-order="listOrder"
    :options="options"
    @eventClicked="$emit('eventClicked', e)"

  />

</template>
<script>
import EventItemComponent from '@/components/calendar/layouts/EventItemComponent.vue'
import VerticalHourGrid from '@/components/calendar/layouts/VerticalHourGrid.vue'
import { Dayjs } from 'dayjs'

export default {
  name: 'ResourceScheduleColumn',
  components: { VerticalHourGrid, EventItemComponent },
  props: {
    schedule: {
      type: Dayjs,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    },
    day: {
      type: Object,
      required: true
    },
    listOrder: {
      type: Number,
      required: true
    },
    columnWidth: {
      type: Number,
      required: true
    },
    pixelPerMinute: {
      type: Number,
      required: true
    },
    options: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      droppedPosition: null
    }
  },
  computed: {
    columnStyle() {
      return {
        width: this.columnWidth + 'px'
      }
    },
    isCurrentDay() {
      return this.day.isSame(this.options.currentDate, 'day')
    },
    scheduleForThisDay() {
      return this.schedule.schedules[this.day.day()]
    },


    startCoordinate() {
      let dayStart = this.$dayjs(this.options.dayStartHour, 'HH:mm')
      if (!this.scheduleForThisDay) {
        return {
          start: 0,
          height: 0
        }
      }

      let scheduleStart = this.$dayjs(this.scheduleForThisDay.start, 'HH:mm')
      let scheduleEnd = this.$dayjs(this.scheduleForThisDay.end, 'HH:mm')
      let scheduleHeight = scheduleEnd.diff(scheduleStart, 'minutes') * this.pixelPerMinute

      let start = scheduleStart.diff(dayStart, 'minutes') * this.pixelPerMinute

      return {
        start: start,
        height: scheduleHeight
      }
    },

    scheduleStyle() {
      return {
        height: this.startCoordinate.height + 'px',
        top: this.startCoordinate.start + 'px',
        width: this.columnWidth + 'px',
        left: (this.columnWidth * this.listOrder) + 'px',
        backgroundColor: this.schedule.expert.color
      }
    },

    hourGridStyle() {
      return {
        position: 'absolute',
        top: '0px',
        bottom: '0px',
        width: this.columnWidth + 'px',
        left: (this.columnWidth * this.listOrder) + 'px',
        borderRight: '1px solid #ccc'
      }
    },


    resourceEvents() {
      return this.events.filter(event => {
        return event.expert.id === this.schedule.expert.id
      })
    }


  },

  methods: {

    onDrop(event) {
      const itemData = JSON.parse(event.dataTransfer.getData('application/json'))

      console.log('expert : ' + itemData.expert.fullName + ' to ' + this.schedule.expert.name)

      let bounds = this.$refs.scheduleColumn.getBoundingClientRect()
      let droppedTop = event.clientY - itemData.layoutY

      let topOffset = droppedTop - bounds.top
      let topMinutes = topOffset / this.pixelPerMinute

      topMinutes = Math.round(topMinutes / this.options.hourGridMinutes) * this.options.hourGridMinutes

      topOffset = topMinutes * this.pixelPerMinute

      let topTime = this.$dayjs(this.day.format('YYYY-MM-DD') + ' ' + this.scheduleForThisDay.start).add(topMinutes, 'minutes')

      console.log('moved : ' + itemData.reservationStartTime.date + ' to ' + topTime.format('YYYY-MM-DD HH:mm'))

      this.droppedPosition = {
        position: 'absolute',
        top: topOffset + 'px',
        left: 0,
        width: '100%',
        height: '30px',
        backgroundColor: 'red',
        opacity: 1
      }


    },

    hourSlotClicked(hour) {
      this.$emit('hourSlotClicked', {
        time: hour,
        expert: this.schedule.expert
      })
    },
    hourSlotDropped(event) {
      this.$emit('hourSlotDropped', {
        time: event.hour,
        expert: this.schedule.expert,
        event: event.itemData
      })
    }
  },
  emits: ['hourSlotClicked', 'hourSlotDropped']

}
</script>

<style>
.schedule-column {
  position: absolute;
  left: 0;
  bottom: 0;
  opacity: 0.3;

  div {
    opacity: 1 !important;
  }
}

</style>