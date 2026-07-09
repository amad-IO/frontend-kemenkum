import api from './api'

type PeriodPayload = Record<string, unknown>
type PeriodId = string | number

export const getAllPeriod = () => api.get('/admin/periods')

export const getPeriodById = (id: PeriodId) => api.get(`/admin/periods/${id}`)

export const createPeriod = (data: PeriodPayload) => api.post('/admin/periods', data)

export const updatePeriod = (id: PeriodId, data: PeriodPayload) =>
  api.patch(`/admin/periods/${id}`, data)

export const deletePeriod = (id: PeriodId) => api.delete(`/admin/periods/${id}`)
