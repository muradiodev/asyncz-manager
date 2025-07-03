<template>
  <div class="container-fluid ps-md-0">
    <div class="row g-0">
      <div class="d-flex col-md-4 col-lg-6 bg-image justify-content-center align-items-center">
        <div class="logo">
          <img src="@/assets/images/logo.png" class="m-4" alt="-" />
        </div>
      </div>
      <div class="col-md-8 col-lg-6">
        <div class="login d-flex flex-column justify-content-between">
          <div class="container text-end p-3">
            <div class=" d-inline-block dropdown">
              <a
                  class="nav-link dropdown-toggle"
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
                    {{ l === $i18n.locale ? '✓' : null }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="container">
            <div class="row">
              <div class="col-md-9 col-lg-8 mx-auto">

                <div v-if="status === 'LOGIN'">
                  <h3 class="login-heading mb-4">{{ $t('login.welcomeBack') }}</h3>
                  <form @submit.prevent="loginOwner">
                    <div class="mb-3">
                      <label for="exampleInputEmail" class="form-label">{{
                        $t('login.emailAddress')
                      }}</label>
                      <input
                        v-model.trim="email"
                        type="email"
                        class="form-control"
                        id="exampleInputEmail"
                        aria-describedby="emailHelp"
                      />
                      <div id="emailHelp" class="form-text">
                        {{ $t('login.noShare') }}
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="d-flex justify-content-between">
                        <label for="exampleInputPassword" class="form-label">
                          {{ $t('login.password') }}
                        </label>
                        <a href="#" @click.prevent="status = 'FORGET'">{{
                          $t('login.forgotPassword')
                        }}</a>
                      </div>

                      <input
                        v-model.trim="password"
                        type="password"
                        class="form-control"
                        id="exampleInputPassword"
                        required
                      />
                    </div>

                    <button type="submit" class="btn btn-primary">
                      {{ $t('general.submit') }}
                    </button>
                  </form>
                </div>

                <div v-if="status === 'FORGET'">
                  <h3 class="login-heading mb-4">{{ $t('login.forgotPasswordTitle') }}</h3>
                  <form @submit.prevent="forgetPassword">
                    <div class="mb-3">
                      <label for="forgetEmail" class="form-label">{{
                        $t('login.emailAddress')
                      }}</label>
                      <input
                        v-model.trim="email"
                        type="email"
                        class="form-control"
                        id="forgetEmail"
                        required
                      />
                    </div>

                    <button type="submit" class="btn btn-primary">
                      {{ $t('login.getVerificationCode') }}
                    </button>
                  </form>
                </div>

                <div v-if="status === 'FORGET_VERIFY'">
                  <h3 class="login-heading mb-4">{{ $t('login.forgotPasswordTitle') }}</h3>
                  <form @submit.prevent="forgetPasswordVerify">
                    <div class="mb-3">
                      <label for="forgetVerifyEmail" class="form-label">{{
                        $t('login.emailAddress')
                      }}</label>
                      <input
                        v-model="email"
                        type="email"
                        class="form-control"
                        id="forgetVerifyEmail"
                        aria-describedby="emailHelp"
                        readonly
                      />
                    </div>

                    <div class="mb-3">
                      <label for="forgetVerifyOtp" class="form-label">{{
                        $t('login.verificationCode')
                      }}</label>
                      <input
                        v-model.trim="otp"
                        type="text"
                        class="form-control"
                        id="forgetVerifyOtp"
                        required
                      />
                    </div>

                    <div class="mb-3">
                      <label for="forgetVerifyPassword" class="form-label">{{
                        $t('login.newPassword')
                      }}</label>
                      <input
                        v-model.trim="newPassWord"
                        type="password"
                        class="form-control"
                        id="forgetVerifyPassword"
                        required
                      />
                    </div>

                    <button type="submit" class="btn btn-primary">
                      {{ $t('login.setMyNewPassword') }}
                    </button>
                  </form>
                </div>

                <div class="mt-4" id="registerPrompt">

                  <p>
                    If you don't have an account, please
                    <router-link :to="{name: 'register', query:{back: $route.query.back}}">Register for free</router-link>
                  </p>

                </div>

              </div>
            </div>
          </div>
          <div class="container">
             <div class="py-3">
               &copy; 2023
             </div>
          </div>
        </div>
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
      this.$i18n.locale = locale;
      localStorage.setItem('_dt_language', locale);
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;

  @media screen and (max-width: 768px) {
    min-height: calc(100vh - 150px);
  }

}

.bg-image {
  background-image: url('@/assets/images/login-bg.jpg');
  background-size: cover;
  background-position: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    z-index: 99;
  }

  .logo {
    z-index: 100;
    position: relative;

    img {
      max-width: 100%;
      width: 200px;
    }
  }
}
</style>
