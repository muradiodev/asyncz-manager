<template>
  <div class="dashboard-home container-fluid py-4">
    <div v-if="isLoading" class="loading-overlay-center">
      <div class="d-flex flex-column align-items-center justify-content-center">
        <div class="spinner-border text-secondary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Loading dashboard data...</p>
      </div>
    </div>


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
                  :class="{ 'btn btn-primary': selectedQuickRange === range.value, 'btn btn-outline-secondary': selectedQuickRange !== range.value }"
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
                <button class="btn-outline-success-custom btn-sm" @click="applyDateFilter" :disabled="isLoading">
                  <i class="bi bi-check-circle me-1"></i>Apply
                </button>
                <button class="btn-outline-danger-custom btn-sm" @click="resetDateFilter" :disabled="isLoading">
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

    <!-- Quick Stats Row -->
    <div class="row g-4 mb-4">
      <div class="col-lg-3 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <div class="display-6 fw-bold text-primary">{{ quickStats.today_appointments || 0 }}</div>
            <div class="small text-muted">Today's Appointments</div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <div class="display-6 fw-bold text-success">{{ quickStats.month_appointments || 0 }}</div>
            <div class="small text-muted">This Month</div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <div class="display-6 fw-bold text-info">{{ quickStats.active_experts || 0 }}</div>
            <div class="small text-muted">Active Experts</div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <div class="display-6 fw-bold text-warning">{{ quickStats.active_procedures || 0 }}</div>
            <div class="small text-muted">Active Services</div>
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
                <button class="btn btn-sm btn-outline-secondary" v-for="range in chartRanges" :key="range.value"
                        :class="{ 'btn-primary text-white': activeChartRange === range.value }"
                        @click="setActiveChartRange(range.value)">
                  {{ range.label }}
                </button>
                <button class="btn btn-light btn-sm ms-1" title="Toggle Chart Type" @click="toggleChartType">
                  <i :class="chartType === 'line' ? 'bi bi-bar-chart-fill' : 'bi bi-graph-up'"></i>
                </button>
              </div>
            </div>
            <div class="d-flex flex-wrap mb-2 gap-3">
              <div>
                <span class="display-6 fw-bold">{{ dashboardSummary.total_appointments || 0 }}</span>
              </div>
              <div class="small text-muted">
                Total appointments<br>
                Completion rate: {{ dashboardSummary.completion_rate || 0 }}%
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
            <div class="display-6 fw-bold mb-2">{{ upcomingAppointments.length }} total</div>
            <div v-if="upcomingAppointments.length" class="upcoming-appointments-list">
              <div v-for="(appt, idx) in upcomingAppointments.slice(0, 5)" :key="appt.id" class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div class="fw-semibold">{{ appt.service }}</div>
                  <div class="small text-muted">{{ formatDate(appt.date) }} at {{ appt.time }}<br>{{ appt.duration }} min</div>
                  <span class="badge" :class="getStatusBadgeClass(appt.status)">{{ appt.status }}</span>
                </div>
                <div class="fw-bold">{{ appt.price || '' }}</div>
              </div>
              <div v-if="upcomingAppointments.length > 5" class="text-center mt-3">
                <small class="text-muted">+{{ upcomingAppointments.length - 5 }} more appointments</small>
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
            <div v-if="topServices.length">
              <table class="table table-sm mb-0">
                <thead>
                <tr>
                  <th>Services</th>
                  <th>Bookings</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="svc in topServices" :key="svc.name">
                  <td>{{ svc.name }}</td>
                  <td>{{ svc.bookings }}</td>
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
            <div v-if="topExperts.length">
              <table class="table table-sm mb-0">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Appointments</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="expert in topExperts" :key="expert.name">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-2">{{ expert.name.charAt(0) }}</div>
                      {{ expert.name }}
                    </div>
                  </td>
                  <td>{{ expert.appointments }}</td>
                </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-muted small">No data available for selected period.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <CContainer v-if="errorMessage && !isLoading" class="px-4" lg>
      <CAlert color="danger" :visible="true">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-3" @click="retryLoad">
          <i class="fas fa-redo me-1"></i> Retry
        </button>
      </CAlert>
    </CContainer>
  </div>
</template>

<<script>
import Chart from 'chart.js/auto'
import {
  getDashboardData,
  getQuickStats,
  getAppointmentsChart,
  getUpcomingAppointments,
  getTopServices,
  getTopExperts
} from '@/repositories/DashboardRepository'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.js'

export default {
  name: 'DashboardHome',
  data() {
    return {
      username: 'User',
      isLoading: false,
      errorMessage: '',

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
        { label: '7 Days', value: '7d' },
        { label: '30 Days', value: '30d' },
        { label: '3 Months', value: '3m' },
        { label: '6 Months', value: '6m' },
        { label: 'Last Year', value: '1y' },
        { label: 'All Time', value: 'all' }
      ],

      chartRanges: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' }
      ],
      activeChartRange: 'month',
      chartType: 'line',

      // API Data
      dashboardData: {},
      quickStats: {},
      chartData: [],
      upcomingAppointments: [],
      topServices: [],
      topExperts: [],
      dashboardSummary: {},

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

      const startStr = this.formatDateForAPI(this.currentDateRange.start)
      if (startStr === '2023-01-01') {
        return 'All time (from Jan 2023)'
      }

      const start = this.formatDate(this.currentDateRange.start)
      const end = this.formatDate(this.currentDateRange.end)
      return `${start} - ${end}`
    },

    ...mapState(useAuthStore, ['user', 'token']),
  },

  async mounted() {
    this.initializeDateRange()
    await this.loadInitialData()
  },

  methods: {
    async loadInitialData() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        await this.loadQuickStats()
        await this.loadDashboardData()
        await this.loadUpcomingAppointments()

        this.$nextTick(() => {
          this.renderChart()
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        this.errorMessage = 'Failed to load dashboard data. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    async loadQuickStats() {
      try {
        console.log('Loading quick stats with token:', this.token)
        const result = await getQuickStats(this.token)
        console.log('Quick stats result:', result)

        if (result && result.code === 200) {
          this.quickStats = {
            today_appointments: result.today_appointments || 0,
            month_appointments: result.month_appointments || 0,
            active_experts: result.active_experts || 0,
            active_procedures: result.active_procedures || 0
          }
        } else {
          console.error('Quick stats API error:', result)
        }
      } catch (error) {
        console.error('Error loading quick stats:', error)
      }
    },

    async loadDashboardData() {
      this.errorMessage = ''

      try {
        const startDate = this.currentDateRange.start ? this.formatDateForAPI(this.currentDateRange.start) : null
        const endDate = this.currentDateRange.end ? this.formatDateForAPI(this.currentDateRange.end) : null

        console.log('Loading dashboard data with dates:', startDate, endDate)
        const result = await getDashboardData(this.token, startDate, endDate)
        console.log('Dashboard result:', result)

        if (result && result.code === 200) {
          this.dashboardData = result
          this.dashboardSummary = result.summary || {
            total_appointments: 0,
            completed_appointments: 0,
            cancelled_appointments: 0,
            completion_rate: 0
          }
          this.username = result.company_name || 'User'

          await this.loadChartData()
          await this.loadTopServices()
          await this.loadTopExperts()
        } else {
          console.error('Dashboard API error:', result)
          this.errorMessage = result.message || 'Failed to load dashboard data'
          throw new Error(this.errorMessage)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        this.errorMessage = 'Failed to load dashboard data. Please try again.'
        throw error
      }
    },

    async loadChartData() {
      try {
        const startDate = this.currentDateRange.start ? this.formatDateForAPI(this.currentDateRange.start) : null
        const endDate = this.currentDateRange.end ? this.formatDateForAPI(this.currentDateRange.end) : null

        const result = await getAppointmentsChart(this.token, startDate, endDate, this.activeChartRange)
        console.log('Chart data result:', result)

        if (result && result.code === 200) {
          this.chartData = result.chart_data || []
        }
      } catch (error) {
        console.error('Error loading chart data:', error)
      }
    },

    async loadUpcomingAppointments() {
      try {
        const result = await getUpcomingAppointments(this.token, 7)
        console.log('Upcoming appointments result:', result)

        if (result && result.code === 200) {
          this.upcomingAppointments = result.upcoming_appointments || []
        }
      } catch (error) {
        console.error('Error loading upcoming appointments:', error)
      }
    },

    async loadTopServices() {
      try {
        const startDate = this.currentDateRange.start ? this.formatDateForAPI(this.currentDateRange.start) : null
        const endDate = this.currentDateRange.end ? this.formatDateForAPI(this.currentDateRange.end) : null

        const result = await getTopServices(this.token, startDate, endDate, 10)
        console.log('Top services result:', result)

        if (result && result.code === 200) {
          this.topServices = result.top_services || []
        }
      } catch (error) {
        console.error('Error loading top services:', error)
      }
    },

    async loadTopExperts() {
      try {
        const startDate = this.currentDateRange.start ? this.formatDateForAPI(this.currentDateRange.start) : null
        const endDate = this.currentDateRange.end ? this.formatDateForAPI(this.currentDateRange.end) : null

        const result = await getTopExperts(this.token, startDate, endDate, 10)
        console.log('Top experts result:', result)

        if (result && result.code === 200) {
          this.topExperts = result.top_experts || []
        }
      } catch (error) {
        console.error('Error loading top experts:', error)
      }
    },

    initializeDateRange() {
      this.selectQuickRange('3m')
    },

    async selectQuickRange(range) {
      this.isLoading = true
      this.errorMessage = ''
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
          start = new Date('2023-01-01')
          break
      }

      this.customDateRange.start = start.toISOString().split('T')[0]
      this.customDateRange.end = end.toISOString().split('T')[0]
      this.currentDateRange.start = start
      this.currentDateRange.end = end

      try {
        await this.loadDashboardData()
        this.$nextTick(() => {
          this.updateChart()
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        this.errorMessage = 'Failed to load dashboard data. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    onCustomDateChange() {
      this.selectedQuickRange = null
      if (this.customDateRange.start && this.customDateRange.end) {
        this.currentDateRange.start = new Date(this.customDateRange.start)
        this.currentDateRange.end = new Date(this.customDateRange.end)
      }
    },

    async applyDateFilter() {
      if (this.customDateRange.start && this.customDateRange.end) {
        this.isLoading = true
        this.errorMessage = ''

        try {
          this.currentDateRange.start = new Date(this.customDateRange.start)
          this.currentDateRange.end = new Date(this.customDateRange.end)
          await this.loadDashboardData()
          this.updateChart()
        } catch (error) {
          console.error('Error applying date filter:', error)
          this.errorMessage = 'Failed to apply date filter. Please try again.'
        } finally {
          this.isLoading = false
        }
      }
    },

    async resetDateFilter() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        this.selectedQuickRange = 'all'
        const end = new Date()
        const start = new Date('2023-01-01')

        this.customDateRange.start = start.toISOString().split('T')[0]
        this.customDateRange.end = end.toISOString().split('T')[0]
        this.currentDateRange.start = start
        this.currentDateRange.end = end

        await this.loadDashboardData()
        this.updateChart()
      } catch (error) {
        console.error('Error resetting date filter:', error)
        this.errorMessage = 'Failed to reset date filter. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    async setActiveChartRange(range) {
      this.isLoading = true
      this.errorMessage = ''

      try {
        this.activeChartRange = range
        await this.loadChartData()
        this.updateChart()
      } catch (error) {
        console.error('Error changing chart range:', error)
        this.errorMessage = 'Failed to update chart. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    async retryLoad() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        await this.loadDashboardData()
      } catch (error) {
        console.error('Retry failed:', error)
        this.errorMessage = 'Failed to load dashboard data. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    toggleChartType() {
      this.chartType = this.chartType === 'line' ? 'bar' : 'line'
      this.updateChart()
    },

    renderChart() {
      const ctx = document.getElementById('appointmentsChart')
      if (!ctx) return

      const chartCtx = ctx.getContext('2d')

      if (this.chart) {
        this.chart.destroy()
      }

      const processedData = this.getProcessedChartData()

      this.chart = new Chart(chartCtx, {
        type: this.chartType,
        data: {
          labels: processedData.labels,
          datasets: [
            {
              label: 'Total Appointments',
              data: processedData.appointments,
              borderColor: '#31A9FF',
              backgroundColor: this.chartType === 'line' ? 'rgba(49,169,255,0.08)' : 'rgba(49,169,255,0.8)',
              pointRadius: 4,
              tension: 0.35,
              fill: this.chartType === 'line'
            },
            {
              label: 'Completed',
              data: processedData.completed,
              borderColor: '#10B981',
              backgroundColor: this.chartType === 'line' ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.8)',
              pointRadius: 4,
              tension: 0.35,
              fill: this.chartType === 'line'
            },
            {
              label: 'Cancelled',
              data: processedData.cancelled,
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
              ticks: {
                precision: 0
              }
            }
          }
        }
      })
    },

    updateChart() {
      if (this.chart) {
        const processedData = this.getProcessedChartData()
        this.chart.data.labels = processedData.labels
        this.chart.data.datasets[0].data = processedData.appointments
        this.chart.data.datasets[1].data = processedData.completed
        this.chart.data.datasets[2].data = processedData.cancelled

        if (this.chart.config.type !== this.chartType) {
          this.chart.destroy()
          this.renderChart()
          return
        }

        this.chart.update()
      }
    },

    getProcessedChartData() {
      if (!this.chartData || !Array.isArray(this.chartData)) {
        return {
          labels: [],
          appointments: [],
          completed: [],
          cancelled: []
        }
      }

      return {
        labels: this.chartData.map(item => this.formatChartLabel(item.date)),
        appointments: this.chartData.map(item => item.appointments || 0),
        completed: this.chartData.map(item => item.completed || 0),
        cancelled: this.chartData.map(item => item.cancelled || 0)
      }
    },

    formatChartLabel(date) {
      const d = new Date(date)

      switch(this.activeChartRange) {
        case 'day':
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        case 'week':
          return `Week ${this.getWeekNumber(d)}`
        case 'month':
        default:
          return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }
    },

    getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
      return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
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

    formatDateForAPI(date) {
      if (!date) return null
      return new Date(date).toISOString().split('T')[0]
    },

    getStatusBadgeClass(status) {
      const classes = {
        'Booked': 'bg-primary text-white',
        'Confirmed': 'bg-success text-white',
        'Pending': 'bg-warning text-dark',
        'Cancelled': 'bg-danger text-white',
        'Completed': 'bg-info text-white',
        'new': 'bg-primary text-white',
        'confirmed': 'bg-success text-white'
      }
      return classes[status] || 'bg-secondary text-white'
    }
  },

  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
</script>


<style scoped>
.dashboard-home {
  font-family: 'Inter', 'Roboto', 'Segoe UI', Arial, sans-serif;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
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
  background: linear-gradient(45deg, #31A9FF, #6366f1);
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

.upcoming-appointments-list {
  max-height: 400px;
  overflow-y: auto;
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

  .display-6 {
    font-size: 1.8rem;
  }
}
.loading-overlay-center {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

</style>
