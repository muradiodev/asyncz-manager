<template>
  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb :breadcrumbs="[
            { name: $t('users.breadcrumb.dashboard'), path: '/dashboard', active: false },
            { name: $t('users.breadcrumb.users'), path: '/dashboard/users', active: true }
          ]" />
        </div>
        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">{{ $t('users.title') }}</span>
          <button class="btn-outline-success-custom" @click="addNewItem = true">
            <i class="fas fa-plus m-1"></i> {{ $t('users.actions.add') }}
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

  <ModalComponent :title="$t('users.actions.add')" v-if="addNewItem" @modalClose="addNewItem = false">
    <form @submit.prevent="createNewItem" autocomplete="off">
      <div class="row gy-3">
        <!-- Role Dropdown -->
        <div class="col-12">
          <label for="userRole" class="form-label fw-bold">{{ $t('users.form.role.label') }}</label>
          <select
            class="form-select"
            id="userRole"
            v-model="newItemDetails.role"
            required
          >
            <option disabled value="">{{ $t('users.form.role.placeholder') }}</option>
            <option value="manager">{{ $t('users.form.role.manager') }}</option>
            <option value="branch">{{ $t('users.form.role.branch') }}</option>
            <option value="expert">{{ $t('users.form.role.expert') }}</option>
          </select>
        </div>

        <!-- Branch Dropdown -->
        <div class="col-12" v-if="newItemDetails.role && newItemDetails.role !== 'manager'">
          <label for="userBranch" class="form-label fw-bold">{{ $t('users.form.branch.label') }}</label>
          <select
            class="form-select"
            id="userBranch"
            v-model="newItemDetails.branchId"
            required
          >
            <option disabled value="">{{ $t('users.form.branch.placeholder') }}</option>
            <option v-for="branch in branchList" :value="branch.id" :key="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <!-- Name -->
        <div class="col-12">
          <label for="userFullName" class="form-label fw-bold">{{ $t('users.form.fullName.label') }}</label>
          <input
            type="text"
            class="form-control"
            id="userFullName"
            v-model="newItemDetails.fullName"
            required
            :placeholder="$t('users.form.fullName.placeholder')"
            autocomplete="off"
          />
        </div>

        <!-- Email -->
        <div class="col-12">
          <label for="userEmail" class="form-label fw-bold">{{ $t('users.form.email.label') }}</label>
          <input
            type="email"
            class="form-control"
            id="userEmail"
            v-model="newItemDetails.email"
            required
            :placeholder="$t('users.form.email.placeholder')"
            autocomplete="off"
            style="max-width: 250px;"
          />
        </div>

        <!-- Submit Button -->
        <div class="col-12 pt-2">
          <button type="submit" class="btn-success-custom w-25 fw-bold py-2">
            <i class="fas fa-plus me-2"></i> {{ $t('users.actions.create') }}
          </button>
        </div>
      </div>
    </form>
  </ModalComponent>

  <ModalComponent :title="$t('users.actions.permissions')" v-if="permissionUserId" @modalClose="permissionUserId = null">
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

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'UsersView',
  data() {
    return {
      addNewItem: false,
      newItemDetails: {
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
        { title: this.$t('users.table.id'), data: 'id', orderable: true },
        { title: this.$t('users.table.name'), data: 'name', orderable: true },
        { title: this.$t('users.table.email'), data: 'email', orderable: true },
        {
          title: this.$t('users.table.branch'),
          data: (row) => row.branch ? row.branch.name : '-'
        },
        {
          title: this.$t('users.table.role'),
          data: (row) => {
            if (row.expert) return this.$t('users.table.roles.expert')
            else if (row.branch) return this.$t('users.table.roles.branchManager')
            else return this.$t('users.table.roles.companyManager')
          }
        },
        {
          title: this.$t('users.table.status'),
          data: (row) => {
            return row.status
              ? `<span class="badge bg-success">${this.$t('users.table.statusValues.active')}</span>`
              : `<span class="badge bg-danger">${this.$t('users.table.statusValues.inactive')}</span>`
          }
        },
        {
          title: this.$t('users.table.publicLink'),
          data: (row) => {
            const match = this.shareLinks.find(
              (shareLink) => shareLink.name == row.name && shareLink.type == this.getUserRole(row)
            )
            if (match && match.hash) {
              const link = `http://book.asyncz.com/?share=${match.hash}`
              return `<button class="btn btn-outline-success btn-sm copy-link-btn" data-link="${link}">
                <i class="fas fa-link"></i>
              </button>`
            }
            return ``
          }
        },
        {
          title: this.$t('users.table.actions'),
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
    getUsers() {
      getUsers(this.token).then(response => {
        this.userList = response
        this.rerenderTable()
      })
    },
    getBranches() {
      getBranches(this.token).then(response => {
        this.branchList = response
      })
    },
    async getShareLinks() {
      this.shareLinks = await getShareLinks(this.token)
    },
    createNewItem() {
      createUser(this.token, this.newItemDetails.role, this.newItemDetails.branchId, this.newItemDetails.fullName, this.newItemDetails.email)
        .then(response => {
          if (response.code === 200) {
            this.getUsers()
            this.addNewItem = false
            if (this.newItemDetails.role === 'expert') {
              this.$router.push({ name: 'expert', params: { id: response.expertId } })
            } else {
              this.$router.push({ name: 'user', params: { id: response.id } })
            }
            this.newItemDetails = { branchId: null, fullName: '', email: '', role: '' }
          } else {
            toast.error(response.message)
          }
        })
    },
    openEditUser(user) {
      if (user.expert) {
        this.$router.push({ name: 'expert', params: { id: user.expert.id } })
      } else {
        this.$router.push({ name: 'user', params: { id: user.id } })
      }
    },
    confirmDeleteUser(user) {
      this.$swal({
        title: this.$t('users.confirm.deleteTitle'),
        text: this.$t('users.confirm.deleteText', { user: user.fullName || user.name || user.email }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('users.confirm.yes'),
        cancelButtonText: this.$t('users.confirm.cancel')
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteUser(user.id)
        }
      })
    },
    deleteUser() {
      toast.info(this.$t('users.toast.deleteApiNotImplemented'))
    },
    rerenderTable() {
      this.$nextTick(() => {
        if (this.$refs.usersTable && this.$refs.usersTable.dt) {
          this.$refs.usersTable.dt.draw()
        }
      })
    },
    getUserRole(row) {
      if (row.expert) return 'expert'
      else if (row.branch) return 'branch'
      else return 'company'
    }
  },
  async mounted() {
    await this.getShareLinks()
    this.getUsers()
    this.getBranches()

    document.addEventListener('click', (event) => {
      const copyBtn = event.target.closest('.copy-link-btn')
      if (copyBtn) {
        const link = copyBtn.getAttribute('data-link')
        navigator.clipboard.writeText(link)
          .then(() => toast.success(this.$t('users.toast.linkCopied')))
          .catch(() => toast.error(this.$t('users.toast.linkCopyFailed')))
      }
      const editBtn = event.target.closest('.user-edit-btn')
      if (editBtn) {
        const id = editBtn.getAttribute('data-id')
        const user = this.userList.find(u => String(u.id) === String(id))
        if (user) this.openEditUser(user)
      }
      const deleteBtn = event.target.closest('.user-delete-btn')
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id')
        const user = this.userList.find(u => String(u.id) === String(id))
        if (user) this.confirmDeleteUser(user)
      }
      const permissionBtn = event.target.closest('.user-permission-btn')
      if (permissionBtn) {
        this.permissionUserId = permissionBtn.getAttribute('data-id')
      }
    })
  },
  components: {
    UserPermissionView,
    AppBreadcrumb,
    ModalComponent,
    DataTable
  }
}
</script>