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
          <span class="h2 mb-0">Branches</span>
          <button class="btn-outline-success-custom" @click="addNewItem = true">
            <i class="fas fa-plus m-1"></i> Add Branch
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
                   :data="branchList"
                   ref="branchesTable">
        </DataTable>
      </CCardBody>
    </CCard>
  </CContainer>

  <!-- CREATE MODAL -->
  <ModalComponent title="New Branch" size="md" v-if="addNewItem" @modalClose="addNewItem = false">
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
          <button class="btn-success-custom w-100">Create</button>
        </div>
      </div>
    </form>
  </ModalComponent>

  <!-- EDIT MODAL -->
  <ModalComponent title="Edit Branch" size="md" v-if="editModalVisible" @modalClose="editModalVisible = false">
    <div v-if="isLoading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading branch data...</p>
    </div>
    <form @submit.prevent="submitEdit" v-else>
      <div class="row">
        <div class="col-12 mb-3">
          <label class="form-label" for="editBranchName">Branch Name</label>
          <input
            id="editBranchName"
            type="text"
            class="form-control"
            v-model="editItem.name"
            required
          />
        </div>
        <div class="col-12 mb-3">
          <label class="form-label" for="editBranchabout">Description</label>
          <input
            id="editBranchabout"
            type="text"
            class="form-control"
            v-model="editItem.about"
            required
          />
        </div>
        <div class="col-12 mb-3">
          <label class="form-label">Status</label>
          <select class="form-select" v-model="editItem.status">
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>
        <div class="col-12">
          <button type="submit" class="btn-success-custom w-100">Save</button>
        </div>
      </div>
    </form>
  </ModalComponent>
</template>

<script>
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net';
import DataTablesLib from 'datatables.net-bs5';

import { useAuthStore } from "@/stores/auth.js";
import { mapState } from "pinia";
import { getBranches, getBranch, createBranch, updateBranch, deleteBranch } from '@/repositories/BranchRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import { getShareLinks } from '@/repositories/ShareLinkRepository.js'
import { toast } from 'vue3-toastify'


DataTable.use(DataTablesLib);
DataTable.use(DataTablesCore);

export default {
  name: 'BranchesView',
  data() {
    return {
      addNewItem: false,
      newItemDetails: {
        name: '',
      },
      branchList: [],
      shareLinks: [],
      isLoading: false,
      columns: [
        { title: 'ID', data: 'id', orderable: true },
        { title: 'Name', data: 'name', orderable: true },
        {
          title: 'Status',
          orderable: true,
          data: (row) => {
            return row.status
              ? `<span class="badge bg-success">active</span>`
              : `<span class="badge bg-danger">inactive</span>`;
          }
        },
        {
          title: 'Public Link', data: (row) => {
            const match = this.shareLinks.find(
              (shareLink) => shareLink.name == row.name && shareLink.type == "branch"
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
    `;
          }

        }
      ],
      editModalVisible: false,
      editItem: {
        id: null,
        name: '',
        about: '',
        status: true,
      },
    }
  },
  computed: {
    ...mapState(useAuthStore, ["token", "user"]),
  },
  methods: {
    async getShareLinks() {
      this.shareLinks = await getShareLinks(this.token);
    },
    getBranches() {
      getBranches(this.token).then(response => {
        this.branchList = response;
        this.rerenderTable(); // ensures table is refreshed
      });
    },
    confirmDeleteBranch(branch) {
      this.$swal({
        title: 'Are you sure?',
        text: `Delete branch "${branch.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteBranch(branch.id);
        }
      });
    },
    deleteBranch(id) {
      deleteBranch(this.token, id).then(async response => {
        if (response.code === 200) {
          await this.getShareLinks();
          this.getBranches();
          toast.success('Branch deleted.');
        } else {
          toast.error(response.message);
        }
      });
    },
    createNewItem() {
      createBranch(this.token, this.newItemDetails.name).then(async response => {
        if (response.code === 200) {
          await this.getShareLinks();
          this.getBranches()
          this.addNewItem = false
          this.newItemDetails = { name: '' }
          toast.success('New branch added successfully');
        } else {
          toast.error(response.message);
        }
      })
    },
    async openEditModal(branchId) {
      try {
        this.isLoading = true;
        this.editModalVisible = true; // Open modal while loading

        // Fetch fresh data from the server
        const response = await getBranch(this.token, branchId);

        if (response.code && response.code !== 200) {
          // Handle error
          toast.error(`Failed to load branch details: ${response.message}`)
          this.editModalVisible = false;
          return;
        }

        const branch = response.branch || {};

        // Update the editItem with fresh data from server
        this.editItem = {
          id: branchId,
          name: branch.name || '',
          about: branch.about || '',
          status: branch.status !== undefined ? branch.status : true
        };
      } catch (error) {
        console.error('Error fetching branch details:', error);
        toast.error('Failed to load branch details. Please try again.');
        this.editModalVisible = false;
      } finally {
        this.isLoading = false;
      }
    },
    submitEdit() {
      updateBranch(this.token, this.editItem.id, {
        name: this.editItem.name,
        about: this.editItem.about,
        status: this.editItem.status,
      }).then(async response => {
        if (response.code === 200) {
          await this.getShareLinks();
          this.getBranches();
          this.editModalVisible = false;
          toast.success('Branch updated.');
        } else {
          toast.error(response.message);
        }
      })
    },
    rerenderTable() {
      // For datatables.net-vue3, to re-draw after data update
      this.$nextTick(() => {
        if (this.$refs.branchesTable && this.$refs.branchesTable.dt) {
          this.$refs.branchesTable.dt.draw();
        }
      });
    }
  },
  async mounted() {
    await this.getShareLinks();
    this.getBranches();

    // Attach edit button click handler after DOM is updated by DataTables
    document.addEventListener('click', (event) => {
      // Handle clicks on dynamically created buttons
      const copyBtn = event.target.closest('.copy-link-btn');
      if (copyBtn) {
        const link = copyBtn.getAttribute('data-link');
        navigator.clipboard.writeText(link)
          .then(() => {
            toast.success('Link copied to clipboard.')
          })
          .catch(() => {
            toast.error('Failed to copy the link.');
            toast.error()
          });
      }

      const editBtn = event.target.closest('.edit-btn');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        this.openEditModal(id);
      }

      const deleteBtn = event.target.closest('.delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        const branch = this.branchList.find(b => String(b.id) === String(id));
        if (branch) this.confirmDeleteBranch(branch);
      }
    });
  },
  components: {
    ModalComponent,
    AppBreadcrumb,
    DataTable
  }
}
</script>

<style lang="scss" scoped>
// Your modern table styling here (if needed)
</style>
