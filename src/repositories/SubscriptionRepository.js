import Repository, { baseUrl } from './Repository'


export async function getPackageList(token) {
  return await Repository.get(`${baseUrl}/manager/packages?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data.packages
      } else {
        return []
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return []
    })
}


export async function subscribe(token, packageId, period) {

  return await Repository.postForm(`${baseUrl}/manager/subscribe`,  {
    token,
    package_id: packageId,
    period: period
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: response.data.code, message: response.data.message }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 1000, message: 'Network error' }
    })
}


export async function cancelSubscription(token) {

  return await Repository.postForm(`${baseUrl}/manager/cancelSubscription`,  {
    token
  })
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data
      } else {
        return { code: response.data.code, message: response.data.message }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 1000, message: 'Network error' }
    })
}

