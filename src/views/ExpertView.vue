<template>

  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>

        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Experts', path: '/dashboard/experts', active: false },
            { name:  expert?.fullName, path: '/expert/' + expertId, active: true }
          ]" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">
            {{expert?.fullName}}
          </span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>





  <CContainer class="px-4" lg>



    <div v-if="!expert">
      <!-- loading-->
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div v-else>


      <div class="row ">

        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body" v-if="!editing">

              <p>
                <strong>About: </strong> <br>
                {{ expert.about || '-' }}
              </p>
              <p class="mb-1">
                <strong>Email: </strong>
                {{ user.email }}
              </p>
              <p class="mb-1">
                <strong>Color: </strong>
                <ColorComponent :expert="expert" />
              </p>
              <p class="mb-1">
                <strong>Branch: </strong>
                {{ expert.branch ? expert.branch.name : '-' }}
              </p>
              <p>
                <strong>Status: </strong>
                <StatusBadge :status="expert.status" />
              </p>
              <button class="btn-outline-custom"
                      v-if="!editing"
                      @click.prevent="editing = true">
                edit
              </button>
            </div>
            <div class="card-body" v-else>

              <form @submit.prevent="saveExpert">

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
                      <option v-for="branch in branches" :value="branch.id" :key="branch.id">
                        {{ branch.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-12 mb-3">
                    <label for="fullName" class="form-label">Full name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="fullName"
                      v-model="expert.fullName"
                      required
                    />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="about" class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      id="about"
                      v-model="expert.about"
                    ></textarea>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="fullName" class="form-label">Email</label>
                    <input
                      type="text"
                      class="form-control"
                      id="fullName"
                      v-model="user.email"
                      required
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">Color</label>
                    <input
                      type="color"
                      class="form-control"
                      id="color"
                      v-model="expert.color"
                      required
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="color" class="form-label">Status</label>
                    <select
                      class="form-control"
                      id="color"
                      v-model="expert.status"
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


        <div class="col-md-6 mb-3">

          <ExpertProcedures :expert-id="expertId" />

        </div>

        <div class="col-md-12">

          <ExpertSchedules :expert-id="expertId" />

        </div>


      </div>


      <div class="my-4" v-if="1>2">
        <DataTable class="table table-striped table-bordered"
                   :columns="columns"
                   :data='data'>
        </DataTable>

      </div>

    </div>
  </CContainer>
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

import { getExpert, saveExpert } from '@/repositories/ExpertsRepository.js'
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import ModalComponent from '@/components/ModalComponent.vue'
import StatusBadge from '@/views/StatusBadge.vue'
import ColorComponent from '@/views/ColorComponent.vue'
import ExpertProcedures from '@/views/ExpertProcedures.vue'
import ExpertSchedules from '@/views/ExpertSchedules.vue'
import { getBranches } from '@/repositories/BranchRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'ExpertView',
  data() {
    return {

      expert: null,
      user: null,

      editing: false,

      branches: [],

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
    expertId() {
      this.getExpert()
    },
    editing() {
      this.getExpert()
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
    data() {
      return this.expertList
    },
    expertId: {
      get() {
        return this.$route.params.id
      },
      set(value) {
        this.$router.push({ name: 'expert', params: { id: value } })
      }
    },
    branchId:{
      get() {
        return this.expert.branch ? this.expert.branch.id : null
      },
      set(value) {
        if(!this.expert.branch){
          this.expert.branch = {}
        }
        this.expert.branch.id = value
      }
    }
  },
  methods: {

    getBranches() {
      getBranches(this.token).then(response => {
        this.branches = response
      })
    },

    getExpert() {
      getExpert(this.token, this.expertId).then(response => {
        if (response.code === 200) {
          this.expert = response.expert
          this.user = response.user;
        } else {
          this.$swal({
            title: 'Error',
            text: response.message,
            icon: 'error'
          })
        }
      })
    },

    saveExpert() {
      saveExpert(this.token, this.expertId, this.branchId, this.expert.fullName, this.expert.about, this.user.email, this.expert.color, this.expert.status ? 1 : 0).then(response => {
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
    this.getExpert();
    this.getBranches();
  },
  components: {
    AppBreadcrumb,
    ExpertSchedules,
    ExpertProcedures,
    ColorComponent,
    StatusBadge,
    ModalComponent,
    DataTable
  }
}
</script>
