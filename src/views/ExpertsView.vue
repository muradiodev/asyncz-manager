<template>

  <div class="container">

    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Experts</li>
      </ol>
    </nav>



    <div class="d-flex align-items-center">
      <span class="h2 mb-0"> Experts</span>
      <button class="btn btn-sm btn-success ms-4" @click="addNewItem = true">
        + Add new
      </button>
    </div>


    <div class="my-4">
      <DataTable class="table table-striped table-bordered"
                 :columns="columns"
                 :data='data'>
      </DataTable>

    </div>


  </div>

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
          <button class="btn btn-success">Create</button>
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
            return `<a href="./expert/${row.id}">manage</a>`;
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
          this.$swal({
            title: 'Error',
            text: response.message,
            icon: 'error'
          });
        }
      });
    }
  },
  mounted() {
    this.getExperts();
    this.getBranches();
  },
  components: {
    ModalComponent,
    DataTable
  }
}
</script>


