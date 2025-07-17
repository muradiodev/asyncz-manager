import Repository, { baseUrl } from './Repository'


// export async function getBusinessData(token) {
//   return await Repository.get(`${baseUrl}/manager/companyProfile?token=${token}`)
//     .then((response) => {
//       if (response.data && response.data.code === 200) {
//         return response.data.data
//       } else {
//         return []
//       }
//     })
//     .catch((error) => {
//       console.log(JSON.stringify(error))
//       return []
//     })
// }

export async function getBusinessData(token) {
  return await Repository.get(`${baseUrl}/manager/companyProfile?token=${token}`)
    .then((response) => {
      if (response.data && response.data.code === 200) {
        return response.data // Return the entire response object
      } else {
        return { code: response.data?.code || 500, message: response.data?.message || 'Unknown error' }
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      return { code: 500, message: error.message || 'Failed to fetch business data' }
    })
}


export async function saveBusinessData(token, businessData) {
  console.log('Repository received data:', businessData); // Debug log

  return await Repository.postForm(`${baseUrl}/manager/companyProfile?token=${token}`, {
    name: businessData.name,
    about: businessData.about,
    address: businessData.address,
    email: businessData.email,
    phone: businessData.phone,
    time_zone: businessData.time_zone,
    slot_size: businessData.slot_size,
    logo: businessData.logo
  })
    .then((response) => {
      if (response.data) {
        return response.data
      } else {
        return { code: 500, message: 'Internal Server Error' }
      }
    })
    .catch((error) => {
      console.error('API error:', error.response || error);
      return { code: 501, message: error.response?.data?.message || error.message }
    })
}

