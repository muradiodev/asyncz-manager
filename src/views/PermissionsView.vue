<template>

  <div class="container">

    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="{name: 'permissions'}">Permissions</router-link>
        </li>
      </ol>
    </nav>


    <div v-if="!permissions">
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
          {{ permissions.name }}
        </span>
      </div>


      <div class="row mt-4">

        <div class="col-md-6">
          <div class="card">
            <div class="card-body" v-if="!editing">

              <p>
                <strong>About: </strong> <br>
                {{ permissions.about || '-' }}
              </p>
              <p>
                <strong>Length: </strong>
                {{ permissions.length || '-' }} minute(s)
              </p>

              <p>
                <strong>Status: </strong>
                <StatusBadge :status="permissions.status" />
              </p>

              <button class="btn-outline-custom" @click.prevent="editing = true">
                edit
              </button>

            </div>
            <div class="card-body" v-else>

              <form @submit.prevent="updatePermissions">

                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      v-model="permissions.name"
                      required
                    />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="about" class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      id="about"
                      v-model="permissions.about"
                    ></textarea>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">Lenght</label>
                    <div class="input-group">

                      <input
                        type="number"
                        class="form-control"
                        id="color"
                        v-model.number="permissions.length"
                        step="1"
                        required
                      />
                      <div class="input-group-text">
                        minute(s)
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">Status</label>
                    <select
                      class="form-control"
                      id="color"
                      v-model="permissions.status"
                      required
                    >
                      <option :value="true">Active</option>
                      <option :value="false">Inactive</option>
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


      <div class="my-4" v-if="1>2">
        <DataTable class="table table-striped table-bordered"
                   :columns="columns"
                   :data='data'>
        </DataTable>

      </div>

    </div>
  </div>

  <ModalComponent title="new expert" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem">
      <div class="row">
        <div class="col-md-12">
          <div class="mb-3">
            <label for="newUserName" class="form-label">Full name</label>
            <input
              type="text"
              class="form-control"
              id="newUserName"
              v-model="newItemDetails.fullName"
              required
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="newEmail" class="form-label">E-mail</label>
            <input
              type="email"
              class="form-control"
              id="newEmail"
              v-model="newItemDetails.email"
              required
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="newPassword" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              id="newPassword"
              v-model="newItemDetails.password"
              required
            />
          </div>
        </div>
        <div class="col-md-12">
          <button class="btn-success-custom">Create</button>
        </div>
      </div>
    </form>
  </ModalComponent>

</template>

<script>

import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import DataTablesLib from 'datatables.net-bs5'

import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import ModalComponent from '@/components/ModalComponent.vue'
import StatusBadge from '@/views/StatusBadge.vue'
import { getPermissionsList, updateUserPermission } from '@/repositories/PermissionsRepository.js'
import { toast } from 'vue3-toastify'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'permissionsView',
  data() {
    return {

      permissions: null,

      editing: false,


      addNewItem: false,
      newItemDetails: {
        fullName: '',
        email: '',
        password: ''
      },

      expertList: [],
      columns: [
        { title: 'ID', data: 'id', orderable: true },
        { title: 'Name', data: 'fullName', orderable: true },
        { role: 'Role', data: 'role', orderable: true },
        { title: 'Email', data: 'email', orderable: true },
        { title: 'Status', data: 'status', orderable: true },
        {
          title: 'Actions', data: (row) => {
            return `<button class="btn btn-outline-secondary btn-sm" @click.prevent="updateUserPermission(${row.id})">Update</button>`
          }, orderable: false
        }
      ]
    }
  },
  watch: {
    permissionsId() {
      this.getpermissions()
    },
    editing() {
      this.getpermissions()
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
    data() {
      return this.expertList
    },
    permissionsId: {
      get() {
        return this.$route.params.id
      },
      set(value) {
        this.$router.push({ name: 'expert', params: { id: value } })
      }
    }
  },
  methods: {

    getPermissionsList() {
      getPermissionsList(this.token, this.permissionsId).then(response => {
        if (response.code === 200) {
          this.permissions = response.permissions
        } else {
          toast.error(response.message);
        }
      })
    },

  },
  mounted() {
    this.getPermissionsList()
  },
  components: {
    StatusBadge,
    ModalComponent,
    DataTable
  }
}
</script>
