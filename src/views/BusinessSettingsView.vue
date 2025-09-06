<template>
  <CCard class="border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="breadcrumbs" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">{{ $t('businessSettings.title') }}</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4 pb-4 mt-4" lg>
    <div v-if="isInitialLoading">
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">{{ $t('general.loading') }}</span>
        </div>
      </div>
    </div>

    <div v-else class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <form @submit.prevent="saveChanges">
          <!-- Business Name -->
          <div class="mb-4">
            <label for="businessName" class="form-label fw-bold">{{ $t('businessSettings.labels.businessName') }}</label>
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
            <label for="businessAbout" class="form-label fw-bold">{{ $t('businessSettings.labels.businessDescription') }}</label>
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
            <label for="businessAddress" class="form-label fw-bold">{{ $t('businessSettings.labels.businessAddress') }}</label>
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
            <label for="businessPhone" class="form-label fw-bold">{{ $t('businessSettings.labels.businessPhone') }}</label>
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
            <label for="businessEmail" class="form-label fw-bold">{{ $t('businessSettings.labels.businessEmail') }}</label>
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
            <label for="businessTimezone" class="form-label fw-bold">{{ $t('businessSettings.labels.businessTimezone') }}</label>

            <div class="dropdown w-100">
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

              <div class="dropdown-menu w-100 p-0 timezone-dropdown-menu" aria-labelledby="timezoneDropdown">
                <!-- Search Input -->
                <div class="p-2 border-bottom">
                  <input
                    type="text"
                    class="form-control"
                    :placeholder="$t('businessSettings.labels.searchTimezoneOrCity')"
                    v-model="timezoneSearch"
                    @input="filterTimezones"
                  />
                </div>

                <!-- Timezone Groups Container -->
                <div class="timezone-selector" style="max-height: 400px; overflow-y: auto;">
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
          </div>

          <!-- Slot Size -->
          <div class="mb-4">
            <label for="slotSize" class="form-label fw-bold">{{ $t('businessSettings.labels.slotSizeInMinutes') }}</label>
            <select
              class="form-select"
              id="slotSize"
              v-model="businessData.slot_size"
              :disabled="isLoading"
            >
              <option value="10">{{ $t('businessSettings.options.slotSizes.10') }}</option>
              <option value="15">{{ $t('businessSettings.options.slotSizes.15') }}</option>
              <option value="30">{{ $t('businessSettings.options.slotSizes.30') }}</option>
              <option value="60">{{ $t('businessSettings.options.slotSizes.60') }}</option>
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
                  {{ $t('businessSettings.labels.requireEmailConfirmationVisuallyHidden') }}
                </label>
              </div>
              <div>
                <h6 class="mb-1">{{ $t('businessSettings.labels.requireEmailConfirmation') }}</h6>
                <p class="text-muted small mb-0">
                  {{ $t('businessSettings.help.requireEmailConfirmation') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Language Selector -->
          <div class="mb-4">
            <label for="language" class="form-label fw-bold">{{ $t('businessSettings.labels.language') }}</label>
            <select
              class="form-select"
              id="language"
              v-model="businessData.language"
              :disabled="isLoading"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="az">Azərbaycanca</option>
              <option value="tr">Türkçe</option>
              <option value="ru">Русский</option>
            </select>
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
              {{ isLoading ? $t('businessSettings.actions.saving') : $t('businessSettings.actions.saveChanges') }}
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
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

export default {
  name: 'BusinessSettingsView',
  components: { AppBreadcrumb },
  setup() {
    const { t, locale } = useI18n()
    const currentLanguage = ref(locale.value)

    const changeLanguage = (lang) => {
      locale.value = lang
      localStorage.setItem('preferredLanguage', lang)
      currentLanguage.value = lang
    }

    return {
      currentLanguage,
      changeLanguage,
    }
  },
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
        email_confirmation_required: '',
        language: 'en' // Default language
      },
      originalData: null,

      // Properly structured timezone database
      allTimezones: {
        'North America': [
          { value: 'Pacific/Midway', label: 'Pacific/Midway (Midway Island, Samoa)', currentTime: '' },
          { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (Hawaii)', currentTime: '' },
          { value: 'America/Juneau', label: 'America/Juneau (Alaska)', currentTime: '' },
          { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time)', currentTime: '' },
          { value: 'America/Tijuana', label: 'America/Tijuana (Tijuana)', currentTime: '' },
          { value: 'America/Boise', label: 'America/Boise (Mountain Time)', currentTime: '' },
          { value: 'America/Phoenix', label: 'America/Phoenix (Arizona)', currentTime: '' },
          { value: 'America/Dawson', label: 'America/Dawson (Dawson, Yukon)', currentTime: '' },
          { value: 'America/Chicago', label: 'America/Chicago (Central Time)', currentTime: '' },
          { value: 'America/Regina', label: 'America/Regina (Saskatchewan)', currentTime: '' },
          { value: 'America/Mexico_City', label: 'America/Mexico_City (Guadalajara, Mexico City, Monterrey)', currentTime: '' },
          { value: 'America/Belize', label: 'America/Belize (Central America)', currentTime: '' },
          { value: 'America/Detroit', label: 'America/Detroit (Eastern Time)', currentTime: '' },
          { value: 'America/St_Johns', label: 'America/St_Johns (Newfoundland and Labrador)', currentTime: '' }
        ],
        'South America': [
          { value: 'America/Bogota', label: 'America/Bogota (Bogota, Lima, Quito)', currentTime: '' },
          { value: 'America/Caracas', label: 'America/Caracas (Caracas, La Paz)', currentTime: '' },
          { value: 'America/Santiago', label: 'America/Santiago (Santiago)', currentTime: '' },
          { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (Brasilia)', currentTime: '' },
          { value: 'America/Montevideo', label: 'America/Montevideo (Montevideo)', currentTime: '' },
          { value: 'America/Argentina/Buenos_Aires', label: 'America/Argentina/Buenos_Aires (Buenos Aires, Georgetown)', currentTime: '' }
        ],
        'Europe': [
          { value: 'Europe/London', label: 'Europe/London (Edinburgh, London)', currentTime: '' },
          { value: 'Europe/Dublin', label: 'Europe/Dublin (Dublin)', currentTime: '' },
          { value: 'Europe/Lisbon', label: 'Europe/Lisbon (Lisbon)', currentTime: '' },
          { value: 'Europe/Brussels', label: 'Europe/Brussels (Brussels, Copenhagen, Madrid, Paris)', currentTime: '' },
          { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna)', currentTime: '' },
          { value: 'Europe/Belgrade', label: 'Europe/Belgrade (Belgrade, Bratislava, Budapest, Ljubljana, Prague)', currentTime: '' },
          { value: 'Europe/Sarajevo', label: 'Europe/Sarajevo (Sarajevo, Skopje, Warsaw, Zagreb)', currentTime: '' },
          { value: 'Europe/Bucharest', label: 'Europe/Bucharest (Bucharest)', currentTime: '' },
          { value: 'Europe/Helsinki', label: 'Europe/Helsinki (Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius)', currentTime: '' },
          { value: 'Europe/Athens', label: 'Europe/Athens (Athens)', currentTime: '' },
          { value: 'Europe/Moscow', label: 'Europe/Moscow (Istanbul, Minsk, Moscow, St. Petersburg, Volgograd)', currentTime: '' }
        ],
        'Asia': [
          { value: 'Asia/Jerusalem', label: 'Asia/Jerusalem (Jerusalem)', currentTime: '' },
          { value: 'Asia/Kuwait', label: 'Asia/Kuwait (Kuwait, Riyadh)', currentTime: '' },
          { value: 'Asia/Baghdad', label: 'Asia/Baghdad (Baghdad)', currentTime: '' },
          { value: 'Asia/Tehran', label: 'Asia/Tehran (Tehran)', currentTime: '' },
          { value: 'Asia/Dubai', label: 'Asia/Dubai (Abu Dhabi, Muscat)', currentTime: '' },
          { value: 'Asia/Baku', label: 'Asia/Baku (Baku, Tbilisi, Yerevan)', currentTime: '' },
          { value: 'Asia/Kabul', label: 'Asia/Kabul (Kabul)', currentTime: '' },
          { value: 'Asia/Yekaterinburg', label: 'Asia/Yekaterinburg (Ekaterinburg)', currentTime: '' },
          { value: 'Asia/Karachi', label: 'Asia/Karachi (Islamabad, Karachi, Tashkent)', currentTime: '' },
          { value: 'Asia/Kolkata', label: 'Asia/Kolkata (Chennai, Kolkata, Mumbai, New Delhi)', currentTime: '' },
          { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (Kathmandu)', currentTime: '' },
          { value: 'Asia/Dhaka', label: 'Asia/Dhaka (Astana, Dhaka)', currentTime: '' },
          { value: 'Asia/Colombo', label: 'Asia/Colombo (Sri Jayawardenepura)', currentTime: '' },
          { value: 'Asia/Almaty', label: 'Asia/Almaty (Almaty, Novosibirsk)', currentTime: '' },
          { value: 'Asia/Rangoon', label: 'Asia/Rangoon (Yangon Rangoon)', currentTime: '' },
          { value: 'Asia/Bangkok', label: 'Asia/Bangkok (Bangkok, Hanoi, Jakarta)', currentTime: '' },
          { value: 'Asia/Krasnoyarsk', label: 'Asia/Krasnoyarsk (Krasnoyarsk)', currentTime: '' },
          { value: 'Asia/Shanghai', label: 'Asia/Shanghai (Beijing, Chongqing, Hong Kong SAR, Urumqi)', currentTime: '' },
          { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur (Kuala Lumpur, Singapore)', currentTime: '' },
          { value: 'Asia/Taipei', label: 'Asia/Taipei (Taipei)', currentTime: '' },
          { value: 'Asia/Irkutsk', label: 'Asia/Irkutsk (Irkutsk, Ulaanbaatar)', currentTime: '' },
          { value: 'Asia/Seoul', label: 'Asia/Seoul (Seoul)', currentTime: '' },
          { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Osaka, Sapporo, Tokyo)', currentTime: '' },
          { value: 'Asia/Yakutsk', label: 'Asia/Yakutsk (Yakutsk)', currentTime: '' },
          { value: 'Asia/Vladivostok', label: 'Asia/Vladivostok (Vladivostok)', currentTime: '' },
          { value: 'Asia/Magadan', label: 'Asia/Magadan (Magadan, Solomon Islands, New Caledonia)', currentTime: '' },
          { value: 'Asia/Kamchatka', label: 'Asia/Kamchatka (Kamchatka, Marshall Islands)', currentTime: '' }
        ],
        'Africa': [
          { value: 'Africa/Casablanca', label: 'Africa/Casablanca (Casablanca, Monrovia)', currentTime: '' },
          { value: 'Africa/Algiers', label: 'Africa/Algiers (West Central Africa)', currentTime: '' },
          { value: 'Africa/Cairo', label: 'Africa/Cairo (Cairo)', currentTime: '' },
          { value: 'Africa/Harare', label: 'Africa/Harare (Harare, Pretoria)', currentTime: '' },
          { value: 'Africa/Nairobi', label: 'Africa/Nairobi (Nairobi)', currentTime: '' }
        ],
        'Atlantic': [
          { value: 'Atlantic/Azores', label: 'Atlantic/Azores (Azores)', currentTime: '' },
          { value: 'Atlantic/Cape_Verde', label: 'Atlantic/Cape_Verde (Cape Verde Islands)', currentTime: '' },
          { value: 'Atlantic/Canary', label: 'Atlantic/Canary (Canary Islands)', currentTime: '' },
          { value: 'America/Godthab', label: 'America/Godthab (Greenland)', currentTime: '' }
        ],
        'Oceania': [
          { value: 'Australia/Perth', label: 'Australia/Perth (Perth)', currentTime: '' },
          { value: 'Australia/Darwin', label: 'Australia/Darwin (Darwin)', currentTime: '' },
          { value: 'Australia/Adelaide', label: 'Australia/Adelaide (Adelaide)', currentTime: '' },
          { value: 'Australia/Brisbane', label: 'Australia/Brisbane (Brisbane)', currentTime: '' },
          { value: 'Australia/Sydney', label: 'Australia/Sydney (Canberra, Melbourne, Sydney)', currentTime: '' },
          { value: 'Australia/Hobart', label: 'Australia/Hobart (Hobart)', currentTime: '' },
          { value: 'Pacific/Guam', label: 'Pacific/Guam (Guam, Port Moresby)', currentTime: '' },
          { value: 'Pacific/Fiji', label: 'Pacific/Fiji (Fiji Islands)', currentTime: '' },
          { value: 'Pacific/Auckland', label: 'Pacific/Auckland (Auckland, Wellington)', currentTime: '' },
          { value: 'Pacific/Tongatapu', label: 'Pacific/Tongatapu (Nuku\'alofa)', currentTime: '' }
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

        // Store the combined value for backend storage
        this.businessData.time_zone = `${timezoneValue}`;
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


          this.businessData = {
            name: data.name || '',
            about: data.about || '',
            address: data.address || '',
            email: data.email || '',
            phone: data.phone || '',
            time_zone: data.time_zone, // Store combined value
            slot_size: data.slot_size || '10',
            logo: data.logo || '',
            email_confirmation_required: data.email_confirmation_required,
            language: data.language || 'en' // Default to English if not provided
          };

          // Set the selected timezone for the dropdown
          this.selectedTimezone = data.time_zone;

          // Update the UI to show the selected timezone
          this.$nextTick(() => {
            this.updateAllTimezones();
          });

          this.originalData = JSON.parse(JSON.stringify(this.businessData));
        }
      } catch (error) {
        toast.error('Failed to load business data');
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
          email_confirmation_required: this.businessData.email_confirmation_required,
          language: this.businessData.language // Send selected language to backend
        });

        if (response.code === 200) {
          toast.success(response.message || 'Business settings updated successfully');
          this.originalData = JSON.parse(JSON.stringify(this.businessData));
          this.changeLanguage(this.businessData.language);
        } else {
          toast.error(response.message || 'Failed to update business settings');
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Error saving business data:', error);
      } finally {
        this.isLoading = false;
      }
    },
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
