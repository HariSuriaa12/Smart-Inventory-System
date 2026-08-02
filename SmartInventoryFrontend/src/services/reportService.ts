import { api } from './api'

export interface ExportRequest {
  modules: string[]
  startDate?: Date
  endDate?: Date
}

export const reportService = {
  exportMasterData: async (request: ExportRequest): Promise<void> => {
    try {
      const response = await api.post('/api/report/export-master-data', {
        modules: request.modules,
        startDate: request.startDate ? request.startDate.toISOString() : null,
        endDate: request.endDate ? request.endDate.toISOString() : null,
      }, {
        responseType: 'blob',
      })

      downloadFile(response.data, 'master_data')
    } catch (error) {
      console.error('Failed to export master data:', error)
      throw error
    }
  },

  exportTransactionalData: async (request: ExportRequest): Promise<void> => {
    try {
      const response = await api.post('/api/report/export-transactional-data', {
        modules: request.modules,
        startDate: request.startDate ? request.startDate.toISOString() : null,
        endDate: request.endDate ? request.endDate.toISOString() : null,
      }, {
        responseType: 'blob',
      })

      let filename = 'download.csv';
      if (response.headers['content-disposition']) {
      const match = response.headers['content-disposition'].match(/filename\*?=(?:UTF-8'')?([^;\n"']*)\b/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }
      
    downloadFile(response.data, filename)
    } catch (error) {
      console.error('Failed to export transactional data:', error)
      throw error
    }
  },

  exportLoggingData: async (request: ExportRequest): Promise<void> => {
    try {
      const response = await api.post('/api/report/export-logging-data', {
        modules: request.modules,
        startDate: request.startDate ? request.startDate.toISOString() : null,
        endDate: request.endDate ? request.endDate.toISOString() : null,
      }, {
        responseType: 'blob',
      })

      downloadFile(response.data, 'logging_data')
    } catch (error) {
      console.error('Failed to export logging data:', error)
      throw error
    }
  },

  exportData: async (request: ExportRequest): Promise<void> => {
    try {
      const response = await api.post('/api/report/export-data', {
        modules: request.modules,
        startDate: request.startDate ? request.startDate.toISOString() : null,
        endDate: request.endDate ? request.endDate.toISOString() : null,
      }, {
        responseType: 'blob',
      })

      let filename = 'export.csv'
      if (response.headers['content-disposition']) {
        const match = response.headers['content-disposition'].match(/filename\*?=(?:UTF-8'')?([^;\n"']*)\b/)
        if (match && match[1]) {
          filename = decodeURIComponent(match[1])
        }
      }

      downloadFile(response.data, filename)
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  },
}

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  //link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
  link.download = `${filename}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
