import { api } from './api'

export interface ExportOptions {
  startDate?: Date
  endDate?: Date
}

export const reportService = {
  exportMasterData: async (options?: ExportOptions): Promise<void> => {
    try {
      const params = new URLSearchParams()
      if (options?.startDate) {
        params.append('startDate', options.startDate.toISOString())
      }
      if (options?.endDate) {
        params.append('endDate', options.endDate.toISOString())
      }

      const response = await api.get('/api/report/export-master-data', {
        params: Object.fromEntries(params),
        responseType: 'blob',
      })

      downloadFile(response.data, 'master_data')
    } catch (error) {
      console.error('Failed to export master data:', error)
      throw error
    }
  },

  exportTransactionalData: async (options?: ExportOptions): Promise<void> => {
    try {
      const params = new URLSearchParams()
      if (options?.startDate) {
        params.append('startDate', options.startDate.toISOString())
      }
      if (options?.endDate) {
        params.append('endDate', options.endDate.toISOString())
      }

      const response = await api.get('/api/report/export-transactional-data', {
        params: Object.fromEntries(params),
        responseType: 'blob',
      })

      downloadFile(response.data, 'transactional_data')
    } catch (error) {
      console.error('Failed to export transactional data:', error)
      throw error
    }
  },

  exportAllData: async (options?: ExportOptions): Promise<void> => {
    try {
      const params = new URLSearchParams()
      if (options?.startDate) {
        params.append('startDate', options.startDate.toISOString())
      }
      if (options?.endDate) {
        params.append('endDate', options.endDate.toISOString())
      }

      const response = await api.get('/api/report/export-all-data', {
        params: Object.fromEntries(params),
        responseType: 'blob',
      })

      downloadFile(response.data, 'complete_inventory_export')
    } catch (error) {
      console.error('Failed to export all data:', error)
      throw error
    }
  },
}

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
