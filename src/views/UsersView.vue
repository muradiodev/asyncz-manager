<template>

  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>

        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Users', path: '/dashboard/users', active: true }
          ]" />
        </div>

      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="h2 mb-0"> Users</span>
        <button class="btn btn-sm btn-success ms-4" @click="addNewItem = true">
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

  <ModalComponent title="new user" v-if="addNewItem" @modalClose="addNewItem = false">
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
              <option value="0" >-all branches-</option>
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

import {useAuthStore} from "@/stores/auth.js";
import {mapState} from "pinia";
import ModalComponent from '@/components/ModalComponent.vue'
import { createUser, getUsers } from '@/repositories/CompanyUserRepository.js'
import { getBranches } from '@/repositories/BranchRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'

DataTable.use(DataTablesLib);
DataTable.use(DataTablesCore);

export default {
  name: 'UsersView',
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
      userList: [],
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
        {title: 'Name', data: 'name', orderable: true},
        {title: 'Email', data: 'email', orderable: true},
        {
          title: 'Role', data: (row) => {
            if(row.expert){
              return 'expert';
            } else  if(row.branch){
              return 'branch manager';
            } else {
              return 'company manager';
            }
          }
        },
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
            if(row.expert) {
              return `<a href="./expert/${row.expert.id}">manage</a>`;
            } else {
              return `<a href="./user/${row.id}">manage</a>`;
            }
          }
        },
      ],
    }
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ["token", "user"]),
    data() {
      return this.userList;
    }
  },
  methods: {

    getUsers() {
      getUsers(this.token).then(response => {
        this.userList = response;
      });
    },

    getBranches(){
      getBranches(this.token).then(response => {
        this.branchList = response;
      });
    },

    createNewItem(){
      createUser(this.token, this.newItemDetails.branchId, this.newItemDetails.fullName, this.newItemDetails.email, this.newItemDetails.password).then(response => {
        if(response.code === 200){
          this.getUsers();
          this.addNewItem = false;
          this.newItemDetails = {
            branchId: null,
            fullName: '',
            email: '',
            password: ''
          };

          this.$router.push({name: 'user', params: {id: response.id}});
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
    this.getUsers();
    this.getBranches();
  },
  components: {
    AppBreadcrumb,
    ModalComponent,
    DataTable
  }
}
</script>


