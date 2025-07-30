<template>
  <div
      class="calendar-column"
      :class="{'current-day': isCurrentDay}"
      :style="columnStyle">


    <ResourceScheduleColumn
        v-for="(schedule, listOrder) in schedules" :key="schedule.expert.id"
        :schedule="schedule"
        :events = "columnEvents"
        :blocks = "columnBlocks"
        :day="day"
        :listOrder="listOrder"
        :column-width="resourceWidth"
        :pixel-per-minute="pixelPerMinute"
        :options="options"
        @hourSlotClicked="$emit('hourSlotClicked', $event)"
        @hourSlotDropped="$emit('hourSlotDropped', $event)"
        @eventClicked="$emit('eventClicked', $event)"
        @appResized="$emit('appResized',$event)"
        @blockClicked="$emit('blockClicked', $event)"
        @blockResized="$emit('blockResized',$event)"
    />

  </div>
</template>
<script>
import ResourceScheduleColumn from "@/components/calendar/layouts/ResourceScheduleColumn.vue";
import {Dayjs} from "dayjs";

export default {
  name: 'CalendarColumn',
  components: {ResourceScheduleColumn},
  props: {
    day: {
      type: Dayjs,
      required: true
    },
    columnOrder: {
      type: Number,
      required: true
    },
    currentDate: {
      type: Dayjs,
      required: true
    },
    pixelPerMinute: {
      type: Number,
      required: true
    },
    columnWidth: {
      type: Number,
      required: true
    },
    options: {
      type: Dayjs,
      required: true
    },
    schedules: {
      type: Array,
      default: () => []
    },
    events: {
      type: Array,
      default: () => []
    },
    blocks: {
      type: Array,
      default: () => []
    },
  },

  computed: {
    isCurrentDay() {
      return this.day.isSame(this.$dayjs(), 'day');
    },

    columnStyle() {
      return {
        width: this.columnWidth + 'px',
        border: '1px solid #ccc',
        position: 'absolute',
        left: this.columnOrder * this.columnWidth + 'px',
        top: 0,
        bottom: 0
      }
    },

    resourceWidth() {
      return this.columnWidth / this.schedules.length;
    },

    columnEvents() {
      if(!this.events){
        return [];
      }
      return this.events.filter(event => {
        let reservationStartTime = this.$dayjs(event.reservationStartTime.date);
        return reservationStartTime.isSame(this.day, 'day');
      });
    },

    columnBlocks() {
      if(!this.blocks){
        return [];
      }
      return this.blocks.filter(event => {
        let startTime = this.$dayjs(event.startTime.date);
        return startTime.isSame(this.day, 'day');
      });
    },




  },
  emits: ['hourSlotClicked', 'hourSlotDropped']
}
</script>

<style lang="scss" scoped>
</style>
