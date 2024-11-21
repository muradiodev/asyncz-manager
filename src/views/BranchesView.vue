<template>

  <div class="container">

    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Branches</li>
      </ol>
    </nav>



    <div class="d-flex align-items-center">
      <span class="h2 mb-0"> Branches</span>
    </div>


    <div class="my-4">
      <DataTable class="table table-striped table-bordered"
                 :columns="columns"
                 :data='data'>
      </DataTable>

    </div>


  </div>

</template>

<script>

import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net';
import DataTablesLib from 'datatables.net-bs5';

import 'datatables.net-select';
import 'datatables.net-responsive';
import 'datatables.net-select-bs5';
import {useAuthStore} from "@/stores/auth.js";
import {mapState} from "pinia";
import { getBranches } from '@/repositories/BranchRepository.js'

DataTable.use(DataTablesLib);
DataTable.use(DataTablesCore);

export default {
  name: 'BranchesView',
  data() {
    return {



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
    }
  },
  mounted() {
    this.getBranches();
  },
  components: {
    DataTable
  }
}
</script>


<style scoped>

@import 'datatables.net-dt';

</style>
