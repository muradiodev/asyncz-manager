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
          <div class="day-name">{{ weekdayLabel(day) }}</div>
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
               :style="{'background':sc.expert.color, width: expertNameWidth+'px', height: '5px'}">
<!--            {{ sc.expert.name}}-->
          </div>

        </div>
      </div>
    </div>
    <div class="calendar-content"
         :style="{marginTop: '5px'}">
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
            :blocks="blocks"
            @hourSlotClicked="$emit('hourSlotClicked', $event)"
            @hourSlotDropped="$emit('hourSlotDropped', $event)"
            @eventClicked="$emit('eventClicked', $event)"
            @appResized="$emit('appResized',$event)"
            @blockClicked="$emit('blockClicked', $event)"
            @blockResized="$emit('blockResized',$event)"
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
    blocks: {
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
      return this.columnWidth / (this.schedules.length || 1);
    },
    expertNameHeight() {
      return this.expertNameWidth / 5;
    },
    pixelPerMinute() {
      const dayStart = this.$dayjs(this.options.dayStartHour, "HH:mm");
      const dayEnd = this.$dayjs(this.options.dayEndHour, "HH:mm");
      const dayLength = dayEnd.diff(dayStart, "minutes");
      return (this.screenHeight - 30) / (dayLength || 1);
    },
    layoutStyle() {
      return { height: this.screenHeight + "px" };
    },
    dayList() {
      const list = [];
      for (let s = this.startDate; s <= this.endDate; s = s.add(1, "day")) {
        list.push(s.clone());
      }
      return list;
    },

    // read language code (same way you do elsewhere)
    preferredLanguage() {
      return localStorage.getItem("preferredLanguage") || "en";
    },

    // dictionary of weekday short labels without Dayjs locales
    weekdayMap() {
      // Order must be Sunday(0) ... Saturday(6) to match day.day()
      return {
        en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        tr: ["Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"],
        de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        az: ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."],
      };
    },
  },

  methods: {
    // returns localized weekday label (no Dayjs locale required)
    weekdayLabel(day) {
      const lang = this.preferredLanguage;
      const names = this.weekdayMap[lang] || this.weekdayMap.en;
      const idx = day.day(); // 0=Sun ... 6=Sat
      return names[idx];
    },
  },
  mounted() {
    new Tooltip(document.body, {
      selector: '[data-bs-toggle=\'tooltipExpert\']'
    })
  },
  emits: ['hourSlotClicked', 'hourSlotDropped','dayClicked','eventClicked','appResized']
}
</script>
