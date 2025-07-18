<template>
  <CCard class="border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Account', path: '/dashboard/account', active: true }
          ]" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">Account Settings</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4 pb-4" lg>
    <div v-if="!user">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Tabs navigation -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a class="nav-link active" data-bs-toggle="tab" href="#account">Account</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#security">Security</a>
        </li>
      </ul>

      <!-- Tab content -->
      <div class="tab-content">
        <!-- Account Tab -->
        <div class="tab-pane fade show active" id="account">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="mb-3">Account Information</h5>
              <p class="text-muted mb-4">Update your personal information</p>

              <form @submit.prevent="user.expert ? updateAccount() : updateAccountManager()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First name</label>
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
                    <label for="lastName" class="form-label">Last name</label>
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
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      :value="user.email || ''"
                      disabled
                    />
                    <small class="text-muted">Email cannot be changed. Contact support if you need to update your email.</small>
                  </div>

                  <div class="col-12 mb-3">
                    <label for="phone" class="form-label">Phone</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      v-model="phone"
                      placeholder="+1 (555) 000-0000"
                      :disabled="isAccountLoading"
                    />
                  </div>

                  <div class="col-12 mb-4" v-if="user.expert">
                    <label for="about" class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      rows="4"
                      id="about"
                      v-model="user.expert.about"
                      placeholder="Tell us about yourself"
                      :disabled="isAccountLoading"
                    ></textarea>
                  </div>

                  <div class="col-12">
                    <button type="submit" class="btn btn-primary-custom" :disabled="isAccountLoading">
                      <span v-if="isAccountLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isAccountLoading ? 'Saving...' : 'Save Changes' }}
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
              <h5 class="mb-3">Password Settings</h5>
              <p class="text-muted mb-4">Update your password</p>

              <form @submit.prevent="updatePassword">
                <div class="row">
                  <div class="col-6 mb-3">
                    <label for="password" class="form-label">New password</label>
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
                      >
                        <fa-icon :icon="['fas','eye-slash']" v-if="showPassword"></fa-icon>
                        <fa-icon :icon="['fas','eye']" v-else></fa-icon>
                      </button>
                    </div>
                  </div>

                  <div class="col-12">
                    <button type="submit" class="btn btn-primary-custom" :disabled="isPasswordLoading">
                      <span v-if="isPasswordLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isPasswordLoading ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
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
import { saveAccount, setPassword } from '@/repositories/AuthRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'

export default {
  name: 'AccountView',
  components: { AppBreadcrumb },
  data() {
    return {
      showPassword: false,
      passwordNew: null,
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
            this.$swal({
              title: 'Success',
              text: response.message,
              icon: 'success'
            }).then(() => {
              window.location.reload()
            })
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
          this.isAccountLoading = false;
        });
    },
    updateAccountManager() {
      this.isAccountLoading = true;
      saveAccount(this.token, this.user.name, null)
        .then(response => {
          if (response.code === 200) {
            this.$swal({
              title: 'Success',
              text: response.message,
              icon: 'success'
            }).then(() => {
              window.location.reload()
            })
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
          this.isAccountLoading = false;
        });
    },
    updatePassword() {
      this.isPasswordLoading = true;
      setPassword(this.token, this.passwordNew, null)
        .then(response => {
          if (response.code === 200) {
            this.$swal({
              title: 'Success',
              text: 'Password updated',
              icon: 'success'
            })
            this.passwordNew = null
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
