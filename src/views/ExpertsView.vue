<template>

  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>

        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Experts', path: '/dashboard/experts', active: true }
          ]" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0"> Experts</span>
          <button class="btn-primary-custom ms-4" @click="addNewItem = true">
            + Add new
          </button>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>





  <CContainer class="px-4" lg>

    <CCard class="mb-4">
      <CCardBody>
      <DataTable class="table table-striped table-bordered"
                 :columns="columns"
                 :data='data'>
      </DataTable>
      </CCardBody>
    </CCard>
  </CContainer>

  <ModalComponent title="new expert" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem">
      <div class="row">
        <div class="col-md-12">
          <div class="mb-3">
            <label for="newBranch" class="form-label">Branch</label>
            <select
              class="form-control"
              id="newBranch"
              v-model="newItemDetails.branchId"
              required
            >
              <option v-for="branch in branchList" :value="branch.id" :key="branch.id">{{ branch.name }}</option>
            </select>
          </div>
        </div>
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
        </div><div class="col-md-6">
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

import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net';
import DataTablesLib from 'datatables.net-bs5';


import { createExpert, getExperts } from '@/repositories/ExpertsRepository.js'
import {useAuthStore} from "@/stores/auth.js";
import {mapState} from "pinia";
import ModalComponent from '@/components/ModalComponent.vue'
import { getBranches } from '@/repositories/BranchRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { toast } from 'vue3-toastify'

DataTable.use(DataTablesLib);
DataTable.use(DataTablesCore);

export default {
  name: 'ExpertsView',
  data() {
    return {

      addNewItem: false,
      newItemDetails:{
        fullName: '',
        email: '',
        password: '',
        branchId: null
      },
      branchList: [],
      expertList: [],
      columns: [
        {title: 'ID', data: 'id', orderable: true},
        {
          title: 'Branch', data: (row) => {
            if(row.branch){
              return row.branch.name;
            } else {
              return '-';
            }
          }
        },
        {title: 'Name', data: 'fullName', orderable: true},
        {
          title: 'Status', data: (row) => {
            if (row.status) {
              return `<span class="badge bg-success">active</span>`;
            } else {
              return `<span class="badge bg-danger">inactive</span>`;
            }
          }
        },
        {
          title: 'Action', data: (row) => {
            return `<button class="btn-primary-custom" onclick="window.location.href='./expert/${row.id}'">manage</button>`;
          }
        },
      ],
    }
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ["token", "user"]),
    data() {
      return this.expertList;
    }
  },
  methods: {

    getExperts() {
      getExperts(this.token).then(response => {
        this.expertList = response;
      });
    },

    getBranches() {
      getBranches(this.token).then(response => {
        this.branchList = response;
      });
    },

    createNewItem(){
      createExpert(this.token, this.newItemDetails.branchId, this.newItemDetails.fullName, this.newItemDetails.email, this.newItemDetails.password).then(response => {
        if(response.code === 200){
          this.getExperts();
          this.addNewItem = false;
          this.newItemDetails = {
            fullName: '',
            email: '',
            password: ''
          };

          this.$router.push({name: 'expert', params: {id: response.id}});
        } else {
          toast.error(response.message);
        }
      });
    }
  },
  mounted() {
    this.getExperts();
    this.getBranches();
  },
  components: {
    AppBreadcrumb,
    ModalComponent,
    DataTable
  }
}
</script>


