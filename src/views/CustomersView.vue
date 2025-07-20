<template>
  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb
            :breadcrumbs="[
              { name: 'Dashboard', path: '/dashboard', active: false },
              { name: 'Customers', path: '/dashboard/customers', active: true }
            ]"
          />
        </div>
        <div class="d-flex align-items-center justify-content-between w-100">
          <span class="h2 mb-0"> Customers</span>
        </div>
      </CContainer>
    </CCardBody>
  </CCard>

  <CContainer class="px-4" lg>
    <CCard class="mb-4">
      <CCardBody>
        <DataTable class="table table-sm table-hover"
                   :columns="columns"
                   :data="customerList"
                   ref="customersTable" />
      </CCardBody>
    </CCard>
  </CContainer>

  <!-- IMPROVED VIEW MODAL -->
  <ModalComponent
    :title="'Customer Details'"
    size="xl"
    v-if="addNewItem"
    @modalClose="closeModal"
  >
    <div class="p-2">
      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-secondary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Loading customer appointments...</p>
      </div>

      <!-- Content (shown when not loading) -->
      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <span class="badge bg-success">Total: {{ appointments.length }}</span>
        </div>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
            <tr>
              <th scope="col" class="text-center">#</th>
              <th scope="col">Service</th>
              <th scope="col">Expert</th>
              <th scope="col">Start Time</th>
              <th scope="col">Length</th>
              <th scope="col">Status</th>
              <th scope="col">Notes</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(appt, index) in appointments" :key="appt.id">
              <td class="text-center fw-bold">{{ index + 1 }}</td>
              <td>{{ appt.procedure?.name || '-' }}</td>
              <td>{{ appt.expert?.name || '-' }}</td>
              <td>{{ appt.reservation_start_time || '-' }}</td>
              <td>{{ appt.reservation_length }} min</td>
              <td>
                  <span :class="getStatusBadgeClass(appt.status)">
                    {{ appt.status }}
                  </span>
              </td>
              <td>{{ appt.notes || '-' }}</td>
            </tr>
            <tr v-if="appointments.length === 0">
              <td colspan="7" class="text-center py-4">
                <i class="fas fa-calendar-times text-muted me-2"></i>
                <span class="text-muted">No appointments found for this customer.</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-light px-4" @click="closeModal">
            <i class="fas fa-times me-2"></i> Close
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
      isLoading: false, // Added loading state
      appointments: [],
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
    ...mapState(useAuthStore, ['token', 'user'])
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
      this.isLoading = false // Reset loading state when closing
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
    }
  },
  mounted() {
    // this.getItemList()
    this.getCustomerList();
    // Attach edit and delete button handlers after DOM update
    document.addEventListener('click', (event) => {
      const viewBtn = event.target.closest('.view-btn')
      if (viewBtn) {
        const index = viewBtn.getAttribute('data-index')
        const customer = this.customerList[index] // ✅ Get the actual object

        // Optional: fill modal form for editing
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
        this.isLoading = true // Set loading to true before API call

        getCustomerDetails(
          this.token,
          customer.name,
          customer.surname,
          customer.email,
          customer.phone
        ).then((response) => {
          this.appointments = response || []
          this.isLoading = false // Set loading to false after API response
        })
          .catch(error => {
            console.error('Error fetching customer details:', error)
            this.isLoading = false // Make sure to set loading to false even on error
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
