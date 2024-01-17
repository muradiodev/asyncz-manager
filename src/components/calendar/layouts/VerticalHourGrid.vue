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
    >
      <div v-if="showTime" class="hour-time">
        {{ getHourLabel(hour) }}
      </div>
    </div>
  </div>
</template>
<script>
import {Dayjs} from "dayjs";

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

  computed: {
    hours() {

      //get difference options.dayStartHour && options.dayEndHour;
      let startParts = this.options.dayStartHour.split(':');
      let start = this.day.clone().hour(startParts[0]).minute(startParts[1]);
      let endParts = this.options.dayEndHour.split(':');
      let end = this.day.clone().hour(endParts[0]).minute(endParts[1]);

      let list = [];
      for (let i = start; !i.isAfter(end); i = i.add(this.options.hourGridMinutes, 'minutes')) {
        list.push(i.clone());
      }
      return list;
    },

    hourHeight() {
      return this.pixelPerMinute * this.options.hourGridMinutes;
    }
  },
  methods: {
    getHourLabel(hour) {
      return hour.format('HH:mm');
    }
  }
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

    .hour-time {
      font-size: 12px;
      color: #aaa;
    }
  }
}
</style>