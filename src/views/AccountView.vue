<template>
  <CCard class="border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="breadcrumbs" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">{{ $t('account.accountSettings') }}</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4 pb-4" lg>
    <div v-if="!user">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">{{ $t('general.loading') }}</span>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Tabs navigation -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a class="nav-link active" data-bs-toggle="tab" href="#account">{{ $t('navigation.account') }}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#security">{{ $t('navigation.security') }}</a>
        </li>
      </ul>

      <!-- Tab content -->
      <div class="tab-content">
        <!-- Account Tab -->
        <div class="tab-pane fade show active" id="account">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="mb-3">{{ $t('account.accountInformation') }}</h5>
              <p class="text-muted mb-4">{{ $t('account.updateYourPersonalInformation') }}</p>

              <form @submit.prevent="user.expert ? updateAccount() : updateAccountManager()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">{{ $t('account.labels.firstName') }}</label>
                    <input
                      type="text"
                      class="form-control"
                      id="firstName"
                      :value="getFirstName"
                      @input="updateFirstName($event.target.value)"
                      required
                      :disabled="isAccountLoading"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">{{ $t('account.labels.lastName') }}</label>
                    <input
                      type="text"
                      class="form-control"
                      id="lastName"
                      :value="getLastName"
                      @input="updateLastName($event.target.value)"
                      required
                      :disabled="isAccountLoading"
                    />
                  </div>

                  <div class="col-12 mb-3">
                    <label for="email" class="form-label">{{ $t('account.labels.email') }}</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      :value="user.email || ''"
                      disabled
                    />
                    <small class="text-muted">{{ $t('account.hints.emailLocked') }}</small>
                  </div>

                  <div class="col-12 mb-3">
                    <label for="phone" class="form-label">{{ $t('account.labels.phone') }}</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      v-model="phone"
                      :placeholder="$t('account.placeholders.phone')"
                      :disabled="isAccountLoading"
                    />
                  </div>

                  <div class="col-12 mb-4" v-if="user.expert">
                    <label for="about" class="form-label">{{ $t('account.labels.description') }}</label>
                    <textarea
                      class="form-control"
                      rows="4"
                      id="about"
                      v-model="user.expert.about"
                      :placeholder="$t('account.placeholders.about')"
                      :disabled="isAccountLoading"
                    ></textarea>
                  </div>

                  <div class="col-12">
                    <button type="submit" class="btn btn-primary-custom" :disabled="isAccountLoading">
                      <span v-if="isAccountLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isAccountLoading ? $t('account.actions.saving') : $t('account.actions.saveChanges') }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div class="tab-pane fade" id="security">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="mb-3">{{ $t('account.security.passwordSettings') }}</h5>
              <p class="text-muted mb-4">{{ $t('account.security.updateYourPassword') }}</p>

              <form @submit.prevent="updatePassword">
                <div class="col-6 mb-3">
                  <label for="currentPassword" class="form-label">{{ $t('account.security.labels.currentPassword') }}</label>
                  <div class="input-group">
                    <input
                      :type="showCurrentPassword ? 'text' : 'password'"
                      class="form-control"
                      id="currentPassword"
                      v-model="passwordCurrent"
                      required
                      :disabled="isPasswordLoading"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click.prevent="showCurrentPassword=!showCurrentPassword"
                      :disabled="isPasswordLoading"
                      :aria-label="showCurrentPassword ? 'Hide' : 'Show'"
                    >
                      <fa-icon :icon="['fas','eye-slash']" v-if="showCurrentPassword"></fa-icon>
                      <fa-icon :icon="['fas','eye']" v-else></fa-icon>
                    </button>
                  </div>
                </div>

                <div class="col-6 mb-3">
                  <label for="password" class="form-label">{{ $t('account.security.labels.newPassword') }}</label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      v-model="passwordNew"
                      required
                      :disabled="isPasswordLoading"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click.prevent="showPassword=!showPassword"
                      :disabled="isPasswordLoading"
                      :aria-label="showPassword ? 'Hide' : 'Show'"
                    >
                      <fa-icon :icon="['fas','eye-slash']" v-if="showPassword"></fa-icon>
                      <fa-icon :icon="['fas','eye']" v-else></fa-icon>
                    </button>
                  </div>
                </div>

                <div class="col-12">
                  <button type="submit" class="btn btn-primary-custom" :disabled="isPasswordLoading">
                    <span v-if="isPasswordLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isPasswordLoading ? $t('account.actions.saving') : $t('account.actions.saveChanges') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CContainer>
</template>

<script>
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { saveAccount, setNewPassword } from '@/repositories/AuthRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { toast } from 'vue3-toastify'

export default {
  name: 'AccountView',
  components: { AppBreadcrumb },
  data() {
    return {
      showPassword: false,
      showCurrentPassword: false,
      passwordNew: null,
      passwordCurrent: null,
      phone: '',
      firstName: '',
      lastName: '',
      isAccountLoading: false,
      isPasswordLoading: false
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser) {
          this.phone = newUser.phone || '';
        }
      }
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
    getFirstName() {
      if (!this.user) return '';
      const name = this.user.expert ? this.user.expert.name : this.user.name;
      return name ? name.split(' ')[0] : '';
    },
    getLastName() {
      if (!this.user) return '';
      const name = this.user.expert ? this.user.expert.name : this.user.name;
      return name ? name.split(' ').slice(1).join(' ') : '';
    }
  },
  methods: {
    updateFirstName(value) {
      if (this.user.expert) {
        this.user.expert.name = value + ' ' + this.getLastName;
      } else {
        this.user.name = value + ' ' + this.getLastName;
      }
    },
    updateLastName(value) {
      if (this.user.expert) {
        this.user.expert.name = this.getFirstName + ' ' + value;
      } else {
        this.user.name = this.getFirstName + ' ' + value;
      }
    },
    updateAccount() {
      this.isAccountLoading = true;
      saveAccount(this.token, this.user.expert.name, this.user.expert.about)
        .then(response => {
          if (response.code === 200) {
            toast.success('Changes saved successfully');
          } else {
            toast.error(response.message);
          }
        })
        .catch(error => {
          toast.error(error.message || 'An error occurred');
        })
        .finally(() => {
          this.isAccountLoading = false;
        });
    },
    updateAccountManager() {
      this.isAccountLoading = true;
      saveAccount(this.token, this.user.name, null)
        .then(response => {
          if (response.code === 200) {
            toast.success('Changes saved successfully');
          } else {
            toast.error(response.message);
          }
        })
        .catch(error => {
          toast.error(error.message || 'An error occurred');
        })
        .finally(() => {
          this.isAccountLoading = false;
        });
    },
    updatePassword() {
      this.isPasswordLoading = true;
      setNewPassword(this.token, this.passwordNew, this.passwordCurrent)
        .then(response => {
          if (response.code === 200) {
            toast.success('Password updated');
            this.passwordNew = null;
            this.passwordCurrent = null;
          } else {
            toast.error(response.error);
          }
        })
        .catch(error => {
          toast.error(error.message || 'An error occurred');
        })
        .finally(() => {
          this.isPasswordLoading = false;
        });
    },
    initTabs() {
      // Use a safer approach that doesn't rely on global bootstrap variable
      const tabs = document.querySelectorAll('.nav-tabs .nav-link');
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();

          // Remove active class from all tabs and tab panes
          document.querySelectorAll('.nav-tabs .nav-link').forEach(t => {
            t.classList.remove('active');
          });
          document.querySelectorAll('.tab-pane').forEach(p => {
            p.classList.remove('show', 'active');
          });

          // Add active class to current tab
          tab.classList.add('active');

          // Show corresponding tab pane
          const target = document.querySelector(tab.getAttribute('href'));
          if (target) {
            target.classList.add('show', 'active');
          }
        });
      });
    }
  },
  mounted() {
    this.initTabs();
  }
}
</script>
