<template>
  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb
            :breadcrumbs="[
              { name: $t('general.dashboard'), path: '/dashboard', active: false },
              { name: $t('navigation.customers'), path: '/dashboard/customers', active: true }
            ]"
          />
        </div>
        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0">{{ $t('customers.title') }}</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4" lg>
    <CCard class="mb-4">
      <CCardBody>
        <DataTable
          class="table table-sm table-hover"
          :columns="columns"
          :data="customerList"
          ref="customersTable"
        />
      </CCardBody>
    </CCard>
  </CContainer>

  <!-- VIEW MODAL -->
  <ModalComponent
    :title="$t('customers.modal.title')"
    size="xl"
    v-if="addNewItem"
    @modalClose="closeModal"
  >
    <div class="p-2">
      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-secondary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">{{ $t('customers.modal.loadingTitle') }}</span>
        </div>
        <p class="text-muted">{{ $t('customers.modal.loadingAppointments') }}</p>
      </div>

      <!-- Content -->
      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <span class="badge bg-success">
            {{ $t('customers.modal.total', { count: appointments.length }) }}
          </span>

          <!-- Items per page selector -->
          <div class="d-flex align-items-center">
            <label class="me-2 mb-0">{{ $t('customers.modal.itemsPerPage') }}:</label>
            <select v-model="itemsPerPage" @change="currentPage = 1" class="form-select form-select-sm" style="width: auto;">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
            <tr>
              <th scope="col" class="text-center">{{ $t('customers.modal.columns.index') }}</th>
              <th scope="col">{{ $t('customers.modal.columns.name') }}</th>
              <th scope="col">{{ $t('customers.modal.columns.surname') }}</th>
              <th scope="col">{{ $t('customers.modal.columns.phone') }}</th>
              <th scope="col">{{ $t('customers.modal.columns.service') }}</th>
              <th scope="col">{{ $t('customers.modal.columns.expert') }}</th>
              <th scope="col">{{ $t('customers.modal.columns.startTime') }}</th>
              <th scope="col">{{ $t('customers.modal.columns.length') }}</th>
              <th scope="col">{{ $t('customers.modal.columns.status') }}</th>
<!--              <th scope="col">{{ $t('customers.modal.columns.notes') }}</th>-->
            </tr>
            </thead>
            <tbody>
            <tr v-for="(appt, index) in paginatedAppointments" :key="appt.id">
              <td class="text-center fw-bold">{{ getGlobalIndex(index) }}</td>
              <td>{{ appt.customer?.name || '-' }}</td>
              <td>{{ appt.customer?.surname || '-' }}</td>
              <td>{{ appt.customer?.phone || '-' }}</td>
              <td>{{ appt.procedure?.name || '-' }}</td>
              <td>{{ appt.expert?.name || '-' }}</td>
              <td>{{ appt.reservation_start_time || '-' }}</td>
              <td>{{ appt.reservation_length }} {{ $t('customers.modal.lengthUnit') }}</td>
              <td>
                  <span :class="getStatusBadgeClass(appt.status)">
                    {{ appt.status }}
                  </span>
              </td>
<!--              <td>{{ appt.notes || '-' }}</td>-->
            </tr>
            <tr v-if="appointments.length === 0">
              <td colspan="9" class="text-center py-4">
                <i class="fas fa-calendar-times text-muted me-2" aria-hidden="true"></i>
                <span class="text-muted">{{ $t('customers.table.empty.iconLabel') }}</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
          <div class="text-muted">
            {{ $t('', {
            start: startItem,
            end: endItem,
            total: appointments.length
          }) }}
          </div>

          <nav aria-label="Appointments pagination">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                  <i class="fas fa-angle-left"></i>
                </button>
              </li>

              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="goToPage(page)">{{ page }}</button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                  <i class="fas fa-angle-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-light px-4" @click="closeModal">
            <i class="fas fa-times me-2"></i> {{ $t('customers.modal.close') }}
          </button>
        </div>
      </div>
    </div>
  </ModalComponent>
</template>

<script>
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
import DataTablesLib from 'datatables.net-bs5'
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import ModalComponent from '@/components/ModalComponent.vue'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { getCustomerDetails, getCustomerList } from '@/repositories/CustomersRepository.js'

DataTable.use(DataTablesLib)
DataTable.use(DataTablesCore)

export default {
  name: 'CustomersView',
  data() {
    return {
      addNewItem: false,
      isEditing: false,
      isLoading: false,
      appointments: [],
      // Pagination data
      currentPage: 1,
      itemsPerPage: 10,
      newItemDetails: {
        id: null,
        name: '',
        length: '',
        expert: '',
        status: '',
        startTime: '',
        notes: ''
      },
      customerList: [],
      columns: [
        {
          title: '#',
          orderable: false,
          data: null,
          render: (data, type, row, meta) => {
            return meta.row + 1;
          }
        },
        { title: 'Name', data: 'name', orderable: true },
        { title: 'Surname', data: 'surname', orderable: true },
        { title: 'Email', data: 'email', orderable: true },
        {
          title: 'Actions',
          orderable: false,
          data: null,
          render: (data, type, row, meta) => {
            return `
              <button class="btn btn-outline-warning btn-sm view-btn" data-index="${meta.row}" style="padding:4px 8px; margin-right:3px;">
                <i class="fas fa-eye"></i>
              </button>
            `
          }
        }
      ]
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user']),

    totalPages() {
      return Math.ceil(this.appointments.length / this.itemsPerPage)
    },

    paginatedAppointments() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.appointments.slice(start, end)
    },

    startItem() {
      return this.appointments.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1
    },

    endItem() {
      const end = this.currentPage * this.itemsPerPage
      return end > this.appointments.length ? this.appointments.length : end
    },

    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    }
  },
  methods: {
    getCustomerList() {
      getCustomerList(this.token).then((response) => {
        this.customerList = response;
        this.rerenderTable();
      })
    },

    closeModal() {
      this.addNewItem = false
      this.isEditing = false
      this.isLoading = false
      this.currentPage = 1 // Reset pagination
      this.itemsPerPage = 10 // Reset items per page
      this.appointments = [] // Clear appointments
      this.newItemDetails = {
        id: null,
        name: '',
        length: '',
        expert: '',
        status: '',
        startTime: '',
        notes: ''
      }
    },

    getStatusBadgeClass(status) {
      switch(status?.toLowerCase()) {
        case 'confirmed':
          return 'badge bg-success';
        case 'cancelled_expert':
          return 'badge bg-danger';
        case 'cancelled':
          return 'badge bg-danger';
        case 'new':
          return 'badge bg-info';
        default:
          return 'badge bg-secondary';
      }
    },

    rerenderTable() {
      this.$nextTick(() => {
        if (this.$refs.customersTable && this.$refs.customersTable.dt) {
          this.$refs.customersTable.dt.draw()
        }
      })
    },

    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    getGlobalIndex(localIndex) {
      return (this.currentPage - 1) * this.itemsPerPage + localIndex + 1
    }
  },

  mounted() {
    this.getCustomerList();

    document.addEventListener('click', (event) => {
      const viewBtn = event.target.closest('.view-btn')
      if (viewBtn) {
        const index = viewBtn.getAttribute('data-index')
        const customer = this.customerList[index]

        this.newItemDetails = {
          id: null,
          name: '',
          length: '',
          expert: '',
          status: '',
          startTime: '',
          notes: ''
        }

        this.isEditing = true
        this.addNewItem = true
        this.isLoading = true
        this.currentPage = 1 // Reset to first page when opening modal

        getCustomerDetails(this.token, customer.email)
          .then((response) => {
            this.appointments = response || []
            this.isLoading = false
          })
          .catch(error => {
            console.error('Error fetching customer details:', error)
            this.isLoading = false
          })
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
