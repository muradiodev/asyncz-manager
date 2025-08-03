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
            {{ user?.name }}
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
                <div v-if="!editing">


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
                  <!-- todo update permission name -->
                  <button class="btn-outline-custom"
                          v-if="permissions.indexOf('MANAGE_USERS') >= 0"
                          @click.prevent="editing = true">
                    edit
                  </button>
                </div>
                <div v-else>

                  <div class="alert alert-warning" v-if="user.id === companyUser.id">
                    This user is currently logged in. Please be careful when editing.
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

                          <option :value="0">-all branches-</option>
                          <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}
                          </option>
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


            <div class="col-md-6">

              <div v-if="!editing">

                <p>Permissions</p>

                <div v-for="p in companyUser.permissions" :key="p">
                  {{ p }}
                </div>
                <div class="alert alert-warning" v-if="companyUser.permissions.length<1">
                  There are no permissions assigned to this user.
                </div>

              </div>
              <div v-else>
                <p>Permissions</p>

                <div>
                  <div class="form-check form-switch" v-for="p in permissions" :key="p">
                    <input class="form-check-input" :value="p" type="checkbox" v-model="companyUser.permissions"
                           role="switch"
                           :id="`permission_${p}`" @change="permissionChanged(p, $event)">
                    <label class="form-check-label" :for="`permission_${p}`">{{ p }}</label>
                  </div>
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
import {
  addPermission,
  getUser,
  getUserPermissions,
  removePermission,
  saveUser
} from '@/repositories/CompanyUserRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { toast } from 'vue3-toastify'
import { customAlert } from '@/utils/utils.js'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'UserView',
  data() {
    return {

      companyUser: null,
      permissions: [],

      editing: false,

      branches: []

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
    ...mapState(useAuthStore, ['token', 'user', 'permissions']),
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

          getUserPermissions(this.token, this.companyUser.role).then(permissions => {
            this.permissions = permissions
          })

        } else {
          toast.error(response.message)
        }
      })
    },

    saveUser() {
      saveUser(this.token, this.userId, this.branchId, this.companyUser.name, this.companyUser.email, this.companyUser.status).then(response => {
        if (response.code === 200) {
          this.editing = false
        } else {
          toast.error(response.message)
        }
      })
    },


    permissionChanged(permission, $event) {

      //todo fix permission name
      if(this.permissions.indexOf("MANAGE_USER_PERMISSIONS") < 0) {
        customAlert('Error', `Permission "${permission}" is not available for this user.`, 'error')
        return
      }


      if ($event.target.checked) {

        addPermission(this.token, this.userId, permission).then(res => {
          if (res.code === 200) {
            console.log(this)
            toast(this, 'success', 'Permission added')
          } else {
            customAlert(`Error ${res.code}`, res.message, 'error')
          }
          this.$emit('updated')
        })

      } else {
        removePermission(this.token, this.userId, permission).then(res => {
          if (res.code === 200) {
            toast(this, 'success', 'Permission removed')
          } else {
            customAlert(`Error ${res.code}`, res.message, 'error')
          }
          this.$emit('updated')
        })
      }

    }
  },
  mounted() {
    this.getUser()
    this.getBranches()
  },
  components: {
    AppBreadcrumb,
    StatusBadge
  }
}
</script>
