<template>
  <div class="header-scheduler-always-open">
    <!-- Always Visible Input Section -->
    <div class="ai-input-container">
      <div class="scheduler-input-container">
        <div class="input-group-header">
          <input
            ref="schedulerInput"
            type="text"
            v-model="messageInput"
            class="form-control-header"
            :placeholder="$t('aiScheduler.placeholder', {email: 'abc@example.com'})"
            :disabled="isRecording || isProcessing"
            @keyup.enter="submitTextInput"
          />

          <!-- Action Buttons -->
          <div class="action-buttons-header">
            <button
              @click="toggleRecording"
              :class="['btn-header', 'voice-btn-header', isRecording ? 'recording' : '']"
              type="button"
              :disabled="isProcessing"
              :title="isRecording ? $t('aiScheduler.tooltips.stopRecording') : $t('aiScheduler.tooltips.voiceInput')"
            >
              <CIcon :icon="isRecording ? icons.cilMediaStop : icons.cilMicrophone" size="sm" />
            </button>

            <button
              @click="submitTextInput"
              class="btn-header submit-btn-header"
              type="button"
              :disabled="isRecording || isProcessing || !messageInput.trim()"
              :title="$t('aiScheduler.tooltips.submit')"
            >
              <CIcon icon="cil-arrow-top" size="sm" />
            </button>
          </div>
        </div>

        <!-- Compact Status Indicators -->
        <div v-if="isRecording" class="status-indicator recording-status">
          <div class="recording-dot"></div>
          <span>{{ $t('aiScheduler.status.recording') }}</span>
        </div>

        <div v-if="isProcessing" class="status-indicator processing-status">
          <CIcon icon="cil-sync" size="sm" class="spinning" />
          <span>{{ $t('aiScheduler.status.processing') }}</span>
        </div>
      </div>

      <div class="ai-message">
        <span>{{ $t('aiScheduler.hint') }}</span>
      </div>
    </div>

    <!-- Error Toast (Compact) -->
    <div v-if="errorMessage" class="error-toast-header">
      <CIcon icon="cil-warning" size="sm" />
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="btn-close-toast">×</button>
    </div>

    <!-- Appointment Confirmation Modal -->
    <div class="modal fade" id="appointmentModal" tabindex="-1" ref="appointmentModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content modern-modal">
          <div class="modal-header modern-header">
            <h5 class="modal-title">
              <CIcon icon="cil-calendar-check" size="lg" class="text-white me-2" />
              {{ $t('aiScheduler.modals.confirmAppointment.title') }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body modern-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">{{ $t('aiScheduler.modals.confirmAppointment.labels.firstName') }}</label>
                <input
                  type="text"
                  v-model="appointmentData.name"
                  class="form-control modern-input"
                  required
                  :class="{ 'is-invalid': !appointmentData.name.trim() && showValidation }"
                />
                <div v-if="!appointmentData.name.trim() && showValidation" class="invalid-feedback">
                  {{ $t('aiScheduler.modals.confirmAppointment.validation.firstNameRequired') }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">{{ $t('aiScheduler.modals.confirmAppointment.labels.lastName') }}</label>
                <input
                  type="text"
                  v-model="appointmentData.surname"
                  class="form-control modern-input"
                  required
                  :class="{ 'is-invalid': !appointmentData.surname.trim() && showValidation }"
                />
                <div
                  v-if="!appointmentData.surname.trim() && showValidation"
                  class="invalid-feedback"
                >
                  {{ $t('aiScheduler.modals.confirmAppointment.validation.lastNameRequired') }}
                </div>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">{{ $t('aiScheduler.modals.confirmAppointment.labels.email') }}</label>
                <input
                  type="email"
                  v-model="appointmentData.email"
                  class="form-control modern-input"
                  :class="{
                    'is-invalid': appointmentData.email && !isValidEmail(appointmentData.email)
                  }"
                />
                <div
                  v-if="appointmentData.email && !isValidEmail(appointmentData.email)"
                  class="invalid-feedback"
                >
                  {{ $t('aiScheduler.modals.confirmAppointment.validation.emailInvalid') }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">{{ $t('aiScheduler.modals.confirmAppointment.labels.phone') }}</label>
                <input
                  type="tel"
                  v-model="appointmentData.phone"
                  class="form-control modern-input"
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ $t('aiScheduler.modals.confirmAppointment.labels.dateTime') }}</label>
              <input
                type="datetime-local"
                v-model="appointmentData.reservation_start_time"
                class="form-control modern-input"
                :min="minDateTime"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">{{ $t('aiScheduler.modals.confirmAppointment.labels.notes') }}</label>
              <textarea
                v-model="appointmentData.notes"
                class="form-control modern-input"
                rows="3"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ $t('aiScheduler.modals.confirmAppointment.labels.expertNotes') }}</label>
              <textarea
                v-model="appointmentData.expert_notes"
                class="form-control modern-input"
                rows="2"
              ></textarea>
            </div>

            <!-- Original Input Display -->
            <div v-if="originalText" class="original-input-display">
              <div class="original-input-header">
                <CIcon icon="cil-quote-alt-left" size="sm" />
                <span>{{ $t('aiScheduler.modals.confirmAppointment.originalInput.title') }}</span>
              </div>
              <p class="original-input-text">{{ originalText }}</p>
            </div>
          </div>
          <div class="modal-footer modern-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <CIcon icon="cil-x" size="sm" class="me-1" />
              {{ $t('aiScheduler.modals.confirmAppointment.actions.cancel') }}
            </button>
            <button
              type="button"
              @click="saveAppointment"
              class="btn btn-primary modern-btn"
              :disabled="isSaving"
            >
              <CIcon
                :icon="isSaving ? 'cil-sync' : 'cil-save'"
                size="sm"
                :class="[isSaving ? 'spinning' : '', 'me-1']"
              />
              {{ isSaving ? $t('aiScheduler.modals.confirmAppointment.actions.saving') : $t('aiScheduler.modals.confirmAppointment.actions.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" ref="successModal">
      <div class="modal-dialog">
        <div class="modal-content modern-modal">
          <div class="modal-header modern-header bg-success text-white">
            <h5 class="modal-title">
              <CIcon icon="cil-check-circle" size="lg" class="me-2" />
              {{ $t('aiScheduler.modals.success.title') }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body modern-body">
            <div class="success-content">
              <div class="success-icon">
                <CIcon icon="cil-check-circle" size="xl" />
              </div>
              <p class="success-message">{{ successMessage }}</p>
            </div>
          </div>
          <div class="modal-footer modern-footer">
            <button type="button" class="btn btn-success modern-btn" data-bs-dismiss="modal">
              <CIcon icon="cil-check" size="sm" class="me-1" />
              {{ $t('aiScheduler.modals.success.ok') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import { cilMicrophone, cilMediaStop } from '@coreui/icons'

export default {
  name: 'AiSchedulerView',
  data() {
    return {
      backendUrl: 'http://localhost:5000',
      isRecording: false,
      isProcessing: false,
      isSaving: false,
      mediaRecorder: null,
      audioChunks: [],
      currentLanguage: 'en',
      messageInput: '',
      errorMessage: '',
      successMessage: '',
      originalText: '',
      showValidation: false,
      appointmentModal: null,
      successModal: null,
      appointmentData: {
        name: '',
        surname: '',
        email: '',
        phone: '',
        notes: '',
        expert_notes: '',
        reservation_start_time: '',
        company_id: 1,
        expert_id: 1,
        procedure_id: 1,
        reservation_length: 60,
        status: 'pending',
        color: '#007bff',
        created_by: 'voice_system'
      },
      icons: {
        cilMicrophone,
        cilMediaStop
      }
    }
  },

  computed: {
    minDateTime() {
      const now = new Date()
      return now.toISOString().slice(0, 16)
    }
  },

  mounted() {
    this.appointmentModal = new Modal(this.$refs.appointmentModal)
    this.successModal = new Modal(this.$refs.successModal)
    //this.checkMicrophonePermissions()
  },

  methods: {
    async checkMicrophonePermissions() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      } catch (error) {
        console.warn('Microphone access not available')
      }
    },

    async toggleRecording() {
      this.checkMicrophonePermissions();
      if (!this.isRecording) {
        await this.startRecording()
      } else {
        this.stopRecording()
      }
    },

    async startRecording() {
      try {
        this.errorMessage = ''
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(stream)
        this.audioChunks = []

        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data)
        }

        this.mediaRecorder.onstop = () => {
          this.processAudio()
        }

        this.mediaRecorder.start()
        this.isRecording = true
      } catch (error) {
        this.errorMessage = 'Microphone access denied'
        setTimeout(() => (this.errorMessage = ''), 3000)
      }
    },

    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
        this.isRecording = false
      }
    },

    async processAudio() {
      this.isProcessing = true
      this.errorMessage = ''

      try {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')
        formData.append('language', this.currentLanguage)

        const response = await fetch(`${this.backendUrl}/process-voice`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.status === 'success') {
          this.showAppointmentModal(result.data)
        } else {
          throw new Error(result.message || 'Processing failed')
        }
      } catch (error) {
        this.errorMessage = `Processing error: ${error.message}`
        setTimeout(() => (this.errorMessage = ''), 5000)
      } finally {
        this.isProcessing = false
      }
    },

    submitTextInput() {
      if (this.messageInput.trim()) {
        this.processTextInput()
      }
    },

    async processTextInput() {
      this.isProcessing = true
      this.errorMessage = ''

      try {
        const response = await fetch(`${this.backendUrl}/process-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: this.messageInput,
            language: this.currentLanguage
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.status === 'success') {
          this.showAppointmentModal(result.data)
        } else {
          throw new Error(result.message || 'Processing failed')
        }
      } catch (error) {
        this.errorMessage = `Processing error: ${error.message}`
        setTimeout(() => (this.errorMessage = ''), 5000)
      } finally {
        this.isProcessing = false
      }
    },

    showAppointmentModal(data) {
      // Populate appointment data
      this.appointmentData.name = data.name || ''
      this.appointmentData.surname = data.surname || ''
      this.appointmentData.email = data.email || ''
      this.appointmentData.phone = data.phone || ''
      this.appointmentData.notes = data.notes || ''
      this.appointmentData.expert_notes = data.expert_notes || ''
      this.originalText = data.original_text || this.messageInput

      if (data.reservation_start_time) {
        try {
          const date = new Date(data.reservation_start_time)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          this.appointmentData.reservation_start_time = `${year}-${month}-${day}T${hours}:${minutes}`
        } catch (error) {
          console.warn('Error parsing date:', error)
        }
      }

      this.showValidation = false
      this.appointmentModal.show()
    },

    async saveAppointment() {
      if (!this.appointmentData.name.trim() || !this.appointmentData.surname.trim()) {
        this.showValidation = true
        return
      }

      if (this.appointmentData.email && !this.isValidEmail(this.appointmentData.email)) {
        return
      }

      this.isSaving = true

      try {
        const response = await fetch(`${this.backendUrl}/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.appointmentData)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.status === 'success') {
          this.appointmentModal.hide()
          this.successMessage = result.message
          this.successModal.show()
          this.resetForm()
        } else {
          throw new Error(result.message || 'Save failed')
        }
      } catch (error) {
        this.errorMessage = `Save error: ${error.message}`
        setTimeout(() => (this.errorMessage = ''), 5000)
      } finally {
        this.isSaving = false
      }
    },

    resetForm() {
      this.appointmentData = {
        name: '',
        surname: '',
        email: '',
        phone: '',
        notes: '',
        expert_notes: '',
        reservation_start_time: '',
        company_id: 1,
        expert_id: 1,
        procedure_id: 1,
        reservation_length: 60,
        status: 'pending',
        color: '#007bff',
        created_by: 'voice_system'
      }

      this.messageInput = ''
      this.originalText = ''
      this.errorMessage = ''
      this.showValidation = false
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }
  }
}
</script>

<style scoped>
/* Always Open Header Scheduler */

</style>
