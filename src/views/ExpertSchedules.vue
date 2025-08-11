<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">{{ $t('expertSchedules.title') }}</h5>
    </div>

    <div class="card-body">
      <table class="table table-striped table-borderless">
        <thead>
        <tr>
          <th>{{ $t('expertSchedules.table.headers.day') }}</th>
          <th>{{ $t('expertSchedules.table.headers.start') }}</th>
          <th>{{ $t('expertSchedules.table.headers.breakStart') }}</th>
          <th>{{ $t('expertSchedules.table.headers.breakEnd') }}</th>
          <th>{{ $t('expertSchedules.table.headers.end') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="schedule in scheduleList" :key="schedule.day">
          <td>{{ schedule.day }}. {{ schedule.dayName }}</td>
          <td>
            <input
              class="form-control form-control-sm"
              type="time"
              v-model="schedule.start"
              @change="schedule.start = $event.target.value"
            />
          </td>
          <td>
            <input
              class="form-control form-control-sm"
              type="time"
              v-model="schedule.breakStart"
              @change="schedule.breakStart = $event.target.value"
            />
          </td>
          <td>
            <input
              class="form-control form-control-sm"
              type="time"
              v-model="schedule.breakEnd"
              @change="schedule.breakEnd = $event.target.value"
            />
          </td>
          <td>
            <input
              class="form-control form-control-sm"
              type="time"
              v-model="schedule.end"
              @change="schedule.end = $event.target.value"
            />
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer">
      <button class="btn-success-custom" @click="saveChanges">
        {{ $t('expertSchedules.actions.save') }}
      </button>
      <button class="btn-outline-danger-custom ms-3" @click="getExpertSchedules">
        {{ $t('expertSchedules.actions.reset') }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import {
  getExpertSchedules,  updateExpertSchedule
} from '@/repositories/ExpertsRepository.js'
import { useAuthStore } from '@/stores/auth.js'
import { toast } from 'vue3-toastify'

export default {
  name: 'ExpertSchedules',
  props: {
    expertId: {}
  },
  data() {
    return {
      weekdays: [
        { id: 1, name: 'Monday' },
        { id: 2, name: 'Tuesday' },
        { id: 3, name: 'Wednesday' },
        { id: 4, name: 'Thursday' },
        { id: 5, name: 'Friday' },
        { id: 6, name: 'Saturday' },
        { id: 7, name: 'Sunday' }
      ],
      expertSchedules: []
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user', 'token']),

    scheduleList: {

      get() {

        let list = []

        this.weekdays.forEach(day => {
          let expertSchedule = this.expertSchedules.find(es => es.weekDay === day.id)

          if (!expertSchedule) {
            list.push({
              id: null,
              day: day.id,
              dayName: day.name,
              start: '00:00',
              end: '00:00',
              breakStart: '00:00',
              breakEnd: '00:00'
            })
          } else {
            list.push({
              id: expertSchedule.id,
              day: day.id,
              dayName: day.name,
              start: this.getTime(expertSchedule.dayStart),
              end: this.getTime(expertSchedule.dayEnd),
              breakStart: this.getTime(expertSchedule.pauseStart),
              breakEnd: this.getTime(expertSchedule.pauseEnd)
            })
          }
        })

        return list

      },
      set(val) {

        this.expertSchedules = val

      }
    }
  },
  methods: {

    getExpertSchedules() {
      getExpertSchedules(this.token, this.expertId).then((expertSchedules) => {
        this.expertSchedules = expertSchedules
      })
    },

    getTime(dateObject) {

      return this.$dayjs(dateObject.date).format('HH:mm')

    },

    saveChanges() {

      let dayData = []

      this.scheduleList.forEach(schedule => {
        dayData.push({
          id: schedule.id,
          weekDay: schedule.day,
          dayStart: this.$dayjs(`2021-01-01 ${schedule.start}`).format('YYYY-MM-DD HH:mm:ss'),
          dayEnd: this.$dayjs(`2021-01-01 ${schedule.end}`).format('YYYY-MM-DD HH:mm:ss'),
          pauseStart: this.$dayjs(`2021-01-01 ${schedule.breakStart}`).format('YYYY-MM-DD HH:mm:ss'),
          pauseEnd: this.$dayjs(`2021-01-01 ${schedule.breakEnd}`).format('YYYY-MM-DD HH:mm:ss')
        })
      });


      updateExpertSchedule(this.token, this.expertId,dayData).then(() => {
        toast.success('Changes saved successfully');
        this.getExpertSchedules()
      })
    }
  },
  mounted() {
    this.getExpertSchedules()
  }
}
</script>