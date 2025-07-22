import Repository, { baseUrl } from './Repository'

export async function getPermissionsList(token) {
  return await Repository.get(`${baseUrl}/manager/permissions?token=${token}`)
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
  return await Repository.put(`${baseUrl}/manager/permissions/update`, {
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