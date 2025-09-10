import Repository, { baseURL } from './Repository'

export async function getPermissionsList(token) {
  return await Repository.get(`${baseURL}/manager/permissions?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.permissions
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}

export async function updateUserPermission(token, userId, permission) {
  return await Repository.put(`${baseURL}/manager/permissions/update`, {
    token: token,
    user_id: userId,
    permission: permission,
  })
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data
      } else {
        return null
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return null
    })
}