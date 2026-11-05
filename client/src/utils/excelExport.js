import * as XLSX from 'xlsx';

/**
 * Exports JSON records to a downloadable Excel .xlsx spreadsheet
 */
export const exportToExcel = (data, fileName = 'export') => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

