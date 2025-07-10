<template>
  <div class="dashboard-home container-fluid py-4">
    <!-- Greeting -->
    <div class="row mb-4">
      <div class="col">
        <h2 class="fw-bold">
          Welcome back, <span class="username-highlight">{{ username }}!</span>
        </h2>
      </div>
    </div>

    <!-- Date Filter Section -->
    <div class="row mb-4">
      <div class="col">
        <div class="card shadow-sm">
          <div class="card-body py-3">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <div class="fw-semibold">Filter by Date Range:</div>

              <!-- Quick Range Buttons -->
              <div class="d-flex flex-wrap gap-2">
                <button
                  class="btn-outline-primary-custom"
                  v-for="range in quickRanges"
                  :key="range.value"
                  :class="{ 'btn-primary': selectedQuickRange === range.value, 'btn-outline-secondary': selectedQuickRange !== range.value }"
                  @click="selectQuickRange(range.value)">
                  {{ range.label }}
                </button>
              </div>

              <!-- Custom Date Range -->
              <div class="d-flex align-items-center gap-2">
                <label class="small text-muted mb-0">From:</label>
                <input
                  type="date"
                  class="form-control form-control-sm date-input"
                  v-model="customDateRange.start"
                  @change="onCustomDateChange"
                  :max="today">

                <label class="small text-muted mb-0">To:</label>
                <input
                  type="date"
                  class="form-control form-control-sm date-input"
                  v-model="customDateRange.end"
                  @change="onCustomDateChange"
                  :max="today"
                  :min="customDateRange.start">
              </div>

              <!-- Apply/Reset Buttons -->
              <div class="d-flex gap-2">
                <button class="btn-success-custom" @click="applyDateFilter">
                  <i class="bi bi-check-circle me-1"></i>Apply
                </button>
                <button class="btn-outline-danger-custom" @click="resetDateFilter">
                  <i class="bi bi-arrow-clockwise me-1"></i>Reset
                </button>
              </div>
            </div>

            <!-- Current Filter Display -->
            <div class="mt-2 small text-muted">
              <strong>Current Filter:</strong> {{ currentFilterText }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main row: Appointments Chart + Upcoming Appointments -->
    <div class="row g-4 mb-3">
      <!-- Appointments Chart -->
      <div class="col-lg-8">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex flex-wrap align-items-center justify-content-between mb-2">
              <div>
                <div class="fw-semibold mb-0" style="font-size: 1.1rem;">Appointments Overview</div>
                <div class="small text-muted">{{ currentFilterText }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" v-for="range in ranges" :key="range.value"
                        :class="{ 'btn-primary text-white': activeRange === range.value }"
                        @click="setActiveRange(range.value)">
                  {{ range.label }}
                </button>
                <button class="btn btn-light btn-sm ms-1" title="Show Chart Type" @click="toggleChartType">
                  <i :class="chartType === 'line' ? 'bi bi-bar-chart-fill' : 'bi bi-graph-up'"></i>
                </button>
              </div>
            </div>
            <div class="d-flex flex-wrap mb-2 gap-3">
              <div>
                <span class="display-6 fw-bold">{{ filteredTotalAppointments }}</span>
              </div>
              <div class="small text-muted">
                Total appointments<br>
                Average per period: {{ filteredAvgAppointments }}
              </div>
            </div>
            <!-- Chart -->
            <canvas id="appointmentsChart" height="120"></canvas>
            <div class="d-flex gap-4 mt-3 small text-muted">
              <div><span class="legend-dot appts"></span>Appointments</div>
              <div><span class="legend-dot completed"></span>Completed</div>
              <div><span class="legend-dot cancelled"></span>Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="col-lg-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="fw-semibold mb-0" style="font-size: 1.1rem;">Upcoming Appointments</div>
            <div class="small text-muted mb-2">Next 7 days (booked & confirmed only)</div>
            <div class="display-6 fw-bold mb-2">{{ filteredUpcomingAppointments.length }} total</div>
            <div v-if="filteredUpcomingAppointments.length">
              <div v-for="(appt, idx) in filteredUpcomingAppointments" :key="appt.id" class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div class="fw-semibold">{{ appt.service }}</div>
                  <div class="small text-muted">{{ formatDate(appt.date) }}<br>{{ appt.duration }} min</div>
                  <span class="badge" :class="getStatusBadgeClass(appt.status)">{{ appt.status }}</span>
                </div>
                <div class="fw-bold">{{ appt.price ? appt.price : '' }}</div>
              </div>
            </div>
            <div v-else class="text-muted small">No upcoming appointments</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom row: Top Services & Top Experts -->
    <div class="row g-4">
      <!-- Top Services -->
      <div class="col-lg-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="fw-semibold mb-0" style="font-size: 1.1rem;">
              Top Services
              <i class="bi bi-info-circle ms-1" title="Most booked services in selected period"></i>
            </div>
            <div class="small text-muted mb-2">Most booked services ({{ currentFilterText }})</div>
            <div v-if="filteredTopServices.length">
              <table class="table table-sm mb-0">
                <thead>
                <tr>
                  <th>Service</th>
                  <th>Bookings</th>
                  <th>Completion</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="svc in filteredTopServices" :key="svc.name">
                  <td>{{ svc.name }}</td>
                  <td>{{ svc.bookings }}</td>
                  <td>
                    <span class="badge" :class="svc.completion >= 90 ? 'bg-success' : svc.completion >= 70 ? 'bg-warning' : 'bg-danger'">
                      {{ svc.completion }}%
                    </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-muted small">No data available for selected period.</div>
          </div>
        </div>
      </div>

      <!-- Top Experts -->
      <div class="col-lg-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="fw-semibold mb-0" style="font-size: 1.1rem;">
              Top Experts
              <i class="bi bi-info-circle ms-1" title="Experts by total appointments in selected period"></i>
            </div>
            <div class="small text-muted mb-2">Experts by total appointments ({{ currentFilterText }})</div>
            <div v-if="filteredTopExperts.length">
              <table class="table table-sm mb-0">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Appointments</th>
                  <th>Rating</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="expert in filteredTopExperts" :key="expert.name">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-2">{{ expert.name.charAt(0) }}</div>
                      {{ expert.name }}
                    </div>
                  </td>
                  <td>{{ expert.appointments }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-star-fill text-warning me-1"></i>
                      {{ expert.rating }}
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-muted small">No data available for selected period.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'DashboardHome',
  data() {
    return {
      username: 'User',

      // Date filtering
      selectedQuickRange: '3m',
      customDateRange: {
        start: '',
        end: ''
      },
      currentDateRange: {
        start: null,
        end: null
      },

      quickRanges: [
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'Last 3 Months', value: '3m' },
        { label: 'Last 6 Months', value: '6m' },
        { label: 'Last Year', value: '1y' },
        { label: 'All Time', value: 'all' }
      ],

      ranges: [
        { label: '7D', value: '7d' },
        { label: '2W', value: '2w' },
        { label: '4W', value: '4w' },
        { label: '3M', value: '3m' },
        { label: '1Y', value: '1y' }
      ],
      activeRange: '1y',
      chartType: 'line',

      // Dummy data - this will be replaced with API calls
      allAppointmentsData: [
        { date: '2024-01-15', appointments: 5, completed: 4, cancelled: 1 },
        { date: '2024-02-15', appointments: 8, completed: 7, cancelled: 1 },
        { date: '2024-03-15', appointments: 12, completed: 10, cancelled: 2 },
        { date: '2024-04-15', appointments: 15, completed: 13, cancelled: 2 },
        { date: '2024-05-15', appointments: 18, completed: 16, cancelled: 2 },
        { date: '2024-06-15', appointments: 22, completed: 20, cancelled: 2 },
        { date: '2024-07-15', appointments: 25, completed: 22, cancelled: 3 },
        { date: '2024-08-15', appointments: 20, completed: 18, cancelled: 2 },
        { date: '2024-09-15', appointments: 24, completed: 22, cancelled: 2 },
        { date: '2024-10-15', appointments: 28, completed: 25, cancelled: 3 },
        { date: '2024-11-15', appointments: 30, completed: 27, cancelled: 3 },
        { date: '2024-12-15', appointments: 35, completed: 32, cancelled: 3 },
      ],

      allUpcomingAppointments: [
        {
          id: 1,
          service: 'Consultation',
          date: '2024-12-20',
          duration: 30,
          status: 'Booked',
          price: '$120'
        },
        {
          id: 2,
          service: 'Therapy Session',
          date: '2024-12-21',
          duration: 60,
          status: 'Confirmed',
          price: '$200'
        },
        {
          id: 3,
          service: 'Follow-up',
          date: '2024-12-22',
          duration: 20,
          status: 'Booked',
          price: '$80'
        },
        {
          id: 4,
          service: 'Assessment',
          date: '2024-12-23',
          duration: 45,
          status: 'Confirmed',
          price: '$150'
        }
      ],

      allTopServices: [
        { name: 'Consultation', bookings: 45, completion: 95, revenue: 5400, dateRange: '2024-01-01' },
        { name: 'Therapy Session', bookings: 38, completion: 92, revenue: 7600, dateRange: '2024-01-01' },
        { name: 'Assessment', bookings: 25, completion: 88, revenue: 3750, dateRange: '2024-01-01' },
        { name: 'Follow-up', bookings: 32, completion: 97, revenue: 2560, dateRange: '2024-01-01' },
        { name: 'Group Session', bookings: 18, completion: 85, revenue: 1800, dateRange: '2024-01-01' }
      ],

      allTopExperts: [
        { name: 'Dr. Murad', appointments: 65, rating: 4.9, revenue: 13000, dateRange: '2024-01-01' },
        { name: 'Dr. Sarah', appointments: 52, rating: 4.8, revenue: 10400, dateRange: '2024-01-01' },
        { name: 'Dr. Ahmed', appointments: 48, rating: 4.7, revenue: 9600, dateRange: '2024-01-01' },
        { name: 'Dr. Lisa', appointments: 41, rating: 4.8, revenue: 8200, dateRange: '2024-01-01' },
        { name: 'Deviofy', appointments: 35, rating: 4.6, revenue: 7000, dateRange: '2024-01-01' }
      ],

      chart: null
    }
  },

  computed: {
    today() {
      return new Date().toISOString().split('T')[0]
    },

    currentFilterText() {
      if (!this.currentDateRange.start || !this.currentDateRange.end) {
        return 'All time'
      }

      const start = this.formatDate(this.currentDateRange.start)
      const end = this.formatDate(this.currentDateRange.end)
      return `${start} - ${end}`
    },

    filteredAppointmentsData() {
      if (!this.currentDateRange.start || !this.currentDateRange.end) {
        return this.allAppointmentsData
      }

      return this.allAppointmentsData.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= this.currentDateRange.start && itemDate <= this.currentDateRange.end
      })
    },

    filteredTotalAppointments() {
      return this.filteredAppointmentsData.reduce((sum, item) => sum + item.appointments, 0)
    },

    filteredAvgAppointments() {
      if (this.filteredAppointmentsData.length === 0) return 0
      return Math.round(this.filteredTotalAppointments / this.filteredAppointmentsData.length)
    },

    filteredUpcomingAppointments() {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      return this.allUpcomingAppointments.filter(appt => {
        const apptDate = new Date(appt.date)
        return apptDate >= today && apptDate <= nextWeek
      })
    },

    filteredTopServices() {
      // In real implementation, this would filter based on date range
      return this.allTopServices.slice(0, 5)
    },

    filteredTopExperts() {
      // In real implementation, this would filter based on date range
      return this.allTopExperts.slice(0, 5)
    }
  },

  mounted() {
    this.initializeDateRange()
    this.renderChart()
  },

  methods: {
    initializeDateRange() {
      // Set default to last 3 months
      this.selectQuickRange('3m')
    },

    selectQuickRange(range) {
      this.selectedQuickRange = range
      const end = new Date()
      let start = new Date()

      switch(range) {
        case '7d':
          start.setDate(end.getDate() - 7)
          break
        case '30d':
          start.setDate(end.getDate() - 30)
          break
        case '3m':
          start.setMonth(end.getMonth() - 3)
          break
        case '6m':
          start.setMonth(end.getMonth() - 6)
          break
        case '1y':
          start.setFullYear(end.getFullYear() - 1)
          break
        case 'all':
          start = null
          break
      }

      if (start) {
        this.customDateRange.start = start.toISOString().split('T')[0]
        this.customDateRange.end = end.toISOString().split('T')[0]
        this.currentDateRange.start = start
        this.currentDateRange.end = end
      } else {
        this.customDateRange.start = ''
        this.customDateRange.end = ''
        this.currentDateRange.start = null
        this.currentDateRange.end = null
      }

      this.updateChart()
    },

    onCustomDateChange() {
      this.selectedQuickRange = null // Clear quick range selection
      if (this.customDateRange.start && this.customDateRange.end) {
        this.currentDateRange.start = new Date(this.customDateRange.start)
        this.currentDateRange.end = new Date(this.customDateRange.end)
        this.updateChart()
      }
    },

    applyDateFilter() {
      if (this.customDateRange.start && this.customDateRange.end) {
        this.currentDateRange.start = new Date(this.customDateRange.start)
        this.currentDateRange.end = new Date(this.customDateRange.end)
        this.updateChart()

        // Show success message (you can use a toast library)
        console.log('Date filter applied successfully')
      }
    },

    resetDateFilter() {
      this.selectedQuickRange = 'all'
      this.customDateRange.start = ''
      this.customDateRange.end = ''
      this.currentDateRange.start = null
      this.currentDateRange.end = null
      this.updateChart()
    },

    setActiveRange(range) {
      this.activeRange = range
      this.updateChart()
    },

    toggleChartType() {
      this.chartType = this.chartType === 'line' ? 'bar' : 'line'
      this.updateChart()
    },

    renderChart() {
      const ctx = document.getElementById('appointmentsChart').getContext('2d')

      const chartData = this.getChartData()

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Total Appointments',
              data: chartData.appointments,
              borderColor: '#31A9FF',
              backgroundColor: this.chartType === 'line' ? 'rgba(49,169,255,0.08)' : 'rgba(49,169,255,0.8)',
              pointRadius: 4,
              tension: 0.35,
              fill: this.chartType === 'line'
            },
            {
              label: 'Completed',
              data: chartData.completed,
              borderColor: '#10B981',
              backgroundColor: this.chartType === 'line' ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.8)',
              pointRadius: 4,
              tension: 0.35,
              fill: this.chartType === 'line'
            },
            {
              label: 'Cancelled',
              data: chartData.cancelled,
              borderColor: '#EF4444',
              backgroundColor: this.chartType === 'line' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.8)',
              pointRadius: 4,
              tension: 0.35,
              fill: this.chartType === 'line'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              precision: 0
            }
          }
        }
      })
    },

    updateChart() {
      if (this.chart) {
        const chartData = this.getChartData()
        this.chart.data.labels = chartData.labels
        this.chart.data.datasets[0].data = chartData.appointments
        this.chart.data.datasets[1].data = chartData.completed
        this.chart.data.datasets[2].data = chartData.cancelled

        // Update chart type if changed
        if (this.chart.config.type !== this.chartType) {
          this.chart.destroy()
          this.renderChart()
          return
        }

        this.chart.update()
      }
    },

    getChartData() {
      const filteredData = this.filteredAppointmentsData

      // Group data based on active range
      let groupedData = []

      if (this.activeRange === '7d' || this.activeRange === '2w') {
        // Daily grouping
        groupedData = filteredData.map(item => ({
          label: this.formatDate(item.date, 'short'),
          appointments: item.appointments,
          completed: item.completed,
          cancelled: item.cancelled
        }))
      } else {
        // Monthly grouping (default)
        groupedData = filteredData.map(item => ({
          label: this.formatDate(item.date, 'month'),
          appointments: item.appointments,
          completed: item.completed,
          cancelled: item.cancelled
        }))
      }

      return {
        labels: groupedData.map(item => item.label),
        appointments: groupedData.map(item => item.appointments),
        completed: groupedData.map(item => item.completed),
        cancelled: groupedData.map(item => item.cancelled)
      }
    },

    formatDate(date, format = 'default') {
      const d = new Date(date)

      switch(format) {
        case 'short':
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        case 'month':
          return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        default:
          return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
      }
    },

    getStatusBadgeClass(status) {
      const classes = {
        'Booked': 'bg-primary text-white',
        'Confirmed': 'bg-success text-white',
        'Pending': 'bg-warning text-dark',
        'Cancelled': 'bg-danger text-white',
        'Completed': 'bg-info text-white'
      }
      return classes[status] || 'bg-secondary text-white'
    }
  }
}
</script>

<style scoped>
.dashboard-home {
  font-family: 'Inter', 'Roboto', 'Segoe UI', Arial, sans-serif;
}

.username-highlight {
  color: var(--primary);
}

.card {
  border-radius: 18px;
  border: none;
}

.date-input {
  width: 140px;
  border-radius: 6px;
}

.legend-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: -2px;
}

.legend-dot.appts {
  background: #31A9FF;
}

.legend-dot.completed {
  background: #10B981;
}

.legend-dot.cancelled {
  background: #EF4444;
}

.btn-outline-secondary, .btn-light {
  border-radius: 8px;
}

.display-6 {
  font-size: 2.3rem;
}

.table thead th {
  font-size: 1em;
  font-weight: 500;
  border-top: none;
  border-bottom: 1px solid #e3e6ef;
}

.table tbody td {
  vertical-align: middle;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

@media (max-width: 991px) {
  .card {
    margin-bottom: 20px;
  }

  .date-input {
    width: 120px;
  }

  .d-flex.gap-3 {
    gap: 1rem !important;
  }
}

@media (max-width: 768px) {
  .d-flex.flex-wrap.gap-3 {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .date-input {
    width: 100%;
    max-width: 150px;
  }
}
</style>
