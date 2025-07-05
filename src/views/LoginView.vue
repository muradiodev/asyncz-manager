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

            <button type="submit" class="btn-primary">{{ $t('general.submit') }}</button>
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
              <button type="button" class="btn-secondary" @click="status = 'LOGIN'">
                Back to Login
              </button>
              <button type="submit" class="btn-primary">
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

            <button type="submit" class="btn-primary">
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
.login-container {
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
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(5px);
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
  justify-content: space-between;

  @media (max-width: 768px) {
    flex: 1;
  }
}

.form-wrapper {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.language-selector {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;

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

.form-step {
  width: 100%;

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #777;
    margin-bottom: 2rem;
  }

  form {
    width: 100%;
  }
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  label {
    display: block;
    font-weight: 500;
    color: #555;
  }

  .forgot-link {
    font-size: 0.9rem;
    color: #3498db;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
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
      border-color: #7FDA56;
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

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  button {
    flex: 1;
  }
}

.btn-primary {
  display: inline-block;
  background-color: #7FDA56;
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
    background-color: darken(#7FDA56, 10%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-secondary {
  display: inline-block;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background-color: #e9e9e9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.register-prompt {
  margin-top: 2rem;
  text-align: center;

  p {
    color: #555;
  }

  a {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.footer-custom {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  padding: 1.5rem;
  width: 100%;
}
</style>
