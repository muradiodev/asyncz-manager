<template>

  <div class="container">

    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="{name: 'procedures'}">Procedures</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page" v-if="procedure">
          {{ procedure.name }}
        </li>
      </ol>
    </nav>


    <div v-if="!procedure">
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
          {{ procedure.name }}
        </span>
      </div>


      <div class="row mt-4">

        <div class="col-md-6">
          <div class="card">
            <div class="card-body" v-if="!editing">

              <p>
                <strong>About: </strong> <br>
                {{ procedure.about || '-' }}
              </p>
              <p>
                <strong>Length: </strong>
                {{ procedure.length || '-' }} minute(s)
              </p>

              <p>
                <strong>Status: </strong>
                <StatusBadge :status="procedure.status" />
              </p>

              <button class="btn btn-sm btn-outline-dark" @click.prevent="editing = true">
                edit
              </button>

            </div>
            <div class="card-body" v-else>

              <form @submit.prevent="saveProcedure">

                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      v-model="procedure.name"
                      required
                    />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="about" class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      id="about"
                      v-model="procedure.about"
                    ></textarea>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">Lenght</label>
                    <div class="input-group">

                    <input
                      type="number"
                      class="form-control"
                      id="color"
                      v-model.number="procedure.length"
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
                      v-model="procedure.status"
                      required
                    >
                      <option :value="true">Active</option>
                      <option :value="false">Inactive</option>
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
          <button class="btn btn-success">Create</button>
        </div>
      </div>
    </form>
  </ModalComponent>

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
import ModalComponent from '@/components/ModalComponent.vue'
import StatusBadge from '@/views/StatusBadge.vue'
import { getProcedure, saveProcedure } from '@/repositories/ProceduresRepository.js'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'ProcedureView',
  data() {
    return {

      procedure: null,

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
        {
          title: 'Status', data: (row) => {
            if (row.status) {
              return `<span class="badge bg-success">active</span>`
            } else {
              return `<span class="badge bg-danger">inactive</span>`
            }
          }
        },
        {
          title: 'Action', data: (row) => {
            return `<a href="./expert/${row.id}">manage</a>`
          }
        }
      ]
    }
  },
  watch: {
    procedureId() {
      this.getProcedure()
    },
    editing() {
      this.getProcedure()
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
    data() {
      return this.expertList
    },
    procedureId: {
      get() {
        return this.$route.params.id
      },
      set(value) {
        this.$router.push({ name: 'expert', params: { id: value } })
      }
    }
  },
  methods: {

    getProcedure() {
      getProcedure(this.token, this.procedureId).then(response => {
        if (response.code === 200) {
          this.procedure = response.procedure
        } else {
          this.$swal({
            title: 'Error',
            text: response.message,
            icon: 'error'
          })
        }
      })
    },

    saveProcedure() {
      saveProcedure(this.token, this.procedureId, this.procedure.name, this.procedure.about, this.procedure.length, this.procedure.status ? 1 : 0).then(response => {
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
    this.getProcedure()
  },
  components: {
    StatusBadge,
    ModalComponent,
    DataTable
  }
}
</script>