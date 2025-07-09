<template>


  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>

        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Users', path: '/dashboard/users', active: false },
            { name:  user?.name, path: '/user/' + userId, active: true }
          ]" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">
            {{user?.name}}
          </span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>





  <CContainer class="px-4" lg>

  <CCard class="mb-4">
    <CCardBody>


    <div v-if="!companyUser">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div v-else>

      <div class="row mt-2">

        <div class="col-md-6 mb-3">
          <div>
            <div  v-if="!editing">



              <p class="mb-1">
                <strong>Email: </strong>
                {{ companyUser.email }}
              </p>

              <p class="mb-1">
                <strong>Branch: </strong>
                {{ companyUser.branch ? companyUser.branch.name : '-' }}
              </p>
              <p>
                <strong>Status: </strong>
                <StatusBadge :status="companyUser.status" />
              </p>
              <button class="btn-outline-custom"
                      v-if="!editing"
                      @click.prevent="editing = true">
                edit
              </button>
            </div>
            <div v-else>

              <div class="alert alert-warning" v-if="user.id === companyUser.id">
                This user is currently logged in.  Please be careful when editing.
              </div>

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
                      :disabled="user.id === companyUser.id"
                    >

                      <option :value="0" >-all branches-</option>
                      <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-12 mb-3">
                    <label for="fullName" class="form-label">Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="fullName"
                      v-model="companyUser.name"
                      required
                    />
                  </div>
                  <div class="col-md-12 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="companyUser.email"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">Status</label>
                    <select
                      class="form-control"
                      id="color"
                      v-model="companyUser.status"
                      required
                    >
                      <option :value="1">Active</option>
                      <option :value="0">Inactive</option>
                    </select>
                  </div>

                  <div class="col-md-12">
                    <button class="btn-success-custom">Save</button>

                    <button class="btn-outline-custom" @click.prevent="editing = false">Cancel</button>
                  </div>


                </div>


              </form>

            </div>
          </div>
        </div>


      </div>

    </div>
    </CCardBody>
  </CCard>
  </CContainer>

</template>

<script>

import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import DataTablesLib from 'datatables.net-bs5'

import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import StatusBadge from '@/views/StatusBadge.vue'
import { getBranches } from '@/repositories/BranchRepository.js'
import { getUser, saveUser } from '@/repositories/CompanyUserRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'UserView',
  data() {
    return {

      companyUser: null,

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
        return this.companyUser.branch ? this.companyUser.branch.id : 0
      },
      set(value) {
        if (!this.companyUser.branch) {
          this.companyUser.branch = {}
        }
        this.companyUser.branch.id = value
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
          this.companyUser = response.user
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
      saveUser(this.token, this.userId, this.branchId, this.companyUser.name, this.companyUser.email, this.companyUser.status).then(response => {
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
    AppBreadcrumb,
    StatusBadge,
  }
}
</script>
