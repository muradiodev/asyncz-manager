<template>
  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="breadcrumbs" />
        </div>
        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">{{ $t('blacklist.title') }}</span>
          <button class="btn-outline-success-custom" @click="addNewItem = true" v-if="enabled">
            <i class="fas fa-plus me-1"></i> {{ $t('blacklist.add') }}
          </button>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4" lg>
    <CCard class="mb-4" v-if="enabled">
      <CCardBody>
        <DataTable class="table table-sm table-hover"
                   :columns="columns"
                   :data="itemList"
                   ref="blacklistTable">
        </DataTable>
      </CCardBody>
    </CCard>
    <CCard class="mb-4" v-else>
      <div class="alert alert-warning m-3">
        {{ $t('blacklist.notSubscribed') }}
      </div>
    </CCard>
  </CContainer>

  <!-- CREATE MODAL -->
  <ModalComponent :title="$t('blacklist.modalCreate.title')" size="md" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem">
      <div class="row">
        <div class="col-md-12">
          <div class="mb-3">
            <label for="newKeyword" class="form-label">{{ $t('blacklist.modalCreate.labels.keyword') }}</label>
            <input
              type="text"
              class="form-control"
              id="newKeyword"
              v-model="newItemDetails.keyword"
              required
            />
          </div>
        </div>
        <div class="col-md-12">
          <button class="btn-success-custom w-25 fw-bold py-2">{{ $t('blacklist.modalCreate.actions.create') }}</button>
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
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { toast } from 'vue3-toastify'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'BlacklistView',
  data() {
    return {
      addNewItem: false,
      newItemDetails: { keyword: '' },
      itemList: [],
      columns: [
        { title: 'Keyword', data: 'value', orderable: true },
        {
          title: 'Action',
          orderable: false,
          data: null,
          render: (data, type, row) => {
            return `
              <button class="btn btn-outline-danger btn-sm delete-btn" data-id="${row.id}" style="padding:4px 8px;">
                <i class="fas fa-trash"></i>
              </button>
            `
          }
        }
      ]
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user','companyPackage']),
    data() { return this.itemList },
    enabled() { return this.companyPackage && this.companyPackage.blacklist }
  },
  methods: {
    getItemList() {
      getBlackList(this.token).then(response => {
        this.itemList = response
        this.rerenderTable()
      })
    },
    createNewItem() {
      createBlacklist(this.token, this.newItemDetails.keyword).then(response => {
        if (response.code === 200) {
          this.getItemList()
          this.addNewItem = false
          this.newItemDetails = { keyword: '' }
          toast.success('New blacklist added successfully');
        } else {
          toast.error(response.message);
        }
      })
    },
    confirmDeleteBlacklist(item) {
      this.$swal({
        title: 'Are you sure?',
        text: `Delete blacklist "${item.value}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteBlacklist(item.id)
        }
      })
    },
    deleteBlacklist(id) {
      deleteBlacklist(this.token, id).then(response => {
        if (response.code === 200) {
          this.getItemList()
          toast.success('Blacklist deleted.');
        } else {
          toast.error(response.message);
        }
      })
    },
    rerenderTable() {
      this.$nextTick(() => {
        if (this.$refs.blacklistTable && this.$refs.blacklistTable.dt) {
          this.$refs.blacklistTable.dt.draw()
        }
      })
    }
  },
  mounted() {
    this.getItemList()
    // Attach delete button handler
    document.addEventListener('click', (event) => {
      const delBtn = event.target.closest('.delete-btn')
      if (delBtn) {
        const id = delBtn.getAttribute('data-id')
        const item = this.itemList.find(i => String(i.id) === String(id))
        if (item) this.confirmDeleteBlacklist(item)
      }
    })
  },
  components: {
    AppBreadcrumb,
    ModalComponent,
    DataTable
  }
}
</script>
