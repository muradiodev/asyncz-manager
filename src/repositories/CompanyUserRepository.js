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


export async function getUserPermissions(token, role) {
  return await Repository.get(`${baseUrl}/manager/user/permissions/${role}?token=${token}`)
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


export async function addPermission(token, id,permission) {
  const endPoint = `manager/user/${id}/permission?token=${token}`;
  const formData = new FormData();
  formData.append('permission', permission);

  return await Repository.postForm(`${baseUrl}/${endPoint}`, formData)
    .then(response => {
      if (response.data) {
        return response.data;
      } else {
        return {code: 1001, message: 'Unexpected response'}
      }
    })
    .catch(error => {
      console.log(JSON.stringify(error));
      return {code: 1000, message: 'Network error'}
    });
}


export async function removePermission(token, id,permission) {
  const endPoint = `manager/user/${id}/permission/delete?token=${token}`;
  const formData = new FormData();
  formData.append('permission', permission);

  return await Repository.postForm(`${baseUrl}/${endPoint}`, formData)
    .then(response => {
      if (response.data) {
        return response.data;
      } else {
        return {code: 1001, message: 'Unexpected response'}
      }
    })
    .catch(error => {
      console.log(JSON.stringify(error));
      return {code: 1000, message: 'Network error'}
    });
}
