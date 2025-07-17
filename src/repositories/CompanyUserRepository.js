import Repository, { baseUrl } from './Repository'


export async function getUsers(token) {
  return await Repository.get(`${baseUrl}/manager/users?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.data
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}

export async function getUser(token, id) {
  return await Repository.get(`${baseUrl}/manager/user/${id}?token=${token}`)
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}

export async function createUser(token, role, branch, name, email) {
  return await Repository.postForm(`${baseUrl}/manager/user?token=${token}`, {
    role,
    branch,
    name,
    email
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}

export async function saveUser(token, id, branch, name, email,  status) {
  return await Repository.postForm(`${baseUrl}/manager/user/${id}?token=${token}`, {
    name,
    email,
    branch,
    status
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}
