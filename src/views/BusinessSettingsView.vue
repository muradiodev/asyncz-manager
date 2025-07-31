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

          <!-- Timezone Selector as Dropdown -->
          <div class="mb-4">
            <label for="businessTimezone" class="form-label fw-bold">Business Timezone</label>

            <div class="dropdown w-100">
              <!-- Dropdown Button -->
              <button
                class="form-control d-flex justify-content-between align-items-center text-start"
                type="button"
                id="timezoneDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                :disabled="isLoading"
              >
                <span>{{ getSelectedTimezoneLabel() }}</span>
                <i class="fas fa-chevron-down"></i>
              </button>

              <!-- Dropdown Menu -->
              <div
                class="dropdown-menu w-100 p-0 timezone-dropdown-menu"
                aria-labelledby="timezoneDropdown"
              >
                <!-- Search Input -->
                <div class="p-2 border-bottom">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search timezone or city..."
                    v-model="timezoneSearch"
                    @input="filterTimezones"
                  />
                </div>

                <!-- Timezone Groups Container -->
                <div class="timezone-selector" style="max-height: 400px; overflow-y: auto;">
                  <!-- Fixed Dynamic Groups with proper error handling -->
                  <template v-for="(timezones, regionName) in filteredTimezones" :key="regionName">
                    <div
                      v-if="timezones && Array.isArray(timezones) && timezones.length > 0"
                      role="group"
                      :aria-labelledby="`group-${regionName.replace(/\s+/g, '-')}`"
                    >
                      <div
                        :id="`group-${regionName.replace(/\s+/g, '-')}`"
                        class="timezone-group-header px-3 py-2 bg-light fw-bold"
                        :class="{ 'border-top': regionName !== 'UTC Offsets' }"
                      >
                        {{ regionName }}
                      </div>
                      <button
                        v-for="tz in timezones"
                        :key="tz.value"
                        role="option"
                        :aria-selected="isTimezoneSelected(tz.value)"
                        :class="['dropdown-item', 'timezone-option', 'px-3', 'py-2', isTimezoneSelected(tz.value) ? 'active' : '']"
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
              </div>
            </div>

            <!-- Selected Timezone Display -->
            <div class="form-text mt-2">
              <small class="text-muted">
                <i class="fas fa-globe me-1"></i>
                UTC: {{ utcTime }} | Timezone: {{ selectedTimezone }} |
                Offset: {{ getOffsetFromCombined(businessData.time_zone) }}
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
        time_zone: 'America/New_York_UTC-05:00',
        slot_size: '10',
        email_confirmation_required: ''
      },
      originalData: null,

      // Properly structured timezone database
      allTimezones: {
        'North America': [
          { value: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)', currentTime: '' },          // UTC-10:00
          { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)', currentTime: '' },        // UTC-09:00
          { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles, Seattle)', currentTime: '' }, // UTC-08:00
          { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)', currentTime: '' },       // UTC-08:00
          { value: 'America/Denver', label: 'Mountain Time (Denver, Phoenix)', currentTime: '' },   // UTC-07:00
          { value: 'America/Chicago', label: 'Central Time (Chicago, Dallas)', currentTime: '' },   // UTC-06:00
          { value: 'America/Mexico_City', label: 'Central Time (Mexico City)', currentTime: '' },   // UTC-06:00
          { value: 'America/New_York', label: 'Eastern Time (New York, Miami)', currentTime: '' },  // UTC-05:00
          { value: 'America/Toronto', label: 'Eastern Time (Toronto, Montreal)', currentTime: '' }  // UTC-05:00
        ],
        'South America': [
          { value: 'America/Lima', label: 'Peru Time (Lima)', currentTime: '' },                    // UTC-05:00
          { value: 'America/Bogota', label: 'Colombia Time (Bogotá)', currentTime: '' },            // UTC-05:00
          { value: 'America/Santiago', label: 'Chile Time (Santiago)', currentTime: '' },           // UTC-04:00
          { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time (Buenos Aires)', currentTime: '' }, // UTC-03:00
          { value: 'America/Sao_Paulo', label: 'Brazil Time (São Paulo, Rio)', currentTime: '' }    // UTC-03:00
        ],
        'Europe': [
          { value: 'Europe/London', label: 'GMT (London, Dublin)', currentTime: '' },               // UTC+00:00
          { value: 'Europe/Paris', label: 'Central European Time (Paris, Berlin, Rome)', currentTime: '' }, // UTC+01:00
          { value: 'Europe/Athens', label: 'Eastern European Time (Athens, Helsinki)', currentTime: '' }, // UTC+02:00
          { value: 'Europe/Istanbul', label: 'Turkey Time (Istanbul)', currentTime: '' },           // UTC+03:00
          { value: 'Europe/Moscow', label: 'Moscow Time (Moscow)', currentTime: '' }                // UTC+03:00
        ],
        'Asia': [
          { value: 'Asia/Jerusalem', label: 'Israel Time (Jerusalem, Tel Aviv)', currentTime: '' }, // UTC+02:00
          { value: 'Asia/Riyadh', label: 'Arabia Time (Riyadh, Kuwait)', currentTime: '' },         // UTC+03:00
          { value: 'Asia/Tehran', label: 'Iran Time (Tehran)', currentTime: '' },                   // UTC+03:30
          { value: 'Asia/Dubai', label: 'Gulf Time (Dubai, Abu Dhabi)', currentTime: '' },          // UTC+04:00
          { value: 'Asia/Kolkata', label: 'India Time (Mumbai, Delhi, Bangalore)', currentTime: '' }, // UTC+05:30
          { value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok, Ho Chi Minh)', currentTime: '' }, // UTC+07:00
          { value: 'Asia/Jakarta', label: 'Indonesia Time (Jakarta)', currentTime: '' },            // UTC+07:00
          { value: 'Asia/Shanghai', label: 'China Time (Beijing, Shanghai)', currentTime: '' },     // UTC+08:00
          { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (Hong Kong)', currentTime: '' },        // UTC+08:00
          { value: 'Asia/Singapore', label: 'Singapore Time (Singapore, Kuala Lumpur)', currentTime: '' }, // UTC+08:00
          { value: 'Asia/Manila', label: 'Philippines Time (Manila)', currentTime: '' },            // UTC+08:00
          { value: 'Asia/Seoul', label: 'Korea Time (Seoul)', currentTime: '' },                    // UTC+09:00
          { value: 'Asia/Tokyo', label: 'Japan Time (Tokyo, Osaka)', currentTime: '' }              // UTC+09:00
        ],
        'Middle East': [
          { value: 'Asia/Jerusalem', label: 'Israel Time (Jerusalem, Tel Aviv)', currentTime: '' }, // UTC+02:00
          { value: 'Asia/Riyadh', label: 'Arabia Time (Riyadh, Kuwait)', currentTime: '' },         // UTC+03:00
          { value: 'Asia/Tehran', label: 'Iran Time (Tehran)', currentTime: '' }                    // UTC+03:30
        ],
        'Africa': [
          { value: 'Africa/Lagos', label: 'West Africa Time (Lagos, Accra)', currentTime: '' },     // UTC+01:00
          { value: 'Africa/Cairo', label: 'Egypt Time (Cairo)', currentTime: '' },                  // UTC+02:00
          { value: 'Africa/Johannesburg', label: 'South Africa Time (Johannesburg, Cape Town)', currentTime: '' }, // UTC+02:00
          { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi, Addis Ababa)', currentTime: '' } // UTC+03:00
        ],
        'Oceania': [
          { value: 'Australia/Perth', label: 'Australian Western Time (Perth)', currentTime: '' },  // UTC+08:00
          { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney, Melbourne)', currentTime: '' }, // UTC+10:00
          { value: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)', currentTime: '' }      // UTC+12:00
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
    // Initialize with proper deep cloning to prevent reference issues
    initializeTimezones() {
      this.filteredTimezones = JSON.parse(JSON.stringify(this.allTimezones))
      this.updateAllTimezones()
    },

    // Update timezone times with error handling for invalid timezones
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

    // Enhanced filtering with proper object structure validation
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

    // Updated to store both timezone value and offset
    selectTimezone(timezoneValue) {
      if (timezoneValue && typeof timezoneValue === 'string') {
        this.selectedTimezone = timezoneValue;

        // Get the offset for this timezone
        const timezoneOffset = this.getTimezoneOffset(timezoneValue);

        // Store the combined value for backend storage
        this.businessData.time_zone = `${timezoneValue}_UTC${timezoneOffset}`;
      }
    },

    getTimezoneOffset(timezoneString) {
      try {
        const date = new Date()

        // Method 1: Using Intl.DateTimeFormat with longOffset
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

        // Method 2: Fallback using Date comparison
        return this.calculateOffsetFromComparison(timezoneString)

      } catch (error) {
        console.warn(`Error calculating offset for timezone: ${timezoneString}`, error)
        return '+00:00' // Default to UTC
      }
    },

    // Calculate timezone offset through direct comparison
    calculateOffsetFromComparison(timezone) {
      try {
        const date = new Date();

        // Get the time in the target timezone
        const timeInTZ = new Date(date.toLocaleString('en-US', { timeZone: timezone }));

        // Get the time in UTC
        const timeInUTC = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));

        // Calculate the difference in minutes
        let diffMinutes = (timeInTZ - timeInUTC) / (1000 * 60);

        // Format as +/-HH:MM
        const sign = diffMinutes >= 0 ? '+' : '-';
        diffMinutes = Math.abs(diffMinutes);

        const hours = Math.floor(diffMinutes / 60).toString().padStart(2, '0');
        const minutes = (diffMinutes % 60).toString().padStart(2, '0');

        return `${sign}${hours}:${minutes}`;
      } catch (error) {
        console.warn(`Error calculating offset for timezone: ${timezone}`, error);
        return '+00:00'; // Default to UTC
      }
    },

    // Helper method to extract timezone value from the combined string
    getTimezoneValueFromCombined(combinedString) {
      if (!combinedString) return '';

      if (combinedString.includes('_UTC')) {
        return combinedString.split('_UTC')[0];
      }

      return combinedString;
    },

    // Helper method to extract offset from the combined string
    getOffsetFromCombined(combinedString) {
      if (!combinedString) return '';

      if (combinedString.includes('_UTC')) {
        return combinedString.split('_UTC')[1] || '';
      }

      return '';
    },

    // Enhanced label retrieval with fallback handling
    getSelectedTimezoneLabel() {
      for (const region of Object.values(this.allTimezones)) {
        if (Array.isArray(region)) {
          const found = region.find(tz => tz.value === this.selectedTimezone)
          if (found) {
            return `${found.label} (${found.currentTime})`
          }
        }
      }
      return `${this.selectedTimezone || 'No timezone selected'}`
    },

    // Find a timezone by its UTC offset
    findTimezoneByOffset(targetOffset) {
      if (!targetOffset) {
        return 'America/New_York'; // Default fallback
      }

      // Normalize the target offset format
      targetOffset = targetOffset.trim();

      // Create a map to store offsets to timezone options
      const offsetMap = new Map();

      // Current date for consistent comparison
      const now = new Date();

      // Populate the map with all timezones and their current offsets
      Object.values(this.allTimezones).forEach(region => {
        if (Array.isArray(region)) {
          region.forEach(tz => {
            try {
              // Get the formatted offset for this timezone
              const formatter = new Intl.DateTimeFormat('en', {
                timeZone: tz.value,
                timeZoneName: 'longOffset'
              });

              const parts = formatter.formatToParts(now);
              const offsetPart = parts.find(part => part.type === 'timeZoneName');

              if (offsetPart && offsetPart.value) {
                // Extract just the offset part (e.g., "+02:00")
                const tzOffset = offsetPart.value.replace('GMT', '');

                // If this timezone matches our target offset, add it to the map
                if (!offsetMap.has(tzOffset)) {
                  offsetMap.set(tzOffset, []);
                }
                offsetMap.get(tzOffset).push(tz.value);
              }
            } catch (error) {
              console.warn(`Error processing timezone: ${tz.value}`, error);
            }
          });
        }
      });

      // First, try to find an exact match
      if (offsetMap.has(targetOffset)) {
        // Prefer common/major timezones if multiple options exist
        const candidates = offsetMap.get(targetOffset);

        // Prioritization logic for multiple timezones with the same offset
        const preferredRegions = ['America', 'Europe', 'Asia', 'Australia'];

        // Try to find a timezone in a preferred region
        for (const region of preferredRegions) {
          const preferred = candidates.find(tz => tz.startsWith(region + '/'));
          if (preferred) return preferred;
        }

        // If no preferred region found, just return the first one
        return candidates[0];
      }

      // If no exact match, try to find the closest offset
      // This handles cases where the offset might have slight formatting differences
      const normalizedTarget = this.normalizeOffset(targetOffset);

      for (const [offset, timezones] of offsetMap.entries()) {
        if (this.normalizeOffset(offset) === normalizedTarget) {
          return timezones[0]; // Return the first timezone with matching normalized offset
        }
      }

      // If still no match, return a default timezone
      console.warn(`No timezone found for offset: ${targetOffset}, using default`);
      return 'America/New_York';
    },

    // Helper method to normalize offset format for comparison
    normalizeOffset(offset) {
      // Remove any non-numeric characters except the sign and colon
      const sign = offset.startsWith('-') ? '-' : '+';
      const parts = offset.replace(/[^0-9:]/g, '').split(':');

      if (parts.length === 2) {
        // Ensure two digits for hours and minutes
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${sign}${hours}:${minutes}`;
      }

      // Handle case where offset might be in hours only
      if (parts.length === 1) {
        const hours = parts[0].padStart(2, '0');
        return `${sign}${hours}:00`;
      }

      return offset; // Return as is if we can't normalize
    },

    // Updated to handle combined timezone format
    async loadBusinessData() {
      this.isInitialLoading = true;
      try {
        const response = await getBusinessData(this.token);
        if (response && response.code === 200 && response.company) {
          const data = response.company;
          console.log("data", data);
          console.log("timezone", data.time_zone);
          // Extract timezone value from the combined string if it exists
          let timezoneValue = '';
          let timezoneOffset = '+00:00';

          if (data.time_zone) {
            // Check if the timeZone contains the separator
            if (data.time_zone.includes('_UTC')) {
              // Split at the _UTC marker
              const parts = data.time_zone.split('_UTC');
              timezoneValue = parts[0];
              timezoneOffset = parts[1] || '+00:00';
            } else {
              // Handle legacy data that might only have offset
              timezoneValue = this.findTimezoneByOffset(data.time_zone);
              timezoneOffset = data.time_zone;
            }
          } else {
            // Default values if no timezone is set
            timezoneValue = 'America/New_York';
            timezoneOffset = '-05:00';
          }

          this.businessData = {
            name: data.name || '',
            about: data.about || '',
            address: data.address || '',
            email: data.email || '',
            phone: data.phone || '',
            time_zone: `${timezoneValue}_UTC${timezoneOffset}`, // Store combined value
            slot_size: data.slotSize ? data.slotSize.toString() : '30',
            logo: data.logo || '',
            email_confirmation_required: data.email_confirmation_required
          };

          // Set the selected timezone for the dropdown
          this.selectedTimezone = timezoneValue;

          // Update the UI to show the selected timezone
          this.$nextTick(() => {
            this.updateAllTimezones();
          });

          this.originalData = JSON.parse(JSON.stringify(this.businessData));
        }
      } catch (error) {
        this.$swal({
          title: 'Error',
          text: 'Failed to load business data',
          icon: 'error'
        });
        console.error('Error loading business data:', error);
      } finally {
        this.isInitialLoading = false;
      }
    },

    isTimezoneSelected(timezoneValue) {
      return this.selectedTimezone === timezoneValue;
    },

    async saveChanges() {
      this.isLoading = true;
      try {
        const response = await saveBusinessData(this.token, {
          name: this.businessData.name,
          about: this.businessData.about,
          address: this.businessData.address,
          email: this.businessData.email,
          phone: this.businessData.phone,
          time_zone: this.businessData.time_zone, // Now contains both timezone and offset
          slot_size: this.businessData.slot_size,
          logo: this.businessData.logo,
          email_confirmation_required: this.businessData.email_confirmation_required
        });

        if (response.code === 200) {
          this.$swal({
            title: 'Success',
            text: response.message || 'Business settings updated successfully',
            icon: 'success'
          });
          this.originalData = JSON.parse(JSON.stringify(this.businessData));
        } else {
          this.$swal({
            title: 'Error',
            text: response.message || 'Failed to update business settings',
            icon: 'error'
          });
        }
      } catch (error) {
        this.$swal({
          title: 'Error',
          text: 'An unexpected error occurred',
          icon: 'error'
        });
        console.error('Error saving business data:', error);
      } finally {
        this.isLoading = false;
      }
    },

    resetForm() {
      if (this.originalData) {
        this.businessData = JSON.parse(JSON.stringify(this.originalData));
        // Extract the timezone value from the combined string
        this.selectedTimezone = this.getTimezoneValueFromCombined(this.businessData.time_zone);
      }
    }
  },

  mounted() {
    this.loadBusinessData();
    this.initializeTimezones();

    // Update times every minute
    this.timeUpdateInterval = setInterval(() => {
      this.updateAllTimezones();
    }, 60000);
  },
  beforeUnmount() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }
}
</script>

<style scoped>
.timezone-dropdown-menu {
  padding: 0;
}

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

.timezone-option.active {
  background-color: #0d6efd !important;
  color: white !important;
}

.timezone-option:focus {
  box-shadow: none;
  outline: 2px solid #0d6efd;
  outline-offset: -2px;
}

/* Make dropdown wider and ensure it doesn't close on internal clicks */
.dropdown-menu.timezone-dropdown-menu {
  width: 100%;
}

/* Fix dropdown search input */
.dropdown-menu .form-control:focus {
  box-shadow: none;
  border-color: #ced4da;
}
</style>
