<template>

  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>

        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Branches', path: '/dashboard/branches', active: true }
          ]" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0"> Branches</span>
          <button class="btn-primary-custom" @click="addNewItem = true">
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

  <ModalComponent title="new branch" size="md" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem">
      <div class="row">
        <div class="col-md-12">
          <div class="mb-3">
            <label for="newName" class="form-label">Branch name</label>
            <input
              type="text"
              class="form-control"
              id="newName"
              v-model="newItemDetails.name"
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


import {useAuthStore} from "@/stores/auth.js";
import {mapState} from "pinia";
import { getBranches, createBranch } from '@/repositories/BranchRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import ModalComponent from '@/components/ModalComponent.vue'

DataTable.use(DataTablesLib);
DataTable.use(DataTablesCore);

export default {
  name: 'BranchesView',
  data() {
    return {
      addNewItem: false,
      newItemDetails:{
        name: '',
      },


      branchList: [],
      columns: [
        {title: 'ID', data: 'id', orderable: true},
        {title: 'Name', data: 'name', orderable: true},
        {
          title: 'Status', data: (row) => {
            if (row.status) {
              return `<span class="badge bg-success">active</span>`;
            } else {
              return `<span class="badge bg-danger">inactive</span>`;
            }
          }
        }
      ],
    }
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ["token", "user"]),
    data() {
      return this.branchList;
    }
  },
  methods: {

    getBranches(){
      getBranches(this.token).then(response => {
        this.branchList = response;
      });
    },

    createNewItem() {
      createBranch(this.token, this.newItemDetails.name).then(response => {
        if (response.code === 200) {
          this.getBranches()
          this.addNewItem = false
          this.newItemDetails = {
            name: ''
          }

          this.$swal({
            title: 'Success',
            text: 'New branch added successfully',
            icon: 'success'
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
  },
  mounted() {
    this.getBranches();
  },
  components: {
    ModalComponent,
    AppBreadcrumb,
    DataTable
  }
}
</script>


