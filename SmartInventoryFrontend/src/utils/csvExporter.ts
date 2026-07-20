export interface CsvExportOptions {
  filename: string
  headers?: string[]
}

export const csvExporter = {
  export: <T extends Record<string, any>>(
    data: T[],
    options: CsvExportOptions
  ): void => {
    if (data.length === 0) {
      console.warn('No data to export')
      return
    }

    // Use provided headers or get from first object keys
    const headers = options.headers || Object.keys(data[0])

    // Create CSV content
    const csvContent = [
      // Header row
      headers.map((h) => csvExporter.escapeCsvField(h)).join(','),
      // Data rows
      ...data.map((row) =>
        headers.map((header) => csvExporter.escapeCsvField(String(row[header] ?? ''))).join(',')
      ),
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${options.filename}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  escapeCsvField: (field: string): string => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  },
}
