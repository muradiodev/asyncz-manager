<template>
  <div class="calendar-vertical-view" :style="layoutStyle">
    <div class="calendar-vertical-view-date-row">
      <div class="position-absolute" :style="{width: columnWidth+'px', left: (columnWidth * column +50)+'px' }"
           v-for="(day, column) in dayList"
           :key="day.format('YYYY-MM-DD')">
        <div class="text-center">
          {{ day.format('DD MMM, ddd') }}
        </div>
        <div class="position-relative w-100 d-flex doctor-name-list">

          <div v-for="sc in schedules" :key="sc.expert.id"
               :title="sc.expert.name"
               class="text-center flex-grow-1"
               :style="{'background':sc.expert.color}">
            {{ sc.expert.name}}
          </div>

        </div>
      </div>
    </div>
    <div class="calendar-content">
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
        />
      </div>

    </div>

  </div>
</template>
<script>
import CalendarColumn from "@/components/calendar/layouts/CalendarColumn.vue";
import VerticalHourGrid from "@/components/calendar/layouts/VerticalHourGrid.vue";
import {Dayjs} from "dayjs";

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
      return (this.screenWidth - 75) / this.dayCount;
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

  },
  emits: ['hourSlotClicked', 'hourSlotDropped']
}
</script>

<style scoped lang="scss">

.calendar-vertical-view {
  position: relative;
  border: 1px solid #ccc;

  .calendar-vertical-view-date-row {
    height: 50px;
    border-bottom: 1px solid #ccc;

    .doctor-name-list{
      height: 100%;
      overflow: hidden;
      font-size: 12px;
      //truncate
      div {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 3px;
      }
    }
  }

  .calendar-content {
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    .hour-list {
      width: 50px;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      overflow: hidden;
    }

    .day-list {
      position: absolute;
      top: 0;
      left: 50px;
      bottom: 0;
      right: 0;
      overflow: hidden;
    }
  }
}

</style>