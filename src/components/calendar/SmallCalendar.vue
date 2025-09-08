<template>
  <div class="small-calendar">
    <VCalendar
      ref="calendar"
      expanded
      borderless
      :isDark="isDark"
      @dayclick="calendarDayClick"
      @did-move="monthChanged($event)"
      :attributes="calendarAttributes"
      :locale="calendarLocale"
    />
  </div>
</template>

<script>
import { getSmallCalendar } from '@/repositories/GeneralDataRepository.js'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.js'
import { useThemeStore } from '@/stores/theme.js'
import { toast } from 'vue3-toastify'

// custom localization for v-calendar
import azVCalendarLocale from '../../locale/vcalendar-az.js'

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
      if (
        newVal !== null &&
        oldVal !== null &&
        newVal.format('YYYY-MM') !== oldVal.format('YYYY-MM')
      ) {
        this.getCalendar()
      }
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token']),
    ...mapState(useThemeStore, ['theme']),

    isDark() {
      return this.theme === 'dark'
    },

    preferredLanguage() {
      return localStorage.getItem('preferredLanguage') || 'en'
    },

    // если az → отдаём объект, иначе строку
    calendarLocale() {
      if (this.preferredLanguage === 'az') {
        return azVCalendarLocale
      }
      return this.preferredLanguage
    },

    calendarAttributes() {
      const list = []

      // подсветка дней с событиями
      this.eventDays.forEach(ev => {
        list.push({
          key: 'event-' + ev,
          bar: 'red',
          dates: ev,
          order: 1
        })
      })

      // подсветка сегодняшнего дня
      const today = this.$dayjs().format('YYYY-MM-DD')
      list.push({
        key: 'today',
        dates: today,
        highlight: {
          color: 'red'
        },
        order: 99
      })

      return list
    }
  },
  methods: {
    calendarDayClick(day) {
      this.$emit('calendarDayClick', day)
    },
    monthChanged(ev) {
      let date = ev[0].id + '-01'
      if (this.date.format('YYYY-MM-01') !== date) {
        this.date = this.$dayjs(date)
        this.getCalendar()
      }
    },
    moveToDate(date) {
      if (date && this.date && date.format('YYYY-MM') !== this.date.format('YYYY-MM')) {
        // при необходимости можно вызвать
        // this.$refs.calendar.move(date)
      }
    },
    getCalendar() {
      if (this.date) {
        getSmallCalendar(this.token, this.date.format('YYYY-MM-DD')).then(response => {
          if (response.code === 200) {
            this.eventDays = response.calendar
          } else {
            toast.error(response.message)
          }
        })
      }
    },
    setDayjsLocale() {
      const lang = this.preferredLanguage === 'az' ? 'az' : this.preferredLanguage
      this.$dayjs.locale(lang)
    }
  },
  mounted() {
    this.date = this.value ? this.value : this.$dayjs()
    this.setDayjsLocale()
    this.getCalendar()
  }
}
</script>

<style scoped>
/* Optional: VCalendar уже добавляет стили, можно кастомизировать */
</style>