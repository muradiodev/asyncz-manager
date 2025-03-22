import Repository, { baseUrl } from './Repository'


export async function getBlackList(token) {
  return await Repository.get(`${baseUrl}/manager/blacklist?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.blacklist
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}

export async function createBlacklist(token, value) {
  return await Repository.postForm(`${baseUrl}/manager/blacklist?token=${token}`, {
    value:value
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

export async function deleteBlacklist(token, id) {
  return await Repository.post(`${baseUrl}/manager/blacklist/${id}/delete?token=${token}`)
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

