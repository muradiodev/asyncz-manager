<template>

  <div class="container">

    <!-- breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link :to="{name: 'home'}">Home</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Blacklist</li>
      </ol>
    </nav>


    <div class="d-flex align-items-center">
      <span class="h2 mb-0"> Blacklist</span>
      <button class="btn btn-sm btn-success ms-4" @click="addNewItem = true">
        + Add new
      </button>
    </div>


    <div class="my-4">
      <DataTable class="table table-striped table-bordered"
                 :columns="columns"
                 :data='data'>

        <template #column-action="props">
          <button type="button" class="btn btn-sm btn-link text-danger" @click="deleteBlacklist(props)">delete</button>
        </template>

      </DataTable>

    </div>


  </div>

  <ModalComponent title="new blacklist" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem">
      <div class="row">
        <div class="col-md-12">
          <div class="mb-3">
            <label for="newName" class="form-label">Keyword</label>
            <input
              type="text"
              class="form-control"
              id="newName"
              v-model="newItemDetails.keyword"
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

import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import ModalComponent from '@/components/ModalComponent.vue'
import { createBlacklist, deleteBlacklist, getBlackList } from '@/repositories/BlacklistRepository.js'
import { customAlert, customAsk } from '@/utils/utils.js'


DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'BlacklistView',
  data() {
    return {

      addNewItem: false,
      newItemDetails: {
        keyword: ''
      },

      itemList: [],
      columns: [
        { title: 'ID', data: 'id', orderable: true },
        { title: 'Keyword', data: 'value', orderable: true },
        {
          title: 'Action',
          name: 'action'
        }
      ]
    }
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),
    data() {
      return this.itemList
    }
  },
  methods: {

    getItemList() {
      getBlackList(this.token).then(response => {
        this.itemList = response
      })
    },

    createNewItem() {
      createBlacklist(this.token, this.newItemDetails.keyword).then(response => {
        if (response.code === 200) {
          this.getItemList()
          this.addNewItem = false
          this.newItemDetails = {
            keyword: ''
          }

          this.$swal({
            title: 'Success',
            text: 'New blacklist added successfully',
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
    deleteBlacklist(props) {
      let id = props.rowData.id

      customAsk(
        'Are you sure you want to delete this blacklist?',
        '', 'warning', () => {
          deleteBlacklist(this.token, id).then(response => {
              if (response.code === 200) {
                this.getItemList()
                customAlert('Success', 'Blacklist deleted successfully', 'success')
              } else {
                customAlert('Error', response.message, 'error')
              }
            }
          )

        })
    }
  },
  mounted() {
    this.getItemList()
  },
  components: {
    ModalComponent,
    DataTable
  }
}
</script>

