import Repository, { baseUrl } from './Repository'


export async function createAppointment(token, expertId, procedureId, datetime, length, name, surname, phone, email, notes, color) {

  {
    return await Repository.postForm(`${baseUrl}/manager/appointment?token=${token}`, {
      expert: expertId,
      procedure: procedureId,
      name: name,
      surname: surname,
      email: email,
      phone: phone,
      start_time: datetime,
      length: length,
      notes: notes,
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

export async function updateAppointment(token, id, expertId, procedureId, datetime, length, name, surname, phone, email, notes, color) {

  {
    return await Repository.postForm(`${baseUrl}/manager/appointment/${id}?token=${token}`, {
      expert: expertId,
      procedure: procedureId,
      name: name,
      surname: surname,
      email: email,
      phone: phone,
      start_time: datetime,
      length: length,
      notes: notes,
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
  return await Repository.postForm(`${baseUrl}/manager/appointment/${id}/setTime?token=${token}`, {
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

export async function confirm(token, id) {
  return await Repository.postForm(`${baseUrl}/manager/appointment/${id}/confirm?token=${token}`)
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

export async function cancel(token, id) {
  return await Repository.postForm(`${baseUrl}/manager/appointment/${id}/cancel?token=${token}`)
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
  return await Repository.postForm(`${baseUrl}/manager/appointment/${id}/setLength?token=${token}`,
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



export async function searchAppointment(token, keyword) {

  {
    return await Repository.get(`${baseUrl}/manager/appointment/search?token=${token}&keywords=${keyword}`)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          return response.data.appointments
        } else {
          return  [];
        }
      })
      .catch(() => {
        return [];
      })
  }
}

export async function getAppointment(token, id) {

  {
    return await Repository.get(`${baseUrl}/manager/appointment/${id}?token=${token}`)
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
