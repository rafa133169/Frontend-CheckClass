import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import ReportGenerator from '../Reports/ReportGenerator';
import AttendanceTable from '../Attendance/AttendanceTable';
import AttendanceStats from '../Stats/AttendanceStats';
import ClassSelector from '../Class/ClassSelector';
import axios from 'axios';

const TeacherDashboard = () => {
  const [qrCode, setQrCode] = useState('');
  const [classCode, setClassCode] = useState('');
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState({
    classes: false,
    attendance: false
  });
  const [error, setError] = useState(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [newClass, setNewClass] = useState({
    id: '',
    name: '',
    schedule: '',
    teacherId: ''
  });
  const createNewClass = async () => {
    try {
      setLoading(prev => ({ ...prev, classes: true }));
      
      // Obtener el ID del profesor logueado
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) throw new Error('Usuario no autenticado');

      const classData = {
        ...newClass,
        teacherId: currentUser.id
      };

      const response = await axios.post('http://localhost:3000/classes', classData);
      
      // Actualizar lista de clases
      await fetchClasses();
      setSelectedClass(response.data.id);
      
      // Cerrar formulario y resetear
      setShowClassForm(false);
      setNewClass({ id: '', name: '', schedule: '', teacherId: '' });
      
    } catch (err) {
      setError('Error al crear la clase. Verifica que el identificador no esté en uso.');
      console.error('Error creating class:', err);
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  const NewClassModal = () => {
    // Manejador de cambios para todos los campos
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewClass(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">Crear Nueva Clase</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identificador único</label>
              <input
                type="text"
                name="id"
                value={newClass.id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: mat-101-2023"
                title="Usa un identificador único que no hayas usado antes"
              />
              <p className="text-xs text-gray-500 mt-1">Este identificador no podrá cambiarse después</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la clase</label>
              <input
                type="text"
                name="name"
                value={newClass.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: Matemáticas Avanzadas"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
              <input
                type="text"
                name="schedule"
                value={newClass.schedule}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: Lunes y Miércoles 10:00-11:30"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowClassForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading.classes}
              >
                Cancelar
              </button>
              <button
                onClick={createNewClass}
                disabled={!newClass.id || !newClass.name || loading.classes}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading.classes ? 'Creando...' : 'Crear Clase'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Modificar el ClassSelector para incluir el botón
  const EnhancedClassSelector = ({ classes, selectedClass, onSelectClass }) => (
    <div className="flex items-center space-x-2">
      <select
        value={selectedClass || ''}
        onChange={(e) => onSelectClass(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        disabled={loading.classes}
      >
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => setShowClassForm(true)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        disabled={loading.classes}
      >
        + Nueva Clase
      </button>
    </div>
  );
  // Cargar clases del docente
  const fetchClasses = async () => {
    try {
      setLoading(prev => ({ ...prev, classes: true }));
      const response = await axios.get('http://localhost:3000/classes');
      setClasses(response.data);
      if (response.data.length > 0 && !selectedClass) {
        setSelectedClass(response.data[0].id);
      }
    } catch (err) {
      setError('Error al cargar las clases');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  // Cargar asistencia por clase
  const fetchAttendance = async (classId) => {
    if (!classId) return;
    
    try {
      setLoading(prev => ({ ...prev, attendance: true }));
      const response = await axios.get('http://localhost:3000/attendance', {
        params: { classId }
      });
      
      // Formatear datos para la tabla
      const formattedAttendance = response.data.map(item => ({
        ...item,
        studentName: item.student.name,
        studentId: item.student.id,
        group: item.student.group,
        enrollment: item.student.enrollment
      }));
      
      setAttendanceList(formattedAttendance);
    } catch (err) {
      setError('Error al cargar la asistencia');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchClasses();
  }, []);

  // Actualizar asistencia cuando cambia la clase seleccionada
  useEffect(() => {
    if (selectedClass) {
      fetchAttendance(selectedClass);
    }
  }, [selectedClass]);

  const generateQR = async () => {
    if (!selectedClass) return;
  
    // const currentClass = classes.find(c => c.id === selectedClass);
    const code = `CLASS_${selectedClass}_${Date.now()}`;
    setClassCode(code);
  
    try {
      // Generar la URL del QR
      const url = await QRCode.toDataURL(code);
      setQrCode(url);
  
      // Obtener datos del usuario logueado (profesor)
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        throw new Error('No hay usuario logueado');
      }
  
      // Calcular fecha de expiración (10 minutos desde ahora)
      const expiresAt = new Date(Date.now() + (10 * 60 * 1000)).toISOString();
  
      // Datos para enviar al backend
      const qrData = {
        code,
        url,
        expiresAt,
        classId: selectedClass,
        teacherId: parseInt(currentUser.id)
      };
  
      // Guardar en la base de datos
      const response = await axios.post('http://localhost:3000/qr/generate', qrData);
      console.log('QR guardado en BD:', response.data);
  
    } catch (err) {
      setError('Error al generar el código QR');
      console.error('Error al generar QR:', err);
    }
  };
  
  const updateAttendance = async (updatedStudent) => {
    try {
      // Actualizar en el backend
      await axios.patch(`http://localhost:3000/attendance/${updatedStudent.id}`, {
        status: updatedStudent.status,
        reason: updatedStudent.reason
      });
      
      // Actualizar estado local
      setAttendanceList(prev => 
        prev.map(student => 
          student.id === updatedStudent.id ? updatedStudent : student
        )
      );
    } catch (err) {
      setError('Error al actualizar la asistencia');
      console.error('Error updating attendance:', err);
    }
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel del Docente</h1>
        {loading.classes ? (
          <div className="animate-pulse">Cargando clases...</div>
        ) : (
          <EnhancedClassSelector
            classes={classes} 
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
          />
        )}
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'attendance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('attendance')}
        >
          Asistencia
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stats')}
        >
          Estadísticas
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('reports')}
        >
          Reportes
        </button>
      </div>

      {activeTab === 'attendance' && (
        <>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Generar Código QR</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <button
                onClick={generateQR}
                disabled={loading.classes}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                  <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 01-1 1H7v1a1 1 0 11-2 0v-3a1 1 0 011-1h2a1 1 0 011 1v1z" />
                  <path d="M14 12a1 1 0 10-1-1v-1a1 1 0 10-2 0v3a1 1 0 002 0v-2z" />
                </svg>
                Generar Nuevo QR
              </button>
              
              {selectedClass && (
                <div className="text-sm text-gray-600">
                  <p>Clase seleccionada: <span className="font-medium">{classes.find(c => c.id === selectedClass)?.name}</span></p>
                  <p>Horario: <span className="font-medium">{classes.find(c => c.id === selectedClass)?.schedule}</span></p>
                </div>
              )}
            </div>
            
            {qrCode && (
              <div className="mt-6 flex flex-col items-center">
                <img src={qrCode} alt="Código QR" className="w-48 h-48 border-4 border-green-500 rounded-lg" />
                <p className="mt-3 text-sm text-gray-600">Código: {classCode}</p>
                <p className="text-xs text-yellow-600 mt-1">Este código expirará en 10 minutos</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Lista de Asistencia</h2>
            {loading.attendance ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <AttendanceTable 
                students={attendanceList} 
                onUpdateAttendance={updateAttendance} 
                showClass={false}
              />
            )}
          </div>
        </>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <AttendanceStats 
            attendanceData={attendanceList} 
            className={classes.find(c => c.id === selectedClass)?.name || ''}
          />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <ReportGenerator 
            attendanceData={attendanceList} 
            classes={classes}
            selectedClass={selectedClass}
          />
        </div>
      )}
      {showClassForm && <NewClassModal />}
    </div>
  );
};

export default TeacherDashboard;