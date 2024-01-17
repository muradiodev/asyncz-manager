import Repository, { baseUrl } from './Repository'

export async function getProfile(token) {
  return await Repository.get(`${baseUrl}/me?token=${token}`)
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}

export async function login(phone) {
  let data = new FormData()
  data.append('phone', phone)

  return await Repository.postForm(`${baseUrl}/otp`, data)
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}

export async function verify(transaction, otp) {
  let data = new FormData()
  data.append('transaction', transaction)
  data.append('otp', otp)

  return await Repository.postForm(`${baseUrl}/verify`, data)
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 501, message: error }
    })
}
