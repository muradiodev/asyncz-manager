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
            <div class="step-label">{{ step }}</div>
          </div>
        </div>

        <!-- Step 1: General Info -->
        <div v-if="status === 'general'" class="form-step">
          <h2>Create Your Account</h2>

          <form @submit.prevent="goTo2">
            <div class="form-group">
              <label for="companyNameInput">Company Name</label>
              <input
                v-model.trim="companyName"
                type="text"
                id="companyNameInput"
                autocomplete="company-name"
                required
              />
            </div>

            <div class="form-group">
              <label for="companyEmailInput">Company Email</label>
              <input
                v-model.trim="companyEmail"
                type="email"
                id="companyEmailInput"
                autocomplete="company-email"
              />
              <span class="helper-text">This email will be visible to your customers.</span>
            </div>

            <div class="form-group">
              <label for="adminNameInput">Your Full Name</label>
              <input
                v-model.trim="adminName"
                type="text"
                id="adminNameInput"
                autocomplete="name"
                required
              />
            </div>

            <div class="form-group">
              <label for="adminEmailInput">Your Email</label>
              <input
                v-model.trim="adminEmail"
                type="email"
                id="adminEmailInput"
                autocomplete="email"
              />
              <span class="helper-text"
                >This email will be used to login to your account and won't be visible to
                customers.</span
              >
            </div>

            <button type="submit" class="btn-primary">Continue</button>
          </form>
        </div>

        <!-- Step 2: Verify Email -->
        <div v-if="status === 'verify'" class="form-step">
          <h2>Verify Your Email</h2>

          <form @submit.prevent="goTo3">
            <div class="form-group">
              <label for="verifyEmail">Email Address</label>
              <input
                v-model="adminEmail"
                type="email"
                id="verifyEmail"
                readonly
                class="readonly-input"
              />
            </div>

            <div class="form-group">
              <label for="verifyOtp">Verification Code</label>
              <input
                v-model.trim="otp"
                type="text"
                id="verifyOtp"
                required
                class="verification-input"
                placeholder="Enter code"
              />
            </div>

            <button type="submit" class="btn-primary">Verify & Continue</button>
          </form>
        </div>

        <!-- Step 3: Set Password -->
        <div v-if="status === 'password'" class="form-step">
          <h2>Set Your Password</h2>

          <form @submit.prevent="goToFinish">
            <div class="form-group">
              <label for="passwordEmail">Email Address</label>
              <input
                v-model="adminEmail"
                type="email"
                id="passwordEmail"
                readonly
                class="readonly-input"
              />
            </div>

            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                v-model.trim="newPassword"
                type="password"
                id="newPassword"
                required
                placeholder="Enter a strong password"
              />
            </div>

            <button type="submit" class="btn-primary">Complete Registration</button>
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

    // These methods are only for testing purposes. Written by Mubariz
    goTo2() {this.status = 'verify'},
    goTo3() {this.status = 'password'},
    goToFinish() {
      this.$swal({
        title: 'You are registered!',
        text: 'You can now login to your account',
        icon: 'success',
        showConfirmButton: true
      })
    },

    loginOwner() {
      registerStart(this.companyName, this.companyEmail, this.adminName, this.adminEmail).then(
        (result) => {
          if (result.code === 200) {
            this.status = 'verify'
            this.$swal({
              title: 'Verification Email Sent',
              text: 'You will receive an email with a verification code. Please check your  spam box too.',
              icon: 'success',
              showConfirmButton: true
            })
          } else {
            this.$swal({
              title: this.$t('general.error'),
              text: result.message,
              icon: 'error',
              showConfirmButton: true
            })
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
          this.$swal({
            title: 'Your account created',
            text: 'Please set password for feature logins.',
            icon: 'success',
            showConfirmButton: true
          })
        } else {
          this.$swal({
            title: this.$t('general.error'),
            text: result.message,
            icon: 'error',
            showConfirmButton: true
          })
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
          this.$swal({
            title: 'Error',
            text: response.message,
            icon: 'error'
          })
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
.registration-container {
  display: flex;
  min-height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.brand-panel {
  flex: 0 0 50%;
  background-image: url('@/assets/images/asyncz_login_back_photo.png');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  @media (max-width: 768px) {
    flex: 0 0 150px;
    min-height: 150px;
  }
}

.logo-container {
  position: relative;
  z-index: 2;
  padding: 2rem;

  img {
    max-width: 100%;
    width: 200px;
    height: auto;
  }
}

.form-panel {
  flex: 0 0 50%;
  background-color: #fff;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    flex: 1;
  }
}

.form-wrapper {
  max-width: 600px;
  width: 90%;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.language-selector {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;

  .dropdown-toggle {
    color: #555;
    text-decoration: none;
    font-size: 0.9rem;
    display: flex;
    align-items: center;

    &::after {
      margin-left: 0.5rem;
    }
  }

  .dropdown-menu {
    min-width: 150px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: none;
    padding: 0.5rem 0;
  }

  .dropdown-item {
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .check-icon {
      color: #4caf50;
      font-weight: bold;
    }
  }
}

.progress-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 30px;
    right: 30px;
    height: 2px;
    background-color: #e0e0e0;
    z-index: 1;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #e0e0e0;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .step-label {
      font-size: 0.8rem;
      color: #777;
      text-align: center;
      transition: all 0.3s ease;
    }

    &.active {
      .step-number {
        background-color: #3498db;
        box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.2);
      }

      .step-label {
        color: #3498db;
        font-weight: 500;
      }
    }

    &.completed {
      .step-number {
        background-color: #4caf50;
      }
    }

    &.disabled {
      .step-number {
        background-color: #e0e0e0;
      }

      .step-label {
        color: #aaa;
      }
    }
  }
}

.form-step {
  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
  }

  .subtitle {
    color: #777;
    margin-bottom: 1rem;
  }
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    &.readonly-input {
      background-color: #f9f9f9;
      color: #777;
    }

    &.verification-input {
      letter-spacing: 2px;
      font-weight: 600;
      text-align: center;
    }
  }

  .helper-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #888;
  }
}

.btn-primary {
  display: inline-block;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: darken(#3498db, 10%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

.footer-custom {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
}
</style>
