import Repository, { baseUrl } from './Repository'


export async function createBlockTime(token, expertId,   datetime, length,  comment, color) {

  {
    return await Repository.postForm(`${baseUrl}/manager/blockTime?token=${token}`, {
      expert: expertId,
      start_time: datetime,
      length: length,
      comment: comment,
      color: color
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
}

export async function updateBlockTime(token, id, expertId, datetime, length,comment, color) {

  {
    return await Repository.postForm(`${baseUrl}/manager/blockTime/${id}?token=${token}`, {
      expert: expertId,
      start_time: datetime,
      length: length,
      comment: comment,
      color: color
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
}


export async function setTime(token, id, datetime, expertId) {
  return await Repository.postForm(`${baseUrl}/manager/blockTime/${id}/setTime?token=${token}`, {
    time: datetime,
    expert: expertId
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


export async function deleteTime(token, id) {
  return await Repository.postForm(`${baseUrl}/manager/blockTime/${id}/delete?token=${token}`)
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

export async function setLength(token, id, length) {
  return await Repository.postForm(`${baseUrl}/manager/blockTime/${id}/setLength?token=${token}`,
    {
      time: length
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




export async function getBlockTime(token, id) {

  {
    return await Repository.get(`${baseUrl}/manager/blockTime/${id}?token=${token}`)
      .then((response) => {
        if (response.data ) {
          return response.data
        } else {
          return { code: 500, message: 'Internal Server Error' }
        }
      })
      .catch(() => {
        return { code: 501, message: 'Internal Server Error' }
      })
  }
}
