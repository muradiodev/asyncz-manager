<template>
  <div v-if="options.showHourGrid" class="hour-grid">

    <div
      v-for="(hour,j) in hours"
      :key="hour"
      class="hour"
      :style="{
        height:  hourHeight + 'px',
        top: (pixelPerMinute *options.hourGridMinutes * j  ) + 'px'
      }"
      @mouseover="hoveredTime = getHourLabel(hour)"
      @mouseleave="hoveredTime = null"
      @click.prevent="hourClicked(hour)"

      v-on:dragover.prevent
      v-on:drop="onDrop(hour,$event)"
    >
      <div v-if="showTime || hoveredTime === getHourLabel(hour) " class="hour-time">
        {{ getHourLabel(hour) }}
      </div>
    </div>
  </div>
</template>
<script>
import { Dayjs } from 'dayjs'

export default {
  name: 'VerticalHourGrid',
  props: {
    day: {
      type: Dayjs,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    pixelPerMinute: {
      type: Number,
      required: true
    },
    showTime: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      hoveredTime: null
    }
  },


  computed: {
    hours() {

      //get difference options.dayStartHour && options.dayEndHour;
      let startParts = this.options.dayStartHour.split(':')
      let start = this.day.clone().hour(startParts[0]).minute(startParts[1])
      let endParts = this.options.dayEndHour.split(':')
      let end = this.day.clone().hour(endParts[0]).minute(endParts[1])

      let list = []
      for (let i = start; !i.isAfter(end); i = i.add(this.options.hourGridMinutes, 'minutes')) {
        list.push(i.clone())
      }
      return list
    },

    hourHeight() {
      return this.pixelPerMinute * this.options.hourGridMinutes
    }
  },
  methods: {
    getHourLabel(hour) {
      return hour.format('HH:mm')
    },

    hourClicked(hour) {
      this.$emit('hourSlotClicked', hour)
    },

    onDrop(hour, event) {
      const itemData = JSON.parse(event.dataTransfer.getData('application/json'))
      this.$emit('hourSlotDropped', {hour: hour, itemData: itemData});
    }
  },
  emits: ['hourSlotClicked', 'hourSlotDropped']
}
</script>

<style scoped>
.hour-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .hour {
    position: absolute;
    left: 0;
    right: 0;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .hour-time {
      font-size: 12px;
      color: #aaa;
    }

    &:hover {
      background-color: #494d49;

      .hour-time {
        color: white;
      }
    }
  }
}
</style>