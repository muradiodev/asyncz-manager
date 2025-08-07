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
          <button class="btn-outline-success-custom" @click="addNewItem = true">
            <i class="fas fa-plus m-1"></i> Add User
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
                   :data="userList"
                   ref="usersTable">
        </DataTable>
      </CCardBody>
    </CCard>
  </CContainer>

  <ModalComponent title="New User" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem" autocomplete="off">
      <div class="row gy-3">
        <!-- Role Dropdown -->
        <div class="col-12">
          <label for="userRole" class="form-label fw-bold">Role</label>
          <select
            class="form-select"
            id="userRole"
            v-model="newItemDetails.role"
            required
          >
            <option disabled value="">Select role...</option>
            <option value="manager">Company manager</option>
            <option value="branch">Branch manager</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <!-- Branch Dropdown (only if not manager) -->
        <div class="col-12" v-if="newItemDetails.role && newItemDetails.role !== 'manager'">
          <label for="userBranch" class="form-label fw-bold">Branch</label>
          <select
            class="form-select"
            id="userBranch"
            v-model="newItemDetails.branchId"
            required
          >
            <option disabled value="">Select branch...</option>
            <option v-for="branch in branchList" :value="branch.id" :key="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <!-- Name -->
        <div class="col-12">
          <label for="userFullName" class="form-label fw-bold">Full Name</label>
          <input
            type="text"
            class="form-control"
            id="userFullName"
            v-model="newItemDetails.fullName"
            required
            placeholder="Enter full name"
            autocomplete="off"
          />
        </div>

        <!-- Email -->
        <div class="col-12">
          <label for="userEmail" class="form-label fw-bold">E-mail</label>
          <input
            type="email"
            class="form-control"
            id="userEmail"
            v-model="newItemDetails.email"
            required
            placeholder="Enter e-mail"
            autocomplete="off"
            style="max-width: 250px;"
          />
        </div>



        <!-- Submit Button -->
        <div class="col-12 pt-2">
          <button type="submit" class="btn-success-custom w-25 fw-bold py-2">
            <i class="fas fa-plus me-2"></i> Create User
          </button>
        </div>
      </div>
    </form>
  </ModalComponent>

  <ModalComponent title="User permissions" v-if="permissionUserId" @modalClose="permissionUserId = null">
     <UserPermissionView :user-id="permissionUserId" @close="permissionUserId = null"></UserPermissionView>
  </ModalComponent>

</template>

<script>
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import DataTablesLib from 'datatables.net-bs5'

import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import ModalComponent from '@/components/ModalComponent.vue'
import { createUser, getUsers } from '@/repositories/CompanyUserRepository.js'
import { getBranches } from '@/repositories/BranchRepository.js'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { getShareLinks } from '@/repositories/ShareLinkRepository.js'
import { toast } from 'vue3-toastify'
import UserPermissionView from '@/views/UserPermissionView.vue'

DataTable.use(DataTablesLib);
DataTable.use(DataTablesCore);

export default {
  name: 'UsersView',
  data() {
    return {
      addNewItem: false,
      newItemDetails:{
        role: '',
        fullName: '',
        email: '',
        branchId: null
      },
      branchList: [],
      userList: [],
      shareLinks: [],
      permissionUserId: null,
      columns: [
        {title: 'ID', data: 'id', orderable: true},

        {title: 'Name', data: 'name', orderable: true},
        {title: 'Email', data: 'email', orderable: true},
        {
          title: 'Branch', data: (row) => {
            if(row.branch){
              return row.branch.name;
            } else {
              return '-';
            }
          }
        },
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
          title: 'Public Link', data: (row) => {
            const match = this.shareLinks.find(
              (shareLink) => shareLink.name == row.name && shareLink.type == this.getUserRole(row)
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
      <button class="btn btn-outline-warning btn-sm user-edit-btn" data-id="${row.id}" style="padding:4px 8px; margin-right:3px;">
        <i class="fas fa-pen"></i>
      </button>
      <button class="btn btn-outline-danger btn-sm user-delete-btn" data-id="${row.id}" style="padding:4px 8px;">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-outline-primary btn-sm user-permission-btn" data-id="${row.id}" style="padding:4px 8px;">
        <i class="fas fa-key"></i>
      </button>
    `;
          }
        },
      ],
    }
  },
  computed: {
    ...mapState(useAuthStore, ["token", "user"]),
  },
  methods: {
    getUsers() {
      getUsers(this.token).then(response => {
        this.userList = response;
        this.rerenderTable();
      });
    },

    getBranches(){
      getBranches(this.token).then(response => {
        this.branchList = response;
      });
    },

    async getShareLinks() {
      this.shareLinks = await getShareLinks(this.token);
    },

    createNewItem(){
      createUser(this.token, this.newItemDetails.role, this.newItemDetails.branchId, this.newItemDetails.fullName, this.newItemDetails.email).then(response => {
        if(response.code === 200){
          this.getUsers();
          this.addNewItem = false;

          if(this.newItemDetails.role === 'expert'){
            this.$router.push({name: 'expert', params: {id: response.expertId}});
          } else {
            this.$router.push({name: 'user', params: {id: response.id}});
          }

          this.newItemDetails = {
            branchId: null,
            fullName: '',
            email: '',
            role: ''
          };

        } else {
          toast.error(response.message);
        }
      });
    },

    openEditUser(user) {
      // Your manage logic:
      if(user.expert) {
        this.$router.push({name: 'expert', params: {id: user.expert.id}});
      } else {
        this.$router.push({name: 'user', params: {id: user.id}});
      }
    },

    confirmDeleteUser(user) {
      this.$swal({
        title: 'Are you sure?',
        text: `Delete user "${user.fullName || user.name || user.email}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteUser(user.id);
        }
      });
    },

    deleteUser(id) {
      // Call your deleteUser API (implement in CompanyUserRepository if not done!)
      // Example (uncomment when available):
      /*
      deleteUser(this.token, id).then(response => {
        if (response.code === 200) {
          this.getUsers();
          this.$swal({ title: 'Deleted!', text: 'User deleted.', icon: 'success' });
        } else {
          this.$swal({ title: 'Error', text: response.message, icon: 'error' });
        }
      });
      */
      // For now, just show a fake alert (remove this when you add real API)
      toast.info('Delete user API not implemented');
    },

    rerenderTable() {
      // For datatables.net-vue3, to re-draw after data update
      this.$nextTick(() => {
        if (this.$refs.usersTable && this.$refs.usersTable.dt) {
          this.$refs.usersTable.dt.draw();
        }
      });
    },
    getUserRole(row) {
      if(row.expert){
        return 'expert';
      } else  if(row.branch){
        return 'branch';
      } else {
        return 'company';
      }
    }
  },
  async mounted() {
    await this.getShareLinks();
    this.getUsers();
    this.getBranches();


    document.addEventListener('click', (event) => {
      const copyBtn = event.target.closest('.copy-link-btn');
      if (copyBtn) {
        const link = copyBtn.getAttribute('data-link');
        navigator.clipboard.writeText(link)
          .then(() => {
            toast.success('Link copied to clipboard');
          })
          .catch(() => {
            toast.error('Failed to copy the link');
          });
      }

      const editBtn = event.target.closest('.user-edit-btn');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const user = this.userList.find(u => String(u.id) === String(id));
        if (user) this.openEditUser(user);
      }

      const deleteBtn = event.target.closest('.user-delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        const user = this.userList.find(u => String(u.id) === String(id));
        if (user) this.confirmDeleteUser(user);
      }

      const permissionBtn = event.target.closest('.user-permission-btn');
      if (permissionBtn) {
        this.permissionUserId = permissionBtn.getAttribute('data-id');
      }
    });
  },
  components: {
    UserPermissionView,
    AppBreadcrumb,
    ModalComponent,
    DataTable
  }
}
</script>
