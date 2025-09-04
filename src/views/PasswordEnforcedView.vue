<template>
  <CContainer class="px-4 pb-4" md>
    <div v-if="!user">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">{{ $t('general.loading') }}</span>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center align-items-center" style="height: 90vh" v-else>
      <div class="card border-0 shadow-sm" style="max-width: 500px;">
        <div class="card-body p-4">
          <img src="@/assets/images/logo.png" style="height: 50px;" class="mb-3" alt="Logo" />

          <h5 class="mb-3">{{ $t('passwordEnforced.title') }}</h5>
          <p class="text-muted mb-4">
            {{ $t('passwordEnforced.subtitle') }}
          </p>

          <form @submit.prevent="updatePassword">
            <div class="mb-3">
              <label for="password" class="form-label">{{ $t('passwordEnforced.labels.newPassword') }}</label>
              <input
                type="password"
                class="form-control"
                id="password"
                autocomplete="new-password"
                v-model="passwordNew"
                required
                :disabled="isPasswordLoading"
                :placeholder="$t('passwordEnforced.placeholders.newPassword')"
              />
            </div>

            <div class="mb-3">
              <label for="password-repeat" class="form-label">{{ $t('passwordEnforced.labels.confirmPassword') }}</label>
              <input
                type="password"
                class="form-control"
                id="password-repeat"
                autocomplete="new-password"
                v-model="passwordConfirm"
                required
                :disabled="isPasswordLoading"
                :placeholder="$t('passwordEnforced.placeholders.confirmPassword')"
              />
              <div class="form-text text-danger" v-if="passwordConfirm && passwordConfirm !== passwordNew">
                {{ $t('passwordEnforced.validation.mismatch') }}
              </div>
            </div>

            <div class="mb-3 d-flex justify-content-between align-items-center">
              <button type="submit" class="btn btn-primary-custom" :disabled="isPasswordLoading">
                <span v-if="isPasswordLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isPasswordLoading ? $t('passwordEnforced.actions.updating') : $t('passwordEnforced.actions.update') }}
              </button>

              <button type="button" class="btn btn-secondary-custom ms-3" :disabled="isPasswordLoading" @click="logout">
                {{ $t('passwordEnforced.actions.logout') }}
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
import { setNewPassword } from '@/repositories/AuthRepository.js'
import { customAlert, customAsk } from '@/utils/utils.js'
import { toast } from 'vue3-toastify'

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

      if (!this.passwordNew || !this.passwordConfirm) {
        toast.error(this.$t('passwordEnforced.toasts.fillAllFields'))
        this.isPasswordLoading = false
        return
      }
      if (this.passwordNew !== this.passwordConfirm) {
        toast.error(this.$t('passwordEnforced.toasts.mismatch'))
        this.isPasswordLoading = false
        return
      }

      setNewPassword(this.token, this.passwordNew)
        .then(response => {
          if (response.code === 200) {
            customAlert(
              this.$t('passwordEnforced.dialog.success.title'),
              this.$t('passwordEnforced.dialog.success.text'),
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
            toast.error(response.message)
          }
        })
        .catch(error => {
          toast.error(error.message || this.$t('passwordEnforced.toasts.genericError'))
        })
        .finally(() => {
          this.isPasswordLoading = false
        })
    },

    logout() {
      customAsk(
        this.$t('passwordEnforced.dialog.logout.title'),
        this.$t('passwordEnforced.dialog.logout.text'),
        'warning',
        () => {
          localStorage.removeItem('token')
          window.location.reload()
        },
        () => {}
      )
    }
  }
}
</script>
