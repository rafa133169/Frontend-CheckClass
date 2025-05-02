import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState({
    students: true,
    teachers: true
  });
  const [filters, setFilters] = useState({
    students: {
      enrollment: '',
      name: ''
    },
    teachers: {
      enrollment: '',
      name: ''
    }
  });
  const [editingRole, setEditingRole] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const response = await axios.get('http://localhost:3000/users/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(prev => ({ ...prev, teachers: true }));
      const response = await axios.get('http://localhost:3000/users/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(prev => ({ ...prev, teachers: false }));
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await axios.patch(`http://localhost:3000/users/${userId}/role`, { role: newRole });
      
      // Update local state
      const updatedStudents = students.map(student => 
        student.id === userId ? { ...student, role: newRole } : student
      );
      setStudents(updatedStudents);
      
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === userId ? { ...teacher, role: newRole } : teacher
      );
      setTeachers(updatedTeachers);
      
      setEditingRole(null);
      window.location.reload();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = student.name?.toLowerCase().includes(filters.students.name.toLowerCase());
    const enrollmentMatch = student.enrollment?.toLowerCase().includes(filters.students.enrollment.toLowerCase());
    return nameMatch && enrollmentMatch;
  });

  const filteredTeachers = teachers.filter(teacher => {
    const nameMatch = teacher.name?.toLowerCase().includes(filters.teachers.name.toLowerCase());
    const enrollmentMatch = teacher.enrollment?.toLowerCase().includes(filters.teachers.enrollment.toLowerCase());
    return nameMatch && enrollmentMatch;
  });

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Panel de Administración</h2>
      
      {/* Students Table */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Estudiantes</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre</label>
            <input
              type="text"
              placeholder="Nombre del estudiante"
              value={filters.students.name}
              onChange={(e) => setFilters({
                ...filters,
                students: { ...filters.students, name: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por matrícula</label>
            <input
              type="text"
              placeholder="Matrícula"
              value={filters.students.enrollment}
              onChange={(e) => setFilters({
                ...filters,
                students: { ...filters.students, enrollment: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchStudents}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Actualizar lista
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading.students ? (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                    Cargando estudiantes...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                    No se encontraron estudiantes
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.enrollment || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.group || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {editingRole === student.id ? (
                        <select
                          defaultValue={student.role || 'student'}
                          onChange={(e) => handleRoleUpdate(student.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="student">Estudiante</option>
                          <option value="teacher">Docente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      ) : (
                        student.role || 'student'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setEditingRole(editingRole === student.id ? null : student.id)}
                        className="text-blue-600 hover:text-blue-900 mr-2 text-sm"
                      >
                        {editingRole === student.id ? 'Guardar' : 'Editar rol'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Teachers Table */}
      <div>
  <h3 className="text-lg font-medium mb-3">Docentes</h3>
  
  {/* Filtro solo por nombre */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre</label>
      <input
        type="text"
        placeholder="Nombre del docente"
        value={filters.teachers.name}
        onChange={(e) => setFilters({
          ...filters,
          teachers: { ...filters.teachers, name: e.target.value }
        })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
      />
    </div>
    
    <div className="flex items-end">
      <button
        onClick={fetchTeachers}
        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
      >
        Actualizar lista
      </button>
    </div>
  </div>
  
  {/* Tabla con edición de roles */}
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {loading.teachers ? (
          <tr>
            <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
              Cargando docentes...
            </td>
          </tr>
        ) : teachers.filter(t => 
            t.name.toLowerCase().includes(filters.teachers.name.toLowerCase())
          ).length === 0 ? (
          <tr>
            <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
              No se encontraron docentes
            </td>
          </tr>
        ) : (
          teachers
            .filter(t => t.name.toLowerCase().includes(filters.teachers.name.toLowerCase()))
            .map((teacher) => (
              <tr key={teacher.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.id}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {teacher.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {teacher.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {editingRole === teacher.id ? (
                    <select
                      value={teacher.role || 'teacher'}
                      onChange={(e) => handleRoleUpdate(teacher.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="student">Estudiante</option>
                      <option value="teacher">Docente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  ) : (
                    teacher.role || 'teacher'
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setEditingRole(editingRole === teacher.id ? null : teacher.id)}
                    className="text-blue-600 hover:text-blue-900 mr-2 text-sm"
                  >
                    {editingRole === teacher.id ? 'Guardar' : 'Editar rol'}
                  </button>
                </td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
};

export default AdminPanel;