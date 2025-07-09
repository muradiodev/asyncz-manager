<template>
  <div class="calendar-vertical-view" :style="layoutStyle">
    <div class="calendar-vertical-view-date-row">
      <div
        class="position-absolute day-wrapper"
        :class="{ 'today-column': day.isSame($dayjs(), 'day') }"
        :style="{ width: columnWidth + 'px', left: ((columnWidth * column) + 50) + 'px' }"
        v-for="(day, column) in dayList"
        :key="day.format('YYYY-MM-DD')"
      >
        <div class="text-center week-day" @click.prevent="$emit('dayClicked',day)">
          <div class="day-name">{{ day.format('ddd') }}</div>
          <div>
            <span
              :class="{ 'day-number-circle': day.isSame($dayjs(), 'day') }"
            >
              {{ day.format('DD') }}
            </span>
          </div>
        </div>

        <div class="position-relative w-100 d-flex doctor-name-list">

          <div v-for="sc in schedules" :key="sc.expert.id"
               :title="sc.expert.name"
               data-bs-toggle="tooltipExpert"
               data-bs-placement="top"
               data-bs-html="true"
               class="text-center"
               :style="{'background':sc.expert.color, width: expertNameWidth+'px', height: expertNameHeight+'px'}">
<!--            {{ sc.expert.name}}-->
          </div>

        </div>
      </div>
    </div>
    <div class="calendar-content"
         :style="{marginTop: expertNameHeight+'px'}">
      <div class="hour-list">
        <VerticalHourGrid
            :day="currentDate"
            :pixel-per-minute="pixelPerMinute"
            :options="options"
            :show-time="true"
        />
      </div>
      <div class="day-list">
        <CalendarColumn
            v-for="(day, column) in dayList" :key="day.format('YYYY-MM-DD')"
            :day="day"
            :column-order="column"
            :current-date="currentDate"
            :column-width="columnWidth"
            :pixel-per-minute="pixelPerMinute"
            :options="options"
            :schedules="schedules"
            :events="events"
            @hourSlotClicked="$emit('hourSlotClicked', $event)"
            @hourSlotDropped="$emit('hourSlotDropped', $event)"
            @eventClicked="$emit('eventClicked', $event)"
            @appResized="$emit('appResized',$event)"
        />
      </div>

    </div>

  </div>
</template>

<style scoped lang="scss">
</style>

<script>
import CalendarColumn from "@/components/calendar/layouts/CalendarColumn.vue";
import VerticalHourGrid from "@/components/calendar/layouts/VerticalHourGrid.vue";
import {Dayjs} from "dayjs";

import { Tooltip } from 'bootstrap'

export default {
  name: 'CalendarVerticalLayout',
  components: {VerticalHourGrid, CalendarColumn},
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
    },
  },
  data() {
    return {}
  },

  computed: {
    columnWidth() {
      return (this.screenWidth - 42) / this.dayCount;
    },
    expertNameWidth() {
      return (this.columnWidth) / this.schedules.length;
    },
    expertNameHeight() {
      return this.expertNameWidth / 5;
    },
    pixelPerMinute() {
      let dayStart = this.$dayjs(this.options.dayStartHour, "HH:mm");
      let dayEnd = this.$dayjs(this.options.dayEndHour, "HH:mm");
      let dayLength = dayEnd.diff(dayStart, 'minutes');
      return (this.screenHeight - 30) / dayLength;
    },

    layoutStyle() {
      return {
        height: this.screenHeight + 'px',
      }
    },

    dayList() {

      let list = [];
      for (let s = this.startDate; s <= this.endDate; s = s.add(1, 'day')) {
        list.push(s.clone());
      }

      return list;

    },

  },

  methods: {},
  mounted() {
    new Tooltip(document.body, {
      selector: '[data-bs-toggle=\'tooltipExpert\']'
    })
  },
  emits: ['hourSlotClicked', 'hourSlotDropped','dayClicked','eventClicked','appResized']
}
</script>