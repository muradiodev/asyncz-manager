import Repository, { baseUrl } from './Repository'


export async function createAppointment(token, expertId, procedureId, datetime, length, name, surname, phone, email, notes, color) {

  {
    return await Repository.postForm(`${baseUrl}/admin/appointment?token=${token}`, {
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
    return await Repository.postForm(`${baseUrl}/admin/appointment/${id}?token=${token}`, {
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


export async function setTime(token,id,  datetime, expertId) {
  return await Repository.postForm(`${baseUrl}/admin/appointment/${id}/setTime?token=${token}`, {
     time:datetime,
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
