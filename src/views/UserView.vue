<template>

  <div class="container">

    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="{name: 'users'}">Users</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page" v-if="user">
          {{ user.name }}
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

        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  {{ user.name }}
                </h5>
                <button class="btn btn-sm btn-outline-dark"
                        v-if="!editing"
                        @click.prevent="editing = true">
                  edit
                </button>
              </div>
            </div>
            <div class="card-body" v-if="!editing">

              <p class="mb-1">
                <strong>Branch: </strong>
                {{ user.branch ? user.branch.name : '-' }}
              </p>
              <p>
                <strong>Status: </strong>
                <StatusBadge :status="user.status" />
              </p>
            </div>
            <div class="card-body" v-else>

              <form @submit.prevent="saveUser">

                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="branch" class="form-label">Branch</label>
                    <select
                      type="text"
                      class="form-control"
                      id="fullName"
                      v-model="branchId"
                      required
                    >
                      <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                    </select>
                  </div>
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
                  <div class="col-md-12 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="user.email"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">Status</label>
                    <select
                      class="form-control"
                      id="color"
                      v-model="user.status"
                      required
                    >
                      <option :value="1">Active</option>
                      <option :value="0">Inactive</option>
                    </select>
                  </div>

                  <div class="col-md-12">
                    <button class="btn btn-success me-2">Save</button>

                    <button class="btn btn-outline-dark" @click.prevent="editing = false">Cancel</button>
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

import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import DataTablesLib from 'datatables.net-bs5'

import 'datatables.net-select'
import 'datatables.net-responsive'
import 'datatables.net-select-bs5'
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import StatusBadge from '@/views/StatusBadge.vue'
import { getBranches } from '@/repositories/BranchRepository.js'
import { getUser, saveUser } from '@/repositories/AdminUserRepository.js'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'UserView',
  data() {
    return {

      user: null,

      editing: false,

      branches: [],

    }
  },
  watch: {
    userId() {
      this.getUser()
    },
    editing() {
      this.getUser()
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
    data() {
      return this.expertList
    },
    userId: {
      get() {
        return this.$route.params.id
      },
      set(value) {
        this.$router.push({ name: 'user', params: { id: value } })
      }
    },
    branchId: {
      get() {
        return this.user.branch ? this.user.branch.id : null
      },
      set(value) {
        if (!this.user.branch) {
          this.user.branch = {}
        }
        this.user.branch.id = value
      }
    }
  },
  methods: {

    getBranches() {
      getBranches(this.token).then(response => {
        this.branches = response
      })
    },

    getUser() {
      getUser(this.token, this.userId).then(response => {
        if (response.code === 200) {
          this.user = response.user
        } else {
          this.$swal({
            title: 'Error',
            text: response.message,
            icon: 'error'
          })
        }
      })
    },

    saveUser() {
      saveUser(this.token, this.userId, this.branchId, this.user.name, this.user.email, this.user.status).then(response => {
        if (response.code === 200) {
          this.editing = false
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
    this.getUser()
    this.getBranches()
  },
  components: {
    StatusBadge,
  }
}
</script>
