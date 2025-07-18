import Repository, { baseUrl } from './Repository'

export async function getCustomerList(token) {
  return await Repository.get(`${baseUrl}/api/customers?token=${token}`)
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

export async function getCustomerDetails(token,
                                         name,
                                         surname,
                                         email,
                                         phone) {
  return await Repository.get(`${baseUrl}/api/customers/details?token=${token}&name=${name}&surname=${surname}&email=${email}&phone=${phone}`)
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