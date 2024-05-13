<template>
  <div class="month-day" :class="{'active':isCurrentDay}">
    <div class="text-center day-title" @click.prevent="dayClicked">
      {{ day.format('D') }}
    </div>
    <div class="month-event"
         data-bs-toggle="tooltip"
         data-bs-placement="top"
         data-bs-html="true"
         :title="tooltipTitle(ev)"
         v-for="ev in dayEvents" :key="ev.id"
         @click.prevent="$emit('eventClicked',ev)">
      <span class="event-dot" :style="{
        'background': ev.expert.color
      }"></span>
      {{ ev.expert.fullName }} - {{ ev.procedure.name }}
    </div>

  </div>
</template>
<script>
import { Dayjs } from 'dayjs'

import { Tooltip } from 'bootstrap'


export default {
  name: 'MonthlyViewDay',
  props: {
    day: {
      type: Dayjs,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    isCurrentDay() {
      return this.day.isSame(this.$dayjs(), 'day')
    },

    dayEvents() {
      if (!this.events) {
        return []
      }
      return this.events.filter(event => {
        let reservationStartTime = this.$dayjs(event.reservationStartTime.date)
        return reservationStartTime.isSame(this.day, 'day')
      })
    }
  },
  methods: {
    dayClicked() {
      this.$emit('dayClicked', this.day)
    },
    tooltipTitle(event) {
      let text = '<span style=\'text-align: left\'>'
      text += event.id + ' <b>' + event.procedure.name + '</b>  <br>'
      text += '<b>' + this.$dayjs(event.reservationStartTime.date).format('HH:mm') + '</b> '
      text += event.name + ' ' + event.surname + ' <br>'
      text += 'lenght: ' + event.reservationLength + ' min <br>'
      text += 'status: ' + event.status + ' <br>'
      text += '</span>'
      return text
    },
  },
  mounted() {
    new Tooltip(document.body, {
      selector: '[data-bs-toggle=\'tooltip\']'
    })
  },
  emits: ['dayClicked']
}
</script>

<style scoped>

.month-day {
  height: 100%;

  &.active {
    background-color: #aae8ac;
  }

  .day-title {
    padding: 5px 0;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
  }


  .month-event {
    padding: 2px 3px;
    font-size: 10px;
    cursor: pointer;
    /* single line with truncate  */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: #ababab;
    margin: 2px;
    border-radius: 3px;

    &:hover {
      background-color: #494d49;
      color: white;
    }

  }

  .event-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 3px;
  }


}


</style>