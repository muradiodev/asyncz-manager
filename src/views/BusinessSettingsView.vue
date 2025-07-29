<template>
  <CCard class="border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb
            :breadcrumbs="[
              { name: 'Dashboard', path: '/dashboard', active: false },
              { name: 'Business Settings', path: '/dashboard/business-settings', active: true }
            ]"
          />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">Business Settings</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4 pb-4 mt-4" lg>
    <div v-if="isInitialLoading">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div v-else class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <form @submit.prevent="saveChanges">
          <!-- Business Name -->
          <div class="mb-4">
            <label for="businessName" class="form-label fw-bold">Business Name</label>
            <input
              type="text"
              class="form-control"
              id="businessName"
              v-model="businessData.name"
              :disabled="isLoading"
            />
          </div>

          <!-- Business Description -->
          <div class="mb-4">
            <label for="businessAbout" class="form-label fw-bold">Business Description</label>
            <textarea
              class="form-control"
              id="businessAbout"
              rows="3"
              v-model="businessData.about"
              :disabled="isLoading"
            ></textarea>
          </div>

          <!-- Business Address -->
          <div class="mb-4">
            <label for="businessAddress" class="form-label fw-bold">Business Address</label>
            <textarea
              class="form-control"
              id="businessAddress"
              rows="3"
              v-model="businessData.address"
              :disabled="isLoading"
            ></textarea>
          </div>

          <!-- Business Phone -->
          <div class="mb-4">
            <label for="businessPhone" class="form-label fw-bold">Business Phone</label>
            <input
              type="tel"
              class="form-control"
              id="businessPhone"
              v-model="businessData.phone"
              :disabled="isLoading"
            />
          </div>

          <!-- Business Email -->
          <div class="mb-4">
            <label for="businessEmail" class="form-label fw-bold">Business Email</label>
            <input
              type="email"
              class="form-control"
              id="businessEmail"
              v-model="businessData.email"
              :disabled="isLoading"
            />
          </div>

          <!-- Business Timezone -->
          <div class="mb-4">
            <label for="businessTimezone" class="form-label fw-bold">Business Timezone</label>
            <select
              class="form-select"
              id="businessTimezone"
              v-model="businessData.time_zone"
              :disabled="isLoading"
            >
              <option value="Eastern Time - Toronto (EST/EDT)">
                Eastern Time - Toronto (EST/EDT)
              </option>
              <option value="Central Time (CST/CDT)">Central Time (CST/CDT)</option>
              <option value="Mountain Time (MST/MDT)">Mountain Time (MST/MDT)</option>
              <option value="Pacific Time (PST/PDT)">Pacific Time (PST/PDT)</option>
              <option value="UTC">UTC</option>
              <option value="GMT">GMT</option>
              <option value="CET">Central European Time (CET)</option>
            </select>
          </div>

          <!-- Slot Size -->
          <div class="mb-4">
            <label for="slotSize" class="form-label fw-bold">Slot Size in Minutes</label>
            <select
              class="form-select"
              id="slotSize"
              v-model="businessData.slot_size"
              :disabled="isLoading"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
            </select>
          </div>

          <!-- Email Confirmation Required -->
          <div class="card border-light shadow-sm mb-4 p-3">
            <div class="d-flex align-items-center">
              <div class="form-check form-switch me-3">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="email_confirmation_required"
                  v-model="emailConfirmationRequired"
                  :disabled="isLoading"
                  style="width: 2.5em; height: 1.25em"
                />
                <label class="form-check-label visually-hidden" for="email_confirmation_required">
                  Require Email Confirmation
                </label>
              </div>
              <div>
                <h6 class="mb-1">Require Email Confirmation</h6>
                <p class="text-muted small mb-0">
                  When enabled, clients will need to confirm their email address when booking
                  appointments.
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons-->
          <div class="col-12">
            <button type="submit" class="btn btn-primary-custom" :disabled="isLoading">
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </CContainer>
</template>

<script>
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { getBusinessData, saveBusinessData } from '@/repositories/BusinessDataRepository.js'

export default {
  name: 'BusinessSettingsView',
  components: { AppBreadcrumb },
  data() {
    return {
      isInitialLoading: true,
      isLoading: false,
      businessData: {
        name: '',
        about: '',
        address: '',
        email: '',
        phone: '',
        time_zone: 'Eastern Time - Toronto (EST/EDT)', // Default timezone
        slot_size: '10', // Default slot size
        email_confirmation_required: ''
      },
      originalData: null
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),

    // Computed property to handle email confirmation toggle
    emailConfirmationRequired: {
      get() {
        return this.businessData.email_confirmation_required == 1
      },
      set(value) {
        this.businessData.email_confirmation_required = value ? 1 : 0
      }
    }
  },
  methods: {
    async loadBusinessData() {
      this.isInitialLoading = true
      try {
        const response = await getBusinessData(this.token)
        if (response && response.code === 200 && response.company) {
          // Extract company data from the response
          const data = response.company
          this.businessData = {
            name: data.name || '',
            about: data.about || '',
            address: data.address || '',
            email: data.email || '',
            phone: data.phone || '',
            time_zone: data.time_zone || 'Eastern Time - Toronto (EST/EDT)',
            slot_size: data.slot_size ? data.slot_size.toString() : '30',
            logo: data.logo || '',
            email_confirmation_required: data.email_confirmation_required
          }
          // Store original data for reset functionality
          this.originalData = JSON.parse(JSON.stringify(this.businessData))
        }
      } catch (error) {
        this.$swal({
          title: 'Error',
          text: 'Failed to load business data',
          icon: 'error'
        })
        console.error('Error loading business data:', error)
      } finally {
        this.isInitialLoading = false
      }
    },
    async saveChanges() {
      this.isLoading = true
      try {
        // Log the data being sent to verify it's correct
        console.log('Sending business data:', this.businessData)

        const response = await saveBusinessData(this.token, {
          name: this.businessData.name,
          about: this.businessData.about,
          address: this.businessData.address,
          email: this.businessData.email,
          phone: this.businessData.phone,
          time_zone: this.businessData.time_zone,
          slot_size: this.businessData.slot_size,
          logo: this.businessData.logo,
          email_confirmation_required: this.businessData.email_confirmation_required
        })

        if (response.code === 200) {
          this.$swal({
            title: 'Success',
            text: response.message || 'Business settings updated successfully',
            icon: 'success'
          })
          // Update original data after successful save
          this.originalData = JSON.parse(JSON.stringify(this.businessData))
        } else {
          this.$swal({
            title: 'Error',
            text: response.message || 'Failed to update business settings',
            icon: 'error'
          })
        }
      } catch (error) {
        this.$swal({
          title: 'Error',
          text: 'An unexpected error occurred',
          icon: 'error'
        })
        console.error('Error saving business data:', error)
      } finally {
        this.isLoading = false
      }
    },
    resetForm() {
      if (this.originalData) {
        this.businessData = JSON.parse(JSON.stringify(this.originalData))
      }
    }
  },
  mounted() {
    this.loadBusinessData()
  }
}
</script>
