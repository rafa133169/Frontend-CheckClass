import React from 'react';

const ClassSelector = ({ classes, selectedClass, onSelectClass }) => {
  return (
    <select
      value={selectedClass}
      onChange={(e) => onSelectClass(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    >
      {classes.map((classItem) => (
        <option key={classItem.id} value={classItem.id}>
          {classItem.name}
        </option>
      ))}
    </select>
  );
};

export default ClassSelector;