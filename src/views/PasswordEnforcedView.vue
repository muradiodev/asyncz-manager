<template>


  <CContainer class="px-4 pb-4" md>
    <div v-if="!user">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center align-items-center" style="height: 90vh" v-else>


      <!-- Tab content -->

      <div class="card border-0 shadow-sm" style="max-width: 500px;">
        <div class="card-body p-4">

          <img src="@/assets/images/logo.png" style="height: 50px;" class="mb-3">

          <h5 class="mb-3">Password update</h5>
          <p class="text-muted mb-4">
            You are required to change your password. Please enter a new password below.
          </p>

          <form @submit.prevent="updatePassword">

            <div class="mb-3">
              <label for="password" class="form-label">New password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                autocomplete="new-password"
                v-model="passwordNew"
                required
                :disabled="isPasswordLoading"
              />
            </div>
            <div class="mb-3">
              <label for="password-repeat" class="form-label">Confirm password</label>
              <input
                type="password"
                class="form-control"
                id="password-repeat"
                autocomplete="new-password"
                v-model="passwordConfirm"
                required
                :disabled="isPasswordLoading"
              />
              <div class="form-text text-danger" v-if="passwordConfirm && passwordConfirm !== passwordNew">
                Please ensure both passwords match.
              </div>
            </div>
            <div class="mb-3 d-flex justify-content-between align-items-center">
              <button type="submit" class="btn btn-primary-custom" :disabled="isPasswordLoading">
                <span v-if="isPasswordLoading" class="spinner-border spinner-border-sm me-2" role="status"
                      aria-hidden="true"></span>
                {{ isPasswordLoading ? 'Updating...' : 'Update' }}
              </button>

              <button type="button" class="btn btn-secondary-custom ms-3" :disabled="isPasswordLoading" @click="logout">
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </CContainer>
</template>

<script>
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { setPassword } from '@/repositories/AuthRepository.js'
import { customAlert, customAsk } from '@/utils/utils.js'

export default {
  name: 'PasswordEnforcedView',
  components: {},
  data() {
    return {
      passwordNew: null,
      passwordConfirm: null,
      isPasswordLoading: false
    }
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['token', 'user'])


  },
  methods: {
    updatePassword() {
      this.isPasswordLoading = true

      if(!this.passwordNew || !this.passwordConfirm) {
        this.$swal({
          title: 'Error',
          text: 'Please fill in all fields.',
          icon: 'error'
        })
        this.isPasswordLoading = false
        return
      }
      if (this.passwordNew !== this.passwordConfirm) {
        this.$swal({
          title: 'Error',
          text: 'Passwords do not match.',
          icon: 'error'
        })
        this.isPasswordLoading = false
        return
      }

      setPassword(this.token, this.passwordNew, null)
        .then(response => {
          if (response.code === 200) {
            customAlert(
              'Success',
              'Your password has been updated successfully.',
              'success',
              () => {
                let next = this.$route['query']['next']
                if (next) {
                  this.$router.push(next)
                } else {
                  this.$router.push({ name: 'home' })
                }
              }
            )
          } else {
            this.$swal({
              title: 'Error',
              text: response.message,
              icon: 'error'
            })
          }
        })
        .catch(error => {
          this.$swal({
            title: 'Error',
            text: error.message || 'An error occurred',
            icon: 'error'
          })
        })
        .finally(() => {
          this.isPasswordLoading = false
        })
    },


    logout() {


      customAsk(
        'Logout',
        'Are you sure you want to logout?',
        'warning',
        () => {
          localStorage.removeItem('token')
          window.location.reload()
        },
        () => {

        }
      )
    }
  },
  mounted() {
  }
}
</script>
