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
            <!-- steps 1. enter info 2. confrm email 3. set password  -->



            <div class="row">
              <div class="col-md-9 col-lg-8 mx-auto">
                <div id="steps-container">

                  <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                    <li class="nav-item me-2" role="presentation" v-for="(step, index) in steps" :key="index">
                      <button
                        class="nav-link "
                        :class="{ 'active': status === index }"
                        :disabled="isDisabled(index)"
                        type="button"
                        role="tab"
                      >
                        {{ step }}
                      </button>
                    </li>
                  </ul>

                </div>

                <div v-if="status === 'general'">
                  <h3 class="login-heading mb-4">Enter your info</h3>
                  <form @submit.prevent="loginOwner">
                    <div class="mb-3 form-floating">

                      <input
                        v-model.trim="companyName"
                        type="text"
                        class="form-control"
                        id="companyNameInput"
                        autocomplete="company-name"
                        required
                      />
                      <label for="companyNameInput" class="form-label">
                        Company Name
                      </label>
                    </div>
                    <div class="mb-3 form-floating">

                      <input
                        v-model.trim="companyEmail"
                        type="email"
                        class="form-control"
                        id="companyEmailInput"
                        autocomplete="company-email"
                      />
                      <label for="companyEmailInput" class="form-label">
                        Company Email
                      </label>
                      <span class="text-muted small">
                        This email will be visible to your customers.
                      </span>
                    </div>
                    <div class="mb-3 form-floating">

                      <input
                        v-model.trim="adminName"
                        type="text"
                        class="form-control"
                        id="adminNameInput"
                        autocomplete="name"
                        required
                      />
                      <label for="adminNameInput" class="form-label">
                        Your full name
                      </label>
                    </div>
                    <div class="mb-3 form-floating">

                      <input
                        v-model.trim="adminEmail"
                        type="email"
                        class="form-control"
                        id="adminEmailInput"
                        autocomplete="email"
                      />
                      <label for="adminEmailInput" class="form-label">
                        Email
                      </label>

                      <span class="text-muted small">
                        This email will be used to login to your account. This email will not be visible to your customers.
                      </span>
                    </div>



                    <button type="submit" class="btn btn-primary">
                      Continue
                    </button>
                  </form>
                </div>


                <div v-if="status === 'verify'">
                  <h3 class="login-heading mb-4">
                    Verify your email
                  </h3>
                  <form @submit.prevent="registerVerify">
                    <div class="mb-3">
                      <label for="verifyEmail" class="form-label">{{
                        $t('login.emailAddress')
                      }}</label>
                      <input
                        v-model="adminEmail"
                        type="email"
                        class="form-control"
                        id="verifyEmail"
                        aria-describedby="emailHelp"
                        readonly
                      />
                    </div>

                    <div class="mb-3">
                      <label for="verifyOtp" class="form-label">{{
                        $t('login.verificationCode')
                      }}</label>
                      <input
                        v-model.trim="otp"
                        type="text"
                        class="form-control"
                        id="verifyOtp"
                        required
                      />
                    </div>

                    <button type="submit" class="btn btn-primary">
                       Create account
                    </button>
                  </form>
                </div>

                <div v-if="status === 'password'">
                  <h3 class="login-heading mb-4">{{ $t('login.forgotPasswordTitle') }}</h3>
                  <form @submit.prevent="updatePassword">
                    <div class="mb-3">
                      <label for="passwordEmail" class="form-label">
                        Set your password
                      </label>
                      <input
                        v-model="adminEmail"
                        type="email"
                        class="form-control"
                        id="passwordEmail"
                        aria-describedby="emailHelp"
                        readonly
                      />
                    </div>

                    <div class="mb-3">
                      <label for="verifyOtp" class="form-label">
                        Create new password
                      </label>
                      <input
                        v-model.trim="newPassword"
                        type="text"
                        class="form-control"
                        id="verifyOtp"
                        required
                      />
                    </div>

                    <button type="submit" class="btn btn-primary">
                       Set my password
                    </button>
                  </form>
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
      companyEmail:'',
      adminName: '',
      adminEmail: '',

      otp: '',
      newPassword: '',
      steps: {
        'general':"General info",
        "verify": "Verify your email",
        "password": "Set your password"
      }
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
  },
  watch: {},
  methods: {
    ...mapActions(useAuthStore, ['setToken']),

    isDisabled(index) {
      switch (index) {
        case 'general':
          return false;
        case 'verify':
          return this.status === 'general';
        case 'password':
          return this.status !== 'verify';
        default:
          return true;
      }
    },

    loginOwner() {
      registerStart(this.companyName, this.companyEmail, this.adminName, this.adminEmail).then((result) => {
        if (result.code === 200) {
            this.status = 'verify';
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
      })
    },

    registerVerify() {
      registerVerify(this.companyName, this.companyEmail, this.adminName, this.adminEmail, this.otp).then((result) => {
        if (result.code === 200) {
          localStorage.setItem('token', result.token);
          this.setToken(result.token);
            this.status = 'password';
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


      setPassword(this.token, this.newPassword).then(response => {
        if (response.code === 200) {

          customAlert(`Success`, `Password updated`, 'success',()=>{
            let next = this.$route['query']['next']

            if (next) {
              this.$router.push(next)
            } else {
              this.$router.push({ name: 'home' })
            }
          });




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
