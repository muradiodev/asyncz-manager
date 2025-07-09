<template>
  <div class="login-container">
    <!-- Left side with logo and background -->
    <div class="brand-panel">
      <div class="logo-container">
        <img src="@/assets/images/logo.png" alt="Logo" />
      </div>
    </div>

    <!-- Right side with login form -->
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

        <!-- Login Form -->
        <div v-if="status === 'LOGIN'" class="form-step">
          <h2>{{ $t('login.welcomeBack') }}</h2>
          <p class="subtitle"></p>

          <form @submit.prevent="loginOwner">
            <div class="form-group">
              <label for="exampleInputEmail">{{ $t('login.emailAddress') }}</label>
              <input v-model.trim="email" type="email" id="exampleInputEmail" required />
              <span class="helper-text">{{ $t('login.noShare') }}</span>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label for="exampleInputPassword">{{ $t('login.password') }}</label>
                <a href="#" @click.prevent="status = 'FORGET'" class="forgot-link">
                  {{ $t('login.forgotPassword') }}
                </a>
              </div>
              <input v-model.trim="password" type="password" id="exampleInputPassword" required />
            </div>

            <button type="submit" class="btn-primary-custom">{{ $t('general.submit') }}</button>
          </form>
        </div>

        <!-- Forgot Password Form -->
        <div v-if="status === 'FORGET'" class="form-step">
          <h2>{{ $t('login.forgotPasswordTitle') }}</h2>
          <p class="subtitle">Enter your email to receive a verification code</p>

          <form @submit.prevent="forgetPassword">
            <div class="form-group">
              <label for="forgetEmail">{{ $t('login.emailAddress') }}</label>
              <input v-model.trim="email" type="email" id="forgetEmail" required />
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary-custom" @click="status = 'LOGIN'">
                Back to Login
              </button>
              <button type="submit" class="btn-primary-custom">
                {{ $t('login.getVerificationCode') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Verify Code & Set New Password -->
        <div v-if="status === 'FORGET_VERIFY'" class="form-step">
          <h2>{{ $t('login.forgotPasswordTitle') }}</h2>
          <p class="subtitle">Enter the verification code and set a new password</p>

          <form @submit.prevent="forgetPasswordVerify">
            <div class="form-group">
              <label for="forgetVerifyEmail">{{ $t('login.emailAddress') }}</label>
              <input
                v-model="email"
                type="email"
                id="forgetVerifyEmail"
                readonly
                class="readonly-input"
              />
            </div>

            <div class="form-group">
              <label for="forgetVerifyOtp">{{ $t('login.verificationCode') }}</label>
              <input
                v-model.trim="otp"
                type="text"
                id="forgetVerifyOtp"
                required
                class="verification-input"
                placeholder="Enter code"
              />
            </div>

            <div class="form-group">
              <label for="forgetVerifyPassword">{{ $t('login.newPassword') }}</label>
              <input
                v-model.trim="newPassWord"
                type="password"
                id="forgetVerifyPassword"
                required
                placeholder="Enter a strong password"
              />
            </div>

            <button type="submit" class="btn-primary-custom">
              {{ $t('login.setMyNewPassword') }}
            </button>
          </form>
        </div>

        <!-- Register prompt -->
        <div class="register-prompt">
          <p>
            Don't have an account?
            <router-link :to="{ name: 'register', query: { back: $route.query.back } }">
              Register for free
            </router-link>
          </p>
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
import { mapActions } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/repositories/AuthRepository'

export default {
  name: 'LoginView',
  components: {},
  data() {
    return {
      status: 'LOGIN',
      email: '',
      password: '',

      otp: '',
      newPassWord: ''
    }
  },
  watch: {},
  methods: {
    ...mapActions(useAuthStore, ['setToken']),

    loginOwner() {
      login(this.email, this.password).then((result) => {
        if (result.code === 200) {
          localStorage.setItem('token', result.token)
          this.setToken(result.token)

          let next = this.$route['query']['next']

          if (next) {
            this.$router.push(next)
          } else {
            this.$router.push({ name: 'home' })
          }
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
