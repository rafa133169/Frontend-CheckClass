export const getStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error accessing localStorage', error);
    return null;
  }
};

export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage', error);
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage', error);
  }
};

// Mock de datos iniciales para desarrollo
export const initializeMockData = () => {
  if (!getStorage('users')) {
    setStorage('users', [
      { id: 1, email: 'admin@escuela.com', password: 'admin123', role: 'admin', name: 'Administrador' },
      { id: 2, email: 'profesor@escuela.com', password: 'profesor123', role: 'teacher', name: 'Profesor García' },
      { id: 3, email: 'estudiante1@escuela.com', password: 'estudiante123', role: 'student', name: 'Juan Pérez' },
      { id: 4, email: 'estudiante2@escuela.com', password: 'estudiante123', role: 'student', name: 'María López' }
    ]);
  }

  if (!getStorage('attendance')) {
    setStorage('attendance', [
      {
        id: 1,
        studentId: 3,
        studentName: 'Juan Pérez',
        classId: 'math101',
        className: 'Matemáticas 101',
        date: '2023-05-10',
        time: '10:05',
        status: 'Presente',
        teacher: 'Prof. García'
      },
      
      {
        id: 2,
        studentId: 4,
        studentName: 'María López',
        classId: 'math101',
        className: 'Matemáticas 101',
        date: '2023-05-10',
        time: '10:07',
        status: 'Presente',
        teacher: 'Prof. García'
      },
      {
        id: 3,
        studentId: 3,
        studentName: 'Juan Pérez',
        classId: 'physics201',
        className: 'Física 201',
        date: '2023-05-11',
        time: '14:15',
        status: 'Tardanza',
        teacher: 'Prof. García',
        reason: 'Llegó tarde por tráfico'
      },
      {
        id: 4,
        studentId: 3,
        studentName: 'Juan Pérez',
        classId: 'math101',
        className: 'Matemáticas 101',
        date: '2023-05-11',
        time: '10:05',
        status: 'Presente',
        teacher: 'Prof. García'
      },
      {
        id: 5,
        studentId: 3,
        studentName: 'Juan Pérez',
        classId: 'math101',
        className: 'Matemáticas 101',
        date: '2023-05-11',
        time: '10:05',
        status: 'Presente',
        teacher: 'Prof. García'
      },
    ]);
  }

  if (!getStorage('studentAttendance')) {
    setStorage('studentAttendance', getStorage('attendance'));
  }
};