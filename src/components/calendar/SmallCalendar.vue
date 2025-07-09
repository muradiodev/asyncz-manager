<template>
  <div class="small-calendar">
  <VCalendar
    ref="calendar"
    expanded
    borderless
    :isDark="isDark"
    @dayclick="calendarDayClick"
    @did-move="monthChanged($event)"
    :attributes="smallCalendarEvents"
  />
  </div>
</template>
<script>
import { getSmallCalendar } from '@/repositories/GeneralDataRepository.js'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.js'
import { useThemeStore } from '@/stores/theme.js'


export default {
  name: 'SmallCalendar',

  props: {
    value: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      eventDays: [],
      date: null,
    }
  },

  watch: {
    value(newVal) {
      this.moveToDate(newVal)
    },
    date(newVal, oldVal) {
      if (newVal !== null && oldVal !== null && newVal.format('YYYY-MM') !== oldVal.format('YYYY-MM')) {
        this.getCalendar()
      }
    }
  },

  computed: {


    ...mapState(useAuthStore, ['token']),
    ...mapState(useThemeStore, ['theme']),

    isDark(){
      console.log(this.theme)
      return this.theme === 'dark'
    },

    smallCalendarEvents() {

      let list = []

      this.eventDays.forEach(ev => {

        list.push({
          key: ev,
          bar: 'red',
          dates: ev,
          order: 1
        })
      })

      return list

    }
  },

  methods: {
    calendarDayClick(day) {
      this.$emit('calendarDayClick', day)
    },

    monthChanged(ev) {
      console.log('month changed start')
      let date = ev[0].id + '-01'
      if (this.date.format('YYYY-MM-01') !== date) {
        console.log('month changed ' + date)
        this.date = this.$dayjs(date)
        this.getCalendar()
      }
    },

    moveToDate(date) {
      console.log('move to date ' + date)
      if (date.format('YYYY-MM') !== this.date.format('YYYY-MM')) {
        console.log('move in ' + date.format('YYYY-MM'))
        //this.$refs.calendar.move(date)
      } else {
        console.log('month not changed ' + date)
      }
    },

    getCalendar() {
      if (this.date) {
        getSmallCalendar(this.token, this.date.format('YYYY-MM-DD')).then((response) => {
          if (response.code === 200) {
            this.eventDays = response.calendar
          } else {
            this.$swal({
              title: 'Error',
              text: response.message,
              icon: 'error',
              showConfirmButton: true
            })
          }
        })
      }
    }
  },
  mounted() {
    if (this.value) {
      this.date = this.value
    } else {
      this.date = this.$dayjs()
    }

    this.getCalendar();

  }

}
</script>

<style scoped>
</style>

