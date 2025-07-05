<template>
  <!-- Voice Input Section -->
  <div class="voice-section">
    <div class="d-flex align-items-center input-group-container">
      <!-- Input field with submit button inside -->
      <div class="input-group flex-grow-1">
        <input
          type="text"
          v-model="messageInput"
          class="form-control"
          placeholder="💡 Schedule for Jane Doe, abc@example.com, +12345, 31 December 14:30, notes: Initial consultation.."
          :disabled="isRecording"
        />
        <button
          @click="submitTextInput"
          class="btn btn-primary submit-btn"
          type="button"
          :disabled="isRecording || isProcessing || !messageInput.trim()"
        >
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      </div>

      <!-- Voice Recording Button -->
      <button
        @click="toggleRecording"
        :class="['btn', 'voice-btn', 'ms-2', isRecording ? 'btn-danger recording' : 'btn-outline-primary']"
        type="button"
        :disabled="isProcessing"
      >
        <i :class="['fas', isRecording ? 'fa-stop' : 'fa-microphone']"></i>
      </button>
    </div>

    <!-- Recording Status -->
    <div v-if="isRecording" class="recording-status mt-3">
      <div class="d-flex align-items-center justify-content-center">
        <div class="recording-indicator"></div>
        <span class="ms-2">Recording... Click to stop</span>
      </div>
    </div>
  </div>

  <!-- Processing Status -->
  <div v-if="isProcessing" class="alert alert-info">
    <i class="fas fa-spinner fa-spin"></i>
    Processing...
  </div>

  <!-- Error Display -->
  <div v-if="errorMessage" class="alert alert-danger">
    <i class="fas fa-exclamation-triangle"></i>
    {{ errorMessage }}
  </div>

  <!-- Appointment Confirmation Modal -->
  <div class="modal fade" id="appointmentModal" tabindex="-1" ref="appointmentModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-calendar-check text-success"></i>
            Confirm Appointment Details
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">First Name *</label>
                <input
                  type="text"
                  v-model="appointmentData.name"
                  class="form-control"
                  required
                  :class="{ 'is-invalid': !appointmentData.name.trim() && showValidation }"
                >
                <div v-if="!appointmentData.name.trim() && showValidation" class="invalid-feedback">
                  First name is required
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Last Name *</label>
                <input
                  type="text"
                  v-model="appointmentData.surname"
                  class="form-control"
                  required
                  :class="{ 'is-invalid': !appointmentData.surname.trim() && showValidation }"
                >
                <div v-if="!appointmentData.surname.trim() && showValidation" class="invalid-feedback">
                  Last name is required
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  v-model="appointmentData.email"
                  class="form-control"
                  :class="{ 'is-invalid': appointmentData.email && !isValidEmail(appointmentData.email) }"
                >
                <div v-if="appointmentData.email && !isValidEmail(appointmentData.email)" class="invalid-feedback">
                  Please enter a valid email address
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Phone</label>
                <input type="tel" v-model="appointmentData.phone" class="form-control">
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Appointment Date & Time</label>
            <input
              type="datetime-local"
              v-model="appointmentData.reservation_start_time"
              class="form-control"
              :min="minDateTime"
            >
          </div>
          <div class="mb-3">
            <label class="form-label">Notes</label>
            <textarea v-model="appointmentData.notes" class="form-control" rows="3"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Expert Notes</label>
            <textarea v-model="appointmentData.expert_notes" class="form-control" rows="2"></textarea>
          </div>

          <!-- Original Voice Text -->
          <div v-if="originalText" class="alert alert-light">
            <strong>Original Voice Input:</strong>
            <p class="mb-0 mt-2">{{ originalText }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button
            type="button"
            @click="saveAppointment"
            class="btn btn-success"
            :disabled="isSaving"
          >
            <i :class="['fas', isSaving ? 'fa-spinner fa-spin' : 'fa-save']"></i>
            {{ isSaving ? 'Saving...' : 'Save Appointment' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Success Modal -->
  <div class="modal fade" id="successModal" tabindex="-1" ref="successModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">
            <i class="fas fa-check-circle"></i>
            Success!
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>{{ successMessage }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-success" data-bs-dismiss="modal">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'

export default {
  name: 'AiSchedulerInput',
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
    this.checkMicrophonePermissions()
  },

  methods: {
    async checkMicrophonePermissions() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
      } catch (error) {
        this.errorMessage = 'Microphone access is required for voice recording.'
      }
    },

    async toggleRecording() {
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
        this.errorMessage = 'Error accessing microphone.'
      }
    },

    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
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
          throw new Error(result.message || 'Unknown error occurred')
        }
      } catch (error) {
        this.errorMessage = `Error processing voice: ${error.message}`
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
          throw new Error(result.message || 'Unknown error occurred')
        }
      } catch (error) {
        this.errorMessage = `Error processing text: ${error.message}`
      } finally {
        this.isProcessing = false
      }
    },

    showAppointmentModal(data) {
      this.appointmentData.name = data.name || ''
      this.appointmentData.surname = data.surname || ''
      this.appointmentData.email = data.email || ''
      this.appointmentData.phone = data.phone || ''
      this.appointmentData.notes = data.notes || ''
      this.appointmentData.expert_notes = data.expert_notes || ''
      this.originalText = data.original_text || ''

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
          throw new Error(result.message || 'Unknown error occurred')
        }
      } catch (error) {
        this.errorMessage = `Error saving appointment: ${error.message}`
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
.voice-section {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 15px;
  padding: 15px;
  margin: 0;
}

.input-group-container {
  width: 100%;
}

.input-group {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 25px;
  overflow: hidden;
}

.input-group .form-control {
  height: 40px;
  font-size: 0.9rem;
  border-right: none;
  border-radius: 25px 0 0 25px;
}

.submit-btn {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 4;
  width: 40px;
  border-radius: 0 25px 25px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-btn {
  height: 40px;
  width: 40px;
  padding: 0;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.recording {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.recording-status {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  padding: 10px;
  font-size: 0.85rem;
}

.recording-indicator {
  width: 8px;
  height: 8px;
  background-color: #dc3545;
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.alert {
  border-radius: 10px;
  border: none;
  padding: 10px 15px;
  font-size: 0.85rem;
}

.modal-content {
  border-radius: 15px;
  border: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-radius: 15px 15px 0 0;
  border-bottom: none;
  padding: 20px 30px;
}

.modal-body {
  padding: 30px;
}

.modal-footer {
  border-top: none;
  padding: 20px 30px;
}

.form-control, .form-select {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  padding: 12px 15px;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875em;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .voice-section {
    padding: 10px;
  }

  .input-group .form-control {
    font-size: 0.8rem;
    height: 35px;
  }

  .voice-btn, .submit-btn {
    height: 35px;
    width: 35px;
  }
}
</style>
