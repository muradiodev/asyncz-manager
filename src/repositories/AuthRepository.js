import Repository, { baseUrl } from './Repository'

export async function registerStart(companyName, companyEmail, adminName, adminEmail) {
  return await Repository.postForm(`${baseUrl}/manager/register/start`, {
    companyName: companyName,
    companyEmail: companyEmail,
    adminName: adminName,
    adminEmail: adminEmail
  })
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

export async function registerVerify(companyName, companyEmail, adminName, adminEmail, otp) {
  return await Repository.postForm(`${baseUrl}/manager/register/verify`, {
    companyName: companyName,
    companyEmail: companyEmail,
    adminName: adminName,
    adminEmail: adminEmail,
    otp: otp
  })
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

export async function login(email, password) {
  return await Repository.postForm(`${baseUrl}/manager/login`, {
    email: email,
    password: password
  })
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

export async function getAccount(token) {
  return await Repository.get(`${baseUrl}/manager/me?token=${token}`)
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

export async function saveAccount(token, name, about) {


  return await Repository.postForm(`${baseUrl}/manager/profile?token=${token}`, {
    name,
    about
  })
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

export async function setPassword(token, password, currentPassword) {
  return await Repository.postForm(`${baseUrl}/manager/password?token=${token}`, {
    password,
    currentPassword
  })
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

