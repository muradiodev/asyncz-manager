<template>
  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb
            :breadcrumbs="[
              { name: 'Dashboard', path: '/dashboard', active: false },
              { name: 'Procedures', path: '/dashboard/procedures', active: true }
            ]"
          />
        </div>
        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0"> Procedures</span>
          <button class="btn-outline-success-custom w-25" @click="openCreateModal">
            <i class="fas fa-plus me-1"></i> Add Procedure
          </button>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4" lg>
    <CCard class="mb-4">
      <CCardBody>
        <DataTable class="table table-sm table-hover"
                   :columns="columns"
                   :data="itemList"
                   ref="proceduresTable" />
      </CCardBody>
    </CCard>
  </CContainer>

  <!-- CREATE / EDIT MODAL -->
  <ModalComponent
    :title="isEditing ? 'Edit Procedure' : 'New Procedure'"
    size="md"
    v-if="addNewItem"
    @modalClose="closeModal"
  >
    <form @submit.prevent="isEditing ? submitEdit() : createNewItem()">
      <div class="row gy-3">
        <div class="col-12">
          <label for="procedureName" class="form-label fw-bold">Name</label>
          <input
            type="text"
            class="form-control"
            id="procedureName"
            v-model="newItemDetails.name"
            required
            placeholder="Procedure name"
            autocomplete="off"
          />
        </div>
        <div class="col-12 col-md-6">
          <label for="procedureLength" class="form-label fw-bold">Length</label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="procedureLength"
              v-model.number="newItemDetails.length"
              required
              min="1"
              placeholder="Length"
              autocomplete="off"
            />
            <span class="input-group-text">minute(s)</span>
          </div>
        </div>
        <div class="col-12">
          <button type="submit" class="btn-success-custom w-50 fw-bold py-2">
            <i :class="isEditing ? 'fas fa-pen me-2' : 'fas fa-plus me-2'"></i>
            {{ isEditing ? 'Save Changes' : 'Create Procedure' }}
          </button>
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
import { getProcedures, createProcedure, updateProcedure, deleteProcedure } from '@/repositories/ProceduresRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { getShareLinks } from '@/repositories/ShareLinkRepository.js'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'ProceduresView',
  data() {
    return {
      addNewItem: false,
      isEditing: false,
      newItemDetails: {
        id: null,
        name: '',
        length: ''
      },
      itemList: [],
      columns: [
        { title: 'ID', data: 'id', orderable: true },
        { title: 'Name', data: 'name', orderable: true },
        {
          title: 'Status',
          data: (row) => {
            return row.status
              ? `<span class="badge bg-success">active</span>`
              : `<span class="badge bg-danger">inactive</span>`
          }
        },
        {
          title: 'Length',
          data: (row) => `${row.length} minute(s)`
        },
        {
          title: 'Public Link', data: (row) => {
            const match = this.shareLinks.find(
              (shareLink) => shareLink.name == row.name && shareLink.type == "procedure"
            );

            if (match && match.hash) {
              const link = `http://book.asyncz.com/?share=${match.hash}`;
              return `<button class="btn btn-outline-success btn-sm copy-link-btn" data-link="${link}">
                <i class="fas fa-link"></i>
              </button>`;
            } else {
              return ``;
            }
          }
        },
        {
          title: 'Actions',
          orderable: false,
          data: null,
          render: (data, type, row) => {
            return `
              <button class="btn btn-outline-warning btn-sm edit-btn" data-id="${row.id}" style="padding:4px 8px; margin-right:3px;">
                <i class="fas fa-pen"></i>
              </button>
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
    ...mapState(useAuthStore, ['token', 'user'])
  },
  methods: {
    async getShareLinks() {
      this.shareLinks = await getShareLinks(this.token);
    },
    getItemList() {
      getProcedures(this.token).then((response) => {
        this.itemList = response
        this.rerenderTable()
      })
    },
    openCreateModal() {
      this.isEditing = false
      this.addNewItem = true
      this.newItemDetails = { id: null, name: '', length: '' }
    },
    closeModal() {
      this.addNewItem = false
      this.isEditing = false
      this.newItemDetails = { id: null, name: '', length: '' }
    },
    createNewItem() {
      createProcedure(this.token, this.newItemDetails.name, this.newItemDetails.length).then(
        (response) => {
          if (response.code === 200) {
            this.getItemList()
            this.closeModal()
            this.$router.push({ name: 'procedure', params: { id: response.id } })
          } else {
            this.$swal({
              title: 'Error',
              text: response.message,
              icon: 'error'
            })
          }
        }
      )
    },
    submitEdit() {
      updateProcedure(this.token, this.newItemDetails.id, {
        name: this.newItemDetails.name,
        length: this.newItemDetails.length
      }).then((response) => {
        if (response.code === 200) {
          this.getItemList()
          this.closeModal()
          this.$swal({ title: 'Saved!', text: 'Procedure updated.', icon: 'success' })
        } else {
          this.$swal({ title: 'Error', text: response.message, icon: 'error' })
        }
      })
    },
    confirmDeleteProcedure(procedure) {
      this.$swal({
        title: 'Are you sure?',
        text: `Delete procedure "${procedure.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteProcedure(procedure.id)
        }
      })
    },
    deleteProcedure(id) {
      deleteProcedure(this.token, id).then((response) => {
        if (response.code === 200) {
          this.getItemList()
          this.$swal({ title: 'Deleted!', text: 'Procedure deleted.', icon: 'success' })
        } else {
          this.$swal({ title: 'Error', text: response.message, icon: 'error' })
        }
      })
    },
    rerenderTable() {
      this.$nextTick(() => {
        if (this.$refs.proceduresTable && this.$refs.proceduresTable.dt) {
          this.$refs.proceduresTable.dt.draw()
        }
      })
    }
  },
  async mounted() {
    await this.getShareLinks();
    this.getItemList()
    // Attach edit and delete button handlers after DOM update
    document.addEventListener('click', (event) => {

      const copyBtn = event.target.closest('.copy-link-btn');
      if (copyBtn) {
        const link = copyBtn.getAttribute('data-link');
        navigator.clipboard.writeText(link)
          .then(() => {
            this.$swal({ title: 'Copied!', text: 'Link copied to clipboard.', icon: 'success' });
          })
          .catch(() => {
            this.$swal({ title: 'Oops!', text: 'Failed to copy the link.', icon: 'error' });
          });
      }

      const editBtn = event.target.closest('.edit-btn')
      if (editBtn) {
        const procedureId = editBtn.getAttribute('data-id')
        this.$router.push({ name: 'procedure', params: { id: procedureId } })
      }
      const deleteBtn = event.target.closest('.delete-btn')
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id')
        const procedure = this.itemList.find(p => String(p.id) === String(id))
        if (procedure) this.confirmDeleteProcedure(procedure)
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
