import React, { useState } from 'react';

const EditAttendanceModal = ({ student, onSave, onClose }) => {
  const [status, setStatus] = useState(student.status);
  const [reason, setReason] = useState('');

  const handleSave = () => {
    onSave({
      ...student,
      status,
      reason: status === 'Ausente' ? reason : ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Editar Asistencia</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Estudiante</p>
            <p className="text-gray-900">{student.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="Presente">Presente</option>
              <option value="Ausente">Ausente</option>
              <option value="Justificado">Justificado</option>
            </select>
          </div>

          {status === 'Ausente' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razón</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Motivo de la ausencia"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;