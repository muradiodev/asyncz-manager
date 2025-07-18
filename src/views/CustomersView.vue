<template>
  <CCard class="mb-4 border-0 rounded-0">
    <CCardBody>
      <CContainer class="px-4" lg>
        <div class="mb-4">
          <AppBreadcrumb
            :breadcrumbs="[
              { name: 'Dashboard', path: '/dashboard', active: false },
              { name: 'Procedures', path: '/dashboard/customers', active: true }
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
                   :data="customerList"
                   ref="proceduresTable" />
      </CCardBody>
    </CCard>
  </CContainer>

  <!-- CREATE / VIRE MODAL -->
  <ModalComponent
    :title="'View Appointments'"
    size="md"
    v-if="addNewItem"
    @modalClose="closeModal"
  >

    <div>
      <h5 class="mb-3">Appointments</h5>
      <div class="table-responsive">
        <table class="table table-bordered table-striped table-sm">
          <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Procedure</th>
            <th>Expert</th>
            <th>Start Time</th>
            <th>Length</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(appt, index) in appointments" :key="appt.id">
            <td>{{ index + 1 }}</td>
            <td>{{ appt.procedure?.name }}</td>
            <td>{{ appt.expert?.name }}</td>
            <td>{{ appt.reservation_start_time }}</td>
            <td>{{ appt.reservation_length }} min</td>
            <td>{{ appt.status }}</td>
            <td>{{ appt.notes }}</td>
          </tr>
          <tr v-if="appointments.length === 0">
            <td colspan="7" class="text-center text-muted">No appointments found.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="text-center mt-4">
        <button class="btn btn-secondary fw-bold px-5" @click="closeModal">Close</button>
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
  name: 'ProceduresView',
  data() {
    return {
      addNewItem: false,
      isEditing: false,
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
      this.newItemDetails = {   id: null,
        name: '',
        length: '',
        expert: '',
        status: '',
        startTime: '',
        notes: '' }
    },

    rerenderTable() {
      this.$nextTick(() => {
        if (this.$refs.proceduresTable && this.$refs.proceduresTable.dt) {
          this.$refs.proceduresTable.dt.draw()
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


        getCustomerDetails(
          this.token,
          customer.name,
          customer.surname,
          customer.email,
          customer.phone
        ).then((response) => {
          this.appointments = response || []
          this.addNewItem = true
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
