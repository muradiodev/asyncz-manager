<template>
  <div class="registration-container">
    <!-- Left side with logo and background -->
    <div class="brand-panel">
      <div class="logo-container">
        <img src="@/assets/images/logo.png" alt="Logo" />
      </div>
    </div>

    <!-- Right side with registration form -->
    <div class="form-panel">
      <div class="form-wrapper">
        <!-- Language selector -->
        <div class="language-selector">
          <div class="dropdown">
            <a
              class="dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-expanded="false"
            >
              {{ $t('language.current') }}
            </a>
            <ul class="dropdown-menu">
              <li v-for="l in $i18n.availableLocales" :key="l">
                <a class="dropdown-item" href="#" @click.prevent="setLanguage(l)">
                  {{ $t(`language.list.${l}`) }}
                  <span v-if="l === $i18n.locale" class="check-icon">✓</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="back-to-login">
          <router-link to="/login" class="back-link">← {{ $t('register.actions.backToLogin') }}</router-link>
        </div>

        <!-- Progress indicator -->
        <div class="progress-indicator">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="step"
            :class="{
              active: status === index,
              completed: isCompleted(index),
              disabled: isDisabled(index)
            }"
          >
            <div class="step-number">{{ getStepNumber(index) }}</div>
            <div class="step-label">{{ $t(`register.steps.${index}`) }}</div>
          </div>
        </div>

        <!-- Step 1: General Info -->
        <div v-if="status === 'general'" class="form-step">
          <h2>{{ $t('register.titles.createAccount') }}</h2>

          <form @submit.prevent="loginOwner">
            <div class="form-group">
              <label for="companyNameInput">{{ $t('register.fields.companyName') }}</label>
              <input
                v-model.trim="companyName"
                type="text"
                id="companyNameInput"
                autocomplete="company-name"
                required
              />
            </div>

            <div class="form-group">
              <label for="companyEmailInput">{{ $t('register.fields.companyEmail') }}</label>
              <input
                v-model.trim="companyEmail"
                type="email"
                id="companyEmailInput"
                autocomplete="company-email"
              />
              <span class="helper-text">{{ $t('register.helpers.companyEmailVisible') }}</span>
            </div>

            <div class="form-group">
              <label for="adminNameInput">{{ $t('register.fields.adminName') }}</label>
              <input
                v-model.trim="adminName"
                type="text"
                id="adminNameInput"
                autocomplete="name"
                required
              />
            </div>

            <div class="form-group">
              <label for="adminEmailInput">{{ $t('register.fields.adminEmail') }}</label>
              <input
                v-model.trim="adminEmail"
                type="email"
                id="adminEmailInput"
                autocomplete="email"
              />
              <span class="helper-text">
                {{ $t('register.helpers.adminEmailNotVisible') }}
              </span>
            </div>

            <button type="submit" class="btn-primary-custom">{{ $t('register.actions.continue') }}</button>
          </form>
        </div>

        <!-- Step 2: Verify Email -->
        <div v-if="status === 'verify'" class="form-step">
          <h2>{{ $t('register.titles.verifyEmail') }}</h2>

          <form @submit.prevent="registerVerify">
            <div class="form-group">
              <label for="verifyEmail">{{ $t('register.fields.emailAddress') }}</label>
              <input
                v-model="adminEmail"
                type="email"
                id="verifyEmail"
                readonly
                class="readonly-input"
              />
            </div>

            <div class="form-group">
              <label for="verifyOtp">{{ $t('register.fields.verificationCode') }}</label>
              <input
                v-model.trim="otp"
                type="text"
                id="verifyOtp"
                required
                class="verification-input"
                :placeholder="$t('register.placeholders.enterCode')"
              />
            </div>

            <button type="submit" class="btn-primary-custom">{{ $t('register.actions.verifyContinue') }}</button>
          </form>
        </div>

        <!-- Step 3: Set Password -->
        <div v-if="status === 'password'" class="form-step">
          <h2>{{ $t('register.titles.setPassword') }}</h2>

          <form @submit.prevent="updatePassword">
            <div class="form-group">
              <label for="passwordEmail">{{ $t('register.fields.emailAddress') }}</label>
              <input
                v-model="adminEmail"
                type="email"
                id="passwordEmail"
                readonly
                class="readonly-input"
              />
            </div>

            <div class="form-group">
              <label for="newPassword">{{ $t('register.fields.newPassword') }}</label>
              <input
                v-model.trim="newPassword"
                type="password"
                id="newPassword"
                required
                :placeholder="$t('register.placeholders.enterPassword')"
              />
            </div>

            <button type="submit" class="btn-primary-custom">{{ $t('register.actions.completeRegistration') }}</button>
          </form>
        </div>
      </div>
      <!-- Footer -->
      <div class="footer-custom">
        <p>&copy; {{ new Date().getFullYear() }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { registerStart, registerVerify, setPassword } from '@/repositories/AuthRepository'
import { customAlert } from '@/utils/utils.js'
import { toast } from 'vue3-toastify'

export default {
  name: 'RegisterView',
  components: {},
  data() {
    return {
      status: 'general',
      companyName: '',
      companyEmail: '',
      adminName: '',
      adminEmail: '',

      otp: '',
      newPassword: '',
      steps: {
        general: 'General Info',
        verify: 'Verify Email',
        password: 'Set Password'
      }
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user'])
  },
  watch: {},
  methods: {
    ...mapActions(useAuthStore, ['setToken']),

    isDisabled(index) {
      switch (index) {
        case 'general':
          return false
        case 'verify':
          return this.status === 'general'
        case 'password':
          return this.status === 'verify'
        default:
          return true
      }
    },

    isCompleted(index) {
      if (index === 'general' && (this.status === 'verify' || this.status === 'password')) {
        return true
      }
      if (index === 'verify' && this.status === 'password') {
        return true
      }
      return false
    },

    getStepNumber(index) {
      const stepOrder = ['general', 'verify', 'password']
      return stepOrder.indexOf(index) + 1
    },

    // These methods are only for testing purposes. Do not delete it yet. Written by Mubariz
    goTo2() {this.status = 'verify'},
    goTo3() {this.status = 'password'},
    goToFinish() {
      toast.success('You can now login to your account');
    },

    loginOwner() {
      registerStart(this.companyName, this.companyEmail, this.adminName, this.adminEmail).then(
        (result) => {
          if (result.code === 200) {
            this.status = 'verify'
            toast.info('You will receive an email with a verification code. Please check your  spam box too.');
          } else {
            toast.error(result.message);
          }
        }
      )
    },

    registerVerify() {
      registerVerify(
        this.companyName,
        this.companyEmail,
        this.adminName,
        this.adminEmail,
        this.otp
      ).then((result) => {
        if (result.code === 200) {
          localStorage.setItem('token', result.token)
          this.setToken(result.token)
          this.status = 'password'
          toast.success('Please set password for feature logins.');
        } else {
          toast.error(result.message);
        }
      })
    },

    updatePassword() {
      setPassword(this.token, this.newPassword).then((response) => {
        if (response.code === 200) {
          customAlert(`Success`, `Password updated`, 'success', () => {
            let next = this.$route['query']['next']

            if (next) {
              this.$router.push(next)
            } else {
              this.$router.push({ name: 'home' })
            }
          })
        } else {
          toast.error(response.message);
        }
      })
    },

    setLanguage(locale) {
      this.$i18n.locale = locale
      localStorage.setItem('_dt_language', locale)
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
</style>
