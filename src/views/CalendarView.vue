<template>


  <div class="container">

    <div class="d-flex justify-content-between mb-3">
      <a href="#" class="btn btn-primary me-4" @click.prevent="prevView">
        prev
      </a>

      <div>
        <h3>
          {{ calendarTitle }}
        </h3>
      </div>

      <a href="#" class="btn btn-primary ms-4" @click.prevent="nextView">
        next
      </a>
    </div>


    <div v-if="readyToBuildLayout">
      <CalendarVerticalLayout
          :current-date="currentDate"
          :start-date="startDate"
          :end-date="endDate"
          :day-count="dayCount"
          :options="options"
          :schedules="schedules"
          :events="calendar"
          :screen-width="screenWidth"
          :screen-height="screenHeight"
          v-if="view==='vertical'"/>

    </div>

  </div>


</template>

<script>

import {getCalendarInfo, getSchedules} from "@/repositories/GeneralDataRepository.js";
import CalendarVerticalLayout from "@/components/calendar/layouts/CalendarVerticalLayout.vue";

export default {
  name: 'CalendarView',
  components: {CalendarVerticalLayout},
  data() {
    return {
      token: 't_XKNJ2KWi451Tlf6TZBZp3BHnN4uyWD',
      view: 'vertical', //horizontal, month, vertical
      dayCount: 4,
      startDate: null,
      currentDate: null,
      endDate: null,
      calendar: [],
      screenWidth: 0,
      screenHeight: 0,
      minDate: null,
      maxDate: null,
      schedules: [],
      options: {
        dayStep: 1,
        showHourGrid: true,
        hourGridMinutes: 20,
        dayStartHour: '07:00',
        dayEndHour: '20:00',
      },
    }
  },
  watch: {

    startDate: function () {
      this.getCalendar();
    },

    endDate: function () {
      this.getCalendar();
    },

    currentDate: function () {
      this.calculateDates();
    },

    dayCount: function () {
      this.calculateDates();
    },


  },
  computed: {

    readyToBuildLayout() {
      return this.startDate && this.endDate && this.currentDate;
    },

    calendarTitle() {

      if (!this.startDate || !this.endDate) return '';

      if (this.startDate === this.endDate) {
        return this.startDate.format('DD MMMM YYYY');
      }
      // if same year
      if (this.startDate.format('YYYY') === this.endDate.format('YYYY')) {
        //if same month
        if (this.startDate.format('MM') === this.endDate.format('MM')) {
          return this.startDate.format('DD') + ' - ' + this.endDate.format('DD MMMM YYYY');
        }
        return this.startDate.format('DD MMMM') + ' - ' + this.endDate.format('DD MMMM YYYY');
      }
      return this.startDate.format('DD MMMM YYYY') + ' - ' + this.endDate.format('DD MMMM YYYY');
    }
  },
  methods: {

    getCalendar() {
      if (this.startDate && this.endDate) {
        getCalendarInfo(this.token, this.startDate.format('YYYY-MM-DD'), this.endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')).then((response) => {
          if (response.code === 200) {
            this.calendar = response.appointments
          } else {
            this.$swal({
              title: "Error",
              text: response.message,
              icon: 'error',
              showConfirmButton: true
            })
          }
        });
      }
    },

    getSchedules() {
      getSchedules(this.token).then((response) => {
        if (response.code === 200) {
          this.schedules = response.data
        } else {
          this.$swal({
            title: "Error",
            text: response.message,
            icon: 'error',
            showConfirmButton: true
          })
        }
      });
    },

    calculateDates() {
      let center = parseInt(this.dayCount / 2);
      this.startDate = this.currentDate.subtract(center, 'day');
      this.endDate = this.startDate.add(this.dayCount - 1, 'day');
    },

    prevView() {
      if (this.currentDate && (!this.minDate || this.currentDate.isAfter(this.minDate))) {
        this.currentDate = this.currentDate.subtract(this.options.dayStep, 'day');
      }
      return false;
    },
    nextView() {
      if (this.currentDate && (!this.maxDate || this.currentDate.isBefore(this.maxDate))) {
        this.currentDate = this.currentDate.add(this.options.dayStep, 'day');
      }
      return false;
    },

    onResize() {
      this.screenWidth = this.$el.offsetWidth;
      this.screenHeight = window.innerHeight *2;
    },

  },
  mounted() {

    this.onResize();

    window.addEventListener('resize', this.onResize);

    this.currentDate = this.$dayjs('2023-12-21').startOf('day');
    this.calculateDates();

    this.getSchedules();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
};

</script>