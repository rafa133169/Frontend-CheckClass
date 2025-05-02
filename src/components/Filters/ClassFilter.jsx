import React from 'react';

const ClassFilter = ({ classes, selectedClass, onSelectClass }) => {
  return (
    <select
      value={selectedClass}
      onChange={(e) => onSelectClass(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    >
      <option value="all">Todas las materias</option>
      {classes.map((classId) => (
        <option key={classId} value={classId}>
          {classId}
        </option>
      ))}
    </select>
  );
};

export default ClassFilter;