import Repository, { baseUrl } from './Repository'


export async function getProcedures(token) {
  return await Repository.get(`${baseUrl}/admin/procedures?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.procedures
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}

export async function getProcedure(token, id) {
  return await Repository.get(`${baseUrl}/admin/procedure/${id}?token=${token}`)
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

export async function createProcedure(token, name, length) {
  return await Repository.postForm(`${baseUrl}/admin/procedure?token=${token}`, {
    name,
    length
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



export async function saveProcedure(token,id,  name, about, length, status) {
  return await Repository.postForm(`${baseUrl}/admin/procedure/${id}?token=${token}`, {
    name,
    about,
    length,
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
