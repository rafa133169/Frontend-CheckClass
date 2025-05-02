import React, { useState, useEffect } from 'react';
import EditAttendanceModal from './EditAttendanceModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AttendanceTable = ({ students, onUpdateAttendance }) => {
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  // Extraer fechas únicas de los registros de asistencia
  useEffect(() => {
    const dates = [...new Set(students.map(student => student.date))];
    setAvailableDates(dates.sort((a, b) => new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')));
    
    // Seleccionar la fecha más reciente por defecto
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, [students]);

  // Formateador de fechas consistente
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleSave = (updatedStudent) => {
    onUpdateAttendance(updatedStudent);
    setEditingStudent(null);
  };

  // Filtrar estudiantes por fecha seleccionada
  const filteredStudents = selectedDate 
  ? students.filter(student => student.date === selectedDate)
  : students;

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h2 className="text-lg font-semibold">Registros de Asistencia</h2>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filtrar por fecha:</label>
          <div className="relative">
          <DatePicker
              selected={selectedDate ? new Date(selectedDate + 'T00:00:00') : null}
              onChange={(date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                setSelectedDate(`${year}-${month}-${day}`);
              }}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              includeDates={availableDates.map(date => new Date(date + 'T00:00:00'))}
              placeholderText="Seleccione una fecha"
              isClearable
              clearButtonClassName="after:content-['×'] after:text-red-500"
            />
          </div>
          
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate(null)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      {selectedDate && (
        <div className="mb-4 text-sm text-gray-600">
          Mostrando registros del: <span className="font-medium">{formatDate(selectedDate)}</span>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th> */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <tr key={`${student.id}-${student.date}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentName}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(student.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.status === 'Presente' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Presente</span>
                  ) : student.status === 'Justificado' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Justificado</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ausente</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleEdit(student)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                {selectedDate 
                  ? `No hay registros de asistencia para la fecha seleccionada (${selectedDate})`
                  : 'No hay registros de asistencia disponibles'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editingStudent && (
        <EditAttendanceModal
          student={editingStudent}
          onSave={handleSave}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
};

export default AttendanceTable;