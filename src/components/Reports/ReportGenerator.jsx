import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AttendancePDF from './AttendancePDF';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ReportGenerator = ({ attendanceData, classes, selectedClass }) => {
  const [reportType, setReportType] = useState('excel');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateExcelReport = () => {
    setIsGenerating(true);
    
    // Filtrar datos según los parámetros
    let filteredData = [...attendanceData];
    
    if (dateRange.start) {
      filteredData = filteredData.filter(item => 
        new Date(item.date) >= new Date(dateRange.start));
    }
    
    if (dateRange.end) {
      filteredData = filteredData.filter(item => 
        new Date(item.date) <= new Date(dateRange.end))
    }
    
    if (selectedFormat !== 'all') {
      filteredData = filteredData.filter(item => item.status === selectedFormat);
    }
    
    // Preparar datos para Excel
    const excelData = filteredData.map(item => ({
      'Estudiante': item.studentName,
      'Clase': classes.find(c => c.id === item.classId)?.name || 'Desconocido',
      'Fecha': item.date,
      'Hora': item.time,
      'Estado': item.status,
      'Profesor': item.teacher,
      'Justificación': item.reason || 'N/A'
    }));
    
    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
    
    // Generar archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const className = classes.find(c => c.id === selectedClass)?.name || 'asistencias';
    saveAs(data, `reporte_${className}_${new Date().toISOString().slice(0,10)}.xlsx`);
    
    setIsGenerating(false);
  };

  const filteredData = attendanceData.filter(item => {
    if (dateRange.start && new Date(item.date) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(item.date) > new Date(dateRange.end)) return false;
    if (selectedFormat !== 'all' && item.status !== selectedFormat) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Estado</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="all">Todos los estados</option>
            <option value="Presente">Presente</option>
            <option value="Ausente">Ausente</option>
            <option value="Tardanza">Tardanza</option>
            <option value="Justificado">Justificado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div className="flex justify-center">
        {reportType === 'excel' ? (
          <button
            onClick={generateExcelReport}
            disabled={isGenerating}
            className={`bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center ${isGenerating ? 'opacity-50' : ''}`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Descargar Excel
              </>
            )}
          </button>
        ) : (
          <PDFDownloadLink
            document={<AttendancePDF data={filteredData} classes={classes} />}
            fileName={`reporte_asistencia_${new Date().toISOString().slice(0,10)}.pdf`}
            className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Descargar PDF
          </PDFDownloadLink>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium text-gray-900 mb-3">Vista previa del reporte ({filteredData.length} registros)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.slice(0, 5).map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date} {item.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.status === 'Presente' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Presente</span>
                    ) : item.status === 'Tardanza' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Tardanza</span>
                    ) : item.status === 'Justificado' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Justificado</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ausente</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length > 5 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    + {filteredData.length - 5} registros más...
                  </td>
                </tr>
              )}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay registros que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;