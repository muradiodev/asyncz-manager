import Repository, { baseUrl } from './Repository'

export async function getCustomerList(token) {
  return await Repository.get(`${baseUrl}/manager/customers?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.customers
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}

export async function getCustomerDetails(token, email) {
  return await Repository.get(`${baseUrl}/manager/customers/details?token=${token}&email=${email}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.appointments
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}