import Repository, { baseUrl } from './Repository'


export async function getBranches(token) {
  return await Repository.get(`${baseUrl}/manager/branches?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.branches
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}

export async function getBranch(token, id) {
  return await Repository.get(`${baseUrl}/manager/branch/${id}?token=${token}`)
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

export async function createBranch(token, name) {
  return await Repository.postForm(`${baseUrl}/manager/branch?token=${token}`, {name: name })
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

export async function updateBranch(token, id, { name, status }) {
  return await Repository.putForm(
    `${baseUrl}/manager/branch/${id}?token=${token}`,
    { name, status }
  )
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

export async function deleteBranch(token, id) {
  return await Repository.delete(`${baseUrl}/manager/branch/${id}?token=${token}`)
    .then((response) => {
      if (response.data) {
        return response.data;
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      return { code: 501, message: error }
    })
}

