import Repository, { baseUrl } from './Repository'


export async function getExperts(token) {
  return await Repository.get(`${baseUrl}/admin/experts?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.experts
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}

export async function getExpert(token, id) {
  return await Repository.get(`${baseUrl}/admin/expert/${id}?token=${token}`)
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

export async function createExpert(token, name, email, password) {
  return await Repository.postForm(`${baseUrl}/admin/expert?token=${token}`, {
    name,
    email,
    password
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

export async function saveExpert(token,id,  name, about, color, status) {
  return await Repository.postForm(`${baseUrl}/admin/expert/${id}?token=${token}`, {
    name,
    about,
    color,
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
