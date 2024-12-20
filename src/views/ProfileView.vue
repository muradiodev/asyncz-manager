<template>

  <div class="container">

    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          Profile
        </li>
      </ol>
    </nav>


    <div v-if="!user">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div v-else>

      <div class="d-flex align-items-center">
        <span class="h2 mb-0">
          {{ user.name }}
        </span>
      </div>


      <div class="row mt-4">

        <div class="col-md-6 mb-3" v-if="user.expert">
          <div class="card">
            <div class="card-header">
              Edit profile
            </div>
            <div class="card-body">
              <div class="alert alert-warning">
                You are editing data visible to users publicly
              </div>

              <form @submit.prevent="updateProfile">

                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="fullName" class="form-label">Full name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="fullName"
                      v-model="user.expert.name"
                      required
                    />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="about" class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      rows="5"
                      id="about"
                      v-model="user.expert.about"
                    ></textarea>
                  </div>

                  <div class="col-md-12">
                    <button class="btn btn-success me-2">Save</button>
                  </div>


                </div>


              </form>
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3" v-else>
          <div class="card">
            <div class="card-header">
              Edit profile
            </div>
            <div class="card-body">

              <form @submit.prevent="updateProfileManager">

                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="fullName" class="form-label">Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="fullName"
                      v-model="user.name"
                      required
                    />
                  </div>

                  <div class="col-md-12">
                    <button class="btn btn-success me-2">Save</button>
                  </div>


                </div>


              </form>
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-header">
              Update password
            </div>
            <div class="card-body">

              <form @submit.prevent="updatePassword">

                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="password" class="form-label">New password</label>
                    <div class="input-group">
                      <input
                        :type="showPassword?'text':'password'"
                        class="form-control border-secondary"
                        id="password"
                        v-model="passwordNew"
                        required
                      />
                      <button type="button" class="btn btn-outline-secondary"
                              @click.prevent="showPassword=!showPassword">
                        <fa-icon :icon="['fas','eye-slash']" v-if="showPassword"></fa-icon>
                        <fa-icon :icon="['fas','eye']" v-else></fa-icon>
                      </button>
                    </div>
                  </div>

                  <div class="col-md-12">
                    <button class="btn btn-success me-2">Save</button>
                  </div>


                </div>


              </form>
            </div>
          </div>
        </div>


      </div>


    </div>
  </div>


</template>

<script>


import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { saveProfile, setPassword } from '@/repositories/AuthRepository.js'

export default {
  name: 'ProfileView',
  data() {
    return {
      showPassword: false,
      passwordNew: null
    }
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['token', 'user'])

  },
  methods: {


    updateProfile() {


      saveProfile(this.token, this.user.expert.name, this.user.expert.about).then(response => {
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
    },
    updateProfileManager() {


      saveProfile(this.token, this.user.name, null).then(response => {
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
    },
    updatePassword() {


      setPassword(this.token, this.passwordNew, null).then(response => {
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
    }
  },
  mounted() {
  }
}
</script>
