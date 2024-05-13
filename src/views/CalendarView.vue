<template>


  <div class="container-fluid">

    <div class="row">
      <div class="col-md-3">

        <div class="mb-3">

          <div class="dropdown">
            <button class="btn btn-outline-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
              Create new
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li><a class="dropdown-item" href="#"  @click.prevent="startNewEventFromScratch">Appointment</a></li>
              <li><a class="dropdown-item" href="#">Time syncer</a></li>
            </ul>
          </div>

        </div>


        <div class="card mb-4">
          <div class="card-body">
            <VCalendar
              expanded
              borderless
              @dayclick="calendarDayClick"
            />
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            Experts
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item" v-for="sh in schedules" :key="sh.expert.id">
              <label>
                <input class="form-check-input me-1" type="checkbox" :value="sh.expert.id" v-model="selectedSchedules"
                       aria-label="...">
                {{ sh.expert.name }}
              </label>
            </li>
          </ul>
        </div>

      </div>
      <div class="col-md-9" id="calendarView">

        <div class="d-flex justify-content-between mb-3">
          <div>
            <a href="#" class="btn btn-outline-secondary me-2" @click.prevent="prevView">
              <fa-icon :icon="['fas', 'chevron-left']" />
            </a>

            <a href="#" class="btn  btn-outline-secondary ms-2" @click.prevent="nextView">
              <fa-icon :icon="['fas', 'chevron-right']" />
            </a>
          </div>

          <div>
            <h3>
              {{ calendarTitle }}
            </h3>
          </div>


          <div>
            <div class="dropdown">
              <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                      data-bs-toggle="dropdown" aria-expanded="false">
                {{ views[activeView].title }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li v-for="(v,k) in views" :key="k">
                  <a class="dropdown-item" href="#" @click.prevent="activateView(k)">
                    {{ v.title }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>


        <div v-if="readyToBuildLayout">
          <CalendarVerticalLayout
            :current-date="currentDate"
            :start-date="startDate"
            :end-date="endDate"
            :day-count="dayCount"
            :options="options"
            :schedules="visibleSchedules"
            :events="visibleEvents"
            :screen-width="screenWidth"
            :screen-height="screenHeight"
            v-if="view===VIEW_VERTICAL"
            @hourSlotClicked="openNewAppointmentModal"
            @hourSlotDropped="updateAppointmentTime"

            @dayClicked="openDayDailyView"
            @eventClicked="showAppointmentDetails"
          />


          <CalendarMonthLayout
            :current-date="currentDate"
            :start-date="startDate"
            :end-date="endDate"
            :day-count="dayCount"
            :options="options"
            :schedules="visibleSchedules"
            :events="visibleEvents"
            :screen-width="screenWidth"
            :screen-height="screenHeight"
            v-if="view===VIEW_MONTH"
            @dayClicked="openDayDailyView"
            @eventClicked="showAppointmentDetails"
          />


        </div>
      </div>
    </div>

  </div>


  <ModalComponent title="new appointment" v-if="newAppointmentIsOpen" @modalClose="newAppointmentIsOpen = false">
    <form @submit.prevent="createNewAppointment">
      <div class="row">

        <div class="col-md-6 mb-3">

          <label for="newExpert" class="form-label">Expert</label>
          <select
            class="form-select"
            id="newExpert"
            v-model="newItemDetails.expert"
            required
          >
            <option v-for="expert in expertList" :key="expert.id" :value="expert.id">
              {{ expert.name }}
            </option>
          </select>
        </div>
        <div class="col-md-6 mb-3">

          <label for="newProcedure" class="form-label">Procedure</label>
          <select
            class="form-select"
            id="newProcedure"
            v-model="newItemDetails.procedure"
            required
          >
            <option v-for="procedure in selectedExpertProcedureList" :key="procedure.id" :value="procedure.id">
              {{ procedure.name }} ({{ procedure.length }} minutes)
            </option>
          </select>
        </div>
        <div class="col-md-4 mb-3">

          <label for="newDate" class="form-label">Date</label>
          <input
            type="date"
            class="form-control"
            id="newDate"
            v-model="newItemDetails.date"
            required>
        </div>
        <div class="col-md-4 mb-3">

          <label for="newTime" class="form-label">Time</label>
          <input
            type="time"
            class="form-control"
            id="newTime"
            v-model="newItemDetails.time"
            required>
        </div>

        <div class="col-md-4 mb-3">

          <label for="newLength" class="form-label">Length</label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="newLength"
              v-model="newItemDetails.length"
              required>
            <span class="input-group-text">minutes</span>
          </div>
        </div>

        <div class="col-md-6 mb-3">

          <label for="newName" class="form-label">Name</label>
          <input
            type="text"
            class="form-control"
            id="newName"
            v-model="newItemDetails.name"
            required>
        </div>

        <div class="col-md-6 mb-3">

          <label for="newSurname" class="form-label">Surname</label>
          <input
            type="text"
            class="form-control"
            id="newSurname"
            v-model="newItemDetails.surname"
            required>
        </div>

        <div class="col-md-6 mb-3">

          <label for="newPhone" class="form-label">Phone</label>
          <input
            type="text"
            class="form-control"
            id="newPhone"
            v-model="newItemDetails.phone"
            required>
        </div>

        <div class="col-md-6 mb-3">

          <label for="newEmail" class="form-label">Email</label>
          <input
            type="email"
            class="form-control"
            id="newEmail"
            v-model="newItemDetails.email"
          >
        </div>


        <div class="col-md-12 mb-3">

          <label for="newNotes" class="form-label">Notes</label>
          <textarea
            class="form-control"
            id="newNotes"
            v-model="newItemDetails.notes"
          >
          </textarea>
        </div>


        <div class="col-md-12">
          <button class="btn btn-success">Create</button>
        </div>
      </div>
    </form>
  </ModalComponent>


  <ModalComponent title="edit appointment" v-if="editingAppointment" @modalClose="editingAppointment = null">
    <form @submit.prevent="updateAppointment">
      <div class="row">

        <div class="col-md-6 mb-3">

          <label for="updateExpert" class="form-label">Expert</label>
          <select
            class="form-select"
            id="updateExpert"
            v-model="editingAppointment.expert.id"
            required
          >
            <option v-for="expert in expertList" :key="expert.id" :value="expert.id">
              {{ expert.name }}
            </option>
          </select>
        </div>
        <div class="col-md-6 mb-3">

          <label for="updateProcedure" class="form-label">Procedure</label>
          <select
            class="form-select"
            id="updateProcedure"
            v-model="editingAppointment.procedure.id"
            required
          >
            <option v-for="procedure in selectedExpertProcedureListUpdate" :key="procedure.id" :value="procedure.id">
              {{ procedure.name }} ({{ procedure.length }} minutes)
            </option>
          </select>
        </div>
        <div class="col-md-4 mb-3">

          <label for="updateDate" class="form-label">Date</label>
          <input
            type="date"
            class="form-control"
            id="updateDate"
            v-model="editingAppointment.date"
            required>
        </div>
        <div class="col-md-4 mb-3">

          <label for="updateTime" class="form-label">Time</label>
          <input
            type="time"
            class="form-control"
            id="updateTime"
            v-model="editingAppointment.time"
            required>
        </div>

        <div class="col-md-4 mb-3">

          <label for="updateLength" class="form-label">Length</label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="updateLength"
              v-model="editingAppointment.reservationLength"
              required>
            <span class="input-group-text">minutes</span>
          </div>
        </div>

        <div class="col-md-6 mb-3">

          <label for="updateName" class="form-label">Name</label>
          <input
            type="text"
            class="form-control"
            id="updateName"
            v-model="editingAppointment.name"
            required>
        </div>

        <div class="col-md-6 mb-3">

          <label for="updateSurname" class="form-label">Surname</label>
          <input
            type="text"
            class="form-control"
            id="updateSurname"
            v-model="editingAppointment.surname"
            required>
        </div>

        <div class="col-md-6 mb-3">

          <label for="updatePhone" class="form-label">Phone</label>
          <input
            type="text"
            class="form-control"
            id="updatePhone"
            v-model="editingAppointment.phone"
            required>
        </div>

        <div class="col-md-6 mb-3">

          <label for="updateEmail" class="form-label">Email</label>
          <input
            type="email"
            class="form-control"
            id="updateEmail"
            v-model="editingAppointment.email"
          >
        </div>


        <div class="col-md-12 mb-3">

          <label for="updateNotes" class="form-label">Notes</label>
          <textarea
            class="form-control"
            id="updateNotes"
            v-model="editingAppointment.notes"
          >
          </textarea>
        </div>


        <div class="col-md-12">
          <button class="btn btn-success">Update</button>
        </div>
      </div>
    </form>
  </ModalComponent>

  <ModalComponent title="Appointment details" v-if="activeAppointment" @modalClose="activeAppointment = null">

    <div class="row">

      <div class="col-md-6 mb-3">
        <div class="mb-1">
          <span class="small text-secondary">Expert:</span> <br>
          <strong>{{ activeAppointment.expert.fullName }}</strong>
        </div>

        <div class="mb-1">
          <span class="small text-secondary">Procedure:</span> <br>
          <strong>{{ activeAppointment.procedure.name }}</strong>
        </div>

        <div class="mb-1">
          <span class="small text-secondary">Starts:</span> <br>
          <strong>{{ formatTime(activeAppointment.reservationStartTime.date) }}</strong>
        </div>

        <div class="mb-1">
          <span class="small text-secondary">Duration:</span> <br>
          <strong>{{ activeAppointment.reservationLength }} minute</strong>
          <span class="text-danger small"
                v-if="activeAppointment.reservationLength!==activeAppointment.procedure['length']">
             (originaly was {{ activeAppointment.procedure['length'] }} minute)
          </span>
        </div>

      </div>
      <div class="col-md-6">
        <div class="mb-1">
          <span class="small text-secondary">Customer:</span> <br>
          <strong>{{ activeAppointment.name }} {{ activeAppointment.surname }} </strong>
        </div>
        <div class="mb-1">
          <span class="small text-secondary">Phone:</span> <br>
          <strong>{{ activeAppointment.phone }} </strong>
        </div>
        <div class="mb-1">
          <span class="small text-secondary">Email:</span> <br>
          <strong>{{ activeAppointment.email }} </strong>
        </div>
        <div class="mb-1">
          <span class="small text-secondary">Notes:</span> <br>
          <strong>{{ activeAppointment.notes || '-' }} </strong>
        </div>
        <div class="mb-1">
          <span class="small text-secondary">Requested at :</span> <br>
          <strong>{{ formatTime(activeAppointment.requestTime.date) }} </strong>
        </div>
      </div>
      <div class="col-12">
        <div class="mt-3">
          <button class="btn btn-sm btn-primary" @click.prevent="editAppointment(activeAppointment) ">
            Update appointment
          </button>
        </div>
      </div>
    </div>


  </ModalComponent>


</template>

<script>

import { getCalendarInfo, getSchedules } from '@/repositories/GeneralDataRepository.js'
import CalendarVerticalLayout from '@/components/calendar/layouts/CalendarVerticalLayout.vue'
import { VIEW_MONTH, VIEW_VERTICAL } from '@/Constants.js'
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { FontAwesomeIcon as FaIcon } from '@fortawesome/vue-fontawesome'
import CalendarMonthLayout from '@/components/calendar/layouts/CalendarMonthLayout.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import { getProcedures } from '@/repositories/ProceduresRepository.js'
import { createAppointment, setTime, updateAppointment } from '@/repositories/AppointmentRepository.js'

export default {
  name: 'CalendarView',
  components: { ModalComponent, CalendarMonthLayout, FaIcon, CalendarVerticalLayout },
  data() {
    return {
      view: VIEW_MONTH, //horizontal, month, vertical
      dayCount: 7,
      dayStep: 7,
      startDate: null,
      currentDate: null,
      endDate: null,
      eventList: [],
      screenWidth: 0,
      screenHeight: 0,
      minDate: null,
      maxDate: null,
      schedules: [],
      selectedSchedules: [],
      activeView: 'week',
      views: {
        day: {
          type: VIEW_VERTICAL,
          title: 'Day',
          dayCount: 1,
          dayStep: 1
        },
        week: {
          type: VIEW_VERTICAL,
          title: 'Week',
          dayCount: 7,
          dayStep: 7
        },
        month: {
          type: VIEW_MONTH,
          title: 'Month'
        }
      },

      procedures: [],


      newAppointmentIsOpen: false,
      newItemDetails: {
        expert: '',
        time: ''
      },

      editingAppointment: null,

      activeAppointment: null
    }
  },
  watch: {

    startDate: function() {
      this.getCalendar()
    },

    endDate: function() {
      this.getCalendar()
    },

    currentDate: function() {
      this.calculateDates()
    },

    dayCount: function() {
      this.calculateDates()
    },
    'newItemDetails.expert': function() {
      this.newItemDetails.procedure = 0
    },
    'newItemDetails.procedure': function() {
      let procedure = this.procedures.find(p => p.id === this.newItemDetails.procedure)
      if (procedure) {
        this.newItemDetails.length = procedure.length
      } else {
        this.newItemDetails.length = 0
      }
    },
    selectedSchedules: {
      handler: function() {
        localStorage.setItem('selectedSchedules', JSON.stringify(this.selectedSchedules))
      },
      deep: true
    }

  },
  computed: {

    options() {
      return {
        dayStep: this.dayStep,
        showHourGrid: true,
        hourGridMinutes: 10,
        dayStartHour: this.staringHour,
        dayEndHour: this.endingHour
      }
    },
    staringHour() {
      let startHour = '23:59'
      if (this.schedules.length > 0) {
        this.schedules.forEach(schedule => {

          if (schedule.schedules) {
            Object.keys(schedule.schedules).forEach(k => {

              let s = schedule.schedules[k]

              if (s.start === s.end) return

              if (s.start.split(':').join('') < startHour.split(':').join('')) {
                startHour = s.start
              }
            })
          }
        })
      }
      //remove 1 hour from the start hour
      let [hour, minute] = startHour.split(':')
      if (minute === '00') {
        hour = parseInt(hour) - 1
        if (hour < 0) hour = 0
      }
      return hour + ':' + minute
    },

    visibleSchedules() {
      if (this.selectedSchedules.length === 0) return []
      return this.schedules.filter(s => this.selectedSchedules.includes(s.expert.id))
    },

    visibleEvents() {
      if (this.selectedSchedules.length === 0) return this.eventList
      return this.eventList.filter(event => {
        return this.selectedSchedules.includes(event.expert.id)
      })
    },

    endingHour() {

      let endHour = '00:00'
      if (this.schedules.length > 0) {
        this.schedules.forEach(schedule => {
          if (schedule.schedules) {
            Object.keys(schedule.schedules).forEach(k => {
              let s = schedule.schedules[k]
              if (s.start === s.end) return
              if (s.end.split(':').join('') > endHour.split(':').join('')) {
                endHour = s.end
              }
            })
          }
        })
      }
      //add 1 hour to the end hour
      let [hour, minute] = endHour.split(':')
      if (minute === '00') {
        hour = parseInt(hour) + 1
        if (hour > 23) hour = 23
      }
      return hour + ':' + minute

    },

    ...mapState(useAuthStore, ['token']),

    readyToBuildLayout() {
      return this.startDate && this.endDate && this.currentDate
    },

    calendarTitle() {

      if (!this.startDate || !this.endDate) return ''

      if (this.startDate.isSame(this.endDate, 'day')) {
        return this.startDate.format('DD MMMM YYYY')
      }
      // if same year
      if (this.startDate.format('YYYY') === this.endDate.format('YYYY')) {
        //if same month
        if (this.startDate.format('MM') === this.endDate.format('MM')) {
          return this.startDate.format('DD') + ' - ' + this.endDate.format('DD MMMM YYYY')
        }
        return this.startDate.format('DD MMMM') + ' - ' + this.endDate.format('DD MMMM YYYY')
      }
      return this.startDate.format('DD MMMM YYYY') + ' - ' + this.endDate.format('DD MMMM YYYY')
    },

    VIEW_VERTICAL() {
      return VIEW_VERTICAL
    },
    VIEW_MONTH() {
      return VIEW_MONTH
    },

    expertList() {
      return this.schedules.map(s => {
        return { id: s.expert.id, name: s.expert.name }
      })
    },

    selectedExpertProcedureList() {

      let expert = this.schedules.find(s => s.expert.id === this.newItemDetails.expert)

      if (expert) {

        return this.procedures.filter(p => expert.procedures.includes(p.id)).map(p => {
          return { id: p.id, name: p.name, length: p.length }
        })
      }


      return []

    },

    selectedExpertProcedureListUpdate() {

      let expert = this.schedules.find(s => s.expert.id === this.editingAppointment.expert.id)

      if (expert) {

        return this.procedures.filter(p => expert.procedures.includes(p.id)).map(p => {
          return { id: p.id, name: p.name, length: p.length }
        })
      }


      return []

    }


  },
  methods: {

    getCalendar() {
      if (this.startDate && this.endDate) {
        getCalendarInfo(this.token, this.startDate.format('YYYY-MM-DD'), this.endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')).then((response) => {
          if (response.code === 200) {
            this.eventList = response.appointments
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
    },

    getSchedules() {
      getSchedules(this.token).then((response) => {
        if (response.code === 200) {
          this.schedules = response.data

          let selectedSchedules = localStorage.getItem('selectedSchedules')

          if (selectedSchedules) {
            this.selectedSchedules = JSON.parse(selectedSchedules)
          } else {
            this.selectedSchedules = this.schedules.map(s => s.expert.id)
          }
        } else {
          this.$swal({
            title: 'Error',
            text: response.message,
            icon: 'error',
            showConfirmButton: true
          })
        }
      })
    },

    getProcedures() {
      getProcedures(this.token).then(response => {
        this.procedures = response
      })
    },

    calculateDates() {
      this.startDate = this.currentDate
      this.endDate = this.startDate.add(this.dayCount - 1, 'day')
    },

    prevView() {
      if (this.currentDate && (!this.minDate || this.currentDate.isAfter(this.minDate))) {
        if (this.activeView === 'month') {
          this.currentDate = this.currentDate.subtract(1, 'month')
          this.dayCount = this.currentDate.daysInMonth()
        } else {
          this.currentDate = this.currentDate.subtract(this.options.dayStep, 'day')
        }
      }
      return false
    },
    nextView() {
      if (this.currentDate && (!this.maxDate || this.currentDate.isBefore(this.maxDate))) {
        if (this.activeView === 'month') {
          this.currentDate = this.currentDate.add(1, 'month')
          this.dayCount = this.currentDate.daysInMonth()
        } else {
          this.currentDate = this.currentDate.add(this.options.dayStep, 'day')
        }
      }
      return false
    },

    onResize() {
      this.screenWidth = window.document.getElementById('calendarView').offsetWidth - 10
      this.screenHeight = window.innerHeight * 2
    },

    activateView(view) {
      let config = this.views[view]
      if (!config) {
        console.error('Invalid view', view)
        return
      }
      this.activeView = view
      this.dayCount = config.dayCount
      this.dayStep = config.dayStep
      this.view = config.type

      if (!this.currentDate) {
        this.currentDate = this.$dayjs()
      }

      if (config.type === VIEW_MONTH) {
        this.currentDate = this.currentDate.startOf('month')
        this.dayStep = this.currentDate.daysInMonth()
        this.dayCount = this.dayStep
      } else if (view === 'week') {
        this.currentDate = this.currentDate.startOf('week')
      } else {
        this.currentDate = this.currentDate.startOf('day')
      }

    },

    calendarDayClick(day) {
      this.currentDate = this.$dayjs(day.id).startOf(this.activeView)
    },

    openDayDailyView(day) {
      this.currentDate = day.startOf('day')
      this.activateView('day')
    },

    openNewAppointmentModal(details) {
      this.newAppointmentIsOpen = true
      this.newItemDetails = {
        expert: details.expert.id,
        date: details.time.format('YYYY-MM-DD'),
        time: details.time.format('HH:mm:00'),
        procedure: 0,
        length: 0,
        name: '',
        surname: '',
        phone: '',
        email: '',
        notes: '',
        color: '#387f94'
      }
    },
    startNewEventFromScratch() {
      this.newAppointmentIsOpen = true
      this.newItemDetails = {
        expert: null,
        date: null,
        time: null,
        procedure: 0,
        length: 0,
        name: '',
        surname: '',
        phone: '',
        email: '',
        notes: '',
        color: '#387f94'
      }
    },

    editAppointment(appointment) {
      this.editingAppointment =  JSON.parse(JSON.stringify(appointment));
      this.editingAppointment.date = this.$dayjs(appointment.reservationStartTime.date).format('YYYY-MM-DD')
      this.editingAppointment.time = this.$dayjs(appointment.reservationStartTime.date).format('HH:mm')
    },

    createNewAppointment() {

      createAppointment(this.token,
        this.newItemDetails.expert,
        this.newItemDetails.procedure,
        this.newItemDetails.date + ' ' + this.newItemDetails.time,
        this.newItemDetails.length,
        this.newItemDetails.name,
        this.newItemDetails.surname,
        this.newItemDetails.phone,
        this.newItemDetails.email,
        this.newItemDetails.notes,
        this.newItemDetails.color
      ).then(response => {
        if (response.code === 200) {
          this.$swal({
            title: 'Success',
            text: 'Appointment created',
            icon: 'success',
            showConfirmButton: true
          })
          this.newAppointmentIsOpen = false
          this.getCalendar()
        } else {
          this.$swal({
            title: 'Error',
            text: response.message,
            icon: 'error',
            showConfirmButton: true
          })
        }
      })

    },

    updateAppointment() {

      updateAppointment(this.token,
        this.editingAppointment.id,
        this.editingAppointment.expert.id,
        this.editingAppointment.procedure.id,
        this.editingAppointment.date + ' ' + this.editingAppointment.time,
        this.editingAppointment.reservationLength,
        this.editingAppointment.name,
        this.editingAppointment.surname,
        this.editingAppointment.phone,
        this.editingAppointment.email,
        this.editingAppointment.notes,
        this.editingAppointment.color
      ).then(response => {
        if (response.code === 200) {
          this.$swal({
            title: 'Success',
            text: 'Appointment updated',
            icon: 'success',
            showConfirmButton: true
          })
          this.editingAppointment = null
          //todo get active appointment one more time to update the view
          this.getCalendar()
        } else {
          this.$swal({
            title: 'Error',
            text: response.message,
            icon: 'error',
            showConfirmButton: true
          })
        }
      })

    },

    updateAppointmentTime(event) {


      this.$swal({
        title: 'Update appointment time',
        text: 'Are you sure you want to update the appointment?',
        html: '<p><strong>Expert: </strong>' + event.expert.name + '</p><p><strong>Time: </strong> ' + event.time.format('DD MMM YYYY HH:mm') + '</p>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (!result.isConfirmed) return
        setTime(this.token, event.event.id, event.time.format('YYYY-MM-DD HH:mm:ss'), event.expert.id).then(response => {
            if (response.code === 200) {
              this.$swal({
                title: 'Success',
                text: 'Appointment time updated',
                icon: 'success',
                showConfirmButton: true
              })
              this.getCalendar()
            } else {
              this.$swal({
                title: 'Error',
                text: response.message,
                icon: 'error',
                showConfirmButton: true
              })
            }
          }
        )
      })


    },

    showAppointmentDetails(event) {

      this.activeAppointment = event

    },
    formatTime(time) {
      return this.$dayjs(time).format('DD.MM.YYYY HH:mm')
    }
  },
  mounted() {

    this.onResize()

    window.addEventListener('resize', this.onResize)


    this.activateView('week')

    this.currentDate = this.$dayjs().startOf(this.activeView)
    this.calculateDates()

    this.getSchedules()

    this.getProcedures()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  }
}

</script>