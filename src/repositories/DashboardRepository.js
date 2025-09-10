import Repository, { baseURL } from './Repository'

export async function getDashboardData(token, startDate = null, endDate = null) {
  let url = `${baseURL}/api/dashboard?token=${token}`

  if (startDate) {
    url += `&start_date=${startDate}`
  }
  if (endDate) {
    url += `&end_date=${endDate}`
  }

  console.log('Making dashboard request to:', url)

  return await Repository.get(url)
    .then((response) => {
      console.log('Dashboard response:', response)

      // Handle the response structure: {data: {code: 200, message: "success", ...}}
      if (response.data && response.data.code === 200) {
        return response.data // Return the entire response.data object
      }

      console.error('Unexpected response format:', response)
      return { code: 500, message: 'Internal Server Error' }
    })
    .catch((error) => {
      console.error('Dashboard API Error:', error)
      return { code: 501, message: error.message || error }
    })
}

export async function getQuickStats(token) {
  const url = `${baseURL}/api/dashboard/quick-stats?token=${token}`
  console.log('Making quick stats request to:', url)

  return await Repository.get(url)
    .then((response) => {
      console.log('Quick stats response:', response)

      // Handle the response structure: {data: {code: 200, message: "success", today_appointments: 0, ...}}
      if (response.data && response.data.code === 200) {
        return response.data // Return the entire response.data object
      }

      return { code: 500, message: 'Internal Server Error' }
    })
    .catch((error) => {
      console.error('Quick stats API Error:', error)
      return { code: 501, message: error.message || error }
    })
}

export async function getAppointmentsChart(token, startDate = null, endDate = null, groupBy = 'month') {
  let url = `${baseURL}/api/dashboard/appointments-chart?token=${token}&group_by=${groupBy}`

  if (startDate) {
    url += `&start_date=${startDate}`
  }
  if (endDate) {
    url += `&end_date=${endDate}`
  }

  return await Repository.get(url)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data
      }
      return { code: 500, message: 'Internal Server Error' }
    })
    .catch((error) => {
      console.error('Chart API Error:', error)
      return { code: 501, message: error.message || error }
    })
}

export async function getUpcomingAppointments(token, days = 7) {
  return await Repository.get(`${baseURL}/api/dashboard/upcoming-appointments?token=${token}&days=${days}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data
      }
      return { code: 500, message: 'Internal Server Error' }
    })
    .catch((error) => {
      console.error('Upcoming appointments API Error:', error)
      return { code: 501, message: error.message || error }
    })
}

export async function getTopServices(token, startDate = null, endDate = null, limit = 10) {
  let url = `${baseURL}/api/dashboard/top-services?token=${token}&limit=${limit}`

  if (startDate) {
    url += `&start_date=${startDate}`
  }
  if (endDate) {
    url += `&end_date=${endDate}`
  }

  return await Repository.get(url)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data
      }
      return { code: 500, message: 'Internal Server Error' }
    })
    .catch((error) => {
      console.error('Top services API Error:', error)
      return { code: 501, message: error.message || error }
    })
}

export async function getTopExperts(token, startDate = null, endDate = null, limit = 10) {
  let url = `${baseURL}/api/dashboard/top-experts?token=${token}&limit=${limit}`

  if (startDate) {
    url += `&start_date=${startDate}`
  }
  if (endDate) {
    url += `&end_date=${endDate}`
  }

  return await Repository.get(url)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data
      }
      return { code: 500, message: 'Internal Server Error' }
    })
    .catch((error) => {
      console.error('Top experts API Error:', error)
      return { code: 501, message: error.message || error }
    })
}
