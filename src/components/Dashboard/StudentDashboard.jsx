import React, { useState, useEffect } from 'react';
import { getStorage } from '../../utilities/storage';
import QRScanner from '../QRScanner';
import AttendanceChart from '../Charts/AttendanceChart';
import ClassFilter from '../Filters/ClassFilter';
import axios from 'axios';

const StudentDashboard = () => {
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    attended: 0,
    percentage: 0,
    late: 0,
    justified: 0
  });

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showScanner, setShowScanner] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  useEffect(() => {
    const savedAttendance = getStorage('studentAttendance') || [];
    const user = getStorage('currentUser');
    
    // Filtrar solo las asistencias del estudiante actual
    const studentAttendance = savedAttendance.filter(
      a => a.studentId === user.id
    );
    
    const total = studentAttendance.length;
    const attended = studentAttendance.filter(a => a.status === 'Presente').length;
    const late = studentAttendance.filter(a => a.status === 'Tardanza').length;
    const justified = studentAttendance.filter(a => a.status === 'Justificado').length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    setAttendanceStats({
      totalClasses: total,
      attended,
      percentage,
      late,
      justified
    });
    setAttendanceHistory(studentAttendance);
  }, []);

  const filteredHistory = attendanceHistory.filter(record => {
    if (filter === 'all' && selectedClass === 'all') return true;
    if (filter !== 'all' && selectedClass === 'all') return record.status === filter;
    if (filter === 'all' && selectedClass !== 'all') return record.classId === selectedClass;
    return record.status === filter && record.classId === selectedClass;
  });

  const uniqueClasses = [...new Set(attendanceHistory.map(item => item.classId))];

  const handleScanSuccess = async (qrData) => {
    try {
      // 1. Obtener lista de QR activos desde el backend
      const qrResponse = await axios.get('http://localhost:3000/qr/list');
      const activeQRs = qrResponse.data;
      
      // 2. Buscar coincidencia con el QR escaneado
      const matchedQR = activeQRs.find(qr => qr.code === qrData);
      
      if (!matchedQR) {
        throw new Error('El código QR no es válido o ha expirado');
      }
      
      // Verificar si el QR ha expirado
      const now = new Date();
      const expiresAt = new Date(matchedQR.expiresAt);
      
      if (now > expiresAt) {
        throw new Error('El código QR ha expirado');
      }
      
      // 3. Obtener usuario del localStorage
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      if (!user) {
        throw new Error('No hay usuario logueado');
      }
      
      // 4. Preparar datos para el registro de asistencia
      const currentDate = new Date();
      const attendanceData = {
        studentId: user.id,
        classId: matchedQR.classId || 'unknown', // Asume que el QR tiene classId
        date: currentDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
        time: currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Presente',
        reason: null, // Puedes modificarlo según necesites
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString()
      };
      
      // 5. Registrar asistencia en el backend
      const attendanceResponse = await axios.post(
        'http://localhost:3000/attendance',
        attendanceData
      );
      
      // 6. Actualizar el estado local
      const newAttendance = {
        id: attendanceResponse.data.id || Date.now(),
        studentId: user.id,
        studentName: user.name,
        classId: attendanceData.classId,
        className: matchedQR.className || 'Clase no especificada',
        date: attendanceData.date,
        time: attendanceData.time,
        status: attendanceData.status,
        teacher: matchedQR.teacher || 'Profesor no especificado'
      };
      
      // Actualizar localStorage
      const savedAttendance = JSON.parse(localStorage.getItem('studentAttendance')) || [];
      const updatedAttendance = [...savedAttendance, newAttendance];
      localStorage.setItem('studentAttendance', JSON.stringify(updatedAttendance));
      
      // Actualizar estados
      setAttendanceHistory(prev => [...prev, newAttendance]);
      setAttendanceStats(calculateStats([...attendanceHistory, newAttendance]));
      
      setScanMessage({
        type: 'success',
        text: 'Asistencia registrada correctamente'
      });
      
    } catch (error) {
      console.error('Error en el registro de asistencia:', error);
      setScanMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Error al registrar asistencia'
      });
    } finally {
      setShowScanner(false);
    }
  };
  
  // Función auxiliar para calcular estadísticas
  const calculateStats = (history) => {
    const total = history.length;
    const attended = history.filter(a => a.status === 'Presente').length;
    const late = history.filter(a => a.status === 'Tardanza').length;
    const justified = history.filter(a => a.status === 'Justificado').length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
  
    return { totalClasses: total, attended, percentage, late, justified };
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel del Estudiante</h1>
        <button
          onClick={() => setShowScanner(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M8 6a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Registrar Asistencia
        </button>
      </div>

      {showScanner && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Escanear Código QR</h2>
        <button 
          onClick={() => {
            setShowScanner(false);
            setScanMessage(null);
          }} 
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <QRScanner onScan={handleScanSuccess} />
    </div>
  </div>
)}

      {scanMessage && (
        <div className={`p-4 rounded-lg ${scanMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {scanMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Mis Estadísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard 
              title="Clases Totales" 
              value={attendanceStats.totalClasses} 
              color="blue" 
              icon="calendar"
            />
            <StatCard 
              title="Asistencias" 
              value={attendanceStats.attended} 
              color="green" 
              icon="check"
            />
            <StatCard 
              title="Porcentaje" 
              value={`${attendanceStats.percentage}%`} 
              color="purple" 
              icon="percent"
            />
            <StatCard 
              title="Tardanzas" 
              value={attendanceStats.late} 
              color="yellow" 
              icon="clock"
            />
            <StatCard 
              title="Justificados" 
              value={attendanceStats.justified} 
              color="orange" 
              icon="document-text"
            />
          </div>
          
          <div className="mt-6 h-64">
            <AttendanceChart attendanceData={attendanceHistory} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Resumen por Materias</h2>
          <ClassSummary attendanceData={attendanceHistory} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Historial de Asistencia</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <ClassFilter 
              classes={uniqueClasses} 
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="all">Todos los estados</option>
              <option value="Presente">Presente</option>
              <option value="Ausente">Ausente</option>
              <option value="Tardanza">Tardanza</option>
              <option value="Justificado">Justificado</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.status === 'Presente' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Presente</span>
                      ) : record.status === 'Tardanza' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Tardanza</span>
                      ) : record.status === 'Justificado' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Justificado</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ausente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.teacher}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay registros de asistencia para mostrar
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

const StatCard = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const iconPaths = {
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    check: 'M5 13l4 4L19 7',
    percent: 'M20 8.01V8m0 8v-.01M15 8.01V8m0 8v-.01M5 8.01V8m0 8v-.01M8 8h12m-12 8h12M8 8a5 5 0 110-10h12a5 5 0 110 10',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    'document-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  };

  return (
    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-2xl font-bold">{value}</p>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[icon]} />
        </svg>
      </div>
    </div>
  );
};

const ClassSummary = ({ attendanceData }) => {
  // Agrupar por materia
  const classGroups = attendanceData.reduce((acc, record) => {
    if (!acc[record.classId]) {
      acc[record.classId] = {
        className: record.className,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        justified: 0
      };
    }
    
    acc[record.classId].total++;
    
    if (record.status === 'Presente') acc[record.classId].present++;
    else if (record.status === 'Ausente') acc[record.classId].absent++;
    else if (record.status === 'Tardanza') acc[record.classId].late++;
    else if (record.status === 'Justificado') acc[record.classId].justified++;
    
    return acc;
  }, {});
  
  return (
    <div className="space-y-4">
      {Object.keys(classGroups).length > 0 ? (
        Object.entries(classGroups).map(([classId, classData]) => (
          <div key={classId} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900">{classData.className}</h3>
            <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
              <div className="text-center">
                <p className="font-semibold">{classData.present}</p>
                <p className="text-green-600">Presente</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{classData.absent}</p>
                <p className="text-red-600">Ausente</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{classData.late}</p>
                <p className="text-yellow-600">Tardanza</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{classData.justified}</p>
                <p className="text-blue-600">Justificado</p>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${(classData.present / classData.total) * 100}%` }}
              ></div>
            </div>
            <p className="mt-1 text-xs text-gray-500 text-right">
              {Math.round((classData.present / classData.total) * 100)}% de asistencia
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No hay datos de materias disponibles</p>
      )}
    </div>
  );
};

export default StudentDashboard;