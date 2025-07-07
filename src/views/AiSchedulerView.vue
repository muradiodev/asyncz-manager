<template>
  <div class="header-scheduler-always-open">
    <!-- Always Visible Input Section -->
    <div class="ai-input-container">
      <div class="ai-message">
        <span>🤖 I'm AI - Use me!</span>
      </div>

      <div class="scheduler-input-container">
        <div class="input-group-header">
          <input
            ref="schedulerInput"
            type="text"
            v-model="messageInput"
            class="form-control-header"
            placeholder="💡 Schedule for Jane Doe, abc@example.com, +12345, 31 December 14:30, notes: Initial consultation.."
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
              :title="isRecording ? 'Stop recording' : 'Voice input'"
            >
              <CIcon :icon="isRecording ? icons.cilMediaStop : icons.cilMicrophone" size="sm" />
            </button>

            <button
              @click="submitTextInput"
              class="btn-header submit-btn-header"
              type="button"
              :disabled="isRecording || isProcessing || !messageInput.trim()"
              title="Submit"
            >
              <CIcon icon="cil-arrow-top" size="sm" />
            </button>
          </div>
        </div>

        <!-- Compact Status Indicators -->
        <div v-if="isRecording" class="status-indicator recording-status">
          <div class="recording-dot"></div>
          <span>Recording...</span>
        </div>

        <div v-if="isProcessing" class="status-indicator processing-status">
          <CIcon icon="cil-sync" size="sm" class="spinning" />
          <span>Processing...</span>
        </div>
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
              Confirm Appointment
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body modern-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">First Name *</label>
                <input
                  type="text"
                  v-model="appointmentData.name"
                  class="form-control modern-input"
                  required
                  :class="{ 'is-invalid': !appointmentData.name.trim() && showValidation }"
                >
                <div v-if="!appointmentData.name.trim() && showValidation" class="invalid-feedback">
                  First name is required
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Last Name *</label>
                <input
                  type="text"
                  v-model="appointmentData.surname"
                  class="form-control modern-input"
                  required
                  :class="{ 'is-invalid': !appointmentData.surname.trim() && showValidation }"
                >
                <div v-if="!appointmentData.surname.trim() && showValidation" class="invalid-feedback">
                  Last name is required
                </div>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  v-model="appointmentData.email"
                  class="form-control modern-input"
                  :class="{ 'is-invalid': appointmentData.email && !isValidEmail(appointmentData.email) }"
                >
                <div v-if="appointmentData.email && !isValidEmail(appointmentData.email)" class="invalid-feedback">
                  Please enter a valid email address
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone</label>
                <input type="tel" v-model="appointmentData.phone" class="form-control modern-input">
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Appointment Date & Time</label>
              <input
                type="datetime-local"
                v-model="appointmentData.reservation_start_time"
                class="form-control modern-input"
                :min="minDateTime"
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="appointmentData.notes" class="form-control modern-input" rows="3"></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Expert Notes</label>
              <textarea v-model="appointmentData.expert_notes" class="form-control modern-input" rows="2"></textarea>
            </div>

            <!-- Original Input Display -->
            <div v-if="originalText" class="original-input-display">
              <div class="original-input-header">
                <CIcon icon="cil-quote-alt-left" size="sm" />
                <span>Original Input</span>
              </div>
              <p class="original-input-text">{{ originalText }}</p>
            </div>
          </div>
          <div class="modal-footer modern-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <CIcon icon="cil-x" size="sm" class="me-1" /> Cancel
            </button>
            <button
              type="button"
              @click="saveAppointment"
              class="btn btn-primary modern-btn"
              :disabled="isSaving"
            >
              <CIcon :icon="isSaving ? 'cil-sync' : 'cil-save'" size="sm" :class="[isSaving ? 'spinning' : '', 'me-1']" />
              {{ isSaving ? 'Saving...' : 'Save Appointment' }}
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
              Success!
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
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
              <CIcon icon="cil-check" size="sm" class="me-1" /> OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import {
  cilMicrophone,
  cilMediaStop
} from '@coreui/icons'

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
    this.checkMicrophonePermissions()
  },

  methods: {
    async checkMicrophonePermissions() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
      } catch (error) {
        console.warn('Microphone access not available')
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
        this.errorMessage = 'Microphone access denied'
        setTimeout(() => this.errorMessage = '', 3000)
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
          throw new Error(result.message || 'Processing failed')
        }
      } catch (error) {
        this.errorMessage = `Processing error: ${error.message}`
        setTimeout(() => this.errorMessage = '', 5000)
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
        setTimeout(() => this.errorMessage = '', 5000)
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
        setTimeout(() => this.errorMessage = '', 5000)
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
.header-scheduler-always-open {
  width: 100%;
  max-width: 100%;
  position: relative;
}

.scheduler-input-container {
  width: 100%;
  position: relative;
}

/* Input Group for Header */
.input-group-header {
  display: flex;
  align-items: center;
  background: var(--cui-body-bg);
  border: 1px solid var(--cui-border-color);
  border-radius: 20px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
  animation: aiPulse 3s ease-in-out infinite;
  min-width: 600px;
  width: 100%;
  max-width: 800px;
}


@keyframes aiPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: var(--cui-border-color);
  }
  50% {
    box-shadow: 0 6px 20px rgba(var(--cui-primary-rgb), 0.5);
    border-color: rgba(var(--cui-primary-rgb), 0.6);
  }
}

.ai-input-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.ai-message {
  background: linear-gradient(135deg, var(--cui-primary), var(--cui-info));
  color: white;
  padding: 10px 14px;
  border-radius: 18px 18px 18px 4px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(var(--cui-primary-rgb), 0.25);
  animation: aiMessagePulse 2s ease-in-out infinite;
  white-space: nowrap;
  position: relative;
  max-width: 200px;
  flex-shrink: 0;
}

@keyframes aiMessagePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.95;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}

.scheduler-input-container {
  flex: 1;
  position: relative;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ai-input-container {
    flex-direction: column;
    gap: 8px;
  }

  .ai-message {
    align-self: flex-start;
    max-width: 160px;
    font-size: 0.8rem;
    padding: 8px 12px;
  }
}

@media (max-width: 576px) {
  .ai-message {
    max-width: 140px;
    font-size: 0.75rem;
    padding: 6px 10px;
  }
}

.input-group-header:focus-within {
  border-color: var(--cui-primary);
  box-shadow: 0 0 0 2px rgba(var(--cui-primary-rgb), 0.25);
}

/* Header Input Field */
.form-control-header {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 16px;
  font-size: 0.875rem;
  color: var(--cui-body-color);
  outline: none;
  height: 32px;
}

.form-control-header::placeholder {
  color: var(--cui-gray-500);
}

.form-control-header:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Action Buttons in Header */
.action-buttons-header {
  display: flex;
  gap: 4px;
  align-items: center;
  padding-right: 4px;
}

.btn-header {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.voice-btn-header {
  background: var(--cui-secondary);
  color: white;
}

.voice-btn-header:hover:not(:disabled) {
  background: #5a6268;
  transform: scale(1.1);
}

.voice-btn-header.recording {
  background: var(--cui-danger);
  animation: pulse-recording 1.5s infinite;
}

.submit-btn-header {
  background: var(--cui-primary);
  color: white;
}

.submit-btn-header:hover:not(:disabled) {
  background: var(--cui-primary);
  transform: scale(1.1);
}

.submit-btn-header:disabled {
  background: var(--cui-gray-400);
  cursor: not-allowed;
  transform: none;
}

/* Status Indicators */
.status-indicator {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

.recording-status {
  background: rgba(var(--cui-warning-rgb), 0.15);
  color: var(--cui-warning-dark);
  border: 1px solid rgba(var(--cui-warning-rgb), 0.3);
}

.processing-status {
  background: rgba(var(--cui-info-rgb), 0.15);
  color: var(--cui-info-dark);
  border: 1px solid rgba(var(--cui-info-rgb), 0.3);
}

.recording-dot {
  width: 6px;
  height: 6px;
  background: var(--cui-danger);
  border-radius: 50%;
  animation: blink 1s infinite;
}

/* Error Toast for Header */
.error-toast-header {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--cui-danger);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1001;
  animation: slideDown 0.3s ease;
  box-shadow: 0 4px 12px rgba(var(--cui-danger-rgb), 0.3);
}

.btn-close-toast {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.btn-close-toast:hover {
  opacity: 1;
}

/* Modal Styles */
.modern-modal {
  border: none;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modern-header {
  background: linear-gradient(135deg, var(--cui-primary) 0%, var(--cui-primary-dark) 100%);
  color: white;
  border: none;
  padding: 20px 24px;
}

.modern-header .modal-title {
  font-weight: 600;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
}

.modern-body {
  padding: 24px;
  background: var(--cui-body-bg);
}

.modern-footer {
  background: var(--cui-gray-50);
  border: none;
  padding: 16px 24px;
}

.modern-input {
  border: 2px solid var(--cui-border-color);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: var(--cui-body-bg);
}

.modern-input:focus {
  border-color: var(--cui-primary);
  box-shadow: 0 0 0 3px rgba(var(--cui-primary-rgb), 0.1);
  outline: none;
}

.modern-btn {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.modern-btn:hover {
  transform: translateY(-1px);
}

/* Original Input Display */
.original-input-display {
  background: var(--cui-gray-50);
  border: 1px solid var(--cui-border-color);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.original-input-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--cui-gray-600);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.original-input-text {
  margin: 0;
  color: var(--cui-body-color);
  line-height: 1.4;
}

/* Success Modal */
.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 3rem;
  color: var(--cui-success);
  margin-bottom: 16px;
}

.success-message {
  font-size: 1.125rem;
  color: var(--cui-body-color);
  margin: 0;
}

/* Spinning animation for loading icons */
.spinning {
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes pulse-recording {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-control-header {
    font-size: 0.8rem;
    padding: 6px 12px;
  }

  .btn-header {
    width: 26px;
    height: 26px;
  }

  .input-group-header {
    padding: 3px;
  }

  .modern-body {
    padding: 16px;
  }

  .modern-header,
  .modern-footer {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .form-control-header::placeholder {
    font-size: 0.75rem;
  }

  .status-indicator,
  .error-toast-header {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
}

/* Dark mode adjustments */
[data-coreui-theme="dark"] .input-group-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

[data-coreui-theme="dark"] .original-input-display {
  background: rgba(255, 255, 255, 0.05);
}

/* Validation styles */
.is-invalid {
  border-color: var(--cui-danger) !important;
}

.invalid-feedback {
  display: block;
  color: var(--cui-danger);
  font-size: 0.875em;
  margin-top: 0.25rem;
}

/* Focus states for accessibility */
.btn-header:focus {
  outline: 2px solid var(--cui-primary);
  outline-offset: 2px;
}

/* Hover effects */
.input-group-header:hover {
  border-color: rgba(var(--cui-primary-rgb), 0.5);
}

/* Loading state for input */
.form-control-header:disabled {
  background: rgba(var(--cui-gray-100-rgb), 0.5);
}

/* Button states */
.btn-header:active {
  transform: scale(0.95);
}

.btn-header:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
