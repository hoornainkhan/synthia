// Export Utilities
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export function exportCSV(data, filename = 'dataset') {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${filename}.csv`)
}

export function exportJSON(data, filename = 'dataset') {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  saveAs(blob, `${filename}.json`)
}

export function exportExcel(data, filename = 'dataset') {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dataset')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export async function exportImagesZip(images, filename = 'synthetic_images') {
  const zip = new JSZip()
  const imgFolder = zip.folder('images')

  for (const img of images) {
    const response = await fetch(img.dataUrl)
    const blob = await response.blob()
    imgFolder.file(`${img.label}.png`, blob)
  }

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${filename}.zip`)
}
