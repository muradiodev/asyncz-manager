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

          <!-- Fixed Timezone Selector -->
          <div class="mb-4">
            <label for="businessTimezone" class="form-label fw-bold">Business Timezone</label>

            <!-- Search Input -->
            <div class="mb-3">
              <input
                type="text"
                class="form-control"
                placeholder="Search timezone or city..."
                v-model="timezoneSearch"
                @input="filterTimezones"
              />
            </div>

            <!-- Timezone Groups Container -->
            <div class="timezone-selector border rounded" style="max-height: 400px; overflow-y: auto;">

              <!-- Fixed Dynamic Groups with proper error handling -->
              <template v-for="(timezones, regionName) in filteredTimezones" :key="regionName">
                <div
                  v-if="timezones && Array.isArray(timezones) && timezones.length > 0"
                  role="group"
                  :aria-labelledby="`group-${regionName.replace(/\s+/g, '-')}`"
                >
                  <div
                    :id="`group-${regionName.replace(/\s+/g, '-')}`"
                    class="timezone-group-header px-3 py-2 bg-light fw-bold border-bottom"
                    :class="{ 'border-top': regionName !== 'UTC Offsets' }"
                  >
                    {{ regionName }}
                  </div>
                  <button
                    v-for="tz in timezones"
                    :key="tz.value"
                    role="option"
                    :aria-selected="isTimezoneSelected(tz.value)"
                    :class="['timezone-option', 'btn', 'btn-link', 'text-start', 'w-100', 'border-0', 'rounded-0', 'px-3', 'py-2', isTimezoneSelected(tz.value) ? 'bg-primary text-white' : 'text-dark']"
                    type="button"
                    @click="selectTimezone(tz.value)"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div>{{ tz.label }}</div>
                      <div class="text-muted small">
                        {{ tz.currentTime }}
                        <span v-if="isTimezoneSelected(tz.value)" class="ms-2">
                          <i class="fas fa-check"></i>
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </template>

            </div>

            <!-- Selected Timezone Display -->
            <div class="form-text mt-2">
              <small class="text-muted">
                <i class="fas fa-clock me-1"></i>
                Selected: {{ getSelectedTimezoneLabel() }} |
                <i class="fas fa-globe me-1"></i>
                UTC: {{ utcTime }}
              </small>
            </div>
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
      selectedTimezone: 'America/New_York',
      utcTime: '',
      timeUpdateInterval: null,
      timezoneSearch: '',
      businessData: {
        name: '',
        about: '',
        address: '',
        email: '',
        phone: '',
        time_zone: 'America/New_York',
        slot_size: '10',
        email_confirmation_required: ''
      },
      originalData: null,

      // Properly structured timezone database
      allTimezones: {
        'North America': [
          { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles, Seattle)', currentTime: '' },
          { value: 'America/Denver', label: 'Mountain Time (Denver, Phoenix)', currentTime: '' },
          { value: 'America/Chicago', label: 'Central Time (Chicago, Dallas)', currentTime: '' },
          { value: 'America/New_York', label: 'Eastern Time (New York, Miami)', currentTime: '' },
          { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)', currentTime: '' },
          { value: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)', currentTime: '' },
          { value: 'America/Toronto', label: 'Eastern Time (Toronto, Montreal)', currentTime: '' },
          { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)', currentTime: '' },
          { value: 'America/Mexico_City', label: 'Central Time (Mexico City)', currentTime: '' }
        ],
        'South America': [
          { value: 'America/Sao_Paulo', label: 'Brazil Time (São Paulo, Rio)', currentTime: '' },
          { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time (Buenos Aires)', currentTime: '' },
          { value: 'America/Santiago', label: 'Chile Time (Santiago)', currentTime: '' },
          { value: 'America/Bogota', label: 'Colombia Time (Bogotá)', currentTime: '' },
          { value: 'America/Lima', label: 'Peru Time (Lima)', currentTime: '' }
        ],
        'Europe': [
          { value: 'Europe/London', label: 'GMT (London, Dublin)', currentTime: '' },
          { value: 'Europe/Paris', label: 'Central European Time (Paris, Berlin, Rome)', currentTime: '' },
          { value: 'Europe/Athens', label: 'Eastern European Time (Athens, Helsinki)', currentTime: '' },
          { value: 'Europe/Moscow', label: 'Moscow Time (Moscow)', currentTime: '' },
          { value: 'Europe/Istanbul', label: 'Turkey Time (Istanbul)', currentTime: '' }
        ],
        'Asia': [
          { value: 'Asia/Dubai', label: 'Gulf Time (Dubai, Abu Dhabi)', currentTime: '' },
          { value: 'Asia/Kolkata', label: 'India Time (Mumbai, Delhi, Bangalore)', currentTime: '' },
          { value: 'Asia/Shanghai', label: 'China Time (Beijing, Shanghai)', currentTime: '' },
          { value: 'Asia/Tokyo', label: 'Japan Time (Tokyo, Osaka)', currentTime: '' },
          { value: 'Asia/Seoul', label: 'Korea Time (Seoul)', currentTime: '' },
          { value: 'Asia/Singapore', label: 'Singapore Time (Singapore, Kuala Lumpur)', currentTime: '' },
          { value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok, Ho Chi Minh)', currentTime: '' },
          { value: 'Asia/Jakarta', label: 'Indonesia Time (Jakarta)', currentTime: '' },
          { value: 'Asia/Manila', label: 'Philippines Time (Manila)', currentTime: '' },
          { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (Hong Kong)', currentTime: '' }
        ],
        'Middle East': [
          { value: 'Asia/Riyadh', label: 'Arabia Time (Riyadh, Kuwait)', currentTime: '' },
          { value: 'Asia/Tehran', label: 'Iran Time (Tehran)', currentTime: '' },
          { value: 'Asia/Jerusalem', label: 'Israel Time (Jerusalem, Tel Aviv)', currentTime: '' }
        ],
        'Africa': [
          { value: 'Africa/Cairo', label: 'Egypt Time (Cairo)', currentTime: '' },
          { value: 'Africa/Johannesburg', label: 'South Africa Time (Johannesburg, Cape Town)', currentTime: '' },
          { value: 'Africa/Lagos', label: 'West Africa Time (Lagos, Accra)', currentTime: '' },
          { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi, Addis Ababa)', currentTime: '' }
        ],
        'Oceania': [
          { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney, Melbourne)', currentTime: '' },
          { value: 'Australia/Perth', label: 'Australian Western Time (Perth)', currentTime: '' },
          { value: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)', currentTime: '' }
        ]
      },

      // Initialize as proper object structure to prevent undefined errors
      filteredTimezones: {}
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),

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
    // Initialize with proper deep cloning to prevent reference issues [[0]](#__0)
    initializeTimezones() {
      this.filteredTimezones = JSON.parse(JSON.stringify(this.allTimezones))
      this.updateAllTimezones()
    },

    // Update timezone times with error handling for invalid timezones [[1]](#__1)
    updateAllTimezones() {
      const now = new Date()
      this.utcTime = now.toISOString().substr(11, 8) + ' UTC'

      // Update times for all regions with proper error handling
      Object.keys(this.allTimezones).forEach(region => {
        if (Array.isArray(this.allTimezones[region])) {
          this.allTimezones[region].forEach(tz => {
            try {
              const timeInZone = new Date().toLocaleTimeString('en-US', {
                timeZone: tz.value,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })
              tz.currentTime = timeInZone
            } catch (error) {
              console.warn(`Invalid timezone: ${tz.value}`)
              tz.currentTime = '--:--'
            }
          })
        }
      })

      // Update filtered timezones safely
      if (this.timezoneSearch) {
        this.filterTimezones()
      } else {
        this.filteredTimezones = JSON.parse(JSON.stringify(this.allTimezones))
      }
    },

    // Enhanced filtering with proper object structure validation [[2]](#__2)
    filterTimezones() {
      const searchTerm = this.timezoneSearch.toLowerCase()

      if (!searchTerm) {
        this.filteredTimezones = JSON.parse(JSON.stringify(this.allTimezones))
        return
      }

      // Reset filtered timezones to empty object
      this.filteredTimezones = {}

      Object.keys(this.allTimezones).forEach(region => {
        if (Array.isArray(this.allTimezones[region])) {
          const filtered = this.allTimezones[region].filter(tz =>
            tz.label.toLowerCase().includes(searchTerm) ||
            tz.value.toLowerCase().includes(searchTerm) ||
            tz.value.split('/')[1]?.toLowerCase().includes(searchTerm)
          )

          // Only add regions that have matching results
          if (filtered.length > 0) {
            this.filteredTimezones[region] = filtered
          }
        }
      })
    },

    // Safe timezone selection with validation [[3]](#__3)
    selectTimezone(timezoneValue) {
      if (timezoneValue && typeof timezoneValue === 'string') {
        this.selectedTimezone = timezoneValue

        // Convert timezone name to UTC offset for backend storage
        const timezoneOffset = this.getTimezoneOffset(timezoneValue)
        this.businessData.time_zone = timezoneOffset
      }
    },

    getTimezoneOffset(timezoneString) {
      try {
        const date = new Date()

        // Method 1: Using Intl.DateTimeFormat with longOffset [[0]](#__0)
        const formatter = new Intl.DateTimeFormat('en', {
          timeZone: timezoneString,
          timeZoneName: 'longOffset'
        })

        const parts = formatter.formatToParts(date)
        const offsetPart = parts.find(part => part.type === 'timeZoneName')

        if (offsetPart && offsetPart.value) {
          // Returns format like "GMT+02:00", we want just "+02:00"
          return offsetPart.value.replace('GMT', '')
        }

        // Method 2: Fallback using Date comparison [[1]](#__1)
        return this.calculateOffsetFromComparison(timezoneString)

      } catch (error) {
        console.warn(`Error calculating offset for timezone: ${timezoneString}`, error)
        return '+00:00' // Default to UTC
      }
    },

    // Enhanced label retrieval with fallback handling
    getSelectedTimezoneLabel() {
      for (const region of Object.values(this.allTimezones)) {
        if (Array.isArray(region)) {
          const found = region.find(tz => tz.value === this.selectedTimezone)
          if (found) {
            return `${found.label} (${found.currentTime}) - ${this.businessData.time_zone}`
          }
        }
      }
      return `${this.selectedTimezone || 'No timezone selected'} - ${this.businessData.time_zone}`
    },

    async loadBusinessData() {
      this.isInitialLoading = true
      try {
        const response = await getBusinessData(this.token)
        if (response && response.code === 200 && response.company) {
          const data = response.company;
          this.businessData = {
            name: data.name || '',
            about: data.about || '',
            address: data.address || '',
            email: data.email || '',
            phone: data.phone || '',
            time_zone: data.timeZone || '+00:00', // Use the UTC offset from backend
            slot_size: data.slotSize ? data.slotSize.toString() : '30',
            logo: data.logo || '',
            email_confirmation_required: data.email_confirmation_required
          }

          // Find the timezone name that matches the UTC offset
          this.selectedTimezone = this.findTimezoneByOffset(data.timeZone || '+00:00')
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

    findTimezoneByOffset(targetOffset) {
      // First, try to find a timezone that currently matches this offset
      for (const region of Object.values(this.allTimezones)) {
        if (Array.isArray(region)) {
          for (const tz of region) {
            const currentOffset = this.getTimezoneOffset(tz.value)
            if (currentOffset === targetOffset) {
              return tz.value
            }
          }
        }
      }

      // If no exact match found, return a default timezone
      return 'America/New_York'
    },

    isTimezoneSelected(timezoneValue) {
      return this.selectedTimezone === timezoneValue
    },

    async saveChanges() {
      this.isLoading = true
      try {
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
        this.selectedTimezone = this.businessData.time_zone
      }
    }
  },

  mounted() {
    this.loadBusinessData()
    this.initializeTimezones()

    // Update times every minute
    this.timeUpdateInterval = setInterval(() => {
      this.updateAllTimezones()
    }, 60000)
  },

  beforeUnmount() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
    }
  }
}
</script>

<style scoped>
.timezone-selector {
  background: white;
}

.timezone-group-header {
  font-size: 0.875rem;
  color: #6c757d;
  position: sticky;
  top: 0;
  z-index: 10;
}

.timezone-option {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f8f9fa;
}

.timezone-option:hover {
  background-color: #f8f9fa !important;
}

.timezone-option.bg-primary {
  background-color: #0d6efd !important;
}

.timezone-option:focus {
  box-shadow: none;
  outline: 2px solid #0d6efd;
  outline-offset: -2px;
}
</style>
