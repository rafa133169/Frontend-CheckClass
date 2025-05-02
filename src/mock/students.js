export const students = [
  { 
    id: 1, 
    name: 'Juan Pérez', 
    status: 'Presente',
    attendanceHistory: [
      { date: '2023-10-01', class: 'Matemáticas', status: 'Presente', teacher: 'Prof. García' },
      { date: '2023-10-08', class: 'Historia', status: 'Tardanza', teacher: 'Prof. Martínez' },
      { date: '2023-10-15', class: 'Ciencias', status: 'Presente', teacher: 'Prof. López' }
    ]
  },
  { 
    id: 2, 
    name: 'María García', 
    status: 'Ausente',
    attendanceHistory: [
      { date: '2023-10-01', class: 'Matemáticas', status: 'Ausente', teacher: 'Prof. García' },
      { date: '2023-10-08', class: 'Historia', status: 'Justificado', teacher: 'Prof. Martínez' },
      { date: '2023-10-15', class: 'Ciencias', status: 'Presente', teacher: 'Prof. López' }
    ]
  },
  // ... otros estudiantes
];