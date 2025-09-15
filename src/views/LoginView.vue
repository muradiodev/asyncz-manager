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
              <input v-model.trim="email" type="email" id="exampleInputEmail" required :disabled="isLoading" />
              <span class="helper-text">{{ $t('login.noShare') }}</span>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label for="exampleInputPassword">{{ $t('login.password') }}</label>
                <a href="#" @click.prevent="status = 'FORGET'" class="forgot-link">
                  {{ $t('login.forgotPassword') }}
                </a>
              </div>
              <input v-model.trim="password" type="password" id="exampleInputPassword" required :disabled="isLoading" />
            </div>

            <button type="submit" class="btn-primary-custom form-group" :disabled="isLoading">
              <span v-if="isLoading && loginType === 'email'" class="loading-spinner"></span>
              {{ isLoading && loginType === 'email' ? $t('login.signingIn') : $t('login.login') }}
            </button>
          </form>

          <!-- Divider -->
          <div class="divider">
            <span>{{ $t('login.or') }}</span>
          </div>

          <!-- Google Login Button -->
          <button
            @click="handleGoogleSignIn"
            class="btn-google"
            :disabled="isLoading"
          >
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span v-if="isLoading && loginType === 'google'" class="loading-spinner"></span>
            {{ isLoading && loginType === 'google' ? $t('login.signingInWithGoogle') : $t('login.continueWithGoogle') }}
          </button>
        </div>

        <!-- Forgot Password Form -->
        <div v-if="status === 'FORGET'" class="form-step">
          <h2>{{ $t('login.forgotPasswordTitle') }}</h2>
          <p class="subtitle">{{ $t('login.subtitles.enterEmail') }}</p>

          <form @submit.prevent="forgetPassword">
            <div class="form-group">
              <label for="forgetEmail">{{ $t('login.emailAddress') }}</label>
              <input v-model.trim="email" type="email" id="forgetEmail" required />
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary-custom" @click="status = 'LOGIN'">
                {{ $t('login.actions.backToLogin') }}
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
          <p class="subtitle">{{ $t('login.subtitles.enterCode') }}</p>

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
                placeholder="{{ $t('login.placeholders.verificationCode') }}"
              />
            </div>

            <div class="form-group">
              <label for="forgetVerifyPassword">{{ $t('login.newPassword') }}</label>
              <input
                v-model.trim="newPassWord"
                type="password"
                id="forgetVerifyPassword"
                required
                placeholder="{{ $t('login.placeholders.newPassword') }}"
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
            {{ $t('login.register.prompt') }}
            <router-link :to="{ name: 'register', query: { back: $route.query.back } }">
              {{ $t('login.register.cta') }}
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
import { login, loginWithGoogle } from '@/repositories/AuthRepository'
import { toast } from 'vue3-toastify'

export default {
  name: 'LoginView',
  components: {},
  data() {
    return {
      status: 'LOGIN',
      email: '',
      password: '',
      otp: '',
      newPassWord: '',
      isLoading: false,
      loginType: null // 'email' or 'google'
    }
  },
  watch: {},
  methods: {
    ...mapActions(useAuthStore, ['setToken']),

    loginOwner() {
      if (this.isLoading) return

      this.isLoading = true
      this.loginType = 'email'

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
          toast.error(result.message)
        }
      }).finally(() => {
        this.isLoading = false
        this.loginType = null
      })
    },

    async handleGoogleSignIn() {
      if (this.isLoading) return

      this.isLoading = true
      this.loginType = 'google'

      try {
        const result = await loginWithGoogle()

        if (result.code === 200) {
          console.log('Google login success:', result)
          // Store your backend token if provided
          if (result.token) {
            localStorage.setItem('token', result.token)
            this.setToken(result.token)
          }

          // Success message
          const userName = result.firebaseUser?.name || ''
          toast.success(this.$t('login.welcomeMessage', { name: userName }))

          // Redirect
          setTimeout(() => {
            const next = this.$route.query?.next
            if (next) {
              this.$router.push(next)
            } else {
              this.$router.push({ name: 'home' })
            }
          }, 1000)

        } else {
          // Only show error if it's not a cancellation
          if (result.message !== 'Login cancelled') {
            toast.error(result.message)
          }
        }
      } catch (error) {
        console.error('Google login error:', error)
        toast.error(this.$t('login.googleLoginFailed'))
      } finally {
        this.isLoading = false
        this.loginType = null
      }
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
// Add these styles to your existing SCSS

.divider {
  text-align: center;
  margin: 24px 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e1e5e9;
  }

  span {
    background: white;
    padding: 0 16px;
    color: #666;
    font-size: 14px;
  }
}

.btn-google {
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #333;
  margin-bottom: 16px;

  &:hover:not(:disabled) {
    border-color: #4285F4;
    box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Update existing button styles to handle disabled state
.btn-primary-custom:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}
</style>
