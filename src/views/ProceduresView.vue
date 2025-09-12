<template>
  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb
            :breadcrumbs="[
              { name: $t('general.dashboard'), path: '/dashboard', active: false },
              { name: $t('procedures.title'), path: '/dashboard/procedures', active: true }
            ]"
          />
        </div>
        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">{{ $t('procedures.title') }}</span>
          <button class="btn-outline-success-custom w-25" @click="openCreateModal">
            <i class="fas fa-plus me-1"></i> {{ $t('procedures.add') }}
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
                   ref="proceduresTable"
                   :options="dtOptions"
                   :key="$i18n.locale"/>
      </CCardBody>
    </CCard>
  </CContainer>

  <!-- CREATE / EDIT MODAL -->
  <ModalComponent
    :title="$t('procedures.modalCreate.title')"
    size="md"
    v-if="addNewItem"
    @modalClose="closeModal"
  >
    <form @submit.prevent="isEditing ? submitEdit() : createNewItem()">
      <div class="row gy-3">
        <div class="col-12">
          <label for="procedureName" class="form-label fw-bold">{{ $t('procedures.modalCreate.labels.name') }}</label>
          <input
            type="text"
            class="form-control"
            id="procedureName"
            v-model="newItemDetails.name"
            required
            :placeholder="$t('procedures.modalCreate.placeholders.name')"
            autocomplete="off"
          />
        </div>
        <div class="col-12 col-md-6">
          <label for="procedureLength" class="form-label fw-bold">{{ $t('procedures.modalCreate.labels.length') }}</label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="procedureLength"
              v-model.number="newItemDetails.length"
              required
              min="1"
              :placeholder="$t('procedures.modalCreate.placeholders.length')"
              autocomplete="off"
            />
            <span class="input-group-text">{{ $t('procedures.lengthUnit') }}</span>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <label for="procedureColor" class="form-label fw-bold">{{ $t('procedures.modalCreate.labels.color') }}</label>
          <div class="color-selector-container">
            <div
              class="selected-color-display"
              @click="toggleColorPalette"
              :style="{ backgroundColor: newItemDetails.color || '#ccc' }"
            >
              <span v-if="!showColorPalette" class="color-hint">
                <font-awesome-icon :icon="faPencil()" />
              </span>
            </div>
            <div v-if="showColorPalette" class="color-palette-container">
              <div class="color-palette">
                <div
                  v-for="(color, index) in colorPalette"
                  :key="index"
                  class="color-swatch"
                  :class="{ selected: newItemDetails.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="selectColor(color)"
                ></div>
              </div>
              <div class="mt-2 d-flex justify-content-between">
                <div>&nbsp;&nbsp;&nbsp;</div>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="showColorPalette = false"
                >
                  {{ $t('procedures.modalCreate.actions.closePalette') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <button type="submit" class="btn-success-custom w-50 fw-bold py-2">
            <i :class="isEditing ? 'fas fa-pen me-2' : 'fas fa-plus me-2'"></i>
            {{ isEditing ? $t('procedures.modalEdit.actions.save') : $t('procedures.modalCreate.actions.create') }}
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
import { toast } from 'vue3-toastify'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPencil } from '@fortawesome/free-solid-svg-icons'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'ProceduresView',
  data() {
    return {
      addNewItem: false,
      isEditing: false,
      showColorPalette: false,
      newItemDetails: {
        id: null,
        name: '',
        length: '',
        color: '',
      },
      itemList: [],
      shareLinks: [],
      colorPalette: [
        // First row - light pastel colors
        '#d4f5e9',
        '#fbeaa0',
        '#fde5d4',
        '#ffd5d5',
        '#e5d4f5',
        // Second row - medium pastel colors
        '#77d4aa',
        '#ebc956',
        '#f4a87c',
        '#ee7e7e',
        '#b39ddb',
        // Third row - darker colors
        '#15a149',
        '#9e7b35',
        '#b25933',
        '#c13f3f',
        '#5e4294',
        // Fourth row - very light colors
        '#e6f0ff',
        '#d4f1f9',
        '#e8f7d4',
        '#fce4ec',
        '#e0e0e0',
        // Fifth row - medium bright colors
        '#5b9bd5',
        '#69c3d4',
        '#a8ce54',
        '#e67ab3',
        '#8c9099',
        // Sixth row - darker bright colors
        '#3464c4',
        '#2b7c93',
        '#6b8e23',
        '#b13e81',
        '#4e5561'
      ],
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user', 'permissions']),

    canManageService() {
      return this.hasAnyPermission(['MANAGE_SERVICES']);
    },

    columns() {
      const cols = [
        { title: this.$t('procedures.table.columns.id'), data: 'id', orderable: true },
        { title: this.$t('procedures.table.columns.name'), data: 'name', orderable: true },
        {
          title: this.$t('procedures.table.columns.color'),
          data: (row) => `<span class="badge" style="background-color: ${row.color};">&nbsp;</span>`,
        },
        {
          title: this.$t('procedures.table.columns.status'),
          data: (row) => row.status
            ? `<span class="badge bg-success">${this.$t('procedures.table.status.active')}</span>`
            : `<span class="badge bg-danger">${this.$t('procedures.table.status.inactive')}</span>`,
        },
        {
          title: this.$t('procedures.table.columns.length'),
          data: (row) => `${row.length} ${this.$t('procedures.lengthUnit')}`,
        },
        {
          title: this.$t('procedures.table.columns.publicLink'),
          data: (row) => {
            const match = this.shareLinks.find(
              (shareLink) => shareLink.name == row.name && shareLink.type == 'procedure'
            );
            if (match && match.hash) {
              const link = `http://book.asyncz.com/?share=${match.hash}`;
              return `<button class="btn btn-outline-success btn-sm copy-link-btn" data-link="${link}">
              <i class="fas fa-link"></i>
            </button>`;
            }
            return '';
          },
        },
      ];

      if (this.canManageService) {
        cols.push({
          title: this.$t('procedures.table.columns.actions'),
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
          `;
          },
        });
      }

      return cols;
    },

    dtOptions() {
      return {
        language: {
          lengthMenu: `_MENU_ ${this.$t('datatable.lengthMenu')}`,
          info: this.$t('datatable.info'),
          infoEmpty: this.$t('datatable.infoEmpty'),
          infoFiltered: this.$t('datatable.infoFiltered'),
          zeroRecords: this.$t('datatable.zeroRecords'),
          search: this.$t('datatable.search'),
          paginate: {
            first: this.$t('datatable.paginate.first'),
            last: this.$t('datatable.paginate.last'),
            next: this.$t('datatable.paginate.next'),
            previous: this.$t('datatable.paginate.previous')
          }
        }
      }
    }
  },
  methods: {
    hasPermission(p) {
      return Array.isArray(this.permissions) && this.permissions.includes(p);
    },
    hasAnyPermission(list) {
      return Array.isArray(list) && list.some(p => this.hasPermission(p));
    },
    faPencil() {
      return faPencil
    },
    toggleColorPalette() {
      this.showColorPalette = !this.showColorPalette
    },
    selectColor(color) {
      this.newItemDetails.color = color
      // Optional: close palette after selection
      // this.showColorPalette = false;
    },
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
      this.newItemDetails = { id: null, name: '', length: '', color: '' }
      this.showColorPalette = false
    },
    closeModal() {
      this.addNewItem = false
      this.isEditing = false
      this.newItemDetails = { id: null, name: '', length: '', color: '' }
      this.showColorPalette = false
    },
    createNewItem() {
      createProcedure(this.token, this.newItemDetails.name, this.newItemDetails.color, this.newItemDetails.length).then(
        (response) => {
          if (response.code === 200) {
            this.getItemList()
            this.closeModal()
            this.$router.push({ name: 'procedure', params: { id: response.id } })
          } else {
            toast.error(response.message);
          }
        }
      )
    },
    submitEdit() {
      updateProcedure(this.token, this.newItemDetails.id, {
        name: this.newItemDetails.name,
        length: this.newItemDetails.length,
        color: this.newItemDetails.color
      }).then((response) => {
        if (response.code === 200) {
          this.getItemList()
          this.closeModal()
          toast.success('Procedure updated!')
        } else {
          toast.error(response.message);
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
          toast.success('Procedure deleted.');
        } else {
          toast.error(response.message);
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
            toast.success('Link copied to clipboard.');
          })
          .catch(() => {
            toast.error('Failed to copy the link.')
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
    DataTable,
    FontAwesomeIcon
  }
}
</script>

<style scoped>
.color-selector-container {
  position: relative;
}

.selected-color-display {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.selected-color-display:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.color-hint {
  color: rgba(0, 0, 0, 0.5);
  text-shadow: 0px 0px 2px rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.color-palette-container {
  position: absolute;
  z-index: 1000;
  width: 100%;
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  max-width: 100%;
}

.color-swatch {
  width: 100%;
  aspect-ratio: 1.5 / 1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #ddd;
}

.color-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.color-swatch.selected {
  border: 3px solid #1976d2;
  box-shadow: 0 0 8px rgba(25, 118, 210, 0.5);
}
</style>
