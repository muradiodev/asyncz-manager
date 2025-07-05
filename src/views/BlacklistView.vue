<template>

  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>

        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: 'Dashboard', path: '/dashboard', active: false },
            { name: 'Blacklist', path: '/dashboard/blacklist', active: true }
          ]" />
        </div>

        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0"> Blacklist </span>
          <button class="btn btn-sm btn-success ms-4" @click="addNewItem = true" v-if="enabled" >
            + Add new
          </button>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>





  <CContainer class="px-4" lg>

    <CCard class="mb-4" v-if="enabled">
      <CCardBody>
      <DataTable class="table table-striped table-bordered"
                 :columns="columns"
                 :data='data'>

        <template #column-action="props">
          <button type="button" class="btn btn-sm btn-danger" @click="deleteBlacklist(props)" style="background-color: #dc3545; color: white; border: 1px solid #dc3545; padding: 4px 8px; border-radius: 4px;">Delete</button>
        </template>



      </DataTable>
      </CCardBody>
    </CCard>
    <CCard class="mb-4" v-else>
      <div class="alert alert-warning m-3">
        Your company is not subscribed to a package that includes the blacklist feature.
      </div>
    </CCard>
  </CContainer>

  <ModalComponent title="new blacklist" size="md" v-if="addNewItem" @modalClose="addNewItem = false">
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
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'


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
    ...mapState(useAuthStore, ['token', 'user','companyPackage']),
    data() {
      return this.itemList
    },

    enabled() {
      return this.companyPackage && this.companyPackage.blacklist
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
    AppBreadcrumb,
    ModalComponent,
    DataTable
  }
}
</script>

