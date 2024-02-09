<template>

  <div class="container">

    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Procedures</li>
      </ol>
    </nav>



    <div class="d-flex align-items-center">
      <span class="h2 mb-0"> Procedures</span>
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

  <ModalComponent title="new procedure" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem">
      <div class="row">
        <div class="col-md-12">
          <div class="mb-3">
            <label for="newName" class="form-label">Name</label>
            <input
              type="text"
              class="form-control"
              id="newName"
              v-model="newItemDetails.name"
              required
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="newLength" class="form-label">Length</label>
           <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="newEmail"
              v-model.number="newItemDetails.length"
              required
            />
             <div class="input-group-text">
               minute(s)
             </div>
           </div>
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

import 'datatables.net-select';
import 'datatables.net-responsive';
import 'datatables.net-select-bs5';
import { createExpert, getExperts } from '@/repositories/ExpertsRepository.js'
import {useAuthStore} from "@/stores/auth.js";
import {mapState} from "pinia";
import ModalComponent from '@/components/ModalComponent.vue'
import { createProcedure, getProcedures } from '@/repositories/ProceduresRepository.js'

DataTable.use(DataTablesLib);
DataTable.use(DataTablesCore);

export default {
  name: 'ProceduresView',
  data() {
    return {

      addNewItem: false,
      newItemDetails:{
        name: '',
        length: ''
      },

      itemList: [],
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
        },{
          title: 'Length', data: (row) => {
             return `${row.length} minute(s)`
          }
        },
        {
          title: 'Action', data: (row) => {
            return `<a href="./procedure/${row.id}">manage</a>`;
          }
        },
      ],
    }
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ["token", "user"]),
    data() {
      return this.itemList;
    }
  },
  methods: {

    getItemList() {
      getProcedures(this.token).then(response => {
        this.itemList = response;
      });
    },

    createNewItem(){
      createProcedure(this.token, this.newItemDetails.name, this.newItemDetails.length).then(response => {
        if(response.code === 200){
          this.getItemList();
          this.addNewItem = false;
          this.newItemDetails = {
            name: '',
            length: ''
          };

          this.$router.push({name: 'procedure', params: {id: response.id}});
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
    this.getItemList();
  },
  components: {
    ModalComponent,
    DataTable
  }
}
</script>


<style scoped>

@import 'datatables.net-dt';

</style>